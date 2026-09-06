require("dotenv").config();
const express = require("express");
const cors = require("cors");
const databaseConnection = require("./database");
const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");
const router = require("./routes/bookRouter");
const { startKeepAlive } = require("./keepAlive");

databaseConnection();

// Root API status endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Book Management API is running" });
});

// Dedicated lightweight ping / keep-alive endpoint for Render & uptime monitors
// Best practice: zero DB overhead, cache-disabled, returns timestamp & uptime
app.get("/ping", (req, res) => {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
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
    "Pragma": "no-cache",
    "Expires": "0",
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

app.use("/books", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startKeepAlive();
});

