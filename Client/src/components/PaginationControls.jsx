import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  totalBooks = 0,
  limit = 12,
  onPageChange,
  onLimitChange,
}) => {
  if (totalBooks === 0) return null;

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="nb-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Total items indicator & Page Size Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase opacity-75">
          PAGE <span className="underline font-black">{currentPage}</span> OF{" "}
          <span className="font-black">{totalPages}</span> ({totalBooks} BOOKS)
        </span>

        <div className="flex items-center gap-1.5 pl-3 border-l-2 border-black/20 dark:border-white/20">
          <label className="text-[11px] font-black uppercase opacity-70">
            PER PAGE:
          </label>
          <select
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            className="nb-input py-1 px-2 text-xs font-black uppercase cursor-pointer"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`nb-btn nb-btn-white nb-btn-sm flex items-center gap-1 ${
            currentPage <= 1
              ? "opacity-40 cursor-not-allowed shadow-none"
              : "cursor-pointer hover:bg-[#FFDE59]"
          }`}
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4 stroke-2.5" />
          <span className="hidden sm:inline">PREV</span>
        </button>

        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black cursor-pointer bg-white text-black hover:bg-[#FFDE59] shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-1 text-xs font-black opacity-50">...</span>
            )}
          </>
        )}

        {pages.map((p) => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                isActive
                  ? "bg-[#CCFF00] text-black shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5"
                  : "bg-white text-black hover:bg-[#FFDE59] shadow-[1.5px_1.5px_0px_0px_#000]"
              }`}
            >
              {p}
            </button>
          );
        })}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-xs font-black opacity-50">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-xs font-black cursor-pointer bg-white text-black hover:bg-[#FFDE59] shadow-[1.5px_1.5px_0px_0px_#000]"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`nb-btn nb-btn-white nb-btn-sm flex items-center gap-1 ${
            currentPage >= totalPages
              ? "opacity-40 cursor-not-allowed shadow-none"
              : "cursor-pointer hover:bg-[#FFDE59]"
          }`}
          title="Next Page"
        >
          <span className="hidden sm:inline">NEXT</span>
          <ChevronRight className="w-4 h-4 stroke-2.5" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
