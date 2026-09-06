const assert = require("assert");
const { hashPassword, comparePassword } = require("./utils/password");
const { signToken, verifyToken } = require("./utils/jwt");
const { lookupBookByIsbn } = require("./utils/isbnLookup");

async function runTests() {
  console.log("=== RUNNING UNIT & REGRESSION TESTS ===");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
      failed++;
    }
  }

  // 1. Password hashing & comparison
  await asyncTest("Password hashing & verify with bcrypt", async () => {
    const password = "TestPassword123!";
    const hash = await hashPassword(password);
    assert(typeof hash === "string", "Hash should be a string");
    assert(hash.length > 20, "Hash should be non-trivial");

    const isCorrect = await comparePassword(password, hash);
    assert.strictEqual(isCorrect, true, "Valid password should match");

    const isWrong = await comparePassword("WrongPassword", hash);
    assert.strictEqual(isWrong, false, "Invalid password should not match");
  });

  await asyncTest("Password PBKDF2 fallback comparison handles malformed/differing length hashes gracefully", async () => {
    // Malformed pbkdf2 hash
    const isMalformed = await comparePassword("pass", "pbkdf2:short");
    assert.strictEqual(isMalformed, false, "Malformed pbkdf2 hash should return false, not throw");

    const isDifferentLen = await comparePassword("pass", "pbkdf2:1234:5678");
    assert.strictEqual(isDifferentLen, false, "Different length hash should return false without crashing timingSafeEqual");
  });

  // 2. JWT signing & verification
  test("JWT sign and verify with valid secret", () => {
    const payload = { id: "user123", email: "test@example.com", name: "Tester" };
    const token = signToken(payload, "1h");
    assert(typeof token === "string" && token.split(".").length === 3, "Should produce 3-part JWT");

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
  });

  test("JWT rejects tampered tokens", () => {
    const payload = { id: "user123", email: "test@example.com" };
    const token = signToken(payload);
    const tampered = token.slice(0, -5) + "abcde";
    assert.throws(() => verifyToken(tampered), "Tampered token must throw an error");
  });

  // 3. ISBN Lookup validation
  await asyncTest("ISBN lookup rejects invalid ISBN lengths", async () => {
    await assert.rejects(
      async () => lookupBookByIsbn("123"),
      /Invalid ISBN format/,
      "Short ISBN should reject"
    );
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
