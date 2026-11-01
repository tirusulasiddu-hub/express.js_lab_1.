const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Database reference holder
let database = null;

// Function to initialize the database connection and start the Express server
const initializeDatabaseAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    app.listen(PORT, () => {
      console.log(`Express server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to connect to database: ${error.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

// Helper function to validate and parse bookId parameter
const parseBookId = (paramValue) => {
  const parsedId = Number(paramValue);
  if (Number.isInteger(parsedId) && parsedId > 0) {
    return parsedId;
  }
  return null;
};

// Helper function to validate book payload fields for POST and PUT
const validateBookPayload = (body) => {
  if (!body || typeof body !== "object") {
    return "Request body must be a valid JSON object";
  }

  const { title, author, price, pages } = body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return "Field 'title' is required and must be a non-empty string";
  }

  if (typeof author !== "string" || author.trim().length === 0) {
    return "Field 'author' is required and must be a non-empty string";
  }

  if (typeof price !== "number" || !Number.isInteger(price) || price < 0) {
    return "Field 'price' is required and must be a non-negative integer";
  }

  if (typeof pages !== "number" || !Number.isInteger(pages) || pages <= 0) {
    return "Field 'pages' is required and must be a positive integer";
  }

  return null;
};

// 1. GET /books/ - Retrieve all books
app.get(["/books", "/books/"], async (request, response) => {
  try {
    const getBooksQuery = `SELECT * FROM book ORDER BY id;`;
    const books = await database.all(getBooksQuery);
    response.status(200).json(books);
  } catch (error) {
    console.error("Error retrieving books:", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// 2. GET /books/:bookId/ - Retrieve a single book by ID
app.get(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
  const bookId = parseBookId(request.params.bookId);

  if (bookId === null) {
    return response.status(400).json({ error: "bookId must be a positive whole number" });
  }

  try {
    const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
    const book = await database.get(getBookQuery, [bookId]);

    if (!book) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json(book);
  } catch (error) {
    console.error(`Error retrieving book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// 3. POST /books/ - Add a new book
app.post(["/books", "/books/"], async (request, response) => {
  const validationError = validateBookPayload(request.body);

  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const { title, author, price, pages } = request.body;

  try {
    const addBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;
    const result = await database.run(addBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages
    ]);

    response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    console.error("Error adding book:", error.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// 4. PUT /books/:bookId/ - Update an existing book completely
app.put(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
  const bookId = parseBookId(request.params.bookId);

  if (bookId === null) {
    return response.status(400).json({ error: "bookId must be a positive whole number" });
  }

  const validationError = validateBookPayload(request.body);

  if (validationError) {
    return response.status(400).json({ error: validationError });
  }

  const { title, author, price, pages } = request.body;

  try {
    const updateBookQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    const result = await database.run(updateBookQuery, [
      title.trim(),
      author.trim(),
      price,
      pages,
      bookId
    ]);

    if (result.changes === 0) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error(`Error updating book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// 5. DELETE /books/:bookId/ - Delete a book by ID
app.delete(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
  const bookId = parseBookId(request.params.bookId);

  if (bookId === null) {
    return response.status(400).json({ error: "bookId must be a positive whole number" });
  }

  try {
    const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
    const result = await database.run(deleteBookQuery, [bookId]);

    if (result.changes === 0) {
      return response.status(404).json({ error: "Book not found" });
    }

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(`Error deleting book ${bookId}:`, error.message);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Middleware to handle unknown / undefined routes
app.use((request, response) => {
  response.status(404).json({ error: "404 - Route not found" });
});

// Global error-handling middleware (handles malformed JSON body errors and unexpected errors)
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({ error: "Malformed JSON payload in request body" });
  }

  const statusCode = error.status || 500;
  console.error("Unhandled error:", error.message);
  response.status(statusCode).json({ error: error.message || "Internal server error" });
});
