import { initDatabase, getDb } from '../src/services/db.js';

let dbSingleton = null;

export function resetDatabase() {
  dbSingleton = null;
}

export function getTestDb() {
  if (!dbSingleton) {
    dbSingleton = initDatabase();
  }
  return dbSingleton;
}
