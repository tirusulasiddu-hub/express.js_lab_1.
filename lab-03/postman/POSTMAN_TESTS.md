# Postman test list

**Collection:** `Lab03_Books_API.postman_collection.json` (32 requests, 82 automated assertions)
**Environment:** `Lab03_Local.postman_environment.json` (`baseUrl = http://localhost:3000`)

## How to use

1. Start the server: `npm start`.
2. In Postman: **Import** both JSON files from this folder.
3. Select the **Lab 03 - Local** environment. For the live link, change `baseUrl` to the deployed URL.
4. Run requests one by one (for screenshots) or use **Run collection**.
5. Run folder `02 Success cases` in order: S8 stores the new id in `createdId`, then S9 and S10 use it.

Command line alternative: `npx newman run postman/Lab03_Books_API.postman_collection.json`

## Success cases

| ID | Request | Expected status | What is checked |
| --- | --- | --- | --- |
| S1 | `GET /books` | 200 | defaults `limit=10`, `offset=0`, `data` is an array |
| S2 | `GET /books?search_q=java` | 200 | every title contains "java" |
| S3 | `GET /books?order_by=price&order=DESC` | 200 | prices in descending order |
| S4 | `GET /books?limit=3&offset=2&order_by=id` | 200 | exactly 3 records |
| S5 | `GET /books?min_price=300&max_price=500` | 200 | every price between 300 and 500 |
| S6 | `GET /books?search_q=a&min_price=200&max_price=800&order_by=title&order=ASC&limit=5&offset=0` | 200 | all filters work together |
| S7 | `GET /books/1` | 200 | returned id is 1 |
| S8 | `POST /books` valid body | 201 | book returned with a numeric id |
| S9 | `PUT /books/{{createdId}}` | 200 | title updated |
| S10 | `DELETE /books/{{createdId}}` | 200 | success message |

## Failure cases

| ID | Request | Expected status | Message mentions |
| --- | --- | --- | --- |
| F1 | `POST /books` without title | 400 | title |
| F2 | `POST /books` without author | 400 | author |
| F3 | `POST /books` without price | 400 | price |
| F4 | `POST /books` with `price: "abc"` | 400 | number |
| F5 | `POST /books` with `price: -10` | 400 | negative |
| F6 | `POST /books` with `{}` | 400 | message present |
| F7 | `POST /books` with broken JSON | 400 | JSON |
| F8 | `PUT /books/1` with `price: "free"` | 400 | number |
| F9 | `GET /books/99999` | 404 | not found |
| F10 | `PUT /books/99999` valid body | 404 | not found |
| F11 | `DELETE /books/99999` | 404 | not found |
| F12 | `GET /books/abc` | 400 | id |
| F13 | `GET /books?order_by=password` | 400 | order_by |
| F14 | `GET /books?order=sideways` | 400 | ASC |
| F15 | `GET /books?limit=0` | 400 | limit |
| F16 | `GET /books?limit=abc` | 400 | limit |
| F17 | `GET /books?offset=-1` | 400 | offset |
| F18 | `GET /books?min_price=cheap` | 400 | min_price |
| F19 | `GET /books?min_price=900&max_price=100` | 400 | min_price |
| F20 | `GET /authors` (unknown route) | 404 | not found |
| F21 | `GET /books?search_q='; DROP TABLE books; --` | 200 | no rows, table still exists (SQL injection is harmless) |

Plus one health check: `GET /` returns 200.
