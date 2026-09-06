const express = require("express");
const router = express.Router();

const {
  register,
  login,
  googleAuth,
  demoLogin,
  getMe,
  updateShelves,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/demo", demoLogin);
router.get("/me", requireAuth, getMe);
router.put("/shelves", requireAuth, updateShelves);

module.exports = router;
