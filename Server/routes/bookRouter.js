const express = require("express");

const router = express.Router();

const {
  handleAddBookController,
  handleGetAllBookController,
  handleDeleteBookController,
  handleUpdateBookController,
} = require("../controllers/bookController");

router.post("/", handleAddBookController);
router.get("/", handleGetAllBookController);
router.delete("/:id", handleDeleteBookController);
router.put("/:id", handleUpdateBookController);

module.exports = router;
