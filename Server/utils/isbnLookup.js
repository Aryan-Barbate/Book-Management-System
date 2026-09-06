/**
 * Helper to normalize and extract clean tags & primary genre from categories/subjects
 */
function extractTagsAndCategories(rawCategories = [], rawSubjects = []) {
  const allRaw = [];

  // Flatten Google categories (e.g. "Computers / Software Development & Engineering / General")
  rawCategories.forEach((cat) => {
    if (typeof cat === "string") {
      cat.split(/[/,&]/).forEach((part) => {
        const trimmed = part.trim();
        if (trimmed) allRaw.push(trimmed);
      });
    }
  });

  // Flatten OpenLibrary subjects
  rawSubjects.forEach((sub) => {
    const name = typeof sub === "string" ? sub : sub?.name;
    if (name && typeof name === "string") {
      allRaw.push(name.trim());
    }
  });

  const stopWords = new Set([
    "general",
    "books",
    "accessible book",
    "protected daisy",
    "large type books",
    "text",
    "juvenile",
    "in library",
    "reading level",
  ]);
  const seen = new Set();
  const cleanTags = [];

  for (const raw of allRaw) {
    // Skip internal metadata/date codes like nyt:..., award:...
    if (raw.includes(":") || raw.includes("=")) continue;

    // Clean up parentheses: "Dune (Imaginary place)" -> "Dune"
    let cleaned = raw.replace(/\(.*?\)/g, "").trim();
    cleaned = cleaned.replace(/^[#\-_,.]+|[#\-_,.]+$/g, "").trim();

    if (!cleaned || cleaned.length < 2 || cleaned.length > 30) continue;
    if (stopWords.has(cleaned.toLowerCase())) continue;

    const lower = cleaned.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      // Capitalize first letter of each word
      const titleCased = cleaned
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      cleanTags.push(titleCased);
    }
    if (cleanTags.length >= 8) break; // Limit to top 8 clean tags
  }

  // Determine best matching primary genre
  let detectedGenre = "Fiction";
  const haystack = allRaw.join(" ").toLowerCase();

  if (haystack.includes("science fiction") || haystack.includes("sci-fi")) detectedGenre = "Sci-Fi";
  else if (haystack.includes("fantasy")) detectedGenre = "Fantasy";
  else if (haystack.includes("dystop")) detectedGenre = "Dystopian";
  else if (haystack.includes("myster") || haystack.includes("thrill") || haystack.includes("crime") || haystack.includes("detective")) detectedGenre = "Mystery";
  else if (haystack.includes("romance") || haystack.includes("love story")) detectedGenre = "Romance";
  else if (haystack.includes("classic")) detectedGenre = "Classic";
  else if (haystack.includes("biograph") || haystack.includes("autobiograph") || haystack.includes("memoir")) detectedGenre = "Biography";
  else if (haystack.includes("philosoph")) detectedGenre = "Philosophy";
  else if (
    haystack.includes("comput") ||
    haystack.includes("software") ||
    haystack.includes("programming") ||
    haystack.includes("coding") ||
    haystack.includes("technology") ||
    haystack.includes("non-fiction") ||
    haystack.includes("business") ||
    haystack.includes("self-help") ||
    haystack.includes("psycholog") ||
    haystack.includes("history") ||
    haystack.includes("economics")
  ) detectedGenre = "Non-Fiction";

  return { tags: cleanTags, genre: detectedGenre };
}

/**
 * Helper to fetch book details from Google Books and OpenLibrary
 */
async function lookupBookByIsbn(rawIsbn) {
  if (!rawIsbn) {
    throw new Error("ISBN is required");
  }

  const cleanIsbn = String(rawIsbn).replace(/[^0-9X]/gi, "").trim();
  if (cleanIsbn.length < 9) {
    throw new Error("Invalid ISBN format. Expected 10 or 13 digits.");
  }

  // 1. Try Google Books API
  try {
    const gbooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;
    const res = await fetch(gbooksUrl, { headers: { "User-Agent": "BookVault/1.0" } });
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const info = item.volumeInfo || {};

        // Extract high-res cover if available
        let coverUrl = "";
        if (info.imageLinks) {
          coverUrl =
            info.imageLinks.extraLarge ||
            info.imageLinks.large ||
            info.imageLinks.medium ||
            info.imageLinks.small ||
            info.imageLinks.thumbnail ||
            "";
          // Replace http with https
          if (coverUrl.startsWith("http://")) {
            coverUrl = coverUrl.replace("http://", "https://");
          }
        }

        // Map genre and extract tags
        const { tags, genre } = extractTagsAndCategories(info.categories || [], []);

        let price = 14.99;
        if (item.saleInfo?.retailPrice?.amount) {
          price = Number(item.saleInfo.retailPrice.amount);
        } else if (item.saleInfo?.listPrice?.amount) {
          price = Number(item.saleInfo.listPrice.amount);
        }

        return {
          bookName: info.title || "",
          bookAuthor: (info.authors && info.authors.join(", ")) || "Unknown Author",
          description: info.description || "",
          publishDate: info.publishedDate || "",
          pageCount: info.pageCount || 0,
          genre: genre,
          categories: info.categories || [genre],
          tags: tags,
          coverUrl: coverUrl,
          bookPrice: price,
          isbn: cleanIsbn,
          source: "Google Books",
        };
      }
    }
  } catch (err) {
    console.warn("Google Books lookup warning:", err.message);
  }

  // 2. Fallback to Open Library API
  try {
    const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const res = await fetch(olUrl, { headers: { "User-Agent": "BookVault/1.0" } });
    if (res.ok) {
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];
      if (bookData) {
        let coverUrl = "";
        if (bookData.cover) {
          coverUrl = bookData.cover.large || bookData.cover.medium || bookData.cover.small || "";
        }

        let authors = "Unknown Author";
        if (bookData.authors && bookData.authors.length > 0) {
          authors = bookData.authors.map((a) => a.name).join(", ");
        }

        // Extract tags and categories from OpenLibrary subjects
        const subjects = bookData.subjects || [];
        const { tags, genre } = extractTagsAndCategories([], subjects);

        return {
          bookName: bookData.title || "",
          bookAuthor: authors,
          description: typeof bookData.notes === "string" ? bookData.notes : "",
          publishDate: bookData.publish_date || "",
          pageCount: bookData.number_of_pages || 0,
          genre: genre,
          categories: subjects.map((s) => s.name || s) || [genre],
          tags: tags,
          coverUrl: coverUrl,
          bookPrice: 15.0,
          isbn: cleanIsbn,
          source: "OpenLibrary",
        };
      }
    }
  } catch (err) {
    console.warn("OpenLibrary lookup warning:", err.message);
  }

  throw new Error(`No book found for ISBN ${cleanIsbn}. Try entering details manually.`);
}

module.exports = { lookupBookByIsbn, extractTagsAndCategories };

