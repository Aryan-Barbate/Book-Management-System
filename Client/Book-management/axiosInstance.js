import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL;
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Safe fallback: when deployed, use the live Render backend if VITE_API_URL is omitted
const defaultBaseUrl = !isLocalhost
  ? "https://book-management-system-m43r.onrender.com"
  : "http://localhost:3000";

export const apiBaseUrl = (rawUrl || defaultBaseUrl).replace(/\/+$/, "");

export const baseBookURL = axios.create({
  baseURL: apiBaseUrl,
  timeout: 35000, // 35 seconds to accommodate Render free-tier cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

