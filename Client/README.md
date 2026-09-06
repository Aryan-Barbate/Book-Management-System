# 💻 Book Vault — Frontend Client (React 19 + Vite)

<div align="center">

![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**The client-side single page application (SPA) for Book Vault, built with React 19, Vite, Tailwind CSS v4, and Lucide React in an electric Neubrutalist aesthetic.**

[UI Showcase](#-ui-showcase) • [Neubrutalism System](#-neubrutalism-design-system) • [Components](#-component-architecture) • [Setup](#-getting-started) • [Deployment](#-deploying-to-vercel)

</div>

---

## 🎨 Neubrutalism Design System

The frontend implements an uncompromising Neubrutalist design language characterized by:
- **Heavy 3px Solid Outlines**: Crisp, high-contrast borders wrapping every card, pill, input, and modal dialog.
- **Hard Geometric Shadows**: Hard drop shadows (`shadow-[3px_3px_0px_#000]`) rather than smooth blurred shadows.
- **High-Energy Retro Palette**:
  - **Canary Yellow**: `#FFDE59` (Hero cards, primary buttons, rating highlights)
  - **Cyber Lime**: `#CCFF00` (Demo access, success states, JSON export)
  - **Electric Cyan**: `#00F0FF` (Action triggers, CSV export, shelf chips)
  - **Hot Pink**: `#FF54B0` (Romance genre, notifications, alerts)
  - **Cyber Purple**: `#A855F7` (Quotes journal modal header)
- **Dual Dynamic Themes**: **Pop Light** and **Cyber Dark** mode toggled instantly via the document-level `data-theme` attribute.
- **Physical Button Physics**: Active micro-translation effects (`active:translate-x-[2px] active:translate-y-[2px]`) for a satisfying tactile feel.

---

## 📸 UI Showcase

### 1. Catalog Grid View & Filtering Engine
Interactive book cards with star ratings, real cover art, shelf chips, and live genre filtering.

![Catalog Grid View](../utils/books-grid-view.png)

---

### 2. High-Density List View
Alternative compact view for quick cataloging, showing cover thumbnails, publication age badges, price badges, and quick journal/edit actions.

![Books List View](../utils/books-list-view.png)

---

### 3. Add & Edit Ingestion Modals
Integrated camera barcode scanning, ISBN lookup via Google Books / OpenLibrary, and cover previewing.

<p align="center">
  <img src="../utils/add-book-modal.png" width="49%" alt="Add Book Modal" />
  <img src="../utils/edit-book-modal.png" width="49%" alt="Edit Book Modal" />
</p>

---

### 4. Reading Journal & Private Notes
Interactive quote tracker with page number markers, personal reflections, and full-length study notes.

![Reading Journal Modal](../utils/reading-journal-modal.png)

---

### 5. Multi-User Authentication & Data Portability
Instant 1-click demo access, Google OAuth token verification, and lossless JSON/CSV export & import.

<p align="center">
  <img src="../utils/auth-modal.png" width="49%" alt="Authentication Modal" />
  <img src="../utils/import-export-modal.png" width="49%" alt="Import Export Modal" />
</p>

---

## 📂 Component Architecture

```
Client/
├── public/
│   ├── favicon.svg             # Scalable Neubrutalist vector favicon
│   ├── favicon.png             # Raster 64x64 PNG favicon
│   └── favicon.ico             # 32x32 legacy ICO icon
│
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx           # 1-Click demo, Google OAuth & email login modal
│   │   ├── BarcodeScannerModal.jsx # Camera barcode scanner (HTML5 Barcode Detection)
│   │   ├── BookCard.jsx            # Grid view book card with ratings, actions & tags
│   │   ├── BookForm.jsx            # Add & Edit modal with ISBN auto-fill & cover preview
│   │   ├── BookJournalModal.jsx    # Quotes journal & private notes editor modal
│   │   ├── BookList.jsx            # High-density horizontal list view
│   │   ├── Header.jsx              # Brand banner, theme toggle, stats & nav buttons
│   │   ├── Home.jsx                # Search bar, shelf selector pills & genre chips
│   │   ├── ImportExportModal.jsx   # CSV/JSON export & Goodreads CSV import handler
│   │   ├── PaginationControls.jsx  # Server-side pagination & page size dropdown
│   │   ├── Stats.jsx               # 4-metric collection insights & portfolio valuation
│   │   └── ToastNotification.jsx   # Tactile toast alert system
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication provider (JWT token & user state)
│   │
│   ├── hooks/
│   │   └── useToasts.js            # Custom hook for queueing & auto-dismissing toasts
│   │
│   ├── constants/
│   │   └── genres.js               # Genre categories & badge color bindings
│   │
│   ├── utils/                      # Currency formatters, date utilities & CSV parsers
│   ├── App.jsx                     # Root state orchestrator & API integration handlers
│   ├── main.jsx                    # React 19 entry point
│   └── index.css                   # Tailwind v4 directives & Neubrutalist CSS rules
│
├── axiosInstance.js                # Dynamic environment-aware Axios client
├── vercel.json                     # SPA fallback rewrites for Vercel
├── .env.example                    # Sample environment template
└── package.json
```

---

## ⚙️ Environment Configuration

The frontend dynamically resolves the backend API URL using Vite environment variables.

Create a `.env` file in `Client/` (or configure in Vercel project settings):

```env
# URL of your running backend (without trailing slash)
# Local development default:
VITE_API_URL=http://localhost:3000

# Production (Vercel):
# VITE_API_URL=https://your-service.onrender.com
```

In [`axiosInstance.js`](axiosInstance.js):
```javascript
const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export const baseBookURL = axios.create({
  baseURL: apiBaseUrl,
});
```

---

## 🚀 Available Scripts

In the `Client` directory, you can run:

```bash
# Start Vite development server with Hot Module Replacement (HMR)
npm run dev

# Type-check and bundle production assets into dist/
npm run build

# Preview production build locally
npm run preview

# Run Oxlint static code linter
npm run lint
```

---

## 🌐 Deploying to Vercel

1. **Import Git Repository**: In your [Vercel Dashboard](https://vercel.com/), import this repo.
2. **Root Directory**: Select `Client`.
3. **Framework Preset**: `Vite` (automatically detected).
4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variable**:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
6. **Deploy**:
   Vercel will build the application using the included [`vercel.json`](vercel.json):
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   This ensures deep routing (such as `/add` or `/edit/:id`) correctly resolves without 404 errors on browser reload.
