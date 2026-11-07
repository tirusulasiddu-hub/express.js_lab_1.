const express = require("express");

module.exports = function booksRouter(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    // BUG 3: table name typo -> "SQLITE_ERROR: no such table: book"
    const books = await db.all("SELECT * FROM book");
    res.json(books);
  });

  router.get("/:id", async (req, res) => {
    // BUG 4: missing await -> db.get() returns a Promise, so the response is {} (or hangs)
    const book = db.get("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!book) return res.status(404).json({ message: "Not found" });
    res.json(book);
  });

  return router;
};
