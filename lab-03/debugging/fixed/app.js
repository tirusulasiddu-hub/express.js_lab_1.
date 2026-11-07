const express = require("express");
// FIX 2: correct import path (file is database.js)
const { initDb } = require("./database");
const booksRouter = require("./routes/books");

async function main() {
  const db = await initDb();
  const app = express();
  app.use(express.json());
  app.use("/books", booksRouter(db));

  // FIX 1: port comes from the environment, and EADDRINUSE is handled with a clear message
  const PORT = Number(process.env.PORT) || 3000;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") console.error(`Port ${PORT} is already in use. Stop the other process or set PORT=3001`);
    else console.error(err);
    process.exit(1);
  });
}

main();
