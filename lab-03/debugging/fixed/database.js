const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function initDb() {
  const db = await open({ filename: "./broken.db", driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);
  const { count } = await db.get("SELECT COUNT(*) AS count FROM books");
  if (count === 0) {
    await db.run("INSERT INTO books (title, author, price) VALUES ('Clean Code', 'Robert C. Martin', 450)");
  }
  return db;
}

module.exports = { initDb };
