# Product API with Caching — Express.js

A simple REST API built with **Node.js** and **Express.js** for managing products with full CRUD operations.

The application uses an **in-memory cache with a 1-minute TTL (Time To Live)** to improve the performance of read requests. The project follows a **layered architecture**, where each layer has a specific responsibility.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Request Flow](#request-flow)
6. [Layer Responsibilities](#layer-responsibilities)
7. [API Endpoints](#api-endpoints)
8. [Caching](#caching)
9. [Cache TTL](#cache-ttl)
10. [Cache Invalidation](#cache-invalidation)
11. [Cache Headers](#cache-headers)
12. [Database Layer](#database-layer)
13. [How to Run](#how-to-run)
14. [How to Test](#how-to-test)
15. [Example Requests with JavaScript](#example-requests-with-javascript)

---

## Features

- Full CRUD operations for products
- Layered architecture
- Separate routes, middleware, controllers, services, and database layers
- In-memory caching for `GET /products`
- In-memory caching for `GET /products/:id`
- 1-minute cache TTL
- `X-Cache` response header with `HIT` or `MISS`
- Automatic cache expiration
- Automatic cache invalidation after successful write operations (`POST`, `PUT`, `PATCH`, `DELETE`)
- Artificial database delay to demonstrate the performance difference between cache `HIT` and `MISS`
- File-based data storage using `db.json`

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| JavaScript | Application logic |
| fs/promises | Reading and writing files |
| JSON | Data storage format |
| In-memory JavaScript object | Cache storage |

---

## Project Structure

```text
ASD_WORKSHOP/
│
├── routes/
│   └── productRoutes.js
│
├── middleware/
│   └── cacheMiddleware.js
│
├── controllers/
│   └── productController.js
│
├── services/
│   └── productService.js
│
├── database/
│   └── productDb.js
│
├── db.json
├── server.js
├── package.json
└── package-lock.json
```

### File Responsibilities

```text
routes/
    Handles API routes and connects routes with middleware/controllers.

middleware/
    Handles cache lookup, cache HIT/MISS responses,
    TTL checking, and cache invalidation.

controllers/
    Handles HTTP requests and responses.

services/
    Contains business logic.

database/
    Handles reading and writing product data to db.json.

db.json
    Stores product data.

server.js
    Starts the Express application.
```

---

## Architecture

The application follows a layered architecture:

```text
Client
   |
   v
Routes
   |
   v
Middleware
   |
   v
Controllers
   |
   v
Services
   |
   v
Database
   |
   v
db.json
```

Each layer has a clear responsibility, which makes the application easier to understand, maintain, and extend.

---

## Request Flow

### GET Request with Cache MISS

When a GET request is received and the requested data is not available in the cache:

```text
Client
  |
  | GET /products
  v
Route
  |
  v
Cache Middleware
  |
  | Cache MISS
  v
Controller
  |
  v
Service
  |
  v
Database
  |
  v
db.json
  |
  v
Response
  |
  v
Cache Middleware
  |
  | Store response in cache
  v
Client
```

### GET Request with Cache HIT

When the requested data is already cached and has not expired:

```text
Client
  |
  | GET /products
  v
Route
  |
  v
Cache Middleware
  |
  | Cache HIT
  v
Client
```

For a cache `HIT`, the controller, service, and database layers are skipped.

---

## Layer Responsibilities

| Layer | File | Responsibility |
|---|---|---|
| Route | `routes/productRoutes.js` | Defines API endpoints and attaches middleware/controllers |
| Middleware | `middleware/cacheMiddleware.js` | Handles cache lookup, TTL, `HIT`/`MISS`, and invalidation |
| Controller | `controllers/productController.js` | Handles requests, responses, status codes, and calls the service |
| Service | `services/productService.js` | Contains business logic such as generating product IDs |
| Database | `database/productDb.js` | Reads and writes data from `db.json` |

---

## API Endpoints

Base URL:

```text
http://localhost:3001
```

| Method | Endpoint | Description | Cache |
|---|---|---|---|
| GET | `/products` | Get all products | Yes |
| GET | `/products/:id` | Get product by ID | Yes |
| POST | `/products` | Create a product | Invalidates cache |
| PUT | `/products/:id` | Update a product | Invalidates cache |
| PATCH | `/products/:id` | Partially update a product | Invalidates cache |
| DELETE | `/products/:id` | Delete a product | Invalidates cache |

### GET All Products

Request:

```http
GET /products
```

Example response:

```json
[
  {
    "id": 1,
    "name": "Keyboard",
    "price": 49.99
  },
  {
    "id": 2,
    "name": "Mouse",
    "price": 19.99
  }
]
```

### GET Product by ID

Request:

```http
GET /products/1
```

Example response:

```json
{
  "id": 1,
  "name": "Keyboard",
  "price": 49.99
}
```

### Create Product

Request:

```http
POST /products
Content-Type: application/json
```

Request body:

```json
{
  "name": "Webcam",
  "price": 59
}
```

Response (HTTP status `201 Created`):

```json
{
  "id": 5,
  "name": "Webcam",
  "price": 59
}
```

### Update Product (PATCH)

Request:

```http
PATCH /products/1
Content-Type: application/json
```

Request body:

```json
{
  "price": 55
}
```

Response:

```json
{
  "id": 1,
  "name": "Keyboard",
  "price": 55
}
```

### Update Product (PUT)

Request:

```http
PUT /products/1
Content-Type: application/json
```

Request body:

```json
{
  "name": "Mechanical Keyboard",
  "price": 79.99
}
```

Response:

```json
{
  "id": 1,
  "name": "Mechanical Keyboard",
  "price": 79.99
}
```

In this project, `PUT` and `PATCH` both use the same `updateProduct` function. The new data is merged with the existing product and the `id` is never changed. If the product does not exist, the API returns `404 Product not found`.

The cache is cleared after a successful update.

### Delete Product

Request:

```http
DELETE /products/1
```

If the product exists and is successfully deleted, the cache is invalidated.

### HTTP Status Codes

| Status Code | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Product created successfully |
| `404` | Product not found |
| `500` | Internal server error |

---

## Caching

Caching is implemented in:

```text
middleware/cacheMiddleware.js
```

The application uses an in-memory JavaScript object to store cached responses.

A cache entry contains:

```js
cache["/products"] = {
  data: [...products],
  createdAt: Date.now()
};
```

The cache key is the request URL, for example `/products`, `/products/1` or `/products/2`. Each URL can have its own cache entry.

### How Caching Works

For every GET request:

**Step 1 — Check the cache.** The cache middleware checks whether the requested URL already exists in the cache.

**Step 2 — Check expiration.** If a cache entry exists, its age is calculated:

```js
Date.now() - entry.createdAt
```

**Step 3 — Cache HIT.** If the cache entry is less than 1 minute old, the response header is:

```text
X-Cache: HIT
```

The cached response is returned immediately. The request does not continue to `Controller → Service → Database`, which makes the response much faster.

**Step 4 — Cache MISS.** If there is no cache entry or the existing entry has expired, the response header is:

```text
X-Cache: MISS
```

The request continues to the controller, service, and database. After the response is generated, the middleware stores the fresh response in the cache.

---

## Cache TTL

TTL means **Time To Live**. This project uses a TTL of **1 minute** (60,000 milliseconds).

| Setting | Value |
|---|---|
| Cache TTL | 1 minute |
| TTL in milliseconds | 60,000 ms |
| Creation timestamp | `createdAt` |
| Storage | In-memory JavaScript object |
| Expired entries | Deleted |

```js
const TTL = 60 * 1000;
```

The cache entry is valid while:

```js
Date.now() - entry.createdAt < TTL
```

Once the entry reaches the TTL, it is removed and fresh data is fetched from the database and stored in the cache again.

---

## Cache Invalidation

When product data changes, existing cached data may become stale.

For example, `GET /products` may have cached a list of products. If a new product is added with `POST /products`, the previous cache no longer represents the current database state.

Therefore, the cache is invalidated after successful write operations: `POST`, `PUT`, `PATCH` and `DELETE`.

### How Cache Invalidation Works

The `invalidateCache` middleware waits for the response to finish.

- If the operation is successful and returns a `2xx` status code, the cache is **cleared**.
- If the operation fails, for example `404 Product not found`, the cache is **kept** because the data was not changed.

### Why Clear the Whole Cache?

The application clears all cache entries instead of only one key. For example, updating `/products/1` can affect both `/products` and `/products/1`. Clearing the complete cache prevents stale data from remaining in other cached endpoints.

---

## Cache Headers

The API provides an `X-Cache` response header.

| Header | Meaning |
|---|---|
| `X-Cache: MISS` | Data was fetched from the database |
| `X-Cache: HIT` | Data was served from the cache |

The first `GET /products` request returns `MISS` (the database is accessed). The second request within 1 minute returns `HIT` (the cached response is returned).

---

## Database Layer

Product data is stored in `db.json` and handled by `database/productDb.js`.

This layer is responsible for:

- Reading `db.json`
- Writing `db.json`
- Returning product data
- Adding products
- Updating products
- Deleting products
- Simulating database latency

The database layer contains an artificial delay of approximately **1.5 seconds** to make the performance difference between cache `MISS` and `HIT` easier to observe.

---

## How to Run

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ASD_WORKSHOP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
node server.js
```

The server runs at:

```text
http://localhost:3001
```

---

## How to Test

You can test the API using a browser, Postman, Thunder Client, `curl`, or the browser Developer Tools.

To see the cache header in Chrome: open `http://localhost:3001/products`, press `F12`, go to the **Network** tab, select the `/products` request and look at **Response Headers**.

### Test 1 — First GET Request

Open `http://localhost:3001/products`.

Expected: `X-Cache: MISS`. The request takes approximately 1.5 seconds because the database layer is accessed.

### Test 2 — Second GET Request

Refresh the page within 1 minute.

Expected: `X-Cache: HIT`. The response is much faster because the data is served from memory.

### Test 3 — Create a Product

Send `POST /products` with:

```json
{
  "name": "Webcam",
  "price": 59
}
```

Expected: `201 Created`. The cache is cleared.

### Test 4 — GET After POST

Open `GET /products`.

Expected: `X-Cache: MISS`, and the new product is visible.

### Test 5 — Test TTL

1. Open `/products`
2. Wait more than 1 minute
3. Open `/products` again

Expected: `X-Cache: MISS`. The old cache entry has expired and fresh data is fetched from the database.

### Test 6 — Test Product-by-ID Cache

Open `/products/1`. First request: `X-Cache: MISS`. Open it again within 1 minute: `X-Cache: HIT`.

### Test 7 — Test Cache Invalidation

1. `GET /products/1` gives `X-Cache: MISS`
2. `GET /products/1` again gives `X-Cache: HIT`
3. Send `PATCH /products/1`
4. `GET /products/1` gives `X-Cache: MISS`

This confirms that the cache was invalidated after the update.

---

## Example Requests with JavaScript

### GET Products

```js
fetch("http://localhost:3001/products")
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### POST Product

```js
fetch("http://localhost:3001/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Webcam",
    price: 59
  })
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### PATCH Product

```js
fetch("http://localhost:3001/products/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    price: 55
  })
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### DELETE Product

```js
fetch("http://localhost:3001/products/1", {
  method: "DELETE"
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

---

## Cache Behaviour Summary

```text
                  GET Request
                       |
                       v
                Cache Middleware
                       |
              +--------+--------+
              |                 |
          Cache HIT         Cache MISS
              |                 |
              v                 v
        Return Cache        Controller
                                |
                                v
                             Service
                                |
                                v
                            Database
                                |
                                v
                             db.json
                                |
                                v
                         Store in Cache
                                |
                                v
                             Client
```

For write operations:

```text
POST / PUT / PATCH / DELETE
              |
              v
          Controller
              |
              v
           Service
              |
              v
          Database
              |
              v
        Successful 2xx?
          /        \
        Yes         No
         |           |
         v           v
   Clear Cache   Keep Cache
```

---

## Learning Objectives

This project demonstrates the following Express.js concepts:

- REST API development
- Express routing
- Middleware
- Controllers
- Service layer
- Database abstraction
- CRUD operations
- In-memory caching
- Cache TTL
- Cache HIT and MISS
- HTTP response headers
- Cache invalidation
- Layered architecture
- File-based data persistence
- Asynchronous JavaScript
- Express request/response lifecycle

---

## Conclusion

This project demonstrates how a basic Express.js CRUD API can be improved using an in-memory caching layer.

The layered architecture separates responsibilities between routes, middleware, controllers, services, and the database layer, while the caching system reduces repeated database operations for frequently requested data.

The combination of **TTL-based expiration** and **cache invalidation after successful write operations** helps keep cached responses synchronized with the underlying product data.