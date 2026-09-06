const express = require("express");
const router = express.Router();

const {
  handleGetAllBookController,
  handleGetBookByIdController,
  handleAddBookController,
  handleUpdateBookController,
  handleDeleteBookController,
  handleAddQuoteController,
  handleDeleteQuoteController,
  handleUpdateNotesController,
  handleImportBooksController,
  handleLookupIsbnController,
} = require("../controllers/bookController");
const { optionalAuth } = require("../middleware/auth");

// Books CRUD & queries
router.get("/", optionalAuth, handleGetAllBookController);
router.post("/", optionalAuth, handleAddBookController);
router.post("/import", optionalAuth, handleImportBooksController);
router.get("/lookup/:isbn", handleLookupIsbnController);

// Single book operations
router.get("/:id", optionalAuth, handleGetBookByIdController);
router.put("/:id", optionalAuth, handleUpdateBookController);
router.delete("/:id", optionalAuth, handleDeleteBookController);

// Quotes & Notes Journal sub-resources
router.post("/:id/quotes", optionalAuth, handleAddQuoteController);
router.delete("/:id/quotes/:quoteId", optionalAuth, handleDeleteQuoteController);
router.put("/:id/notes", optionalAuth, handleUpdateNotesController);

module.exports = router;
