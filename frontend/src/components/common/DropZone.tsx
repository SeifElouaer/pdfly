"use client";

import React, { useState, useRef } from "react";
import { Upload, FileUp, Plus, Shield } from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accepts: string;
  multiple: boolean;
  title?: string;
  subtitle?: string;
}

export function DropZone({
  onFilesSelected,
  accepts,
  multiple,
  title = "Select PDF files",
  subtitle = "or drop PDF files here",
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const filtered = multiple ? filesArray : [filesArray[0]];
      onFilesSelected(filtered);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const filtered = multiple ? filesArray : [filesArray[0]];
      onFilesSelected(filtered);
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 sm:p-16 text-center transition-all duration-200 select-none ${
        isDragging
          ? "border-brand bg-brand-50/60 dark:bg-brand-950/20 scale-[1.01]"
          : "border-border hover:border-brand/60 bg-muted/20 hover:bg-muted/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accepts}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mx-auto flex flex-col items-center justify-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/20 mb-6 transition-transform hover:scale-105 active:scale-95">
          <Upload className="h-8 w-8" />
        </div>

        <button
          type="button"
          className="rounded-xl bg-brand px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-md hover:bg-brand-hover active:scale-[0.98] transition-all"
        >
          {title}
        </button>

        <p className="mt-3 text-sm font-medium text-muted-foreground">{subtitle}</p>

        <div className="mt-6 flex items-center gap-2 text-[11px] font-medium text-muted-foreground bg-background/80 py-1 px-3 rounded-full border border-border">
          <Shield className="h-3 w-3 text-emerald-500" />
          <span>Files are encrypted & purged within 60 minutes</span>
        </div>
      </div>
    </div>
  );
}
