#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
// Dynamic imports after directory change (will be done in main function)
let itemDb: any, collectionDb: any, apiKeyDb: any, enhancedSearch: any, processContent: any, detectInputType: any;

interface Item {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  metadata_json: string;
  embedding_vector: string | null;
  created_at: string;
}

// CRITICAL: Change to project root directory before importing anything
import { dirname, join } from 'path';
import { chdir } from 'process';

// In CommonJS, __dirname is available directly
// Get project root (parent of mcp-server/dist directory)
const projectRoot = join(__dirname, '..', '..');
console.error('=== Synapse MCP Server Starting ===');
console.error('Script location:', __dirname);
console.error('Changing to project root:', projectRoot);
chdir(projectRoot);
console.error('New working directory:', process.cwd());

const API_KEY = process.env.MCP_API_KEY || '';
console.error('API key present:', !!API_KEY);

// Validate API key on startup
function validateAuth(): number {
  try {
    if (!API_KEY) {
      console.error('ERROR: MCP_API_KEY environment variable is required');
      process.exit(1);
    }

    console.error('Attempting to validate API key...');
    const keyRecord = apiKeyDb.findByKey(API_KEY);
    
    if (!keyRecord) {
      console.error('ERROR: Invalid MCP_API_KEY - key not found in database');
      process.exit(1);
    }

    console.error('API key validated successfully for user:', keyRecord.user_id);
    return keyRecord.user_id;
  } catch (error) {
    console.error('ERROR during API key validation:', error);
    process.exit(1);
  }
}

// Load modules after changing directory using require (works with TypeScript compiled files)
async function loadModules() {
  try {
    console.error('Loading modules from project root...');
    // Use require for CommonJS modules (better-sqlite3, etc.)
    const dbModule = require('./lib/db');
    const aiModule = require('./lib/ai');
    const processorModule = require('./lib/processor');
    
    itemDb = dbModule.itemDb;
    collectionDb = dbModule.collectionDb;
    apiKeyDb = dbModule.apiKeyDb;
    enhancedSearch = aiModule.enhancedSearch;
    processContent = processorModule.processContent;
    detectInputType = processorModule.detectInputType;
    
    console.error('Modules loaded successfully');
    return true;
  } catch (error: any) {
    console.error('ERROR loading modules:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
}

let userId: number;
async function initialize() {
  if (!await loadModules()) {
    process.exit(1);
  }
  
  try {
    userId = validateAuth();
    console.error('MCP Server initialized successfully');
  } catch (error) {
    console.error('FATAL: Failed to initialize MCP server:', error);
    process.exit(1);
  }
}

// Create server instance
const server = new Server(
  {
    name: 'synapse-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'synapse://items',
        name: 'All Items',
        description: 'List all saved items in Synapse',
        mimeType: 'application/json',
      },
      {
        uri: 'synapse://items/{id}',
        name: 'Item by ID',
        description: 'Get a specific item by ID',
        mimeType: 'application/json',
      },
      {
        uri: 'synapse://search?q={query}',
        name: 'Search Items',
        description: 'Search items using semantic search',
        mimeType: 'application/json',
      },
      {
        uri: 'synapse://collections',
        name: 'Collections',
        description: 'List all collections',
        mimeType: 'application/json',
      },
      {
        uri: 'synapse://collections/{id}',
        name: 'Collection Items',
        description: 'Get items in a specific collection',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri.toString();

  if (uri === 'synapse://items') {
    const items = itemDb.findByUserId(userId, 100);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(items.map(parseItem), null, 2),
        },
      ],
    };
  }

  if (uri.startsWith('synapse://items/')) {
    const id = parseInt(uri.split('/').pop() || '0');
    const item = itemDb.findById(id);
    
    if (!item || item.user_id !== userId) {
      throw new Error('Item not found');
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(parseItem(item), null, 2),
        },
      ],
    };
  }

  if (uri.startsWith('synapse://search?q=')) {
    const query = decodeURIComponent(uri.split('q=')[1] || '');
    const items = itemDb.findByUserId(userId, 1000);
    const results = await enhancedSearch(query, items as any[], 20);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            results.map((r: any) => ({ ...parseItem(r.item), score: r.score })),
            null,
            2
          ),
        },
      ],
    };
  }

  if (uri === 'synapse://collections') {
    const collections = collectionDb.findByUserId(userId);
    const collectionsWithCounts = collections.map((c: any) => ({
      ...c,
      itemCount: collectionDb.getItemCount(c.id),
    }));

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(collectionsWithCounts, null, 2),
        },
      ],
    };
  }

  if (uri.startsWith('synapse://collections/')) {
    const id = parseInt(uri.split('/').pop() || '0');
    const collection = collectionDb.findById(id);
    
    if (!collection || collection.user_id !== userId) {
      throw new Error('Collection not found');
    }

    const items = collectionDb.getItems(id);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            collection,
            items: items.map(parseItem),
          }, null, 2),
        },
      ],
    };
  }

  throw new Error('Resource not found');
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_item',
        description: 'Add a new item to Synapse (URL, text, or note)',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'The content to add (URL, text, or note)',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'delete_item',
        description: 'Delete an item from Synapse',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'number',
              description: 'The ID of the item to delete',
            },
          },
          required: ['itemId'],
        },
      },
      {
        name: 'create_collection',
        description: 'Create a new collection',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Collection name',
            },
            description: {
              type: 'string',
              description: 'Collection description (optional)',
            },
            icon: {
              type: 'string',
              description: 'Collection icon emoji (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'add_to_collection',
        description: 'Add an item to a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collectionId: {
              type: 'number',
              description: 'The collection ID',
            },
            itemId: {
              type: 'number',
              description: 'The item ID to add',
            },
          },
          required: ['collectionId', 'itemId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'add_item': {
      const input = (args as any).input;
      const inputType = detectInputType(input);
      const processed = await processContent({ type: inputType, data: input });
      
      const itemId = itemDb.create({
        user_id: userId,
        type: processed.type,
        title: processed.title,
        content: processed.content,
        metadata: processed.metadata,
        embedding: processed.embedding,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              itemId,
              type: processed.type,
              title: processed.title,
            }, null, 2),
          },
        ],
      };
    }

    case 'delete_item': {
      const itemId = (args as any).itemId;
      const item = itemDb.findById(itemId);
      
      if (!item || item.user_id !== userId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Item not found' }),
            },
          ],
          isError: true,
        };
      }

      itemDb.delete(itemId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, message: 'Item deleted' }),
          },
        ],
      };
    }

    case 'create_collection': {
      const { name, description, icon } = args as any;
      
      const collectionId = collectionDb.create(
        userId,
        name,
        description || undefined,
        undefined,
        icon || undefined,
        false
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              collectionId,
              name,
            }, null, 2),
          },
        ],
      };
    }

    case 'add_to_collection': {
      const { collectionId, itemId } = args as any;
      
      // Verify ownership
      const collection = collectionDb.findById(collectionId);
      const item = itemDb.findById(itemId);
      
      if (!collection || collection.user_id !== userId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Collection not found' }),
            },
          ],
          isError: true,
        };
      }

      if (!item || item.user_id !== userId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: 'Item not found' }),
            },
          ],
          isError: true,
        };
      }

      collectionDb.addItem(collectionId, itemId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Item added to collection',
            }),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Helper function to parse item
function parseItem(item: Item) {
  return {
    ...item,
    metadata: item.metadata_json ? JSON.parse(item.metadata_json) : {},
    embedding: null, // Don't send embeddings over MCP for efficiency
  };
}

// Start the server
async function main() {
  await initialize();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Synapse MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

