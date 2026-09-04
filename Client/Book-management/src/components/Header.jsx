import React from "react";
import { NavLink } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Library,
  DollarSign,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

const Header = ({
  bookCount,
  totalValue,
  theme,
  onToggleTheme,
  showAddButton = true,
  showStats = true,
}) => {
  return (
    <header className="mb-10 animate-slide-down">
      {/* Top Navbar */}
      <nav className="nb-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFDE59] text-black border-3 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000]">
            <BookOpen className="w-6 h-6 stroke-2.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight uppercase">
                BOOK VAULT
              </span>
              <span className="nb-badge nb-badge-lime text-[11px]">
                {theme === "dark" ? "CYBER" : "POP LIGHT"}
              </span>
            </div>
            <p className="text-xs font-bold opacity-75">
              Personal Literature Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `
                nb-btn nb-btn-white nb-btn-sm ${
                  isActive
                    ? "bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#000]"
                    : "bg-white text-black hover:bg-[#FFDE59]"
                }`}
            >
              <Library className="w-4 h-4 stroke-2.5" />
              <span>HOME</span>
            </NavLink>

            {showAddButton && (
              <NavLink
                to="/add"
                className={({ isActive }) => `
                  nb-btn nb-btn-yellow ${
                    isActive
                      ? "bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#000]"
                      : ""
                  }`}
              >
                <Plus className="w-5 h-5 stroke-3" />
                <span>ADD NEW BOOK</span>
              </NavLink>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="nb-btn nb-btn-white nb-btn-sm"
            title={`Switch to ${theme === "light" ? "Cyber Dark" : "Pop Light"} mode`}
          >
            {theme === "light" ? (
              <>
                <Moon className="w-4 h-4 text-black stroke-2.5" />
                <span>CYBER DARK</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[#FFDE59] fill-[#FFDE59] stroke-2.5" />
                <span>POP LIGHT</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Banner - only show on home page or when stats are enabled */}
      {showStats && bookCount !== undefined && totalValue !== undefined && (
        <div className="nb-card nb-card-yellow p-6 sm:p-10 relative overflow-hidden">
          {/* Playful background decorative shape */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#FF66C4] border-4 border-black rounded-full opacity-20 pointer-events-none transform rotate-12 hidden sm:block" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-black text-white text-xs font-black tracking-wider uppercase mb-4 shadow-[2px_2px_0px_0px_#FFFDF5]">
              <Zap className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
              <span>LIBRARY COMMAND CENTER</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08] mb-4 uppercase text-black">
              YOUR PERSONAL BOOK COLLECTION & TRACKER
            </h1>

            <p className="text-base sm:text-lg font-bold text-black/90 mb-6 max-w-2xl">
              Organize titles, track reading stats, estimate total collection
              valuation, and filter literature by genre in style!
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="nb-badge nb-badge-white text-sm py-2 px-4">
                <Library className="w-4 h-4 text-black stroke-2.5" />
                <span>
                  {bookCount} {bookCount === 1 ? "BOOK" : "BOOKS"} TOTAL
                </span>
              </div>

              <div className="nb-badge nb-badge-cyan text-sm py-2 px-4">
                <DollarSign className="w-4 h-4 text-black stroke-2.5" />
                <span>
                  VALUATION:{" "}
                  <strong className="underline">
                    ${totalValue.toFixed(2)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
