require("dotenv").config();
const { initDb } = require("./db");

const SAMPLE_BOOKS = [
  ["Clean Code", "Robert C. Martin", 450],
  ["The Pragmatic Programmer", "Andrew Hunt", 520],
  ["Eloquent JavaScript", "Marijn Haverbeke", 380],
  ["You Don't Know JS", "Kyle Simpson", 299],
  ["Node.js Design Patterns", "Mario Casciaro", 650],
  ["Learning SQL", "Alan Beaulieu", 410],
  ["JavaScript: The Good Parts", "Douglas Crockford", 275],
  ["Designing Data-Intensive Applications", "Martin Kleppmann", 899],
  ["Refactoring", "Martin Fowler", 720],
  ["Introduction to Algorithms", "Thomas H. Cormen", 950],
];

// Inserts sample rows only when the table is empty (safe to run many times).
async function seedIfEmpty(db) {
  const { count } = await db.get("SELECT COUNT(*) AS count FROM books");
  if (count > 0) return 0;
  for (const [title, author, price] of SAMPLE_BOOKS) {
    await db.run("INSERT INTO books (title, author, price) VALUES (?, ?, ?)", [title, author, price]);
  }
  return SAMPLE_BOOKS.length;
}

module.exports = { seedIfEmpty };

if (require.main === module) {
  (async () => {
    const db = await initDb(process.env.DB_PATH || "./books.db");
    const added = await seedIfEmpty(db);
    console.log(added ? `Seeded ${added} books.` : "Table already has data. Nothing seeded.");
    await db.close();
  })();
}
