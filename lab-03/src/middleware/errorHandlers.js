// 404 for any URL that no route matched
function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler: keeps every error response in the { message } format
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // express.json() throws this when the body is not valid JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body" });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err); // full detail stays in the server log only
  res.status(500).json({ message: "Internal server error" });
}

module.exports = { notFoundHandler, errorHandler };
