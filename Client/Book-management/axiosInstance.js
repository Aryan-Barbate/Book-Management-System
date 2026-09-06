import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL;
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// If deployed and VITE_API_URL was not set during build, warn in console
if (typeof window !== "undefined" && !isLocalhost && (!rawUrl || rawUrl.includes("localhost"))) {
  console.error(
    "[BookVault Config] VITE_API_URL is missing or set to localhost on a deployed website!\n" +
    "To fix: Set VITE_API_URL=https://<your-backend>.onrender.com in your Vercel Project Settings -> Environment Variables, then redeploy."
  );
}

export const apiBaseUrl = (rawUrl || "http://localhost:3000").replace(/\/+$/, "");

export const baseBookURL = axios.create({
  baseURL: apiBaseUrl,
  timeout: 35000, // 35 seconds to accommodate Render free-tier cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

