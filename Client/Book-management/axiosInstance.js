import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export const baseBookURL = axios.create({
  baseURL: apiBaseUrl,
});
