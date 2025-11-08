const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

const email = 'shubhamgangwarrrr@gmail.com';

// Get user
const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

if (!user) {
  console.error('User not found!');
  process.exit(1);
}

// Generate API key
const apiKey = `sk-synapse-${crypto.randomBytes(32).toString('hex')}`;

// Insert into database
db.prepare('INSERT INTO api_keys (user_id, key, name) VALUES (?, ?, ?)')
  .run(user.id, apiKey, 'Browser Extension');

console.log('\n========================================');
console.log('✅ API KEY GENERATED SUCCESSFULLY!');
console.log('========================================\n');
console.log('🔑 YOUR API KEY:\n');
console.log(apiKey);
console.log('\n========================================');
console.log('📋 Copy this key for your extension!');
console.log('⚠️  You won\'t be able to see it again!');
console.log('========================================\n');

db.close();

