"use client";

import React, { useState } from "react";
import { RotateCw, Trash2, GripVertical } from "lucide-react";
import { RenderedPage } from "@/lib/pdf-renderer";

export interface PageItem {
  id: string;
  pageIndex: number;
  rotation: number;
  dataUrl?: string;
}

interface PageThumbnailGridProps {
  pages: PageItem[];
  onReorder: (newPages: PageItem[]) => void;
  onRotatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  allowDelete?: boolean;
  allowRotate?: boolean;
}

export function PageThumbnailGrid({
  pages,
  onReorder,
  onRotatePage,
  onDeletePage,
  allowDelete = true,
  allowRotate = true,
}: PageThumbnailGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...pages];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onReorder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {pages.map((page, index) => (
        <div
          key={page.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group relative flex flex-col items-center rounded-xl border border-border bg-card p-3 shadow-sm transition-all duration-150 select-none ${
            draggedIndex === index
              ? "opacity-50 scale-95 border-brand ring-2 ring-brand"
              : "hover:border-border hover:shadow-card hover:-translate-y-0.5"
          }`}
        >
          {/* Top page badge & drag handle */}
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1 font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
              #{index + 1}
            </span>
            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/60 group-hover:text-foreground" />
          </div>

          {/* Thumbnail Image Container */}
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40 border border-border/50">
            {page.dataUrl ? (
              <img
                src={page.dataUrl}
                alt={`Page ${index + 1}`}
                style={{
                  transform: `rotate(${page.rotation}deg)`,
                  transition: "transform 0.2s ease-in-out",
                }}
                className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-sm"
              />
            ) : (
              <div className="text-xs text-muted-foreground font-mono">Page {page.pageIndex + 1}</div>
            )}

            {/* Hover Actions Bar */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {allowRotate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRotatePage(page.id);
                  }}
                  title="Rotate page 90° clockwise"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground border border-border shadow-sm hover:text-brand active:scale-95 transition-all"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              )}
              {allowDelete && pages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  title="Remove this page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-foreground border border-border shadow-sm hover:text-red-500 active:scale-95 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Rotation indicator if rotated */}
          {page.rotation > 0 && (
            <div className="mt-2 text-[10px] font-mono text-muted-foreground">
              Rotated {page.rotation}°
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
