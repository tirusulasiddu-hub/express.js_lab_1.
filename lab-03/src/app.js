const express = require("express");
const booksRouter = require("./routes/books");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandlers");

// Builds the Express app. The database is passed in so tests can use a temporary one.
function createApp(db) {
  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Books REST API is running. Try GET /books" });
  });

  app.use("/books", booksRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
