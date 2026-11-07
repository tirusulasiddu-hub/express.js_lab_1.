# Debugging exercise

The faculty hands out a broken project with four bugs. This folder has a practice version with the same four bugs so you can see every error and fix it.

- `broken/` : the project with all four bugs
- `fixed/` : the same project after the fixes

Run these commands from the **lab-03 root** (after `npm install`), so Node finds `node_modules`:

```bash
node debugging/broken/app.js
node debugging/fixed/app.js
```

A `broken.db` file is created in the folder you run from. It is ignored by `.gitignore`.

Take the screenshots 20 to 24 listed in `screenshots/SCREENSHOTS_CHECKLIST.md` while doing the steps below.

---

## Bug 1: Port conflict (EADDRINUSE)

**How to reproduce:** open two terminals. In the first run `npm start` (uses port 3000). In the second run the broken app (also hard-coded to 3000).

```bash
node debugging/broken/app.js
```

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** two programs cannot listen on the same port. The port `3000` was hard-coded and nothing handled the error.

**Fix (3 parts):**

1. Find and stop the old process.
   - Mac/Linux: `lsof -i :3000` then `kill <PID>`
   - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
2. Read the port from the environment instead of hard-coding it.
3. Show a clear message when the port is busy.

```diff
-  app.listen(3000, () => console.log("Broken server running on port 3000"));
+  const PORT = Number(process.env.PORT) || 3000;
+  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
+  server.on("error", (err) => {
+    if (err.code === "EADDRINUSE") console.error(`Port ${PORT} is already in use. Stop the other process or set PORT=3001`);
+    else console.error(err);
+    process.exit(1);
+  });
```

---

## Bug 2: Wrong import path

**Error:**

```
Error: Cannot find module './db'
```

**Cause:** `app.js` imports `./db` but the file is named `database.js`.

```diff
-const { initDb } = require("./db");
+const { initDb } = require("./database");
```

**Tip:** read the first line of the error and the "Require stack". Check spelling, folder, and `./` or `../` at the start of the path.

---

## Bug 3: Table-name typo (no such table)

**Error** (server log, and the browser shows an HTML error page):

```
Error: SQLITE_ERROR: no such table: book
```

**Cause:** the table is called `books` but the query says `book`.

```diff
-    const books = await db.all("SELECT * FROM book");
+    const books = await db.all("SELECT * FROM books");
```

**Tip:** compare the name in the `CREATE TABLE` statement with every query.

---

## Bug 4: Missing await

**Symptom:** `GET /books/1` returns `{}` instead of the book. There is no error message.

**Cause:** `db.get()` returns a Promise. Without `await`, `book` is the Promise object itself (not the row), so `res.json(book)` sends `{}`. The same mistake also breaks the 404 check, because a Promise is always truthy.

```diff
-    const book = db.get("SELECT * FROM books WHERE id = ?", [req.params.id]);
+    const book = await db.get("SELECT * FROM books WHERE id = ?", [req.params.id]);
```

**Tip:** every database call in this project is async. The route function must be `async` and each call needs `await`.

---

## Verification after the fixes

```bash
PORT=3001 node debugging/fixed/app.js
curl http://localhost:3001/books      # list of books
curl http://localhost:3001/books/1    # the book, not {}
curl -i http://localhost:3001/books/99  # 404
```

On Windows PowerShell, set the port with `$env:PORT=3001; node debugging/fixed/app.js`.

## Quick checklist for any bug

1. Read the error message from the top: what, and in which file and line.
2. Reproduce it with the smallest steps.
3. Change one thing at a time, then test again.
4. Use `console.log` or the debugger to see actual values.
