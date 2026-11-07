const express = require("express");
const { ValidationError, isNumeric, validateBookBody, validateIdParam } = require("../middleware/validate");

// Only these columns may be used in ORDER BY. Column names cannot be sent as
// "?" parameters, so we map the user's input to a fixed whitelist instead of
// joining raw input into the SQL string.
const SORTABLE_COLUMNS = { id: "id", title: "title", author: "author", price: "price", created_at: "created_at" };

const DEFAULTS = { order_by: "id", order: "ASC", limit: 10, offset: 0 };
const MAX_LIMIT = 100;

function parseWholeNumber(raw, name, { min, max }) {
  if (!/^\d+$/.test(String(raw))) throw new ValidationError(`${name} must be a whole number`);
  const n = Number(raw);
  if (n < min) throw new ValidationError(`${name} must be at least ${min}`);
  if (max !== undefined && n > max) throw new ValidationError(`${name} must be at most ${max}`);
  return n;
}

function parseListQuery(query) {
  const orderByRaw = query.order_by === undefined ? DEFAULTS.order_by : String(query.order_by).toLowerCase();
  if (!Object.hasOwn(SORTABLE_COLUMNS, orderByRaw)) {
    throw new ValidationError(`order_by must be one of: ${Object.keys(SORTABLE_COLUMNS).join(", ")}`);
  }

  const orderRaw = query.order === undefined ? DEFAULTS.order : String(query.order).toUpperCase();
  if (orderRaw !== "ASC" && orderRaw !== "DESC") {
    throw new ValidationError("order must be ASC or DESC");
  }

  const limit = query.limit === undefined ? DEFAULTS.limit : parseWholeNumber(query.limit, "limit", { min: 1, max: MAX_LIMIT });
  const offset = query.offset === undefined ? DEFAULTS.offset : parseWholeNumber(query.offset, "offset", { min: 0 });

  let minPrice = null;
  let maxPrice = null;
  if (query.min_price !== undefined) {
    if (!isNumeric(query.min_price)) throw new ValidationError("min_price must be a number");
    minPrice = Number(query.min_price);
  }
  if (query.max_price !== undefined) {
    if (!isNumeric(query.max_price)) throw new ValidationError("max_price must be a number");
    maxPrice = Number(query.max_price);
  }
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new ValidationError("min_price cannot be greater than max_price");
  }

  const search = query.search_q === undefined ? "" : String(query.search_q).trim();

  return { orderBy: SORTABLE_COLUMNS[orderByRaw], order: orderRaw, limit, offset, minPrice, maxPrice, search };
}

// Escape % and _ so a user searching for "50%" does not act as a wildcard.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

module.exports = function booksRouter(db) {
  const router = express.Router();

  // GET /books  -> search, filter, sort, paginate
  router.get("/", async (req, res, next) => {
    try {
      const q = parseListQuery(req.query);

      const where = [];
      const params = [];
      if (q.search) {
        where.push("title LIKE ? ESCAPE '\\'");
        params.push(`%${escapeLike(q.search)}%`);
      }
      if (q.minPrice !== null && q.maxPrice !== null) {
        where.push("price BETWEEN ? AND ?");
        params.push(q.minPrice, q.maxPrice);
      } else if (q.minPrice !== null) {
        where.push("price >= ?");
        params.push(q.minPrice);
      } else if (q.maxPrice !== null) {
        where.push("price <= ?");
        params.push(q.maxPrice);
      }
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

      const { total } = await db.get(`SELECT COUNT(*) AS total FROM books ${whereSql}`, params);
      // q.orderBy and q.order come from fixed whitelists above, never raw user text.
      const data = await db.all(
        `SELECT id, title, author, price, created_at FROM books ${whereSql}
         ORDER BY ${q.orderBy} ${q.order}, id ASC LIMIT ? OFFSET ?`,
        [...params, q.limit, q.offset]
      );

      res.status(200).json({
        total,
        count: data.length,
        limit: q.limit,
        offset: q.offset,
        data,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /books/:id
  router.get("/:id", validateIdParam, async (req, res, next) => {
    try {
      const book = await db.get("SELECT id, title, author, price, created_at FROM books WHERE id = ?", [req.bookId]);
      if (!book) return res.status(404).json({ message: `Book with id ${req.bookId} not found` });
      res.status(200).json(book);
    } catch (err) {
      next(err);
    }
  });

  // POST /books
  router.post("/", validateBookBody, async (req, res, next) => {
    try {
      const { title, author, price } = req.book;
      const result = await db.run("INSERT INTO books (title, author, price) VALUES (?, ?, ?)", [title, author, price]);
      const book = await db.get("SELECT id, title, author, price, created_at FROM books WHERE id = ?", [result.lastID]);
      res.status(201).json({ message: "Book created successfully", book });
    } catch (err) {
      next(err);
    }
  });

  // PUT /books/:id
  router.put("/:id", validateIdParam, validateBookBody, async (req, res, next) => {
    try {
      const { title, author, price } = req.book;
      const result = await db.run("UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?", [title, author, price, req.bookId]);
      if (result.changes === 0) return res.status(404).json({ message: `Book with id ${req.bookId} not found` });
      const book = await db.get("SELECT id, title, author, price, created_at FROM books WHERE id = ?", [req.bookId]);
      res.status(200).json({ message: "Book updated successfully", book });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /books/:id
  router.delete("/:id", validateIdParam, async (req, res, next) => {
    try {
      const result = await db.run("DELETE FROM books WHERE id = ?", [req.bookId]);
      if (result.changes === 0) return res.status(404).json({ message: `Book with id ${req.bookId} not found` });
      res.status(200).json({ message: `Book with id ${req.bookId} deleted successfully` });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
