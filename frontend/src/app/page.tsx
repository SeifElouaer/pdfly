"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Combine,
  Split,
  LayoutGrid,
  Minimize2,
  FileText,
  Image,
  FileImage,
  RotateCw,
  Stamp,
  ListOrdered,
  Lock,
  Unlock,
  ArrowRight,
  Shield,
  Zap,
  Sliders,
  Sparkles,
  Send
} from "lucide-react";
import { TOOLS, CATEGORIES, ToolCategory } from "@/lib/tools-config";

// Icon mapping helper
const ICON_MAP: Record<string, React.ReactNode> = {
  Combine: <Combine className="h-6 w-6" />,
  Split: <Split className="h-6 w-6" />,
  LayoutGrid: <LayoutGrid className="h-6 w-6" />,
  Minimize2: <Minimize2 className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  Image: <Image className="h-6 w-6" />,
  FileImage: <FileImage className="h-6 w-6" />,
  RotateCw: <RotateCw className="h-6 w-6" />,
  Stamp: <Stamp className="h-6 w-6" />,
  ListOrdered: <ListOrdered className="h-6 w-6" />,
  Lock: <Lock className="h-6 w-6" />,
  Unlock: <Unlock className="h-6 w-6" />,
};

// Distinct category badge styling with the new indigo/teal/violet palette
const CATEGORY_COLORS: Record<ToolCategory, { bg: string; text: string; border: string }> = {
  organize: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-900" },
  optimize: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900" },
  convert: { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-900" },
  edit: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-900" },
  security: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900" },
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 pb-20">
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-brand-50/40 via-muted/20 to-background py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold text-muted-foreground mb-6 shadow-subtle">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
            PDFly • 100% Free & Privacy-First Ephemeral Suite
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            Fly through your PDF tasks with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand to-indigo-500">
              zero friction.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Merge, split, compress, convert, rotate, and secure documents with
            instant in-browser previews. Clean, confidential, and completely ephemeral.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand" /> Instant client previews
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-brand" /> 60-min auto-purge TTL
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-brand" /> Fine-grained parameters
            </span>
          </div>
        </div>
      </section>

      {/* Main Tools Catalog */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-border/80">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All Tools ({TOOLS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-foreground text-background shadow-sm font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Filter */}
          <div className="w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools by name..."
              className="w-full sm:w-64 h-9 rounded-lg border border-border bg-muted/40 px-3 text-xs font-medium placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-all"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredTools.map((tool) => {
            const badge = CATEGORY_COLORS[tool.category];
            return (
              <Link
                key={tool.id}
                href={`/${tool.slug}`}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-floating active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition-all group-hover:bg-brand group-hover:text-white group-hover:shadow-md group-hover:shadow-brand/20">
                      {ICON_MAP[tool.icon] || <FileText className="h-6 w-6" />}
                    </div>
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {tool.categoryLabel.replace(" PDF", "")}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-brand transition-colors flex items-center gap-1.5">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {tool.shortDesc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transform translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Launch Tool <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">No PDF tools match your query.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearch("");
              }}
              className="mt-3 text-xs font-semibold text-brand hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
