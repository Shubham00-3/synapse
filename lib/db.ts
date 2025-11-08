import Database from 'better-sqlite3';
import path from 'path';

// Initialize database connection
const dbPath = path.join(process.cwd(), 'database.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Items table - stores all saved content
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      metadata_json TEXT,
      embedding_vector TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
    CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
  `);

  // Collections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      auto_generated BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Collection items junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (collection_id, item_id),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  // Chat conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      role TEXT NOT NULL,
      context_items TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Item analytics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_analytics (
      item_id INTEGER PRIMARY KEY,
      view_count INTEGER DEFAULT 0,
      last_viewed_at DATETIME,
      review_count INTEGER DEFAULT 0,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  // API keys table for MCP authentication
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT UNIQUE NOT NULL,
      name TEXT,
      last_used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // FTS5 virtual table for full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
      item_id UNINDEXED,
      title,
      content,
      tokenize = 'porter unicode61'
    )
  `);

  // Create additional indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_items_type_user ON items(type, user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
    CREATE INDEX IF NOT EXISTS idx_collection_items_item ON collection_items(item_id);
  `);
}

// Initialize database on import
initDatabase();

// User operations
export const userDb = {
  create: (email: string, passwordHash: string) => {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, passwordHash);
    return result.lastInsertRowid;
  },

  findByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as { id: number; email: string; password_hash: string; created_at: string } | undefined;
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as { id: number; email: string; password_hash: string; created_at: string } | undefined;
  },
};

// Item operations
export interface Item {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string | null;
  metadata_json: string | null;
  embedding_vector: string | null;
  created_at: string;
}

export interface CreateItemInput {
  user_id: number;
  type: string;
  title: string;
  content?: string;
  metadata?: any;
  embedding?: number[];
}

export const itemDb = {
  create: (input: CreateItemInput) => {
    const stmt = db.prepare(`
      INSERT INTO items (user_id, type, title, content, metadata_json, embedding_vector)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.user_id,
      input.type,
      input.title,
      input.content || null,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.embedding ? JSON.stringify(input.embedding) : null
    );
    
    const itemId = result.lastInsertRowid as number;
    
    // Add to FTS index
    try {
      const ftsStmt = db.prepare(`
        INSERT INTO items_fts (item_id, title, content)
        VALUES (?, ?, ?)
      `);
      ftsStmt.run(itemId, input.title, input.content || '');
    } catch (error) {
      console.error('Failed to add to FTS index:', error);
    }
    
    return itemId;
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
    return stmt.get(id) as Item | undefined;
  },

  findByUserId: (userId: number, limit = 100, offset = 0) => {
    const stmt = db.prepare(`
      SELECT * FROM items 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as Item[];
  },

  findByUserIdAndType: (userId: number, type: string) => {
    const stmt = db.prepare(`
      SELECT * FROM items 
      WHERE user_id = ? AND type = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(userId, type) as Item[];
  },

  update: (id: number, updates: Partial<CreateItemInput>) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata_json = ?');
      values.push(JSON.stringify(updates.metadata));
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.embedding !== undefined) {
      fields.push('embedding_vector = ?');
      values.push(JSON.stringify(updates.embedding));
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  delete: (id: number) => {
    // Delete from FTS index first
    try {
      const ftsStmt = db.prepare('DELETE FROM items_fts WHERE item_id = ?');
      ftsStmt.run(id);
    } catch (error) {
      console.error('Failed to delete from FTS index:', error);
    }
    
    const stmt = db.prepare('DELETE FROM items WHERE id = ?');
    stmt.run(id);
  },

  // Full-text search using FTS5
  fullTextSearch: (userId: number, query: string, limit: number = 50) => {
    const stmt = db.prepare(`
      SELECT i.* FROM items i
      INNER JOIN items_fts fts ON i.id = fts.item_id
      WHERE i.user_id = ? AND items_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);
    return stmt.all(userId, query, limit) as Item[];
  },

  getAllWithEmbeddings: (userId: number) => {
    const stmt = db.prepare(`
      SELECT * FROM items 
      WHERE user_id = ? AND embedding_vector IS NOT NULL
      ORDER BY created_at DESC
    `);
    return stmt.all(userId) as Item[];
  },

  search: (userId: number, query: string) => {
    const stmt = db.prepare(`
      SELECT * FROM items 
      WHERE user_id = ? AND (
        title LIKE ? OR 
        content LIKE ?
      )
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(userId, searchPattern, searchPattern) as Item[];
  },

  incrementViewCount: (itemId: number) => {
    const stmt = db.prepare(`
      INSERT INTO item_analytics (item_id, view_count, last_viewed_at)
      VALUES (?, 1, CURRENT_TIMESTAMP)
      ON CONFLICT(item_id) DO UPDATE SET
        view_count = view_count + 1,
        last_viewed_at = CURRENT_TIMESTAMP
    `);
    stmt.run(itemId);
  },
};

// Conversation operations
export interface Conversation {
  id: number;
  user_id: number;
  message: string;
  role: 'user' | 'assistant';
  context_items: string | null;
  created_at: string;
}

export const conversationDb = {
  create: (userId: number, message: string, role: 'user' | 'assistant', contextItems?: number[]) => {
    const stmt = db.prepare(`
      INSERT INTO conversations (user_id, message, role, context_items)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      userId,
      message,
      role,
      contextItems ? JSON.stringify(contextItems) : null
    );
    return result.lastInsertRowid;
  },

  findByUserId: (userId: number, limit = 50) => {
    const stmt = db.prepare(`
      SELECT * FROM conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as Conversation[];
  },

  clearByUserId: (userId: number) => {
    const stmt = db.prepare('DELETE FROM conversations WHERE user_id = ?');
    stmt.run(userId);
  },
};

// Collection operations
export interface Collection {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  auto_generated: boolean;
  created_at: string;
}

export const collectionDb = {
  create: (userId: number, name: string, description?: string, color?: string, icon?: string, autoGenerated = false) => {
    const stmt = db.prepare(`
      INSERT INTO collections (user_id, name, description, color, icon, auto_generated)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, name, description || null, color || null, icon || null, autoGenerated ? 1 : 0);
    return result.lastInsertRowid;
  },

  findByUserId: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as Collection[];
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM collections WHERE id = ?');
    return stmt.get(id) as Collection | undefined;
  },

  update: (id: number, updates: { name?: string; description?: string; color?: string; icon?: string }) => {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updates.icon);
    }

    if (fields.length === 0) return;

    values.push(id);
    const stmt = db.prepare(`UPDATE collections SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM collections WHERE id = ?');
    stmt.run(id);
  },

  addItem: (collectionId: number, itemId: number) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO collection_items (collection_id, item_id)
      VALUES (?, ?)
    `);
    stmt.run(collectionId, itemId);
  },

  removeItem: (collectionId: number, itemId: number) => {
    const stmt = db.prepare('DELETE FROM collection_items WHERE collection_id = ? AND item_id = ?');
    stmt.run(collectionId, itemId);
  },

  getItems: (collectionId: number) => {
    const stmt = db.prepare(`
      SELECT i.* FROM items i
      JOIN collection_items ci ON i.id = ci.item_id
      WHERE ci.collection_id = ?
      ORDER BY ci.added_at DESC
    `);
    return stmt.all(collectionId) as Item[];
  },

  getItemCount: (collectionId: number): number => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?');
    const result = stmt.get(collectionId) as { count: number };
    return result.count;
  },
};

// API Key operations
export interface APIKey {
  id: number;
  user_id: number;
  key: string;
  name: string | null;
  last_used_at: string | null;
  created_at: string;
}

export const apiKeyDb = {
  create: (userId: number, key: string, name?: string) => {
    const stmt = db.prepare(`
      INSERT INTO api_keys (user_id, key, name)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, key, name || null);
    return result.lastInsertRowid;
  },

  findByKey: (key: string) => {
    const stmt = db.prepare('SELECT * FROM api_keys WHERE key = ?');
    return stmt.get(key) as APIKey | undefined;
  },

  findByUserId: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as APIKey[];
  },

  updateLastUsed: (key: string) => {
    const stmt = db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE key = ?');
    stmt.run(key);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM api_keys WHERE id = ?');
    stmt.run(id);
  },
};

export default db;
