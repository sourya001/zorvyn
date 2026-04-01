import Database from 'better-sqlite3';
import { hashPassword } from './password.js';

const DB_FILE = process.env.SQLITE_FILE || 'sqlite.db';
let db = null;

export function initDatabase() {
  resetDb();
  const dbFile = process.env.SQLITE_FILE || 'sqlite.db';
  db = new Database(dbFile);
  db.pragma('foreign_keys = ON');

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run();

  const adminExists = db.prepare('SELECT 1 FROM users WHERE role = ? LIMIT 1').get('admin');
  if (!adminExists) {
    const hash = hashPassword('Admin@123');
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status, created_at)
      VALUES (?, ?, ?, 'admin', 'active', ?)
    `).run('Admin', 'admin@example.com', hash, new Date().toISOString());
  }

  return db;
}

export function getDb() {
  if (!db) {
    initDatabase();
  }
  return db;
}

export function resetDb() {
  if (db) {
    try {
      db.close();
    } catch (e) {
      // ignore
    }
  }
  db = null;
}
