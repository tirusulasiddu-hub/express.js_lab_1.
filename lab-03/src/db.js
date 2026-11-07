const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Opens the SQLite database and makes sure the books table exists.
async function initDb(filename) {
  const db = await open({ filename, driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      author     TEXT    NOT NULL,
      price      REAL    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

module.exports = { initDb };
