require("dotenv").config();
const { initDb } = require("./db");
const { seedIfEmpty } = require("./seed");
const { createApp } = require("./app");

const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || "./books.db";

async function start() {
  const db = await initDb(DB_PATH);
  const seeded = await seedIfEmpty(db);
  if (seeded) console.log(`Seeded ${seeded} sample books`);

  const app = createApp(db);
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT in .env`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
