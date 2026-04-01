import fs from 'fs';
import path from 'path';
import { resetDb } from '../src/services/db.js';

const DB_FILE = 'sqlite.db.test';

export function setupTestDb() {
  resetDb();
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  process.env.SQLITE_FILE = DB_FILE;
}

export function cleanupTestDb() {
  resetDb();
  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }
  delete process.env.SQLITE_FILE;
}
