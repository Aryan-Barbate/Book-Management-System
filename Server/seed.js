require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/book");

const sampleBooks = [
  {
    bookName: "The Great Gatsby",
    bookAuthor: "F. Scott Fitzgerald",
    bookPrice: 14.99,
    publishDate: new Date("1925-04-10"),
    genre: "Classic",
    rating: 5,
    description: "A portrait of the Jazz Age, exploring themes of decadence, idealism, and excess.",
    isFavorite: true,
  },
  {
    bookName: "Clean Code",
    bookAuthor: "Robert C. Martin",
    bookPrice: 39.95,
    publishDate: new Date("2008-08-01"),
    genre: "Non-Fiction",
    rating: 5,
    description: "A handbook of agile software craftsmanship with best practices and refactoring techniques.",
    isFavorite: true,
  },
  {
    bookName: "Dune",
    bookAuthor: "Frank Herbert",
    bookPrice: 18.50,
    publishDate: new Date("1965-08-01"),
    genre: "Sci-Fi",
    rating: 5,
    description: "Set on the desert planet Arrakis, a sweeping saga of politics, religion, and spice ecology.",
    isFavorite: false,
  },
  {
    bookName: "The Silent Patient",
    bookAuthor: "Alex Michaelides",
    bookPrice: 15.99,
    publishDate: new Date("2019-02-05"),
    genre: "Mystery",
    rating: 4,
    description: "A shocking psychological thriller about a woman's act of violence against her husband and her therapist.",
    isFavorite: false,
  },
  {
    bookName: "Designing Data-Intensive Applications",
    bookAuthor: "Martin Kleppmann",
    bookPrice: 42.00,
    publishDate: new Date("2017-03-16"),
    genre: "Non-Fiction",
    rating: 5,
    description: "The definitive guide to the architecture of storage engines, distributed data, and reliability.",
    isFavorite: true,
  },
  {
    bookName: "1984",
    bookAuthor: "George Orwell",
    bookPrice: 12.99,
    publishDate: new Date("1949-06-08"),
    genre: "Fiction",
    rating: 5,
    description: "A dystopian social science fiction novel that examines surveillance, truth, and totalitarianism.",
    isFavorite: false,
  },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "Book-Management";

  if (!uri) {
    console.error("ERROR: MONGODB_URI is not set in Server/.env!");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB Atlas (DB: ${dbName})...`);
    await mongoose.connect(uri, { dbName });
    console.log("Connected to MongoDB Atlas.");

    const existingCount = await Book.countDocuments();
    console.log(`Current book count: ${existingCount}`);

    // If --force is passed or database is empty, seed
    const force = process.argv.includes("--force");
    if (existingCount > 0 && !force) {
      console.log(`Database already has ${existingCount} books. To overwrite, run: npm run seed -- --force`);
      console.log("Seeding skipped to prevent accidental data overwrites.");
    } else {
      if (force && existingCount > 0) {
        console.log("Clearing existing books (--force provided)...");
        await Book.deleteMany({});
      }

      console.log(`Inserting ${sampleBooks.length} sample books...`);
      const inserted = await Book.insertMany(sampleBooks);
      console.log(`Successfully inserted ${inserted.length} books into MongoDB Atlas!`);
    }

    await mongoose.disconnect();
    console.log("Disconnected cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
