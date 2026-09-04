import React from "react";
import BookCard from "./BookCard";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  BookX,
  Heart,
  X,
} from "lucide-react";
import { GENRE_FILTERS, getGenreColor } from "../constants";

const BookList = ({
  books,
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onDelete,
  onToggleFavorite,
  onResetFilters,
  totalBooksCount,
}) => {
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
              placeholder="SEARCH TITLE, AUTHOR, OR SUMMARY..."
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
                className="nb-input py-2 px-3 text-xs font-black uppercase min-w-37.5 cursor-pointer"
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

        {/* Genre Pill Selector */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {GENRE_FILTERS.map((genre) => {
            const isSelected = selectedGenre === genre;
            const colorClass = getGenreColor(genre, isSelected);
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black flex items-center gap-2 cursor-pointer ${colorClass} ${
                  isSelected
                    ? "shadow-[3px_3px_0px_0px_#000] -translate-y-0.5"
                    : "shadow-[1.5px_1.5px_0px_0px_#000]"
                }`}
              >
                {genre === "Favorites" && (
                  <Heart
                    className={`w-3.5 h-3.5 ${isSelected ? "fill-white text-white" : "fill-[#FF4D4D] text-[#FF4D4D]"}`}
                  />
                )}
                <span>{genre}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-extrabold uppercase">
          SHOWING <span className="underline font-black">{books.length}</span>{" "}
          OF {totalBooksCount} BOOKS
          {selectedGenre !== "All" && (
            <span>
              {" "}
              IN{" "}
              <span className="nb-badge nb-badge-yellow">{selectedGenre}</span>
            </span>
          )}
        </p>

        {(searchQuery || selectedGenre !== "All") && (
          <button
            onClick={onResetFilters}
            className="nb-badge nb-badge-white text-xs cursor-pointer hover:bg-[#FFDE59]"
          >
            RESET FILTERS
          </button>
        )}
      </div>

      {/* Empty State */}
      {books.length === 0 && (
        <div className="nb-card nb-card-yellow p-10 text-center my-8">
          <div className="w-16 h-16 rounded-xl bg-black text-[#CCFF00] border-3 border-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_#000]">
            <BookX className="w-8 h-8 stroke-2.5" />
          </div>
          <h3 className="text-2xl font-black mb-2 uppercase">
            NO MATCHING BOOKS FOUND
          </h3>
          <p className="text-sm font-bold text-black/80 max-w-sm mx-auto mb-6">
            We couldn't find any literature matching your current search filter
            or genre selection.
          </p>
          <button onClick={onResetFilters} className="nb-btn nb-btn-black">
            RESET ALL FILTERS
          </button>
        </div>
      )}

      {/* Book Grid / List */}
      {books.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              viewMode={viewMode}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BookList;
