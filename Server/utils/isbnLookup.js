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

        // Map genre / categories
        let genre = "Fiction";
        if (info.categories && info.categories.length > 0) {
          const rawCat = info.categories[0].toLowerCase();
          if (rawCat.includes("sci") || rawCat.includes("science fiction")) genre = "Sci-Fi";
          else if (rawCat.includes("dystop")) genre = "Dystopian";
          else if (rawCat.includes("myster") || rawCat.includes("thrill") || rawCat.includes("crime")) genre = "Mystery";
          else if (rawCat.includes("roman")) genre = "Romance";
          else if (rawCat.includes("classic")) genre = "Classic";
          else if (rawCat.includes("comput") || rawCat.includes("biograph") || rawCat.includes("history") || rawCat.includes("non-fiction") || rawCat.includes("business")) genre = "Non-Fiction";
          else genre = info.categories[0].split("/")[0].trim() || "Fiction";
        }

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

        let genre = "Fiction";
        if (bookData.subjects && bookData.subjects.length > 0) {
          const sub = bookData.subjects[0].name || "";
          genre = sub;
        }

        return {
          bookName: bookData.title || "",
          bookAuthor: authors,
          description: typeof bookData.notes === "string" ? bookData.notes : "",
          publishDate: bookData.publish_date || "",
          pageCount: bookData.number_of_pages || 0,
          genre: genre,
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

module.exports = { lookupBookByIsbn };
