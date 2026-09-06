# ⚙️ Book Vault — Express 5 & MongoDB Backend API

<div align="center">

![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-9.8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Secure-black?style=for-the-badge&logo=jsonwebtokens)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

**The RESTful API service powering Book Vault, built with Node.js, Express 5, and Mongoose for MongoDB Atlas.**

[Architecture](#-architecture-overview) • [Database Schemas](#-database-schemas) • [Keep-Alive Engine](#-keep-alive-engine-render-free-tier) • [API Reference](#-rest-api-reference) • [Deployment](#-cloud-deployment-on-render)

</div>

---

## 📂 Architecture Overview

```
Server/
├── controllers/
│   ├── authController.js       # Authentication handlers (Register, Login, Google OAuth, Demo)
│   └── bookController.js       # Books CRUD, ISBN lookup, pagination, quotes & notes
│
├── middleware/
│   └── auth.js                 # JWT Bearer token authentication & route protection
│
├── models/
│   ├── book.js                 # Mongoose schema for book records & reading journals
│   └── user.js                 # Mongoose schema for user profiles & custom shelves
│
├── routes/
│   ├── authRouter.js           # Route definitions for /auth endpoints
│   └── bookRouter.js           # Route definitions for /books endpoints
│
├── database.js                 # Resilient MongoDB Atlas connection manager with retry logic
├── keepAlive.js                # Self-ping keep-alive service for Render free-tier sleep prevention
├── index.js                    # Express app initialization, middleware pipeline & PORT listener
├── seed.js                     # Sample library seeder for quick database bootstrapping
├── .env.example                # Sample environment variable template
└── package.json                # Dependencies and scripts
```

---

## 🗄️ Database Schemas

### 1. Book Schema (`models/book.js`)

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `bookName` | `String` | **Yes** | — | Title of the volume |
| `bookAuthor` | `String` | **Yes** | — | Author name |
| `bookPrice` | `Number` | **Yes** | `0` | Valuation price (USD) |
| `publishDate` | `Date` | No | — | Date of publication |
| `genre` | `String` | No | `"General"` | Literature category (Fiction, Sci-Fi, etc.) |
| `rating` | `Number` | No | `5` | User star rating (1 to 5) |
| `description` | `String` | No | `""` | Synopsis or book summary |
| `coverUrl` | `String` | No | `""` | Cover image URL or Base64 data string |
| `isbn` | `String` | No | `""` | 10 or 13 digit ISBN number |
| `pageCount` | `Number` | No | `0` | Total number of pages |
| `shelf` | `String` | No | `"Want to Read"` | Active shelf (*"Want to Read"*, *"Currently Reading"*, *"Read"*, *"Favorites"*, etc.) |
| `tags` | `[String]` | No | `[]` | Freeform categorization chips |
| `isFavorite` | `Boolean` | No | `false` | Favorite status indicator |
| `quotes` | `[Quote]` | No | `[]` | Subdocuments: `{ quote, page, note, createdAt }` |
| `notes` | `String` | No | `""` | Private study and review notes |
| `user` | `ObjectId` | No | `null` | Reference to `User` model (for multi-tenant collections) |

### 2. User Schema (`models/user.js`)

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `String` | **Yes** | Display name |
| `email` | `String` | **Yes** | Unique email address |
| `password` | `String` | Conditional | Bcrypt-hashed password (optional for Google OAuth users) |
| `googleId` | `String` | No | Google profile subject ID |
| `avatar` | `String` | No | Profile picture URL |
| `customShelves`| `[String]` | No | User-created custom shelves (e.g. `["Summer 2026", "Tech"]`) |

---

## ⚡ Keep-Alive Engine (Render Free Tier)

Render's free web services automatically spin down after 15 minutes of HTTP inactivity, incurring a 30-50 second cold start on the next request.

Book Vault implements a multi-layer keep-alive solution:

1. **Lightweight `/ping` Endpoint**:
   - Responds to both `GET /ping` and `HEAD /ping`.
   - Bypasses the database completely for sub-millisecond response times.
   - Sends `Cache-Control: no-store, no-cache, must-revalidate` headers.
2. **Self-Pinging Background Service ([`keepAlive.js`](keepAlive.js))**:
   - In production environments with `RENDER_EXTERNAL_URL` set, the server automatically fires an HTTP request to `RENDER_EXTERNAL_URL/ping` every 14 minutes.
3. **External Uptime Monitoring**:
   - You can also configure a free external probe via [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/) targeting `/ping` every 10–14 minutes for 100% continuous uptime.

---

## 📡 REST API Reference

### Health & Keep-Alive

```http
GET /ping
HEAD /ping
```
**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "message": "pong",
  "timestamp": "2026-09-06T10:45:00.000Z",
  "uptime": 1420
}
```

---

### Authentication Routes (`/auth`)

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Alex Reader",
  "email": "alex@bookvault.io",
  "password": "SecurePassword123"
}
```
**Response (`201 Created`)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Alex Reader", "email": "alex@bookvault.io" }
}
```

#### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alex@bookvault.io",
  "password": "SecurePassword123"
}
```
**Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": { ... }
}
```

#### 3. Instant 1-Click Demo Login
```http
POST /auth/demo
```
**Response (`200 OK`)**: Logs into the public demo user account with sample books and shelves.

#### 4. Update Custom Shelves
```http
PUT /auth/shelves
Authorization: Bearer <token>
Content-Type: application/json

{
  "customShelves": ["Want to Read", "Currently Reading", "Read", "Favorites", "Summer 2026"]
}
```

---

### Book Routes (`/books`)

#### 1. Get Paginated Books (With Filters & Search)
```http
GET /books?page=1&limit=12&search=gatsby&genre=Classic&shelf=Read&sortBy=bookName&order=asc
```
**Response (`200 OK`)**:
```json
{
  "Message": "Books retrieved successfully",
  "BookList": [ ... ],
  "pagination": {
    "totalBooks": 24,
    "page": 1,
    "limit": 12,
    "totalPages": 2
  }
}
```

#### 2. Create Book
```http
POST /books
Authorization: Bearer <token> (optional)
Content-Type: application/json

{
  "bookName": "Clean Code",
  "bookAuthor": "Robert C. Martin",
  "bookPrice": 39.95,
  "publishDate": "2008-08-01",
  "genre": "Non-Fiction",
  "rating": 5,
  "shelf": "Read",
  "description": "A handbook of agile software craftsmanship.",
  "coverUrl": "https://covers.openlibrary.org/b/id/123456-L.jpg"
}
```

#### 3. Bulk Import (CSV / Goodreads)
```http
POST /books/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "books": [
    { "bookName": "1984", "bookAuthor": "George Orwell", "bookPrice": 12.99, "genre": "Dystopian" }
  ]
}
```

#### 4. ISBN Lookup
```http
GET /books/lookup/9780143127741
```
Queries Google Books and OpenLibrary to auto-resolve book metadata (title, author, publisher, description, cover art, page count, and genre).

#### 5. Quotes & Reading Journal
```http
POST /books/:id/quotes
Content-Type: application/json

{
  "quote": "The body keeps the score: if memory of trauma is encoded in the visceral...",
  "page": 42,
  "note": "Crucial concept regarding somatic memory storage."
}
```

```http
DELETE /books/:id/quotes/:quoteId
```

#### 6. Private Study Notes
```http
PUT /books/:id/notes
Content-Type: application/json

{
  "notes": "Chapter 4 takeaways: Neuroplasticity and body awareness therapies."
}
```

---

## 🚀 Getting Started

### Local Setup

```bash
# Navigate to Server directory
cd Server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure `Server/.env`:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=Book-Management
JWT_SECRET=your_jwt_secret_key
RENDER_EXTERNAL_URL=http://localhost:3000
```

Start the service:
```bash
# Development with live reloading
npm run dev

# Production
npm start
```

### Seeding Sample Data

To populate the database with a rich set of starter books, covers, shelves, and quotes:
```bash
node seed.js
```

---

## 🌐 Cloud Deployment on Render

1. Create a **Web Service** on [Render](https://dashboard.render.com/).
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `Server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/ping`
4. Define Environment Variables:
   - `MONGODB_URI`: *Your MongoDB connection string*
   - `DB_NAME`: `Book-Management`
   - `JWT_SECRET`: *A secure random string*
   - `RENDER_EXTERNAL_URL`: `https://your-service-name.onrender.com`
5. Deploy service.
