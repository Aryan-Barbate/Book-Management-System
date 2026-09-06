import React, { useState, useEffect } from "react";
import {
  X,
  Quote as QuoteIcon,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Bookmark,
  Sparkles,
  Save,
} from "lucide-react";
import { baseBookURL } from "../../axiosInstance";

const BookJournalModal = ({ isOpen, onClose, book, onBookUpdated, onToast }) => {
  const [activeTab, setActiveTab] = useState("quotes");
  const [quoteText, setQuoteText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [notes, setNotes] = useState(book?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);


  // Handle exit animation completion
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setIsExiting(false);
        onClose();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onClose]);

  // Don't render when closed and not exiting
  if (!isOpen && !isExiting || !book) return null;

  const quotes = Array.isArray(book.quotes) ? book.quotes : [];

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    setIsSaving(true);
    const bookId = book._id || book.id;

    try {
      const payload = {
        quote: quoteText.trim(),
        page: pageNumber ? Number(pageNumber) : null,
        note: quoteNote.trim(),
      };

      let updatedQuotes;
      if (typeof bookId === "string" && bookId.length === 24) {
        const res = await baseBookURL.post(`/books/${bookId}/quotes`, payload);
        updatedQuotes = res.data?.quotes || [...quotes, { ...payload, _id: Date.now() }];
      } else {
        // Local fallback
        updatedQuotes = [...quotes, { ...payload, _id: Date.now(), createdAt: new Date() }];
      }

      const updatedBook = { ...book, quotes: updatedQuotes };
      onBookUpdated(updatedBook);
      setQuoteText("");
      setPageNumber("");
      setQuoteNote("");
      onToast?.("Quote added to journal!", "success");
    } catch (err) {
      console.error("Error adding quote:", err);
      // Fallback local update
      const newQ = {
        quote: quoteText.trim(),
        page: pageNumber ? Number(pageNumber) : null,
        note: quoteNote.trim(),
        _id: Date.now(),
        createdAt: new Date(),
      };
      const updatedBook = { ...book, quotes: [...quotes, newQ] };
      onBookUpdated(updatedBook);
      setQuoteText("");
      setPageNumber("");
      setQuoteNote("");
      onToast?.("Quote added locally", "info");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    const bookId = book._id || book.id;
    try {
      if (typeof bookId === "string" && bookId.length === 24 && typeof quoteId === "string" && quoteId.length === 24) {
        await baseBookURL.delete(`/books/${bookId}/quotes/${quoteId}`);
      }
      const updatedQuotes = quotes.filter((q) => String(q._id) !== String(quoteId));
      onBookUpdated({ ...book, quotes: updatedQuotes });
      onToast?.("Quote removed from journal", "info");
    } catch (err) {
      console.error("Delete quote error:", err);
      const updatedQuotes = quotes.filter((q) => String(q._id) !== String(quoteId));
      onBookUpdated({ ...book, quotes: updatedQuotes });
      onToast?.("Quote removed", "info");
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    const bookId = book._id || book.id;
    try {
      if (typeof bookId === "string" && bookId.length === 24) {
        await baseBookURL.put(`/books/${bookId}/notes`, { notes });
      }
      onBookUpdated({ ...book, notes });
      onToast?.("Study notes saved successfully!", "success");
    } catch (err) {
      console.error("Error saving notes:", err);
      onBookUpdated({ ...book, notes });
      onToast?.("Notes saved locally", "info");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs ${isExiting ? 'modal-exiting' : 'animate-pop'}`}>
      <div className="w-full max-w-2xl bg-white dark:bg-[#1C1C24] border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 nb-card-purple border-b-3 border-black shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.bookName}
                className="w-10 h-14 object-cover rounded border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0"
              />
            ) : (
              <div className="w-10 h-12 rounded bg-[#CCFF00] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                <BookOpen className="w-5 h-5 stroke-2.5" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-black uppercase text-black truncate">
                {book.bookName}
              </h2>
              <p className="text-xs font-bold text-black/80 truncate">
                Reading Journal & Quotes by {book.bookAuthor}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExiting(true)}
            className="w-8 h-8 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-3" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-black/5 dark:bg-white/5 border-b-2 border-black shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("quotes")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black flex items-center gap-2 cursor-pointer ${
              activeTab === "quotes"
                ? "bg-[#CCFF00] text-black shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5"
                : "bg-white dark:bg-[#2A2A38] text-black dark:text-white hover:bg-[#FFDE59]"
            }`}
          >
            <QuoteIcon className="w-3.5 h-3.5 stroke-2.5" />
            <span>QUOTES JOURNAL ({quotes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-black flex items-center gap-2 cursor-pointer ${
              activeTab === "notes"
                ? "bg-[#FFDE59] text-black shadow-[2.5px_2.5px_0px_0px_#000] -translate-y-0.5"
                : "bg-white dark:bg-[#2A2A38] text-black dark:text-white hover:bg-[#FFDE59]"
            }`}
          >
            <FileText className="w-3.5 h-3.5 stroke-2.5" />
            <span>PRIVATE NOTES</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "quotes" && (
            <div className="space-y-6">
              {/* Add Quote Box */}
              <form
                onSubmit={handleAddQuote}
                className="nb-card p-4 space-y-3 bg-[#FFFDF5] dark:bg-[#22222D]"
              >
                <div className="flex items-center gap-2 text-xs font-black uppercase">
                  <Sparkles className="w-4 h-4 text-[#FFDE59]" />
                  <span>RECORD A FAVORITE PASSAGE OR QUOTE</span>
                </div>

                <div>
                  <textarea
                    required
                    rows="2"
                    placeholder='"It is a truth universally acknowledged..."'
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="nb-input text-sm italic"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-black uppercase mb-1">
                      Page Marker
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 142"
                      value={pageNumber}
                      onChange={(e) => setPageNumber(e.target.value)}
                      className="nb-input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase mb-1">
                      Your Thoughts / Reflection
                    </label>
                    <input
                      type="text"
                      placeholder="Why this resonated with you..."
                      value={quoteNote}
                      onChange={(e) => setQuoteNote(e.target.value)}
                      className="nb-input text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !quoteText.trim()}
                  className="nb-btn nb-btn-lime nb-btn-sm flex items-center gap-1.5 cursor-pointer shadow-[2.5px_2.5px_0px_0px_#000]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-3" />
                  <span>ADD QUOTE TO JOURNAL</span>
                </button>
              </form>

              {/* Quote List */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider opacity-70">
                  RECORDED QUOTES ({quotes.length})
                </h3>

                {quotes.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-black/20 dark:border-white/20 rounded-xl">
                    <QuoteIcon className="w-8 h-8 stroke-2 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold opacity-60">
                      No quotes added yet. Highlight and preserve your favorite
                      moments from this book above!
                    </p>
                  </div>
                ) : (
                  quotes.map((q, idx) => (
                    <div
                      key={q._id || idx}
                      className="nb-card p-4 space-y-2 relative group hover:border-[#CCFF00]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <blockquote className="text-sm font-bold italic tracking-tight leading-relaxed pr-6">
                          "{q.quote}"
                        </blockquote>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(q._id)}
                          className="text-[#FF4D4D] opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer shrink-0"
                          title="Delete quote"
                        >
                          <Trash2 className="w-4 h-4 stroke-2" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-black/10 dark:border-white/10 flex-wrap">
                        {q.page && (
                          <span className="nb-badge nb-badge-lime text-[10px]">
                            <Bookmark className="w-3 h-3 stroke-2.5" />
                            <span>PAGE {q.page}</span>
                          </span>
                        )}

                        {q.note && (
                          <p className="text-xs font-semibold opacity-80">
                            💡 {q.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Personal Reading Journal & Study Notes
                </label>
                <textarea
                  rows="12"
                  placeholder="Record chapter summaries, personal reflections, key concepts, critique, or action items from this book..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="nb-input font-medium text-sm leading-relaxed p-4"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="nb-btn nb-btn-yellow flex items-center gap-2 shadow-[3px_3px_0px_0px_#000]"
                >
                  <Save className="w-4 h-4 stroke-2.5" />
                  <span>{isSaving ? "SAVING..." : "SAVE NOTES"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookJournalModal;
