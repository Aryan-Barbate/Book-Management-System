import axios from "axios";

export const baseBookURL = axios.create({
  baseURL: "http://localhost:3000/",
});
