import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, Edit3, Trash2, Heart, Calendar, BookOpen } from "lucide-react";
import { formatDate, getBookAge, getGenreBadgeClass } from "../utils/format";

const FavoriteButton = ({ isFavorite, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center transition-all cursor-pointer ${
      isFavorite
        ? "bg-[#FF4D4D] text-white shadow-[2px_2px_0px_0px_#000]"
        : "bg-white hover:bg-[#FFDE59] text-black shadow-[2px_2px_0px_0px_#000]"
    }`}
    title={isFavorite ? "Remove Favorite" : "Mark Favorite"}
  >
    <Heart
      className={`w-5 h-5 ${isFavorite ? "fill-white text-white" : "text-black stroke-2.5"}`}
    />
  </button>
);

const BookCard = ({ book, viewMode = "grid", onDelete, onToggleFavorite }) => {
  const navigate = useNavigate();
  const bookId = book._id || book.id;
  const formattedPrice = `$${Number(book.bookPrice || 0).toFixed(2)}`;
  const bookAge = getBookAge(book.publishDate);
  const badgeClass = getGenreBadgeClass(book.genre);

  if (viewMode === "list") {
    return (
      <div className="nb-card nb-card-hover p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-14 rounded-lg bg-[#CCFF00] text-black border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <BookOpen className="w-6 h-6 stroke-2.5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-black tracking-tight truncate">
                {book.bookName}
              </h3>
              <span className={`nb-badge ${badgeClass} text-[11px]`}>
                {book.genre || "General"}
              </span>
            </div>
            <p className="text-sm font-semibold opacity-80">
              by{" "}
              <span className="font-extrabold text-black dark:text-white">
                {book.bookAuthor}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t-2 sm:border-t-0 border-black/10">
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
        {/* Header row: Genre & Favorite */}
        <div className="flex items-center justify-between mb-3">
          <span className={`nb-badge ${badgeClass} text-[11px]`}>
            {book.genre || "Fiction"}
          </span>
          <FavoriteButton
            isFavorite={book.isFavorite}
            onClick={() => onToggleFavorite(bookId)}
          />
        </div>

        {/* Title & Author */}
        <h3 className="text-xl font-black tracking-tight leading-snug line-clamp-2 mb-1.5 group-hover:underline">
          {book.bookName}
        </h3>
        <p className="text-sm font-semibold opacity-80 mb-3">
          by{" "}
          <span className="font-extrabold text-black dark:text-white">
            {book.bookAuthor}
          </span>
        </p>

        {book.description && (
          <p className="text-xs font-semibold line-clamp-3 mb-4 opacity-75">
            {book.description}
          </p>
        )}
      </div>

      <div>
        {/* Price & Rating badges */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-black/10 mb-4">
          <span className="nb-badge nb-badge-lime font-black text-sm px-3 py-1">
            {formattedPrice}
          </span>
          <div className="nb-badge nb-badge-yellow px-2.5 py-1">
            <Star className="w-3.5 h-3.5 fill-black text-black stroke-2.5" />
            <span>{book.rating || 5} / 5</span>
          </div>
        </div>

        {/* Footer info & Buttons */}
        <div className="flex items-center justify-between text-xs font-extrabold opacity-70 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 stroke-2.5" />
            {formatDate(book.publishDate)}
          </span>
          <span>{bookAge}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate(`/edit/${bookId}`)}
            className="nb-btn nb-btn-cyan nb-btn-sm flex-1"
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
            <span>DELETE</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
