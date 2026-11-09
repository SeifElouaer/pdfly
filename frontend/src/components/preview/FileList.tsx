"use client";

import React, { useState } from "react";
import { GripVertical, Trash2, Plus, FileText, Image as ImageIcon } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
}

interface FileListProps {
  files: FileItem[];
  onReorder: (newFiles: FileItem[]) => void;
  onRemove: (id: string) => void;
  onAddFiles: (files: File[]) => void;
  accepts: string;
}

export function FileList({
  files,
  onReorder,
  onRemove,
  onAddFiles,
  accepts,
}: FileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...files];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onReorder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* File Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {files.map((item, index) => {
          const isImage = item.file.type.startsWith("image/");
          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all select-none ${
                draggedIndex === index
                  ? "opacity-50 scale-95 border-brand ring-2 ring-brand"
                  : "hover:border-border hover:shadow-card hover:-translate-y-0.5"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1 font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/60 group-hover:text-foreground" />
                </div>
              </div>

              {/* Preview / Icon */}
              <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40 border border-border/50 mb-3">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="max-h-full max-w-full object-contain pointer-events-none"
                  />
                ) : isImage ? (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <FileText className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              {/* File Info */}
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {formatBytes(item.file.size)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Add more files card */}
        <label className="flex flex-col items-center justify-center h-52 cursor-pointer rounded-xl border-2 border-dashed border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-brand/60 transition-all p-4 text-center">
          <input
            type="file"
            accept={accepts}
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground mb-2 group-hover:bg-brand group-hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Add more files</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">Click or drop here</span>
        </label>
      </div>
    </div>
  );
}
