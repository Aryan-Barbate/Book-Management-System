require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const databaseConnection = require("./database");
const bookRouter = require("./routes/bookRouter");
const authRouter = require("./routes/authRouter");
const { startKeepAlive } = require("./keepAlive");

const app = express();

// Enable CORS for all origins with credentials & authorization headers
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with 25MB limit for cover images & bulk imports
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Connect to MongoDB
databaseConnection();

// Root API status endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Book Management API is running",
    version: "2.0.0",
    features: [
      "JWT & Google Authentication",
      "Multi-Tenancy",
      "Cover Art & Uploads",
      "ISBN Lookup & Barcode Scanning",
      "Custom Shelves & Multi-Tagging",
      "Quotes & Notes Journal",
      "CSV, Goodreads & JSON Import/Export",
      "Server-Side Pagination",
    ],
  });
});

// Dedicated lightweight ping / keep-alive endpoint for Render & uptime monitors
app.get("/ping", (req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  res.status(200).json({
    status: "ok",
    message: "pong",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Health check with MongoDB connection status diagnostics
app.get("/health", (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const isConnected = readyState === 1;

  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "degraded",
    database: {
      status: states[readyState] || "unknown",
      readyState: readyState,
      dbName: mongoose.connection.name || process.env.DB_NAME || "unknown",
    },
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/auth", authRouter);
app.use("/books", bookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startKeepAlive();
});
