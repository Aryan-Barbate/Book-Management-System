import React, { useState } from "react";
import {
  X,
  Download,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  parseCSV,
  isGoodreadsCSV,
  normalizeGoodreadsBook,
  normalizeGenericCSVBook,
  generateBooksCSV,
  downloadFile,
} from "../utils/csv";
import { baseBookURL } from "../../axiosInstance";

const ImportExportModal = ({ isOpen, onClose, books, onImportSuccess, onToast }) => {
  const [activeTab, setActiveTab] = useState("export");
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedBooks, setParsedBooks] = useState([]);
  const [importFormat, setImportFormat] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(books, null, 2);
      downloadFile(dataStr, `book-vault-export-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
      onToast?.("Exported library as JSON!", "success");
    } catch (err) {
      onToast?.("Failed to export JSON.", "error");
    }
  };

  const handleExportCSV = () => {
    try {
      const csvStr = generateBooksCSV(books);
      downloadFile(csvStr, `book-vault-export-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
      onToast?.("Exported library as CSV!", "success");
    } catch (err) {
      onToast?.("Failed to export CSV.", "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSelectedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== "string") {
          throw new Error("Could not read file content.");
        }

        if (file.name.endsWith(".json")) {
          const json = JSON.parse(text);
          const rawBooks = Array.isArray(json) ? json : json.books || [];
          if (rawBooks.length === 0) {
            throw new Error("No books found in JSON file.");
          }
          setImportFormat("JSON Library");
          setParsedBooks(rawBooks);
        } else {
          // CSV / Goodreads
          const records = parseCSV(text);
          if (records.length === 0) {
            throw new Error("Could not parse any book rows from CSV.");
          }

          if (isGoodreadsCSV(records)) {
            setImportFormat("Goodreads Library Export");
            const mapped = records.map(normalizeGoodreadsBook).filter((b) => b.bookName);
            setParsedBooks(mapped);
          } else {
            setImportFormat("Standard Book CSV");
            const mapped = records.map(normalizeGenericCSVBook).filter((b) => b.bookName);
            setParsedBooks(mapped);
          }
        }
      } catch (err) {
        console.error("Import file parsing error:", err);
        setErrorMessage(err.message || "Failed to parse file.");
        setParsedBooks([]);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Error reading file from disk.");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedBooks.length === 0) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await baseBookURL.post("/books/import", { books: parsedBooks });
      const count = res.data?.count || parsedBooks.length;
      onToast?.(`Successfully imported ${count} books!`, "success");
      onImportSuccess?.(res.data?.data || parsedBooks);
      onClose();
    } catch (err) {
      console.warn("Backend import fallback to client:", err.message);
      onImportSuccess?.(parsedBooks);
      onToast?.(`Imported ${parsedBooks.length} books locally!`, "success");
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-xl bg-white dark:bg-[#1C1C24] border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 nb-card-yellow border-b-3 border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black text-[#FFDE59] border-2 border-black font-black shadow-[2px_2px_0px_0px_#FFFDF5]">
              <Download className="w-5 h-5 stroke-2.5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-black leading-tight">
                IMPORT & EXPORT LIBRARY
              </h2>
              <p className="text-[11px] font-extrabold text-black/80 uppercase">
                CSV, Goodreads, and JSON data portability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FF4D4D] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-3" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-black/5 dark:bg-white/5 border-b-2 border-black shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "export"
                ? "bg-white dark:bg-[#2A2A38] text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                : "text-black/60 dark:text-white/60 hover:text-black"
            }`}
          >
            EXPORT DATA ({books.length} BOOKS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === "import"
                ? "bg-white dark:bg-[#2A2A38] text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                : "text-black/60 dark:text-white/60 hover:text-black"
            }`}
          >
            IMPORT FILE (CSV / GOODREADS)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "export" && (
            <div className="space-y-6">
              <p className="text-xs font-bold opacity-80 leading-relaxed">
                Download your complete collection including titles, authors, shelves, tags, ratings, and journal entries for offline backup or spreadsheets.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CSV Export Option */}
                <div className="nb-card p-5 space-y-3 bg-[#FFFDF5] dark:bg-[#22222D]">
                  <div className="w-10 h-10 rounded-lg bg-[#00E5FF] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                    <FileText className="w-5 h-5 stroke-2.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase">
                      CSV SPREADSHEET
                    </h3>
                    <p className="text-[11px] font-semibold opacity-70">
                      Standard format for Excel, Google Sheets, or Notion
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={books.length === 0}
                    className="w-full nb-btn nb-btn-cyan nb-btn-sm flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Download className="w-4 h-4 stroke-2.5" />
                    <span>DOWNLOAD CSV</span>
                  </button>
                </div>

                {/* JSON Export Option */}
                <div className="nb-card p-5 space-y-3 bg-[#FFFDF5] dark:bg-[#22222D]">
                  <div className="w-10 h-10 rounded-lg bg-[#CCFF00] text-black border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000]">
                    <FileCode className="w-5 h-5 stroke-2.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase">
                      JSON DATA VAULT
                    </h3>
                    <p className="text-[11px] font-semibold opacity-70">
                      Full lossless backup with structured quotes & notes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    disabled={books.length === 0}
                    className="w-full nb-btn nb-btn-lime nb-btn-sm flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Download className="w-4 h-4 stroke-2.5" />
                    <span>DOWNLOAD JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "import" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Select CSV or JSON File
                </label>
                <div className="border-3 border-dashed border-black dark:border-white/30 rounded-xl p-6 text-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv, .json"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 stroke-2.5 mx-auto mb-2 text-black dark:text-white" />
                  <p className="text-xs font-black uppercase">
                    {selectedFile ? selectedFile.name : "DRAG & DROP OR CLICK TO BROWSE"}
                  </p>
                  <p className="text-[11px] font-bold opacity-60 mt-1">
                    Supports Goodreads export CSV, standard BookVault CSV, or JSON
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-[#FF4D4D]/20 border-2 border-[#FF4D4D] text-[#FF4D4D] rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {parsedBooks.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="nb-badge nb-badge-lime text-xs">
                        <CheckCircle className="w-3.5 h-3.5 stroke-2.5" />
                        <span>PARSED {parsedBooks.length} BOOKS</span>
                      </span>
                      <span className="nb-badge nb-badge-yellow text-xs">
                        {importFormat}
                      </span>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="max-h-48 overflow-y-auto border-2 border-black rounded-lg text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-black/10 dark:bg-white/10 font-black uppercase sticky top-0">
                        <tr>
                          <th className="p-2">Title</th>
                          <th className="p-2">Author</th>
                          <th className="p-2">Shelf</th>
                          <th className="p-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 dark:divide-white/10 font-semibold">
                        {parsedBooks.slice(0, 10).map((b, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold truncate max-w-40">{b.bookName}</td>
                            <td className="p-2 truncate max-w-32">{b.bookAuthor}</td>
                            <td className="p-2">{b.shelf || "Want to Read"}</td>
                            <td className="p-2">{b.rating || 5} ★</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {parsedBooks.length > 10 && (
                    <p className="text-[11px] font-bold opacity-60 text-center">
                      ...and {parsedBooks.length - 10} more books
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={isProcessing}
                    className="w-full nb-btn nb-btn-lime py-3 text-xs font-black shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>IMPORTING BOOKS INTO VAULT...</span>
                      </div>
                    ) : (
                      `CONFIRM & IMPORT ${parsedBooks.length} BOOKS`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;
