# 💻 Book Vault — Frontend Client

<div align="center">

![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**The client-side single page application (SPA) for Book Vault, built with React 19, Vite, Tailwind CSS v4, and Lucide React.**

</div>

---

## 🎨 Neubrutalism Design System

The frontend implements a custom Neubrutalist design language characterized by:
- **Bold 3px Outlines**: Sharp high-contrast black borders around all cards, buttons, badges, and modals.
- **Hard Drop Shadows**: Solid geometric offset shadows (`shadow-[3px_3px_0px_0px_#000]`) instead of blurred shadows.
- **Vibrant Retro Palette**: `#FFDE59` (Electric Canary), `#CCFF00` (Cyber Lime), `#00F0FF` (Electric Cyan), and `#FF54B0` (Hot Pink).
- **Dual Themes**: **Pop Light** and **Cyber Dark** mode toggled instantly via the `data-theme` document attribute.
- **Tactile Micro-Interactions**: Active press translation effects (`translate-x-[2px] translate-y-[2px]`) that simulate physical buttons.

---

## 📂 Directory Structure

```
Client/Book-management/
├── public/
│   ├── favicon.svg             # Scalable Neubrutalist vector favicon
│   ├── favicon.png             # Raster 64x64 PNG favicon
│   └── favicon.ico             # 32x32 legacy ICO icon
│
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top branding bar, theme toggle & stats counter
│   │   ├── Home.jsx            # Catalog container with search, filters & grid/list toggle
│   │   ├── BookCard.jsx        # Individual book card with ratings, actions & genres
│   │   ├── BookForm.jsx        # Add / Edit book modal with validation & star selector
│   │   └── ToastNotification.jsx # Animated feedback notifications
│   │
│   ├── hooks/
│   │   └── useToasts.js        # Hook for dispatching & dismissing toast notifications
│   │
│   ├── constants/
│   │   └── genres.js           # Predefined genre categories & color badge bindings
│   │
│   ├── utils/                  # Formatters & date helper functions
│   ├── App.jsx                 # Main state coordinator & CRUD handlers
│   ├── main.jsx                # Application root mounting
│   └── index.css               # Neubrutalism utility CSS classes & theme definitions
│
├── axiosInstance.js            # Axios client with dynamic environment-aware baseURL
├── vercel.json                 # SPA fallback rewrite configuration
├── .env.example                # Sample environment variables
└── package.json
```

---

## ⚙️ Environment Variables

The client dynamically resolves the backend API location using Vite environment variables.

Create a `.env` file in this directory (or configure directly in Vercel):

```env
# URL of your running backend (without trailing slash)
# Local development default:
VITE_API_URL=http://localhost:3000

# Production (Vercel):
# VITE_API_URL=https://<your-render-backend>.onrender.com
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

In this directory, you can run:

```bash
# Start the local development server with HMR (Hot Module Replacement)
npm run dev

# Build the production bundle into dist/
npm run build

# Preview the production build locally
npm run preview

# Run the fast Oxlint code linter
npm run lint
```

---

## 🌐 Deploying to Vercel

1. **Import Git Repository**: In your [Vercel Dashboard](https://vercel.com/), select your repository.
2. **Root Directory**: Select `Client/Book-management`.
3. **Framework Preset**: `Vite` (automatically detected).
4. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: `https://<your-service-name>.onrender.com`
6. **Click Deploy**:
   Vercel will build the application using the included [`vercel.json`](vercel.json) rewrite rule:
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
   This ensures deep routing (such as `/add` or `/edit/:id`) correctly resolves without 404 errors on page reload.
