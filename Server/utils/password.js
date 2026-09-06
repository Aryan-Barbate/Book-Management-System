const crypto = require("crypto");

/**
 * Hash a password using bcryptjs if available, or pbkdf2 with salt.
 */
async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password must be a non-empty string");
  }

  try {
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  } catch (e) {
    // Fallback to crypto PBKDF2
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(plainPassword, salt, 100000, 64, "sha512")
      .toString("hex");
    return `pbkdf2:${salt}:${hash}`;
  }
}

/**
 * Compare a candidate password against a stored hashed password.
 */
async function comparePassword(candidatePassword, storedHash) {
  if (!candidatePassword || !storedHash) {
    return false;
  }

  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$") ||
    storedHash.startsWith("$2")
  ) {
    try {
      const bcrypt = require("bcryptjs");
      return await bcrypt.compare(candidatePassword, storedHash);
    } catch (e) {
      return false;
    }
  }

  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hash] = parts;
    try {
      const candidateHash = crypto
        .pbkdf2Sync(candidatePassword, salt, 100000, 64, "sha512")
        .toString("hex");
      const bufA = Buffer.from(hash, "hex");
      const bufB = Buffer.from(candidateHash, "hex");
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch (e) {
      return false;
    }
  }

  return false;
}

module.exports = {
  hashPassword,
  comparePassword,
};
