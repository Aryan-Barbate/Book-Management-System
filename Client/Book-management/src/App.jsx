import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import BookForm from "./components/BookForm";
import ToastNotification from "./components/ToastNotification";
import { useToasts } from "./hooks/useToasts";
import { baseBookURL } from "../axiosInstance";
import "./index.css";

const App = () => {
  const [books, setBooks] = useState([]);
  const [theme, setTheme] = useState("light");
  const { toasts, addToast, dismissToast } = useToasts();

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch books from backend API on mount
  useEffect(() => {
    const fetchBooksFromAPI = async () => {
      try {
        const response = await baseBookURL.get("/books");
        if (response.data && Array.isArray(response.data.BookList)) {
          setBooks(response.data.BookList);
        }
      } catch (error) {
        console.error(
          "Error fetching books from backend server:",
          error.message,
        );
      }
    };
    fetchBooksFromAPI();
  }, []);

  const handleSaveBook = useCallback(
    async (bookData) => {
      const targetId = bookData._id || bookData.id;
      const isEdit =
        targetId !== undefined && targetId !== null && targetId !== "";

      if (isEdit) {
        // Update existing book
        try {
          if (typeof targetId === "string" && targetId.length === 24) {
            const res = await baseBookURL.put(`/books/${targetId}`, bookData);
            const updatedBook = res.data?.data || {
              ...bookData,
              _id: targetId,
            };
            setBooks((prev) =>
              prev.map((b) =>
                String(b._id || b.id) === String(targetId) ? updatedBook : b,
              ),
            );
          } else {
            setBooks((prev) =>
              prev.map((b) =>
                String(b._id || b.id) === String(targetId)
                  ? { ...b, ...bookData }
                  : b,
              ),
            );
          }
          addToast(`Updated details for "${bookData.bookName}"`, "success");
        } catch (error) {
          console.error("API Edit Error, applying local update:", error);
          setBooks((prev) =>
            prev.map((b) =>
              String(b._id || b.id) === String(targetId)
                ? { ...b, ...bookData }
                : b,
            ),
          );
          addToast(`Updated details for "${bookData.bookName}"`, "success");
        }
      } else {
        // Create new book
        try {
          const res = await baseBookURL.post("/books", bookData);
          const newBook = res.data?.data || { ...bookData, id: Date.now() };
          setBooks((prev) => [newBook, ...prev]);
          addToast(`Added "${bookData.bookName}" to collection`, "success");
        } catch (error) {
          console.error("API Create Error, applying local creation:", error);
          setBooks((prev) => [{ ...bookData, id: Date.now() }, ...prev]);
          addToast(`Added "${bookData.bookName}" to collection`, "success");
        }
      }
    },
    [addToast],
  );

  const handleDeleteBook = useCallback(
    async (id) => {
      const target = books.find((b) => String(b._id || b.id) === String(id));
      if (!target) return;

      if (
        window.confirm(`Are you sure you want to remove "${target.bookName}"?`)
      ) {
        try {
          if (String(id).length === 24) {
            // Delete from Express backend (DELETE /books/:id)
            await baseBookURL.delete(`/books/${id}`);
          }
        } catch (error) {
          console.error("API Delete Error:", error);
        }
        setBooks((prev) =>
          prev.filter((b) => String(b._id || b.id) !== String(id)),
        );
        addToast(`Removed "${target.bookName}" from library`, "info");
      }
    },
    [books, addToast],
  );

  const handleToggleFavorite = useCallback(
    async (id) => {
      const target = books.find((b) => String(b._id || b.id) === String(id));
      if (!target) return;

      const nextState = !target.isFavorite;
      try {
        if (String(id).length === 24) {
          await baseBookURL.put(`/books/${id}`, {
            ...target,
            isFavorite: nextState,
          });
        }
      } catch (error) {
        console.error("API Favorite Toggle Error:", error);
      }

      setBooks((prev) =>
        prev.map((b) =>
          String(b._id || b.id) === String(id)
            ? { ...b, isFavorite: nextState }
            : b,
        ),
      );
      addToast(
        nextState
          ? `Marked "${target.bookName}" as favorite`
          : `Removed "${target.bookName}" from favorites`,
        "info",
      );
    },
    [books, addToast],
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16 transition-colors duration-200">
        {/* Toast Container */}
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastNotification
                toast={toast}
                onClose={() => dismissToast(toast.id)}
              />
            </div>
          ))}
        </div>

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                books={books}
                onDeleteBook={handleDeleteBook}
                onToggleFavorite={handleToggleFavorite}
                theme={theme}
                onToggleTheme={handleToggleTheme}
              />
            }
          />
          <Route
            path="/add"
            element={<BookForm mode="add" onSaveBook={handleSaveBook} />}
          />
          <Route
            path="/edit/:id"
            element={
              <BookForm
                mode="edit"
                initialData={books}
                onSaveBook={handleSaveBook}
                addToast={addToast}
              />
            }
          />
          {/* Redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
