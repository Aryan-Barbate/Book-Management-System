# 📚 Book Vault — Neubrutalism Book Management System

<div align="center">

![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-9.8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)

**A high-energy, full-stack literature tracking platform engineered with the MERN stack and styled in an electric Neubrutalist aesthetic.**

[Features](#-key-features) • [Screenshots](#-visual-showcase) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [API Reference](#-api-endpoints)

</div>

---

## ⚡ Overview

**Book Vault** is a personal library management and literature valuation dashboard. Built with a decoupled **Express/MongoDB** backend and a **React 19/Vite** frontend, it pairs robust CRUD capabilities with an eye-catching Neubrutalism design system — featuring heavy outlines, bold offset box shadows, vibrant retro-pop colors, and an interactive Cyber Dark mode.

---

## 📸 Visual Showcase

### 1. Dashboard & Command Center
High-contrast hero banner displaying active collection metrics, valuation counter, search bar, and genre filter pills.

![Dashboard & Command Center](utils/dashboard-hero.png)

### 2. Interactive Book Grid View
Rich book cards featuring genre tags, author credits, synopsis previews, prices, star ratings, and quick actions.

![Books Grid View](utils/books-grid-view.png)

### 3. Compact List View
Toggle into a clean horizontal list view for rapid browsing across large collections.

![Books List View](utils/books-list-view.png)

### 4. Collection Insights & Valuation
Real-time calculated stats including collection count, cumulative portfolio value, top category, and saved favorites.

![Collection Insights](utils/collection-insights.png)

### 5. Add & Edit Modals
Neubrutalist modal forms complete with live interactive star ratings, date pickers, category dropdowns, and form validation.

<p align="center">
  <img src="utils/add-book-modal.png" width="48%" alt="Add Book Modal" />
  <img src="utils/edit-book-modal.png" width="48%" alt="Edit Book Modal" />
</p>

### 6. Favorites Filter
Instant one-click bookmarking of favorite titles with quick filter isolation.

![Favorites Filter](utils/favorites-filter.png)

---

### ✨ Key Features (v2.0)

- **🔐 Multi-User Authentication & Tenancy**: Email/password registration and login with JWT, Google OAuth integration, secure password hashing, and user-scoped collections with zero-friction 1-click demo access.
- **🎨 Real Cover Art & File Uploads**: Real book cover rendering in grid and list views, image file upload support (Base64), image URL input, and automatic cover image population from ISBN lookups.
- **📱 ISBN Auto-Fill & HTML5 Barcode Scanner**: Instant lookup from Google Books & OpenLibrary APIs to auto-fill title, author, description, publish date, page count, and genre; plus an in-browser HTML5 camera barcode scanner.
- **📚 Custom Shelves & Multi-Tagging**: User-defined custom shelves ("Want to Read", "Currently Reading", "Read", "Favorites", and user-created collections like "Summer 2026") alongside flexible tagging chips.
- **📝 Quotes & Reading Journal**: Dedicated per-book reading journal with page markers, blockquotes, and personal reflections, plus full-length study notes.
- **🔄 CSV, Goodreads & JSON Import/Export**: Export your library as CSV or JSON, and import from standard CSVs or Goodreads library export files with smart schema mapping.
- **📄 Server-Side Pagination**: Full limit/skip backend pagination with page number navigation, page size selectors (6, 12, 24, 48), and server-side filtering.
- **🎨 Electric Neubrutalism UI**: Heavy 3px solid black borders, hard drop shadows (`shadow-[3px_3px_0px_#000]`), retro color accents (vibrant yellow `#FFDE59`, cyan, hot pink, lime), and tactile hover micro-interactions.
- **🌓 Cyber Dark & Pop Light Modes**: Full theme switching with dynamic `data-theme` switching and high-contrast color token mapping.
- **🚀 Cloud Production Ready**: Fully configured for one-click deployment on **Render** (API backend) and **Vercel** (SPA frontend).

---

## 🏗️ Project Architecture

```
Book-Management-System/
├── Client/                         # Frontend (React 19 + Vite + Tailwind v4)
│   ├── public/
│   │   ├── favicon.svg             # Neubrutalism vector favicon
│   │   ├── favicon.png             # Raster favicon
│   │   └── favicon.ico             # Legacy favicon
│   ├── src/
│   │   ├── components/             # UI components (Header, BookCard, BookForm, etc.)
│   │   ├── context/                # Auth context (JWT + Google OAuth)
│   │   ├── hooks/                  # Custom hooks (useToasts)
│   │   ├── constants/              # Static genre tags and themes
│   │   ├── utils/                  # Helper utilities (format, csv)
│   │   ├── App.jsx                 # Root application orchestrator
│   │   ├── main.jsx                # React root entry
│   │   └── index.css               # Neubrutalist utility CSS rules
│   ├── axiosInstance.js            # Configured Axios client with dynamic baseURL
│   ├── vercel.json                 # Vercel SPA routing rewrites
│   ├── .env.example                # Sample client environment variables
│   └── package.json
│
├── Server/                         # Backend (Node.js + Express 5 + MongoDB)
│   ├── controllers/                # Request handlers (bookController.js)
│   ├── models/                     # Mongoose schemas (book.js)
│   ├── routes/                     # REST route definitions (bookRouter.js)
│   ├── database.js                 # MongoDB connection handler
│   ├── index.js                    # Express app entry & PORT listener
│   ├── .env.example                # Sample backend environment variables
│   └── package.json
│
├── utils/                          # High-resolution screenshots & UI assets
│   ├── dashboard-hero.png
│   ├── books-grid-view.png
│   ├── books-list-view.png
│   ├── collection-insights.png
│   ├── add-book-modal.png
│   ├── edit-book-modal.png
│   └── favorites-filter.png
│
├── render.yaml                     # Render Blueprint infrastructure specification
└── README.md                       # Main project documentation
```

---

## 🛠️ Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | [React 19](https://react.dev/) | Component architecture & modern hooks |
| | [Vite 8](https://vite.dev/) | Lightning-fast bundler & development environment |
| | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS framework for custom styling tokens |
| | [React Router v7](https://reactrouter.com/) | Client-side routing with clean URL support |
| | [Lucide React](https://lucide.dev/) | High-clarity iconography |
| | [Axios](https://axios-http.com/) | HTTP client with automatic base URL detection |
| **Backend** | [Node.js](https://nodejs.org/) | Asynchronous JavaScript runtime |
| | [Express.js 5](https://expressjs.com/) | RESTful API routing framework |
| | [Mongoose 9](https://mongoosejs.com/) | Object Data Modeling (ODM) for MongoDB |
| | [Dotenv](https://www.npmjs.com/package/dotenv) | Secure environment variable configuration |
| | [CORS](https://www.npmjs.com/package/cors) | Cross-origin resource sharing middleware |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Multi-cloud document database |
| **Hosting** | [Vercel](https://vercel.com/) | Edge hosting for the React single-page application |
| | [Render](https://render.com/) | Managed cloud hosting for the Node.js API |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- [Node.js](https://nodejs.org/) (version 18.0 or newer)
- [npm](https://www.npmjs.com/) (version 9.0 or newer)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection URI

### 1. Clone the Repository

```bash
git clone https://github.com/Aryan-Barbate/Book-Management-System.git
cd Book-Management-System
```

### 2. Backend Setup

```bash
# Navigate to Server directory
cd Server

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

Open `Server/.env` and supply your MongoDB Atlas credentials:

```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
DB_NAME=Book-Management
```

Start the backend server:

```bash
# Production mode
npm start

# Or development mode (with nodemon live-reload)
npm run dev
```

The server will launch at: `http://localhost:3000`

### 3. Frontend Setup

In a new terminal window:

```bash
# Navigate to Client directory
cd Client

# Install dependencies
npm install

# Create environment configuration (optional for local dev)
cp .env.example .env
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will launch at: `http://localhost:5173`

---

## 🌐 Cloud Deployment

### Deploying the Backend on Render
1. Create a new **Web Service** on [Render](https://dashboard.render.com/) connected to your repo.
2. Set **Root Directory** to `Server`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Set **Health Check Path** to `/ping` (or deploy with the included [`render.yaml`](render.yaml) Blueprint).
5. Add the environment variables:
   - `MONGODB_URI`: *Your MongoDB connection string*
   - `DB_NAME`: `Book-Management`
6. Live backend URL: `https://book-management-system-m43r.onrender.com`
7. **Keep Active 24/7 (Prevent Sleep)**: Render Free tier spins down after 15 minutes of inactivity. The backend automatically pings itself via `RENDER_EXTERNAL_URL/ping` every 14 minutes. For 100% reliability, you can also add a free ping monitor on [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/) targeting `https://book-management-system-m43r.onrender.com/ping` every 10–14 minutes.

### Deploying the Frontend on Vercel
1. Import your repository on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `Client`.
3. Framework Preset: `Vite`.
4. Add the environment variable:
   - `VITE_API_URL`: `https://book-management-system-m43r.onrender.com` *(without trailing slash)*
5. Click **Deploy**.

---

## 📡 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Payload Sample |
|---|---|---|---|
| `POST` | `/auth/register` | Create user account | `{ "name": "...", "email": "...", "password": "..." }` |
| `POST` | `/auth/login` | Log in with email/password | `{ "email": "...", "password": "..." }` |
| `POST` | `/auth/google` | Google OAuth token verification | `{ "credential": "..." }` |
| `POST` | `/auth/demo` | 1-Click instant demo login | None |
| `GET` | `/auth/me` | Current user profile | Bearer Token in Header |
| `PUT` | `/auth/shelves` | Update custom shelves list | `{ "customShelves": ["Want to Read", "Summer 2026"] }` |

### Books (`/books`)

| Method | Endpoint | Description | Payload / Query Params |
|---|---|---|---|
| `GET` | `/books` | Retrieve paginated books | Query: `?page=1&limit=12&search=...&genre=...&shelf=...&tag=...&sortBy=...` |
| `POST` | `/books` | Create new book entry | `{ "bookName": "...", "bookAuthor": "...", "coverUrl": "...", "shelf": "...", "tags": [...] }` |
| `POST` | `/books/import` | Bulk import books | `{ "books": [ { "bookName": "...", "bookAuthor": "..." } ] }` |
| `GET` | `/books/lookup/:isbn` | Query Google/OpenLibrary by ISBN | None |
| `GET` | `/books/:id` | Get book details by ID | None |
| `PUT` | `/books/:id` | Update book by ID | `{ "shelf": "Read", "rating": 5 }` |
| `DELETE` | `/books/:id` | Delete a book by ID | None |
| `POST` | `/books/:id/quotes` | Add quote to reading journal | `{ "quote": "...", "page": 42, "note": "..." }` |
| `DELETE` | `/books/:id/quotes/:quoteId` | Remove quote from journal | None |
| `PUT` | `/books/:id/notes` | Update private study notes | `{ "notes": "..." }` |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
