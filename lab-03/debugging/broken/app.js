const express = require("express");
// BUG 2: wrong import path -> "Cannot find module ./db" (the file is database.js)
const { initDb } = require("./db");
const booksRouter = require("./routes/books");

async function main() {
  const db = await initDb();
  const app = express();
  app.use(express.json());
  app.use("/books", booksRouter(db));

  // BUG 1: port is hard-coded and there is no error handling.
  // If something already uses 3000 you get "Error: listen EADDRINUSE: address already in use :::3000"
  app.listen(3000, () => console.log("Broken server running on port 3000"));
}

main();
