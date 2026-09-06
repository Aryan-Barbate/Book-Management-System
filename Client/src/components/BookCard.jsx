import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Edit3,
  Trash2,
  Heart,
  Calendar,
  BookOpen,
  Quote,
  Tag,
  Bookmark,
} from "lucide-react";
import { formatDate, getBookAge, getGenreBadgeClass } from "../utils/format";
import { getShelfBadgeClass } from "../constants";

const FavoriteButton = ({ isFavorite, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center transition-all cursor-pointer ${
      isFavorite
        ? "bg-[#FF4D4D] text-white shadow-[2px_2px_0px_0px_#000]"
        : "bg-white hover:bg-[#FFDE59] text-black shadow-[2px_2px_0px_0px_#000]"
    }`}
    title={isFavorite ? "Remove Favorite" : "Mark Favorite"}
  >
    <Heart
      className={`w-5 h-5 ${
        isFavorite ? "fill-white text-white" : "text-black stroke-2.5"
      }`}
    />
  </button>
);

const BookCard = ({
  book,
  viewMode = "grid",
  onDelete,
  onToggleFavorite,
  onOpenJournal,
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const bookId = book._id || book.id;
  const formattedPrice = `$${Number(book.bookPrice || 0).toFixed(2)}`;
  const bookAge = getBookAge(book.publishDate);
  const badgeClass = getGenreBadgeClass(book.genre);
  const shelfClass = getShelfBadgeClass(book.shelf);
  const quotesCount = Array.isArray(book.quotes) ? book.quotes.length : 0;
  const tags = Array.isArray(book.tags) ? book.tags : [];

  if (viewMode === "list") {
    return (
      <div className="nb-card nb-card-hover p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Cover Art Thumbnail */}
          {book.coverUrl && !imageError ? (
            <img
              src={book.coverUrl}
              alt={book.bookName}
              onError={() => setImageError(true)}
              className="w-12 h-16 object-cover rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0 bg-neutral-100"
            />
          ) : (
            <div className="w-12 h-16 rounded-lg bg-[#CCFF00] text-black border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <BookOpen className="w-6 h-6 stroke-2.5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-black tracking-tight truncate">
                {book.bookName}
              </h3>
              <span className={`nb-badge ${badgeClass} text-[11px]`}>
                {book.genre || "General"}
              </span>
              {book.shelf && (
                <span className={`nb-badge ${shelfClass} text-[10px]`}>
                  <Bookmark className="w-3 h-3 stroke-2.5" />
                  <span>{book.shelf}</span>
                </span>
              )}
            </div>
            <p className="text-sm font-semibold opacity-80">
              by{" "}
              <span className="font-extrabold text-black dark:text-white">
                {book.bookAuthor}
              </span>
            </p>

            {/* Tags preview in list view */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-black/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-black/10">
          <div className="text-left sm:text-right">
            <div className="nb-badge nb-badge-lime text-sm font-black">
              {formattedPrice}
            </div>
            <div className="text-xs font-bold opacity-60 mt-1">{bookAge}</div>
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton
              isFavorite={book.isFavorite}
              onClick={() => onToggleFavorite(bookId)}
            />

            {/* Journal Button */}
            <button
              type="button"
              onClick={() => onOpenJournal?.(book)}
              className="nb-btn nb-btn-white nb-btn-sm"
              title="Open Reading Journal & Quotes"
            >
              <Quote className="w-3.5 h-3.5 stroke-2.5" />
              <span className="hidden md:inline">JOURNAL</span>
              {quotesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#CCFF00] text-black text-[10px] font-black flex items-center justify-center">
                  {quotesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(`/edit/${bookId}`)}
              className="nb-btn nb-btn-cyan nb-btn-sm"
              title="Edit Book"
            >
              <Edit3 className="w-4 h-4 stroke-2.5" />
              <span>EDIT</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(bookId)}
              className="nb-btn nb-btn-white nb-btn-sm text-[#FF4D4D]"
              title="Delete Book"
            >
              <Trash2 className="w-4 h-4 stroke-2.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="nb-card nb-card-hover p-5 flex flex-col justify-between h-full group">
      <div>
        {/* Header row: Genre, Shelf & Favorite */}
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`nb-badge ${badgeClass} text-[11px]`}>
              {book.genre || "Fiction"}
            </span>
            {book.shelf && (
              <span className={`nb-badge ${shelfClass} text-[10px]`}>
                {book.shelf}
              </span>
            )}
          </div>
          <FavoriteButton
            isFavorite={book.isFavorite}
            onClick={() => onToggleFavorite(bookId)}
          />
        </div>

        {/* Cover Art Visual Block */}
        <div className="relative mb-4 overflow-hidden rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000] bg-neutral-100 dark:bg-neutral-900 aspect-[16/10] flex items-center justify-center">
          {book.coverUrl && !imageError ? (
            <img
              src={book.coverUrl}
              alt={book.bookName}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#FFDE59] to-[#FF66C4] text-black">
              <div className="flex items-center justify-between">
                <BookOpen className="w-6 h-6 stroke-2.5" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  {book.genre || "BOOK"}
                </span>
              </div>
              <div>
                <h4 className="font-black text-sm uppercase line-clamp-2 leading-tight">
                  {book.bookName}
                </h4>
                <p className="text-[11px] font-bold opacity-80 truncate">
                  {book.bookAuthor}
                </p>
              </div>
            </div>
          )}

          {/* Page count pill if available */}
          {book.pageCount > 0 && (
            <span className="absolute bottom-2 right-2 nb-badge nb-badge-white text-[10px] py-0.5 px-1.5">
              {book.pageCount} PAGES
            </span>
          )}
        </div>

        {/* Title & Author */}
        <h3 className="text-xl font-black tracking-tight leading-snug line-clamp-2 mb-1 group-hover:underline">
          {book.bookName}
        </h3>
        <p className="text-sm font-semibold opacity-80 mb-2">
          by{" "}
          <span className="font-extrabold text-black dark:text-white">
            {book.bookAuthor}
          </span>
        </p>

        {book.description && (
          <p className="text-xs font-semibold line-clamp-2 mb-3 opacity-75">
            {book.description}
          </p>
        )}

        {/* Tags chips */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 border border-black/20"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] font-bold opacity-50">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Price & Rating badges */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-black/10 mb-3">
          <span className="nb-badge nb-badge-lime font-black text-sm px-3 py-1">
            {formattedPrice}
          </span>
          <div className="nb-badge nb-badge-yellow px-2.5 py-1">
            <Star className="w-3.5 h-3.5 fill-black text-black stroke-2.5" />
            <span>{book.rating || 5} / 5</span>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="flex items-center justify-between text-xs font-extrabold opacity-70 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 stroke-2.5" />
            {formatDate(book.publishDate)}
          </span>
          <span>{bookAge}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Journal Button */}
          <button
            type="button"
            onClick={() => onOpenJournal?.(book)}
            className="nb-btn nb-btn-white nb-btn-sm flex-1 flex items-center justify-center gap-1.5"
            title="Quotes & Reading Journal"
          >
            <Quote className="w-3.5 h-3.5 stroke-2.5" />
            <span>JOURNAL</span>
            {quotesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#CCFF00] text-black text-[10px] font-black flex items-center justify-center">
                {quotesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/edit/${bookId}`)}
            className="nb-btn nb-btn-cyan nb-btn-sm"
            title="Edit Book"
          >
            <Edit3 className="w-3.5 h-3.5 stroke-2.5" />
            <span>EDIT</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(bookId)}
            className="nb-btn nb-btn-white nb-btn-sm text-[#FF4D4D]"
            title="Delete Book"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-2.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
