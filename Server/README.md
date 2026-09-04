# ⚙️ Book Vault — Express & MongoDB Backend API

<div align="center">

![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-9.8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

**The RESTful API service powering Book Vault, built with Node.js, Express 5, and Mongoose for MongoDB Atlas.**

</div>

---

## 📂 Architecture Overview

```
Server/
├── controllers/
│   └── bookController.js       # CRUD business logic and request handlers
│
├── models/
│   └── book.js                 # Mongoose document schema definition
│
├── routes/
│   └── bookRouter.js           # Express route definitions for /books
│
├── database.js                 # Asynchronous MongoDB connection manager
├── index.js                    # Server setup, middleware, route mounting & PORT binding
├── .env.example                # Sample environment configuration
└── package.json                # Dependencies and production run scripts
```

---

## 🗄️ Database Schema

Books are modeled using Mongoose in [`models/book.js`](models/book.js):

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `bookName` | `String` | Yes | — | Title of the book |
| `bookAuthor` | `String` | Yes | — | Author name |
| `bookPrice` | `Number` | Yes | — | Retail or valuation price (USD) |
| `publishDate` | `Date` | No | — | Date of publication |
| `genre` | `String` | No | `"General"` | Literature category (e.g., Fiction, Sci-Fi, Mystery) |
| `rating` | `Number` | No | `5` | User star rating from 1 to 5 |
| `description` | `String` | No | `""` | Brief summary, synopsis, or user notes |
| `isFavorite` | `Boolean` | No | `false` | Bookmark status |

---

## 📡 REST API Reference

All endpoints return JSON responses.

### 1. Health Check
```http
GET /
```
**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "message": "Book Management API is running"
}
```

---

### 2. Get All Books
```http
GET /books
```
**Response (`200 OK`)**:
```json
{
  "Message": "Book Details retrieved successfully",
  "BookList": [
    {
      "_id": "6648f8c2b53f7c0012345678",
      "bookName": "The Great Gatsby",
      "bookAuthor": "F. Scott Fitzgerald",
      "bookPrice": 14.99,
      "publishDate": "1925-04-10T00:00:00.000Z",
      "genre": "Classic",
      "rating": 5,
      "description": "A portrait of the Jazz Age.",
      "isFavorite": true
    }
  ]
}
```

---

### 3. Create a Book
```http
POST /books
Content-Type: application/json
```
**Request Body**:
```json
{
  "bookName": "Clean Code",
  "bookAuthor": "Robert C. Martin",
  "bookPrice": 39.95,
  "publishDate": "2008-08-01",
  "genre": "Non-Fiction",
  "rating": 5,
  "description": "A Handbook of Agile Software Craftsmanship",
  "isFavorite": false
}
```
**Response (`201 Created`)**:
```json
{
  "Message": "Book added successfully!",
  "data": { ... }
}
```

---

### 4. Update a Book
```http
PUT /books/:id
Content-Type: application/json
```
**Request Body**:
```json
{
  "bookPrice": 29.99,
  "rating": 4,
  "isFavorite": true
}
```
**Response (`200 OK`)**:
```json
{
  "Message": "Book updated successfully!",
  "data": { ... }
}
```

---

### 5. Delete a Book
```http
DELETE /books/:id
```
**Response (`200 OK`)**:
```json
{
  "Message": "Book deleted successfully"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file inside this `Server/` directory (see [`.env.example`](.env.example)):

```env
# Port for local server (defaults to 3000 if omitted)
PORT=3000

# MongoDB connection string (Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority

# Database name
DB_NAME=Book-Management
```

---

## 🚀 Available Scripts

```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server with live reload (nodemon)
npm run dev
```

---

## 🌐 Deploying to Render

This service is pre-configured for Render using the root [`render.yaml`](../render.yaml) Blueprint or manual configuration:

1. **Create Web Service**: On [Render Dashboard](https://dashboard.render.com/), choose your GitHub repository.
2. **Settings**:
   - **Root Directory**: `Server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
3. **Environment Variables**:
   - `MONGODB_URI`: *Your MongoDB connection URI*
   - `DB_NAME`: `Book-Management`
4. **Network Access**: Ensure your MongoDB Atlas cluster allows inbound connections from anywhere (`0.0.0.0/0`).
