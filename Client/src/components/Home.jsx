import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import BookList from "./BookList";
import Stats from "./Stats";
import ImportExportModal from "./ImportExportModal";

const sortFns = {
  "title-asc": (a, b) => (a.bookName || "").localeCompare(b.bookName || ""),
  "title-desc": (a, b) => (b.bookName || "").localeCompare(a.bookName || ""),
  "price-low": (a, b) => Number(a.bookPrice || 0) - Number(b.bookPrice || 0),
  "price-high": (a, b) => Number(b.bookPrice || 0) - Number(a.bookPrice || 0),
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  newest: (a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0),
  oldest: (a, b) => new Date(a.publishDate || 0) - new Date(b.publishDate || 0),
};

const Home = ({
  books,
  isLoading,
  fetchError,
  onRetry,
  onDeleteBook,
  onToggleFavorite,
  onBookUpdated,
  onImportSuccess,
  theme,
  onToggleTheme,
  addToast,
  // Server-side pagination parameters & callback from App
  pagination,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedShelf, setSelectedShelf] = useState("All Shelves");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("title-asc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const navigate = useNavigate();

  // Inform parent when filters or pagination change (for server-side querying)
  useEffect(() => {
    onFilterChange?.({
      page: currentPage,
      limit,
      search: searchQuery,
      genre: selectedGenre,
      shelf: selectedShelf,
      tag: selectedTag,
      sortBy,
    });
  }, [
    currentPage,
    limit,
    searchQuery,
    selectedGenre,
    selectedShelf,
    selectedTag,
    sortBy,
    onFilterChange,
  ]);

  const handleOpenAddModal = () => {
    navigate("/add");
  };

  // Client-side filtering & sorting fallback if pagination data is not strictly server-managed
  const filteredAndSortedBooks = useMemo(() => {
    let result = books;

    // Shelf filter
    if (selectedShelf !== "All Shelves") {
      if (selectedShelf === "Favorites") {
        result = result.filter((b) => b.isFavorite);
      } else {
        result = result.filter((b) => b.shelf === selectedShelf);
      }
    }

    // Genre filter
    if (selectedGenre === "Favorites") {
      result = result.filter((b) => b.isFavorite);
    } else if (selectedGenre !== "All") {
      result = result.filter((b) => b.genre === selectedGenre);
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter(
        (b) => Array.isArray(b.tags) && b.tags.includes(selectedTag)
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.bookName?.toLowerCase().includes(q) ||
          b.bookAuthor?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q) ||
          (Array.isArray(b.tags) &&
            b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    const sortFn = sortFns[sortBy] || sortFns["title-asc"];
    return [...result].sort(sortFn);
  }, [books, selectedShelf, selectedGenre, selectedTag, searchQuery, sortBy]);

  // Paginated slice for display (works seamlessly whether backend paginated or client paginated)
  const totalBooksCount = pagination?.totalBooks ?? filteredAndSortedBooks.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(filteredAndSortedBooks.length / limit));

  const displayBooks = useMemo(() => {
    // If backend already returned a paginated slice matching current page and limit
    if (pagination && pagination.totalBooks !== undefined && books.length <= limit) {
      return books;
    }
    // Otherwise slice client-side
    const start = (currentPage - 1) * limit;
    return filteredAndSortedBooks.slice(start, start + limit);
  }, [books, filteredAndSortedBooks, pagination, currentPage, limit]);

  const totalValue = useMemo(() => {
    return books.reduce((sum, b) => sum + Number(b.bookPrice || 0), 0);
  }, [books]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSelectedShelf("All Shelves");
    setSelectedTag("");
    setSortBy("title-asc");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedGenre !== "All" ||
    selectedShelf !== "All Shelves" ||
    selectedTag ||
    sortBy !== "title-asc" ||
    currentPage !== 1
  );

  const handleHomeClick = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    const hadFilters = hasActiveFilters;
    handleResetFilters();
    window.scrollTo({ top: 0, behavior: "smooth" });
    onRetry?.();
    if (hadFilters) {
      addToast?.("Library reset to full collection & top", "info");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <>
      <Header
        bookCount={totalBooksCount}
        totalValue={totalValue}
        onOpenAddModal={handleOpenAddModal}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onHomeClick={handleHomeClick}
        hasActiveFilters={hasActiveFilters}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Book List / Controls */}
        <BookList
          books={displayBooks}
          isLoading={isLoading}
          fetchError={fetchError}
          onRetry={onRetry}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          selectedGenre={selectedGenre}
          setSelectedGenre={(g) => {
            setSelectedGenre(g);
            setCurrentPage(1);
          }}
          selectedShelf={selectedShelf}
          setSelectedShelf={(s) => {
            setSelectedShelf(s);
            setCurrentPage(1);
          }}
          selectedTag={selectedTag}
          setSelectedTag={(t) => {
            setSelectedTag(t);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onDelete={onDeleteBook}
          onToggleFavorite={onToggleFavorite}
          onResetFilters={handleResetFilters}
          onBookUpdated={onBookUpdated}
          totalBooksCount={totalBooksCount}
          currentPage={currentPage}
          totalPages={totalPages}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onToast={addToast}
        />

        {/* Statistics Insights */}
        <Stats books={books} totalBooksCount={totalBooksCount} />
      </main>

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        books={books}
        onImportSuccess={onImportSuccess}
        onToast={addToast}
      />
    </>
  );
};

export default Home;
