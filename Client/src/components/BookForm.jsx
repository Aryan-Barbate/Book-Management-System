import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
  BookOpen,
  User,
  DollarSign,
  Calendar,
  Tag,
  Star,
  Sparkles,
  Search,
  ScanLine,
  Upload,
  Image as ImageIcon,
  Bookmark,
  Hash,
  Layers,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { GENRES, DEFAULT_SHELVES, POPULAR_TAGS } from "../constants";
import { formatDateForInput } from "../utils/format";
import { baseBookURL } from "../../axiosInstance";
import { useAuth } from "../context/AuthContext";
import BarcodeScannerModal from "./BarcodeScannerModal";

const BookForm = ({
  mode = "add",
  initialData,
  onSaveBook,
  onCancel,
  addToast,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = mode === "edit";

  const availableShelves = user?.customShelves?.length
    ? user.customShelves
    : DEFAULT_SHELVES;

  const [formData, setFormData] = useState({
    bookName: "",
    bookAuthor: "",
    bookPrice: "",
    publishDate: "",
    genre: "Fiction",
    shelf: "Want to Read",
    rating: 5,
    description: "",
    coverUrl: "",
    isbn: "",
    pageCount: "",
    tags: [],
    isFavorite: false,
  });

  const [isbnQuery, setIsbnQuery] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      setIsLoading(false);
      return;
    }

    if (!id && !initialData) {
      navigate("/");
      return;
    }

    const bookData =
      initialData?.find((b) => String(b._id || b.id) === String(id)) || null;

    if (bookData) {
      setFormData({
        bookName: bookData.bookName || "",
        bookAuthor: bookData.bookAuthor || "",
        bookPrice: String(bookData.bookPrice || ""),
        publishDate: formatDateForInput(bookData.publishDate),
        genre: bookData.genre || "Fiction",
        shelf: bookData.shelf || "Want to Read",
        rating: bookData.rating || 5,
        description: bookData.description || "",
        coverUrl: bookData.coverUrl || "",
        isbn: bookData.isbn || "",
        pageCount: bookData.pageCount ? String(bookData.pageCount) : "",
        tags: Array.isArray(bookData.tags) ? bookData.tags : [],
        isFavorite: Boolean(bookData.isFavorite),
      });
      setIsbnQuery(bookData.isbn || "");
    } else if (initialData && initialData.length === 0) {
      addToast?.("Book not found", "error");
      navigate("/");
    }
    setIsLoading(false);
  }, [id, initialData, isEdit, navigate, addToast]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Cover image file upload handler (converts to base64 Data URL)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast?.("Please select a valid image file (PNG, JPG, WEBP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast?.("Cover image file must be smaller than 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url && typeof base64Url === "string") {
        setFormData((prev) => ({ ...prev, coverUrl: base64Url }));
        addToast?.("Cover image uploaded!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // ISBN Auto-fill fetcher
  const handleLookupIsbn = async (targetIsbn) => {
    const raw = targetIsbn || isbnQuery;
    const cleanIsbn = String(raw).replace(/[^0-9X]/gi, "").trim();

    if (!cleanIsbn || cleanIsbn.length < 9) {
      addToast?.("Please enter a valid 10 or 13 digit ISBN.", "error");
      return;
    }

    setIsLookingUp(true);
    try {
      let data = null;

      // Try backend endpoint first
      try {
        const res = await baseBookURL.get(`/books/lookup/${cleanIsbn}`);
        if (res.data?.data) {
          data = res.data.data;
        }
      } catch (backendErr) {
        console.warn("Backend lookup fallback to client APIs:", backendErr.message);
      }

      // Direct client fallback to Google Books API
      if (!data) {
        const gRes = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
        );
        if (gRes.ok) {
          const gJson = await gRes.json();
          if (gJson.items && gJson.items.length > 0) {
            const info = gJson.items[0].volumeInfo || {};
            let cover = info.imageLinks?.thumbnail || info.imageLinks?.small || "";
            if (cover.startsWith("http://")) cover = cover.replace("http://", "https://");

            // Extract tags from Google categories
            const allRaw = [];
            (info.categories || []).forEach((c) => {
              c.split(/[/,&]/).forEach((p) => {
                const t = p.trim();
                if (t && t.length > 2 && t.toLowerCase() !== "general") allRaw.push(t);
              });
            });
            const clientTags = Array.from(new Set(allRaw)).slice(0, 8);

            data = {
              bookName: info.title || "",
              bookAuthor: info.authors ? info.authors.join(", ") : "",
              description: info.description || "",
              publishDate: info.publishedDate || "",
              pageCount: info.pageCount || 0,
              genre: info.categories ? info.categories[0].split("/")[0].trim() : "Fiction",
              tags: clientTags,
              coverUrl: cover,
              bookPrice: 14.99,
              isbn: cleanIsbn,
            };
          }
        }
      }

      // Direct client fallback to OpenLibrary
      if (!data) {
        const olRes = await fetch(
          `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
        );
        if (olRes.ok) {
          const olJson = await olRes.json();
          const olBook = olJson[`ISBN:${cleanIsbn}`];
          if (olBook) {
            // Extract tags from OpenLibrary subjects
            const subTags = (olBook.subjects || [])
              .map((s) => (typeof s === "string" ? s : s.name))
              .filter((s) => s && !s.includes(":") && !s.includes("=") && s.length > 2 && s.length < 30)
              .map((s) => s.replace(/\(.*?\)/g, "").trim())
              .filter(Boolean);
            const clientTags = Array.from(new Set(subTags)).slice(0, 8);

            data = {
              bookName: olBook.title || "",
              bookAuthor: olBook.authors ? olBook.authors.map((a) => a.name).join(", ") : "",
              description: typeof olBook.notes === "string" ? olBook.notes : "",
              publishDate: olBook.publish_date || "",
              pageCount: olBook.number_of_pages || 0,
              genre: olBook.subjects ? olBook.subjects[0].name : "Fiction",
              tags: clientTags,
              coverUrl: olBook.cover?.large || olBook.cover?.medium || "",
              bookPrice: 15.0,
              isbn: cleanIsbn,
            };
          }
        }
      }

      if (!data) {
        throw new Error("No book found for this ISBN. You can enter details manually.");
      }

      // Populate form with fetched book details, category & tags
      setFormData((prev) => {
        const mergedTags = Array.from(
          new Set([...(prev.tags || []), ...(data.tags || [])])
        ).slice(0, 10);

        return {
          ...prev,
          bookName: data.bookName || prev.bookName,
          bookAuthor: data.bookAuthor || prev.bookAuthor,
          description: data.description || prev.description,
          publishDate: formatDateForInput(data.publishDate) || prev.publishDate,
          pageCount: data.pageCount ? String(data.pageCount) : prev.pageCount,
          coverUrl: data.coverUrl || prev.coverUrl,
          isbn: cleanIsbn,
          genre: GENRES.includes(data.genre) ? data.genre : prev.genre,
          tags: mergedTags,
          bookPrice: prev.bookPrice || String(data.bookPrice || "14.99"),
        };
      });

      setIsbnQuery(cleanIsbn);
      const tagCount = data.tags?.length || 0;
      addToast?.(
        `Auto-filled details & ${tagCount} tag${tagCount === 1 ? "" : "s"} for "${data.bookName}"!`,
        "success"
      );
    } catch (err) {
      addToast?.(err.message || "Failed to find book details.", "error");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Barcode detection callback
  const handleBarcodeDetected = (scannedCode) => {
    setIsbnQuery(scannedCode);
    handleLookupIsbn(scannedCode);
  };

  // Tags management
  const handleAddTag = (tagToAdd) => {
    const cleanTag = tagToAdd.trim().replace(/^#/, "");
    if (!cleanTag) return;
    if (!formData.tags.includes(cleanTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bookName.trim()) newErrors.bookName = "Title is required";
    if (!formData.bookAuthor.trim())
      newErrors.bookAuthor = "Author is required";
    if (!formData.bookPrice) {
      newErrors.bookPrice = "Price is required";
    } else if (
      isNaN(formData.bookPrice) ||
      parseFloat(formData.bookPrice) < 0
    ) {
      newErrors.bookPrice = "Enter a valid price";
    }
    if (!formData.publishDate)
      newErrors.publishDate = "Publish date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const targetId =
      initialData?._id || initialData?.id || (isEdit ? id : undefined);

    onSaveBook({
      ...formData,
      id: targetId,
      _id: targetId,
      bookPrice: parseFloat(formData.bookPrice),
      rating: Number(formData.rating),
      pageCount: formData.pageCount ? parseInt(formData.pageCount, 10) : 0,
      isFavorite: Boolean(formData.isFavorite),
    });

    onCancel?.();
    navigate("/");
  };

  const handleCancel = () => {
    onCancel?.();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFDE59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const headerTitle = isEdit ? "EDIT BOOK DETAILS" : "ADD NEW BOOK";
  const headerSubtitle = isEdit
    ? `Update information for "${formData.bookName || initialData?.bookName || ""}"`
    : "Enter details or scan ISBN to auto-populate your library";
  const submitLabel = isEdit ? "SAVE CHANGES" : "ADD TO VAULT";

  return (
    <div className="min-h-screen pb-16 transition-colors duration-200">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleCancel}
          className="w-10 h-10 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFDE59] transition-colors cursor-pointer"
          title="Go back to library"
        >
          <X className="w-5 h-5 stroke-2.5" />
        </button>
      </div>

      <div className="pt-16 sm:pt-20 px-4 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-[#1C1C24] border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 nb-card-yellow border-b-3 border-black">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black text-[#CCFF00] border-2 border-black shadow-[2px_2px_0px_0px_#FFFDF5]">
                <Sparkles className="w-5 h-5 stroke-2.5" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase text-black">
                  {headerTitle}
                </h2>
                <p className="text-xs font-bold text-black/80">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-3" />
            </button>
          </div>

          {/* ISBN & Barcode Scanner Auto-Fill Banner */}
          <div className="p-4 sm:p-5 bg-black/5 dark:bg-white/5 border-b-2 border-black space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-[#00E5FF] stroke-2.5" />
                <span>ISBN LOOKUP & BARCODE AUTO-FILL</span>
              </span>
              <span className="nb-badge nb-badge-lime text-[10px]">
                FAST POPULATE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                <input
                  type="text"
                  placeholder="Enter 10 or 13 digit ISBN (e.g. 9780140283334)..."
                  value={isbnQuery}
                  onChange={(e) => setIsbnQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLookupIsbn();
                    }
                  }}
                  className="nb-input nb-input-has-icon text-xs font-bold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleLookupIsbn()}
                  disabled={isLookingUp}
                  className="nb-btn nb-btn-cyan nb-btn-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
                >
                  {isLookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 stroke-2.5" />
                  )}
                  <span>FETCH INFO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="nb-btn nb-btn-lime nb-btn-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]"
                  title="Scan physical book barcode with camera"
                >
                  <ScanLine className="w-4 h-4 stroke-2.5" />
                  <span>SCAN BARCODE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Cover Art Preview & Upload Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border-2 border-black bg-black/5 dark:bg-white/5 items-center">
              <div className="flex flex-col items-center justify-center">
                {formData.coverUrl ? (
                  <div className="relative group">
                    <img
                      src={formData.coverUrl}
                      alt="Cover Preview"
                      className="w-24 h-36 object-cover rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("coverUrl", "")}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF4D4D] text-white flex items-center justify-center border border-black shadow"
                      title="Remove cover"
                    >
                      <X className="w-3.5 h-3.5 stroke-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-36 rounded-lg border-2 border-dashed border-black/40 dark:border-white/40 flex flex-col items-center justify-center p-2 text-center text-neutral-400">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px] font-bold">NO COVER</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1">
                    Cover Image URL or File Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.example.com/cover.jpg"
                      value={formData.coverUrl}
                      onChange={(e) => handleChange("coverUrl", e.target.value)}
                      className="nb-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="nb-btn nb-btn-white nb-btn-sm flex items-center gap-2 cursor-pointer w-fit shadow-[2px_2px_0px_0px_#000]">
                    <Upload className="w-4 h-4 stroke-2.5" />
                    <span>UPLOAD COVER IMAGE</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] font-semibold opacity-60 mt-1">
                    Auto-populated when searching by ISBN, or upload PNG/JPG.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Book Title <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. The Great Gatsby"
                    value={formData.bookName}
                    onChange={(e) => handleChange("bookName", e.target.value)}
                    className="nb-input nb-input-has-icon"
                  />
                </div>
                {errors.bookName && (
                  <p className="text-xs font-extrabold text-[#FF4D4D] mt-1">
                    {errors.bookName}
                  </p>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Author <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. F. Scott Fitzgerald"
                    value={formData.bookAuthor}
                    onChange={(e) => handleChange("bookAuthor", e.target.value)}
                    className="nb-input nb-input-has-icon"
                  />
                </div>
                {errors.bookAuthor && (
                  <p className="text-xs font-extrabold text-[#FF4D4D] mt-1">
                    {errors.bookAuthor}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Price ($ USD) <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="14.99"
                    value={formData.bookPrice}
                    onChange={(e) => handleChange("bookPrice", e.target.value)}
                    className="nb-input nb-input-has-icon"
                  />
                </div>
                {errors.bookPrice && (
                  <p className="text-xs font-extrabold text-[#FF4D4D] mt-1">
                    {errors.bookPrice}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Genre
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5 z-10" />
                  <select
                    value={formData.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                    className="nb-input nb-input-has-icon cursor-pointer font-bold"
                  >
                    {GENRES.map((g) => (
                      <option
                        key={g}
                        value={g}
                        className="bg-white dark:bg-[#1C1C24] text-black dark:text-white"
                      >
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Shelf */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Shelf / Collection
                </label>
                <div className="relative">
                  <Bookmark className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5 z-10" />
                  <select
                    value={formData.shelf}
                    onChange={(e) => handleChange("shelf", e.target.value)}
                    className="nb-input nb-input-has-icon cursor-pointer font-bold"
                  >
                    {availableShelves.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-white dark:bg-[#1C1C24] text-black dark:text-white"
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Publish Date */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Publication Date <span className="text-[#FF4D4D]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5 z-10" />
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => handleChange("publishDate", e.target.value)}
                    className="nb-input nb-input-has-icon cursor-pointer"
                  />
                </div>
                {errors.publishDate && (
                  <p className="text-xs font-extrabold text-[#FF4D4D] mt-1">
                    {errors.publishDate}
                  </p>
                )}
              </div>

              {/* Page Count */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Page Count
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 320"
                    value={formData.pageCount}
                    onChange={(e) => handleChange("pageCount", e.target.value)}
                    className="nb-input nb-input-has-icon"
                  />
                </div>
              </div>

              {/* ISBN */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  ISBN Number
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none stroke-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. 9780743273565"
                    value={formData.isbn}
                    onChange={(e) => handleChange("isbn", e.target.value)}
                    className="nb-input nb-input-has-icon"
                  />
                </div>
              </div>

              {/* Multi-Tagging Input */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider">
                  Tags & Categories
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a tag and press Enter (e.g. Must-Read)..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddTag(newTagInput);
                      }
                    }}
                    className="nb-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(newTagInput)}
                    className="nb-btn nb-btn-lime nb-btn-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-3" />
                    <span>ADD TAG</span>
                  </button>
                </div>

                {/* Active Tags Chips */}
                {formData.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="nb-badge nb-badge-yellow text-xs py-1 px-2.5 flex items-center gap-1"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-[#FF4D4D] cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3 stroke-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular Tags Quick Add */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold opacity-60">
                    POPULAR:
                  </span>
                  {POPULAR_TAGS.map((pt) => {
                    const isAdded = formData.tags.includes(pt);
                    return (
                      <button
                        key={pt}
                        type="button"
                        onClick={() =>
                          isAdded ? handleRemoveTag(pt) : handleAddTag(pt)
                        }
                        className={`text-[10px] font-black px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isAdded
                            ? "bg-[#CCFF00] text-black border-black"
                            : "bg-black/5 dark:bg-white/5 border-black/20 hover:bg-[#FFDE59]"
                        }`}
                      >
                        {isAdded ? "✓ " : "+"}#{pt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Rating ({formData.rating} / 5 Stars)
                </label>
                <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 border-2 border-black rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleChange("rating", star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= formData.rating
                            ? "fill-[#FFDE59] text-black stroke-2.5"
                            : "text-black/30 dark:text-white/30 stroke-2"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Summary / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Key takeaways or synopsis..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="nb-input resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t-2 border-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="nb-btn nb-btn-white"
              >
                CANCEL
              </button>
              <button type="submit" className="nb-btn nb-btn-yellow">
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDetected={handleBarcodeDetected}
      />
    </div>
  );
};

export default BookForm;
