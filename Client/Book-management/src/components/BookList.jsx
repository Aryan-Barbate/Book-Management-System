import React, { useState } from "react";
import BookCard from "./BookCard";
import PaginationControls from "./PaginationControls";
import BookJournalModal from "./BookJournalModal";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  BookX,
  Heart,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Bookmark,
  FolderPlus,
  Tag,
} from "lucide-react";
import { GENRE_FILTERS, getGenreColor, DEFAULT_SHELVES } from "../constants";
import { useAuth } from "../context/AuthContext";

const BookList = ({
  books,
  isLoading,
  fetchError,
  onRetry,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedShelf,
  setSelectedShelf,
  selectedTag,
  setSelectedTag,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onDelete,
  onToggleFavorite,
  onResetFilters,
  onBookUpdated,
  totalBooksCount,
  // Pagination props
  currentPage = 1,
  totalPages = 1,
  limit = 12,
  onPageChange,
  onLimitChange,
  onToast,
}) => {
  const { user, updateCustomShelves, isAuthenticated } = useAuth();
  const [activeJournalBook, setActiveJournalBook] = useState(null);
  const [isAddingShelf, setIsAddingShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");

  const userShelves = user?.customShelves?.length
    ? user.customShelves
    : DEFAULT_SHELVES;
  const allShelves = ["All Shelves", ...userShelves];

  const handleCreateShelf = async (e) => {
    e.preventDefault();
    const trimmed = newShelfName.trim();
    if (!trimmed) return;

    if (userShelves.includes(trimmed)) {
      onToast?.("Shelf already exists.", "info");
      setSelectedShelf(trimmed);
      setIsAddingShelf(false);
      setNewShelfName("");
      return;
    }

    const updated = [...userShelves, trimmed];
    await updateCustomShelves(updated);
    setSelectedShelf(trimmed);
    setIsAddingShelf(false);
    setNewShelfName("");
    onToast?.(`Created new shelf "${trimmed}"!`, "success");
  };

  return (
    <section className="space-y-6" aria-label="Book Collection">
      {/* Controls & Filter Panel */}
      <div className="nb-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none z-10 stroke-2.5" />
            <input
              type="text"
              placeholder="SEARCH TITLE, AUTHOR, TAGS, ISBN, OR NOTES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nb-input nb-input-has-icon pr-12 font-extrabold uppercase placeholder:text-black/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 nb-badge nb-badge-pink cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5 stroke-3" />
                <span>CLEAR</span>
              </button>
            )}
          </div>

          {/* Controls: Sort & Layout */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 stroke-2.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="nb-input py-2 px-3 text-xs font-black uppercase min-w-[150px] cursor-pointer"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Published</option>
                <option value="oldest">Oldest Published</option>
              </select>
            </div>

            {/* Grid / List toggle */}
            <div className="flex items-center p-1 bg-black/10 dark:bg-white/10 rounded-xl border-2 border-black">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#CCFF00] text-black border-black shadow-[2px_2px_0px_0px_#000]"
                    : "bg-white dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-[#FFDE59] hover:border-black"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4 stroke-2.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#CCFF00] text-black border-black shadow-[2px_2px_0px_0px_#000]"
                    : "bg-white dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20 hover:bg-[#FFDE59] hover:border-black"
                }`}
                title="List View"
              >
                <List className="w-4 h-4 stroke-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Shelves Horizontal Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 stroke-2.5" />
              <span>BOOK SHELVES & COLLECTIONS</span>
            </span>

            {/* Inline Add Shelf Button */}
            {!isAddingShelf ? (
              <button
                type="button"
                onClick={() => setIsAddingShelf(true)}
                className="text-[11px] font-black uppercase hover:underline flex items-center gap-1 cursor-pointer text-[#00E5FF] dark:text-[#00E5FF]"
              >
                <FolderPlus className="w-3.5 h-3.5 stroke-2.5" />
                <span>+ NEW SHELF</span>
              </button>
            ) : (
              <form onSubmit={handleCreateShelf} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Summer 2026..."
                  value={newShelfName}
                  onChange={(e) => setNewShelfName(e.target.value)}
                  className="nb-input py-0.5 px-2 text-xs font-bold w-36"
                  autoFocus
                />
                <button
                  type="submit"
                  className="nb-btn nb-btn-lime nb-btn-sm py-0.5 px-2 text-[10px]"
                >
                  SAVE
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingShelf(false)}
                  className="p-1 hover:text-[#FF4D4D] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-3" />
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {allShelves.map((shelf) => {
              const isSelected = selectedShelf === shelf;
              return (
                <button
                  key={shelf}
                  onClick={() => setSelectedShelf(shelf)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#00E5FF] text-black shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5"
                      : "bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_0px_#000]"
                  }`}
                >
                  <Bookmark
                    className={`w-3 h-3 ${
                      isSelected ? "fill-black" : "stroke-2"
                    }`}
                  />
                  <span>{shelf}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Genre Pill Selector */}
        <div className="space-y-1.5 pt-1 border-t border-black/10 dark:border-white/10">
          <span className="text-[11px] font-black uppercase tracking-wider opacity-60">
            GENRES
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GENRE_FILTERS.map((genre) => {
              const isSelected = selectedGenre === genre;
              const colorClass = getGenreColor(genre, isSelected);
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black flex items-center gap-2 cursor-pointer ${colorClass} ${
                    isSelected
                      ? "shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5"
                      : "shadow-[1px_1px_0px_0px_#000]"
                  }`}
                >
                  {genre === "Favorites" && (
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isSelected
                          ? "fill-white text-white"
                          : "fill-[#FF4D4D] text-[#FF4D4D]"
                      }`}
                    />
                  )}
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tag Filter Indicator */}
        {selectedTag && (
          <div className="flex items-center gap-2 pt-1 border-t border-black/10">
            <span className="text-xs font-black uppercase">FILTERED BY TAG:</span>
            <span className="nb-badge nb-badge-lime text-xs flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 stroke-2.5" />
              <span>#{selectedTag}</span>
              <button
                type="button"
                onClick={() => setSelectedTag("")}
                className="ml-1 hover:text-[#FF4D4D] cursor-pointer"
              >
                <X className="w-3 h-3 stroke-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-extrabold uppercase">
          SHOWING <span className="underline font-black">{books.length}</span> OF{" "}
          {totalBooksCount} BOOKS
          {selectedGenre !== "All" && (
            <span>
              {" "}
              IN{" "}
              <span className="nb-badge nb-badge-yellow">{selectedGenre}</span>
            </span>
          )}
          {selectedShelf !== "All Shelves" && (
            <span>
              {" "}
              ON{" "}
              <span className="nb-badge nb-badge-cyan">{selectedShelf}</span>
            </span>
          )}
        </p>

        {(searchQuery ||
          selectedGenre !== "All" ||
          selectedShelf !== "All Shelves" ||
          selectedTag) && (
          <button
            onClick={onResetFilters}
            className="nb-badge nb-badge-white text-xs cursor-pointer hover:bg-[#FFDE59]"
          >
            RESET FILTERS
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="nb-card p-10 text-center my-8 bg-white dark:bg-[#1E1E1E]">
          <div className="w-16 h-16 rounded-xl bg-[#CCFF00] text-black border-3 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000] animate-spin">
            <Loader2 className="w-8 h-8 stroke-3" />
          </div>
          <h3 className="text-2xl font-black mb-2 uppercase">
            CONNECTING TO BOOK VAULT...
          </h3>
          <p className="text-sm font-bold opacity-80 max-w-md mx-auto mb-2">
            Fetching books from database. Please wait a moment.
          </p>
          <p className="text-xs font-semibold opacity-60 max-w-sm mx-auto">
            (Render free tier web services take 30–50s to spin up if sleeping)
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && fetchError && (
        <div className="nb-card nb-card-pink p-8 sm:p-10 text-center my-8">
          <div className="w-16 h-16 rounded-xl bg-black text-[#FF4D4D] border-3 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000]">
            <AlertTriangle className="w-8 h-8 stroke-2.5" />
          </div>
          <h3 className="text-2xl font-black mb-2 uppercase">
            UNABLE TO FETCH BOOKS FROM DATABASE
          </h3>
          <p className="text-sm font-extrabold text-black/90 max-w-lg mx-auto mb-4 bg-white/70 dark:bg-black/40 p-3.5 rounded-lg border-2 border-black">
            {fetchError}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="nb-btn nb-btn-yellow flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000]"
              >
                <RefreshCw className="w-4 h-4 stroke-2.5" />
                <span>RETRY CONNECTION</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !fetchError && books.length === 0 && (
        <div className="nb-card nb-card-yellow p-10 text-center my-8">
          <div className="w-16 h-16 rounded-xl bg-black text-[#CCFF00] border-3 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000]">
            <BookX className="w-8 h-8 stroke-2.5" />
          </div>
          <h3 className="text-2xl font-black mb-2 uppercase">
            NO MATCHING BOOKS FOUND
          </h3>
          <p className="text-sm font-bold text-black/80 max-w-sm mx-auto mb-6">
            We couldn't find any literature matching your current search, shelf,
            or genre selection.
          </p>
          <button onClick={onResetFilters} className="nb-btn nb-btn-black">
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* Book Grid / List */}
      {!isLoading && !fetchError && books.length > 0 && (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {books.map((book) => (
              <BookCard
                key={book._id || book.id}
                book={book}
                viewMode={viewMode}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onOpenJournal={(b) => setActiveJournalBook(b)}
              />
            ))}
          </div>

          {/* Server-Side Pagination Controls */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalBooks={totalBooksCount}
            limit={limit}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </>
      )}

      {/* Reading Journal Modal */}
      {activeJournalBook && (
        <BookJournalModal
          isOpen={Boolean(activeJournalBook)}
          onClose={() => setActiveJournalBook(null)}
          book={activeJournalBook}
          onBookUpdated={(updated) => {
            setActiveJournalBook(updated);
            onBookUpdated?.(updated);
          }}
          onToast={onToast}
        />
      )}
    </section>
  );
};

export default BookList;
