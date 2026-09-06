const mongoose = require("mongoose");
const Book = require("../models/book");
const { lookupBookByIsbn } = require("../utils/isbnLookup");

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Build Mongoose query object based on user, search, and filters
 */
const buildBookQuery = (req) => {
  const query = {};

  // Multi-tenancy scoping
  if (req.user && req.user.id) {
    // If user is authenticated, retrieve user's books OR legacy unassigned/demo books
    query.$or = [{ userId: req.user.id }, { userId: null }];
  } else {
    // If unauthenticated guest, only retrieve public demo/unassigned books
    query.userId = null;
  }

  // Shelf filtering
  if (req.query.shelf && req.query.shelf !== "All" && req.query.shelf !== "All Shelves") {
    if (req.query.shelf === "Favorites") {
      query.isFavorite = true;
    } else {
      query.shelf = req.query.shelf;
    }
  }

  // Genre filtering
  if (req.query.genre && req.query.genre !== "All") {
    if (req.query.genre === "Favorites") {
      query.isFavorite = true;
    } else {
      query.genre = req.query.genre;
    }
  }

  // Tag filtering
  if (req.query.tag) {
    query.tags = req.query.tag;
  }

  // Favorite toggle filtering
  if (req.query.isFavorite === "true" || req.query.isFavorite === true) {
    query.isFavorite = true;
  }

  // Text search across title, author, description, tags, and ISBN
  if (req.query.search && req.query.search.trim()) {
    const s = req.query.search.trim();
    const regex = new RegExp(s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    const searchFilter = {
      $or: [
        { bookName: regex },
        { bookAuthor: regex },
        { description: regex },
        { isbn: regex },
        { tags: regex },
        { genre: regex },
      ],
    };

    if (query.$or) {
      query.$and = [{ $or: query.$or }, searchFilter];
      delete query.$or;
    } else {
      query.$or = searchFilter.$or;
    }
  }

  return query;
};

/**
 * Build Mongoose sort object based on sortBy param
 */
const buildSortObject = (sortBy) => {
  switch (sortBy) {
    case "title-desc":
      return { bookName: -1 };
    case "price-low":
      return { bookPrice: 1 };
    case "price-high":
      return { bookPrice: -1 };
    case "rating":
      return { rating: -1, bookName: 1 };
    case "newest":
      return { publishDate: -1, createdAt: -1 };
    case "oldest":
      return { publishDate: 1, createdAt: 1 };
    case "title-asc":
    default:
      return { bookName: 1 };
  }
};

/**
 * GET /books
 * Supports pagination (page, limit), filters, sorting, and multi-tenancy
 */
const handleGetAllBookController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      Message: "Database is not connected. Please ensure MongoDB Atlas connection string is valid and IP 0.0.0.0/0 is whitelisted.",
      BookList: [],
      pagination: {
        totalBooks: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }

  try {
    const query = buildBookQuery(req);
    const sort = buildSortObject(req.query.sortBy);

    // Check if pagination was requested
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.ceil(totalBooks / limit) || 1;

    let bookList;
    if (hasPagination && req.query.limit !== "all") {
      const skip = (page - 1) * limit;
      bookList = await Book.find(query).sort(sort).skip(skip).limit(limit);
    } else {
      bookList = await Book.find(query).sort(sort);
    }

    return res.status(200).json({
      Message: "Book Details retrieved successfully",
      BookList: bookList,
      pagination: {
        totalBooks,
        totalPages,
        currentPage: page,
        limit: req.query.limit === "all" ? totalBooks : limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error in handleGetAllBookController:", err);
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * GET /books/:id
 */
const handleGetBookByIdController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found." });
    }
    // Prevent reading other users' private books
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to view this book." });
    }
    return res.status(200).json({ book });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * POST /books
 */
const handleAddBookController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({
      Message: "Database is not connected. Please ensure MongoDB Atlas connection string is valid.",
    });
  }

  try {
    const {
      bookName,
      bookAuthor,
      bookPrice,
      publishDate,
      genre,
      rating,
      description,
      isFavorite,
      coverUrl,
      isbn,
      pageCount,
      shelf,
      tags,
      quotes,
      notes,
    } = req.body;

    const newBook = new Book({
      userId: req.user?.id || null,
      bookName,
      bookAuthor,
      bookPrice: Number(bookPrice || 0),
      publishDate: publishDate ? new Date(publishDate) : undefined,
      genre: genre || "Fiction",
      rating: Number(rating) || 5,
      description: description || "",
      isFavorite: Boolean(isFavorite),
      coverUrl: coverUrl || "",
      isbn: isbn ? String(isbn).trim() : "",
      pageCount: Number(pageCount || 0),
      shelf: shelf || "Want to Read",
      tags: Array.isArray(tags) ? tags : [],
      quotes: Array.isArray(quotes) ? quotes : [],
      notes: notes || "",
    });

    const savedBook = await newBook.save();

    return res.status(201).json({
      Message: "Book added successfully!",
      data: savedBook,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /books/:id
 */
const handleUpdateBookController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }

  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found" });
    }

    // Permission check: if book has an owner, only that owner can edit
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to edit this book." });
    }

    const updateData = { ...req.body };
    delete updateData._id;

    // Preserve original owner or assign to authenticated user adopting demo book
    if (book.userId) {
      updateData.userId = book.userId;
    } else if (req.user && req.user.id) {
      updateData.userId = req.user.id;
    }

    if (updateData.bookPrice !== undefined) {
      updateData.bookPrice = Number(updateData.bookPrice);
    }
    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }
    if (updateData.pageCount !== undefined) {
      updateData.pageCount = Number(updateData.pageCount);
    }

    const updateBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      Message: "Book updated successfully",
      data: updateBook,
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * DELETE /books/:id
 */
const handleDeleteBookController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found" });
    }

    // Permission check: only owner can delete their book
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to delete this book." });
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({ Message: "Book deleted successfully" });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * POST /books/:id/quotes
 * Add a quote with page marker and optional note
 */
const handleAddQuoteController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }

  try {
    const { id } = req.params;
    const { quote, page, note } = req.body;

    if (!quote || !quote.trim()) {
      return res.status(400).json({ Message: "Quote text is required." });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found." });
    }

    // Permission check
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to modify this book." });
    }

    const newQuote = {
      quote: quote.trim(),
      page: page ? Number(page) : null,
      note: note ? note.trim() : "",
      createdAt: new Date(),
    };

    book.quotes.push(newQuote);
    await book.save();

    return res.status(201).json({
      Message: "Quote added to journal!",
      quotes: book.quotes,
      data: book,
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * DELETE /books/:id/quotes/:quoteId
 * Delete a quote by quoteId
 */
const handleDeleteQuoteController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }

  try {
    const { id, quoteId } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found." });
    }

    // Permission check
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to modify this book." });
    }

    book.quotes = book.quotes.filter((q) => q._id.toString() !== quoteId);
    await book.save();

    return res.status(200).json({
      Message: "Quote removed successfully.",
      quotes: book.quotes,
      data: book,
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * PUT /books/:id/notes
 * Update book's private notes
 */
const handleUpdateNotesController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }

  try {
    const { id } = req.params;
    const { notes } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ Message: "Book not found." });
    }

    // Permission check
    if (book.userId && (!req.user || String(book.userId) !== String(req.user.id))) {
      return res.status(403).json({ Message: "You do not have permission to modify this book." });
    }

    book.notes = typeof notes === "string" ? notes : "";
    await book.save();

    return res.status(200).json({
      Message: "Notes updated successfully.",
      data: book,
    });
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
};

/**
 * POST /books/import
 * Batch import books from CSV or Goodreads or JSON
 */
const handleImportBooksController = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is not connected." });
  }

  try {
    const { books } = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ Message: "An array of books is required." });
    }

    const userId = req.user?.id || null;
    const formattedBooks = books.map((b) => ({
      userId,
      bookName: b.bookName || b.Title || "Untitled Book",
      bookAuthor: b.bookAuthor || b.Author || "Unknown Author",
      bookPrice: Number(b.bookPrice || b.Price || 14.99),
      publishDate: b.publishDate ? new Date(b.publishDate) : undefined,
      genre: b.genre || b.Genre || "Fiction",
      rating: Math.min(5, Math.max(1, Number(b.rating || b.Rating || 5))),
      description: b.description || b.Summary || "",
      isFavorite: Boolean(b.isFavorite),
      coverUrl: b.coverUrl || b.Cover || "",
      isbn: b.isbn || b.ISBN || "",
      pageCount: Number(b.pageCount || b.Pages || 0),
      shelf: b.shelf || b.Shelf || "Want to Read",
      tags: Array.isArray(b.tags) ? b.tags : [],
      quotes: Array.isArray(b.quotes) ? b.quotes : [],
      notes: b.notes || "",
    }));

    const inserted = await Book.insertMany(formattedBooks, { ordered: false });

    return res.status(201).json({
      Message: `Successfully imported ${inserted.length} books into your library!`,
      count: inserted.length,
      data: inserted,
    });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ Message: err.message || "Failed to import books." });
  }
};

/**
 * GET /books/lookup/:isbn
 * Query Google Books / OpenLibrary for automatic book details population
 */
const handleLookupIsbnController = async (req, res) => {
  try {
    const { isbn } = req.params;
    const bookData = await lookupBookByIsbn(isbn);
    return res.status(200).json({
      Message: "Book details fetched successfully",
      data: bookData,
    });
  } catch (err) {
    return res.status(404).json({ Message: err.message });
  }
};

module.exports = {
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
};
