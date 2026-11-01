# Backend Development Fundamentals

Repository containing lab exercises and practical implementations for the **Backend Development Fundamentals** course.

---

## 👨‍🎓 Student Details

- **Name:** T. Apurup Siddhardha
- **Registration Number:** `252U1R7091`
- **Department / Section:** CSE FSD
- **Course:** Backend Development Fundamentals

---

## 🗂️ Repository Structure

```text
.
├── 📁 lab-01/                  # Lab 01: Node.js & Express Server
│   ├── 📁 screenshots/         # Route verification screenshots
│   ├── .gitignore              # Ignores node_modules and sensitive files
│   ├── package.json            # Lab 1 dependencies & scripts
│   ├── package-lock.json       # Exact dependency lockfile
│   ├── README.md               # Detailed Lab 1 documentation
│   ├── server-http.js          # Native Node.js http module server
│   └── server.js               # Express.js server implementation
│
├── 📁 lab-02/                  # Lab 02: SQLite Database & CRUD Routes
│   ├── 📁 postman/             # Postman collections and test configurations
│   ├── 📁 screenshots/         # Endpoint test screenshots (GET, POST, PUT, DELETE)
│   ├── .gitignore              # Ignores node_modules, .env, and temp files
│   ├── books.db                # SQLite database instance
│   ├── package.json            # Lab 2 dependencies (express, sqlite, sqlite3)
│   ├── package-lock.json       # Exact dependency lockfile
│   ├── README.md               # Detailed Lab 2 documentation
│   ├── seed.sql                # Table schema and initial seed data
│   └── server.js               # Express server with parameterized SQLite CRUD endpoints
│
└── README.md                   # Repository overview and guide
```

---

## 📚 Labs Overview

### [Lab 01: Node.js & Express Server](./lab-01/)
- **Objective:** Set up a Node.js project using `npm`, understand `package.json`, build an HTTP server using Node's native `http` module, and implement an Express server with multiple routes (`/`, `/about`, `/time`, and a 404 handler) with proper status codes.
- **Key Features:**
  - Native `http` module server on port 3000 (`server-http.js`)
  - Express.js server on port 3000 (`server.js`)
  - Dynamic time endpoint returning current server timestamp
  - Standard 404 Not Found error handling

### [Lab 02: SQLite Database & CRUD Routes](./lab-02/)
- **Objective:** Connect an Express server to an SQLite database using `sqlite` and `sqlite3`, preventing SQL injection using parameterized `?` queries, and implementing full CRUD operations over REST endpoints.
- **Key Features:**
  - SQLite database initialization and seeding (`seed.sql`)
  - `GET /books` - Retrieve all books
  - `GET /books/:id` - Retrieve a single book by ID
  - `POST /books` - Create a new book record (HTTP 201)
  - `PUT /books/:id` - Update existing book fields (HTTP 200)
  - `DELETE /books/:id` - Remove a book record (HTTP 200)
  - Safe parameterized queries (`?` placeholders)
  - Proper HTTP error handling (400 Bad Request, 404 Not Found, 500 Internal Error)

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime environment |
| **Express.js** | Web application framework for routing and JSON parsing |
| **SQLite3 / sqlite** | File-based SQL database and promise wrapper |
| **Postman** | API testing, request automation, and documentation |
| **Nodemon** | Development reload monitor |

---

## 🚀 Getting Started

To run any of the labs locally:

### Running Lab 01
```bash
cd lab-01
npm install
npm start
```
Server starts on `http://localhost:3000`.

### Running Lab 02
```bash
cd lab-02
npm install
npm start
```
Server starts on `http://localhost:3000` connected to `books.db`.

---

## 📄 License
This repository is submitted as part of academic coursework for **Backend Development Fundamentals**.
