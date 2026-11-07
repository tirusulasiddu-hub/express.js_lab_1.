// Validation helpers. Every failure is { message: "..." } with status 400.

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

function isNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.trim() !== "" && Number.isFinite(Number(value));
  return false;
}

// Validates the body of POST /books and PUT /books/:id
function validateBookBody(req, res, next) {
  const body = req.body;
  if (body === undefined || body === null || typeof body !== "object" || Array.isArray(body)) {
    return next(new ValidationError("Request body must be a JSON object with title, author and price"));
  }
  const { title, author, price } = body;

  if (typeof title !== "string" || title.trim() === "") {
    return next(new ValidationError("title is required and must be a non-empty string"));
  }
  if (typeof author !== "string" || author.trim() === "") {
    return next(new ValidationError("author is required and must be a non-empty string"));
  }
  if (price === undefined || price === null || price === "") {
    return next(new ValidationError("price is required"));
  }
  if (!isNumeric(price)) {
    return next(new ValidationError("price must be a number"));
  }
  if (Number(price) < 0) {
    return next(new ValidationError("price must not be negative"));
  }

  req.book = { title: title.trim(), author: author.trim(), price: Number(price) };
  next();
}

// Validates :id in the path (must be a positive whole number)
function validateIdParam(req, res, next) {
  if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
    return next(new ValidationError("id must be a positive whole number"));
  }
  req.bookId = Number(req.params.id);
  next();
}

module.exports = { ValidationError, isNumeric, validateBookBody, validateIdParam };
