const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    trim: true,
  },
  page: {
    type: Number,
    default: null,
  },
  note: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    bookName: {
      type: String,
      required: true,
      trim: true,
    },
    bookAuthor: {
      type: String,
      required: true,
      trim: true,
    },
    bookPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    publishDate: {
      type: Date,
      required: false,
    },
    genre: {
      type: String,
      default: "General",
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      default: "",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    coverUrl: {
      type: String,
      default: "",
    },
    isbn: {
      type: String,
      default: "",
      trim: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    shelf: {
      type: String,
      default: "Want to Read",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    quotes: {
      type: [quoteSchema],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Book", bookSchema);
