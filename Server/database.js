const mongoose = require("mongoose");

// Track connection event listeners once
let listenersInitialized = false;

function setupConnectionEvents() {
  if (listenersInitialized) return;
  listenersInitialized = true;

  mongoose.connection.on("connected", () => {
    console.log(`[MongoDB] Connected successfully to database: "${mongoose.connection.name || process.env.DB_NAME}"`);
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Connection lost (disconnected). Attempting reconnection...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[MongoDB] Reconnected successfully.");
  });
}

const databaseConnection = async () => {
  setupConnectionEvents();

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "Book-Management";

  if (!uri) {
    console.error(
      "[MongoDB] ERROR: MONGODB_URI environment variable is not defined!\n" +
      "If running locally, set MONGODB_URI in Server/.env.\n" +
      "If running on Render, add MONGODB_URI under Service Settings -> Environment Variables."
    );
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 8000, // Fail faster if network/IP is blocked
    });
  } catch (err) {
    console.error(
      `[MongoDB] Initial connection failed: ${err.message}\n` +
      "Troubleshooting tips:\n" +
      "1. MongoDB Atlas Network Access: Ensure 0.0.0.0/0 is added to your IP Access List.\n" +
      "2. Credentials: Verify your username and password in MONGODB_URI are correct and URL-encoded.\n" +
      "3. Database Name: Verify DB_NAME matches your Atlas collection target."
    );
  }
};

module.exports = databaseConnection;

