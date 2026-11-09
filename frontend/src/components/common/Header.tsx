"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Search, Send, FileText, ChevronDown, Sparkles } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";

export function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const filteredTools = searchQuery.trim()
    ? TOOLS.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: PDFly */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand to-indigo-400 text-white shadow-md shadow-brand/20 transition-all group-hover:scale-105 active:scale-95">
              <Send className="h-4 w-4 -rotate-45 ml-0.5 -mt-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground flex items-center">
                PDF<span className="text-brand">ly</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground -mt-1">
                Fast & Private
              </span>
            </div>
          </Link>

          {/* Quick links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/merge-pdf" className="hover:text-foreground transition-colors">
              Merge
            </Link>
            <Link href="/split-pdf" className="hover:text-foreground transition-colors">
              Split
            </Link>
            <Link href="/compress-pdf" className="hover:text-foreground transition-colors">
              Compress
            </Link>
            <Link href="/pdf-to-word" className="hover:text-foreground transition-colors">
              Convert
            </Link>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search tools..."
                className="h-9 w-44 sm:w-60 rounded-lg border border-border bg-muted/50 pl-9 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
              />
            </div>

            {/* Instant Search Dropdown */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSearchOpen(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-floating">
                  {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/${tool.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex flex-col p-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <span className="text-sm font-semibold text-foreground group-hover:text-brand">
                          {tool.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {tool.shortDesc}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No matching PDF tools found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
