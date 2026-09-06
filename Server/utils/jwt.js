const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "book-vault-super-secret-jwt-key-2026-prod";

/**
 * Base64URL encode a buffer or string
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Base64URL decode to string
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Sign a JWT token using HS256 algorithm.
 * Uses jsonwebtoken if installed, otherwise built-in Node crypto.
 */
function signToken(payload, expiresInStr = "7d") {
  try {
    const jwt = require("jsonwebtoken");
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInStr });
  } catch (e) {
    // Fallback to pure Node.js crypto HS256 implementation
    const header = { alg: "HS256", typ: "JWT" };

    // Calculate expiry in seconds
    let seconds = 7 * 24 * 60 * 60; // 7 days default
    if (typeof expiresInStr === "string") {
      if (expiresInStr.endsWith("d")) {
        seconds = parseInt(expiresInStr, 10) * 24 * 60 * 60;
      } else if (expiresInStr.endsWith("h")) {
        seconds = parseInt(expiresInStr, 10) * 60 * 60;
      } else if (expiresInStr.endsWith("m")) {
        seconds = parseInt(expiresInStr, 10) * 60;
      } else if (expiresInStr.endsWith("s")) {
        seconds = parseInt(expiresInStr, 10);
      }
    } else if (typeof expiresInStr === "number") {
      seconds = expiresInStr;
    }

    const now = Math.floor(Date.now() / 1000);
    const enrichedPayload = {
      ...payload,
      iat: now,
      exp: now + seconds,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(enrichedPayload));
    const signature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

/**
 * Verify a JWT token.
 * Uses jsonwebtoken if installed, otherwise pure Node crypto.
 */
function verifyToken(token) {
  try {
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (e.name === "TokenExpiredError" || e.name === "JsonWebTokenError") {
      throw e;
    }

    // Node.js crypto verification fallback
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("JWT must have 3 parts");
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      const err = new Error("Token expired");
      err.name = "TokenExpiredError";
      throw err;
    }

    return payload;
  }
}

module.exports = {
  signToken,
  verifyToken,
  JWT_SECRET,
};
