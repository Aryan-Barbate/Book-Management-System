import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import BookForm from "./components/BookForm";
import ToastNotification from "./components/ToastNotification";
import AuthModal from "./components/AuthModal";
import { useToasts } from "./hooks/useToasts";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { baseBookURL } from "../axiosInstance";
import "./index.css";

const MainApp = () => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({
    totalBooks: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  });
  const [filterParams, setFilterParams] = useState(null);
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { toasts, addToast, dismissToast } = useToasts();
  const { isAuthModalOpen, closeAuthModal, user } = useAuth();

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch books from backend API with optional server-side filter params
  const fetchBooksFromAPI = useCallback(async (params = null) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const queryParams = params || {};
      const response = await baseBookURL.get("/books", {
        params: queryParams,
      });

      if (response.data && Array.isArray(response.data.BookList)) {
        setBooks(response.data.BookList);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        } else {
          setPagination({
            totalBooks: response.data.BookList.length,
            totalPages: 1,
            currentPage: 1,
            limit: response.data.BookList.length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching books from backend server:", error);
      let message = error.response?.data?.Message || error.message;

      if (error.code === "ECONNABORTED") {
        message =
          "Connection timed out. Render backend may still be spinning up from sleep.";
      } else if (
        !error.response &&
        typeof window !== "undefined" &&
        window.location.protocol === "https:" &&
        error.config?.baseURL?.startsWith("http://localhost")
      ) {
        message =
          "Mixed Content Block: Deployed HTTPS frontend cannot reach localhost:3000. Set VITE_API_URL in your Vercel settings to your Render backend URL.";
      } else if (!error.response) {
        message =
          "Could not connect to backend server. The Render service may be starting up (cold start) or CORS is blocking the request.";
      }

      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBooksFromAPI();
  }, [fetchBooksFromAPI, user]);

  // Handle server-side filter changes
  const handleFilterChange = useCallback(
    (newParams) => {
      setFilterParams(newParams);
      fetchBooksFromAPI(newParams);
    },
    [fetchBooksFromAPI]
  );

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
                String(b._id || b.id) === String(targetId) ? updatedBook : b
              )
            );
          } else {
            setBooks((prev) =>
              prev.map((b) =>
                String(b._id || b.id) === String(targetId)
                  ? { ...b, ...bookData }
                  : b
              )
            );
          }
          addToast(`Updated details for "${bookData.bookName}"`, "success");
        } catch (error) {
          console.error("API Edit Error, applying local update:", error);
          setBooks((prev) =>
            prev.map((b) =>
              String(b._id || b.id) === String(targetId)
                ? { ...b, ...bookData }
                : b
            )
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
          fetchBooksFromAPI(filterParams);
        } catch (error) {
          console.error("API Create Error, applying local creation:", error);
          setBooks((prev) => [{ ...bookData, id: Date.now() }, ...prev]);
          addToast(`Added "${bookData.bookName}" to collection`, "success");
        }
      }
    },
    [addToast, fetchBooksFromAPI, filterParams]
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
            await baseBookURL.delete(`/books/${id}`);
          }
        } catch (error) {
          console.error("API Delete Error:", error);
        }
        setBooks((prev) =>
          prev.filter((b) => String(b._id || b.id) !== String(id))
        );
        addToast(`Removed "${target.bookName}" from library`, "info");
        fetchBooksFromAPI(filterParams);
      }
    },
    [books, addToast, fetchBooksFromAPI, filterParams]
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
            : b
        )
      );
      addToast(
        nextState
          ? `Marked "${target.bookName}" as favorite`
          : `Removed "${target.bookName}" from favorites`,
        "info"
      );
    },
    [books, addToast]
  );

  // When quotes or notes or shelf are updated inside modals
  const handleBookUpdated = useCallback((updatedBook) => {
    const bookId = updatedBook._id || updatedBook.id;
    setBooks((prev) =>
      prev.map((b) =>
        String(b._id || b.id) === String(bookId) ? updatedBook : b
      )
    );
  }, []);

  // When bulk import finishes
  const handleImportSuccess = useCallback(
    (importedList) => {
      if (Array.isArray(importedList)) {
        setBooks((prev) => [...importedList, ...prev]);
      }
      fetchBooksFromAPI();
    },
    [fetchBooksFromAPI]
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

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          onToast={addToast}
        />

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                books={books}
                isLoading={isLoading}
                fetchError={fetchError}
                onRetry={() => fetchBooksFromAPI(filterParams)}
                onDeleteBook={handleDeleteBook}
                onToggleFavorite={handleToggleFavorite}
                onBookUpdated={handleBookUpdated}
                onImportSuccess={handleImportSuccess}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                addToast={addToast}
                pagination={pagination}
                onFilterChange={handleFilterChange}
              />
            }
          />
          <Route
            path="/add"
            element={
              <BookForm
                mode="add"
                onSaveBook={handleSaveBook}
                addToast={addToast}
              />
            }
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

const App = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;
