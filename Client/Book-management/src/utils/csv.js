/**
 * RFC 4180 compliant CSV Parser
 * Handles commas inside quotes, multiline fields, and escaped quotes ("")
 */
export function parseCSV(text) {
  if (!text || typeof text !== "string") return [];

  const rows = [];
  let currentRow = [];
  let currentField = "";
  let insideQuotes = false;

  // Clean BOM and standardize newlines
  const cleanText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Push last field and row if remaining
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.replace(/^["']|["']$/g, "").trim());
  const records = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      record[header] = row[c] !== undefined ? row[c] : "";
    }
    records.push(record);
  }

  return records;
}

/**
 * Check if parsed headers match Goodreads export format
 */
export function isGoodreadsCSV(records) {
  if (!records || records.length === 0) return false;
  const sample = records[0];
  const keys = Object.keys(sample);
  const goodreadsMarkers = [
    "Book Id",
    "ISBN13",
    "My Rating",
    "Bookshelves",
    "Exclusive Shelf",
    "Average Rating",
    "Original Publication Year",
  ];
  const matches = goodreadsMarkers.filter((m) => keys.includes(m));
  return matches.length >= 2;
}

/**
 * Clean Goodreads ISBN which often has format `="9780140283334"`
 */
function cleanGoodreadsISBN(val) {
  if (!val) return "";
  return String(val).replace(/[^0-9X]/gi, "").trim();
}

/**
 * Normalize Goodreads row into standard Book object
 */
export function normalizeGoodreadsBook(row) {
  const exclusiveShelf = (row["Exclusive Shelf"] || "").toLowerCase().trim();
  const rawShelf = (row["Bookshelves"] || "").toLowerCase().trim();
  let shelf = "Want to Read";

  if (
    exclusiveShelf === "read" ||
    (rawShelf.includes("read") && !rawShelf.includes("to-read"))
  ) {
    shelf = "Read";
  } else if (
    exclusiveShelf === "currently-reading" ||
    rawShelf.includes("currently-reading") ||
    rawShelf.includes("reading")
  ) {
    shelf = "Currently Reading";
  } else if (rawShelf.includes("favorite")) {
    shelf = "Favorites";
  }

  const myRating = Number(row["My Rating"]);
  const avgRating = Math.round(Number(row["Average Rating"]) || 4);
  const rating = myRating > 0 ? myRating : (avgRating >= 1 && avgRating <= 5 ? avgRating : 5);

  const year = row["Year Published"] || row["Original Publication Year"];
  const publishDate = year ? `${year}-01-01` : "";

  const isbn = cleanGoodreadsISBN(row["ISBN13"] || row["ISBN"]);

  return {
    bookName: row["Title"] || "Untitled Book",
    bookAuthor: row["Author"] || row["Additional Authors"] || "Unknown Author",
    bookPrice: 14.99,
    publishDate,
    genre: "Fiction",
    rating,
    shelf,
    isbn,
    pageCount: Number(row["Number of Pages"]) || 0,
    description: row["My Review"] || row["Private Notes"] || "",
    isFavorite: shelf === "Favorites" || myRating === 5,
    coverUrl: "",
    tags: row["Bookshelves"]
      ? row["Bookshelves"]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    notes: row["Private Notes"] || "",
  };
}

/**
 * Normalize generic CSV row into standard Book object
 */
export function normalizeGenericCSVBook(row) {
  const getField = (...names) => {
    for (const name of names) {
      const matchKey = Object.keys(row).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      if (matchKey && row[matchKey]) return row[matchKey];
    }
    return "";
  };

  const title = getField("bookName", "title", "book title", "name") || "Untitled Book";
  const author = getField("bookAuthor", "author", "authors", "by") || "Unknown Author";
  const price = Number(getField("bookPrice", "price", "cost")) || 14.99;
  const genre = getField("genre", "category", "categories") || "Fiction";
  const shelf = getField("shelf", "bookshelf", "status") || "Want to Read";
  const rating = Math.min(5, Math.max(1, Number(getField("rating", "stars", "score")) || 5));
  const desc = getField("description", "summary", "notes", "review") || "";
  const isbn = cleanGoodreadsISBN(getField("isbn", "isbn13", "isbn10"));
  const pages = Number(getField("pageCount", "pages", "page count")) || 0;
  const coverUrl = getField("coverUrl", "cover", "image", "image url");
  const tagsStr = getField("tags", "tag");
  const tags = tagsStr ? tagsStr.split(/[,;|]/).map((t) => t.trim()).filter(Boolean) : [];

  return {
    bookName: title,
    bookAuthor: author,
    bookPrice: price,
    genre,
    shelf,
    rating,
    description: desc,
    isbn,
    pageCount: pages,
    coverUrl,
    tags,
    isFavorite: shelf === "Favorites" || rating === 5,
  };
}

/**
 * Escape field for CSV
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) return "";
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV string from books array
 */
export function generateBooksCSV(books) {
  const headers = [
    "Title",
    "Author",
    "Price",
    "Genre",
    "Shelf",
    "Rating",
    "Publish Date",
    "ISBN",
    "Page Count",
    "Tags",
    "Cover URL",
    "Description",
    "Notes",
  ];

  const rows = [headers.join(",")];

  for (const b of books) {
    const row = [
      escapeCSVField(b.bookName),
      escapeCSVField(b.bookAuthor),
      escapeCSVField(Number(b.bookPrice || 0).toFixed(2)),
      escapeCSVField(b.genre || "Fiction"),
      escapeCSVField(b.shelf || "Want to Read"),
      escapeCSVField(b.rating || 5),
      escapeCSVField(
        b.publishDate
          ? typeof b.publishDate === "string"
            ? b.publishDate.slice(0, 10)
            : new Date(b.publishDate).toISOString().slice(0, 10)
          : ""
      ),
      escapeCSVField(b.isbn || ""),
      escapeCSVField(b.pageCount || 0),
      escapeCSVField(Array.isArray(b.tags) ? b.tags.join("; ") : ""),
      escapeCSVField(b.coverUrl || ""),
      escapeCSVField(b.description || ""),
      escapeCSVField(b.notes || ""),
    ];
    rows.push(row.join(","));
  }

  return rows.join("\r\n");
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content, fileName, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
