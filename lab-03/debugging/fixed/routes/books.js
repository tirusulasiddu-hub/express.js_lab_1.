const express = require("express");

module.exports = function booksRouter(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    // FIX 3: correct table name (books)
    const books = await db.all("SELECT * FROM books");
    res.json(books);
  });

  router.get("/:id", async (req, res) => {
    // FIX 4: await the database call
    const book = await db.get("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (!book) return res.status(404).json({ message: "Not found" });
    res.json(book);
  });

  return router;
};
