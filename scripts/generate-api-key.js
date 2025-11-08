#!/usr/bin/env node

/**
 * Generate API Key for Browser Extension
 * 
 * Usage:
 *   node scripts/generate-api-key.js <user-email>
 * 
 * Example:
 *   node scripts/generate-api-key.js user@example.com
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

function generateApiKey(userEmail) {
  // Find user by email
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(userEmail);
  
  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    process.exit(1);
  }

  // Generate API key
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const apiKey = `sk-synapse-${randomBytes}`;
  
  // Hash the key for storage
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  // Check if API key already exists for this user
  const existing = db.prepare('SELECT id FROM api_keys WHERE user_id = ? AND name = ?')
    .get(user.id, 'Browser Extension');
  
  if (existing) {
    // Update existing key
    db.prepare('UPDATE api_keys SET key_hash = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hash, existing.id);
    console.log('✅ Updated existing API key');
  } else {
    // Insert new key
    db.prepare('INSERT INTO api_keys (user_id, name, key_hash) VALUES (?, ?, ?)')
      .run(user.id, 'Browser Extension', hash);
    console.log('✅ Created new API key');
  }
  
  console.log('\n🔑 API Key (copy this for your browser extension):');
  console.log(`\n${apiKey}\n`);
  console.log('⚠️  Save this key - you won\'t be able to see it again!\n');
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Usage: node scripts/generate-api-key.js <user-email>');
  console.error('\nExample: node scripts/generate-api-key.js user@example.com');
  process.exit(1);
}

const userEmail = args[0];
generateApiKey(userEmail);

db.close();

