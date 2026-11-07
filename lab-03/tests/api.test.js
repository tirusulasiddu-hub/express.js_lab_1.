const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { initDb } = require("../src/db");
const { seedIfEmpty } = require("../src/seed");
const { createApp } = require("../src/app");

let server, db, base;

before(async () => {
  db = await initDb(":memory:");
  await seedIfEmpty(db);
  server = createApp(db).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.close();
  await db.close();
});

const call = async (method, path, body, raw) => {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: raw !== undefined ? raw : body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
};

test("GET /books defaults", async () => {
  const r = await call("GET", "/books");
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.limit, 10);
  assert.strictEqual(r.json.offset, 0);
  assert.strictEqual(r.json.total, 10);
  assert.strictEqual(r.json.data.length, 10);
});

test("search_q partial match", async () => {
  const r = await call("GET", "/books?search_q=java");
  assert.strictEqual(r.status, 200);
  assert.ok(r.json.data.length >= 2);
  assert.ok(r.json.data.every((b) => b.title.toLowerCase().includes("java")));
});

test("search_q treats % literally", async () => {
  const r = await call("GET", "/books?search_q=%25");
  assert.strictEqual(r.json.total, 0);
});

test("sorting order_by + order", async () => {
  const r = await call("GET", "/books?order_by=price&order=desc");
  const prices = r.json.data.map((b) => b.price);
  assert.deepStrictEqual(prices, [...prices].sort((a, b) => b - a));
});

test("limit and offset", async () => {
  const r = await call("GET", "/books?limit=3&offset=2&order_by=id");
  assert.strictEqual(r.json.count, 3);
  assert.strictEqual(r.json.data[0].id, 3);
});

test("price range BETWEEN", async () => {
  const r = await call("GET", "/books?min_price=300&max_price=500");
  assert.ok(r.json.data.length > 0);
  assert.ok(r.json.data.every((b) => b.price >= 300 && b.price <= 500));
});

test("only min_price / only max_price", async () => {
  const a = await call("GET", "/books?min_price=800");
  assert.ok(a.json.data.every((b) => b.price >= 800));
  const b = await call("GET", "/books?max_price=300");
  assert.ok(b.json.data.every((x) => x.price <= 300));
});

test("combined filters", async () => {
  const r = await call("GET", "/books?search_q=a&min_price=300&max_price=700&order_by=title&limit=5");
  assert.strictEqual(r.status, 200);
});

test("bad query params -> 400", async () => {
  for (const q of ["order_by=password", "order=sideways", "limit=0", "limit=abc", "limit=1000", "offset=-1", "min_price=abc", "max_price=x", "min_price=500&max_price=100"]) {
    const r = await call("GET", "/books?" + q);
    assert.strictEqual(r.status, 400, q);
    assert.ok(r.json.message, q);
  }
});

test("SQL injection attempt is harmless", async () => {
  const r = await call("GET", "/books?search_q=" + encodeURIComponent("'; DROP TABLE books; --"));
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.total, 0);
  const again = await call("GET", "/books");
  assert.strictEqual(again.json.total, 10);
});

test("GET /books/:id success, 404, 400", async () => {
  assert.strictEqual((await call("GET", "/books/1")).status, 200);
  assert.strictEqual((await call("GET", "/books/9999")).status, 404);
  assert.strictEqual((await call("GET", "/books/abc")).status, 400);
});

test("POST success returns 201", async () => {
  const r = await call("POST", "/books", { title: "New Book", author: "Me", price: 199.5 });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.json.book.title, "New Book");
});

test("POST validation -> 400", async () => {
  const bad = [
    {},
    { author: "A", price: 10 },
    { title: "T", price: 10 },
    { title: "T", author: "A" },
    { title: "T", author: "A", price: "abc" },
    { title: "  ", author: "A", price: 10 },
    { title: "T", author: "A", price: -5 },
  ];
  for (const b of bad) {
    const r = await call("POST", "/books", b);
    assert.strictEqual(r.status, 400, JSON.stringify(b));
    assert.ok(r.json.message);
  }
});

test("POST malformed JSON -> 400", async () => {
  const r = await call("POST", "/books", null, "{bad json");
  assert.strictEqual(r.status, 400);
  assert.strictEqual(r.json.message, "Invalid JSON in request body");
});

test("PUT success 200, 404, 400", async () => {
  const ok = await call("PUT", "/books/2", { title: "Updated", author: "X", price: 111 });
  assert.strictEqual(ok.status, 200);
  assert.strictEqual(ok.json.book.title, "Updated");
  assert.strictEqual((await call("PUT", "/books/9999", { title: "T", author: "A", price: 1 })).status, 404);
  assert.strictEqual((await call("PUT", "/books/2", { title: "T", author: "A", price: "x" })).status, 400);
  assert.strictEqual((await call("PUT", "/books/abc", { title: "T", author: "A", price: 1 })).status, 400);
});

test("DELETE 200 then 404", async () => {
  const created = await call("POST", "/books", { title: "Temp", author: "T", price: 1 });
  const id = created.json.book.id;
  assert.strictEqual((await call("DELETE", `/books/${id}`)).status, 200);
  assert.strictEqual((await call("DELETE", `/books/${id}`)).status, 404);
  assert.strictEqual((await call("GET", `/books/${id}`)).status, 404);
});

test("unknown route -> 404 JSON", async () => {
  const r = await call("GET", "/nothing");
  assert.strictEqual(r.status, 404);
  assert.ok(r.json.message);
});
