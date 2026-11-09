"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, Trash2, ArrowLeft, RefreshCw, FileText } from "lucide-react";
import { ProcessResult, deleteSession } from "@/lib/api";

interface ProcessSuccessProps {
  result: ProcessResult;
  onReset: () => void;
  title?: string;
}

export function ProcessSuccess({
  result,
  onReset,
  title = "Your PDF has been processed!",
}: ProcessSuccessProps) {
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteNow = async () => {
    setDeleting(true);
    await deleteSession(result.session_id);
    setDeleted(true);
    setDeleting(false);
  };

  return (
    <div className="mx-auto max-w-xl text-center py-12 px-4 sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-sm">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        {title}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Ready for instant download. Ephemeral storage will automatically purge this file.
      </p>

      {/* File Info Card */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-foreground truncate">{result.filename}</p>
              <p className="text-xs text-muted-foreground">{result.size_formatted}</p>
            </div>
          </div>
          {result.reduction_percentage !== undefined && result.reduction_percentage > 0 && (
            <span className="shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md">
              -{result.reduction_percentage}%
            </span>
          )}
        </div>

        {/* Compression Statistics Breakdown */}
        {result.original_size_formatted && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Original Size:</span>
              <p className="font-semibold text-foreground mt-0.5">{result.original_size_formatted}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Compressed Size:</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{result.size_formatted}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Download Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={result.download_url}
          download={result.filename}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] transition-all"
        >
          <Download className="h-5 w-5" />
          Download {result.filename.endsWith(".zip") ? "ZIP Archive" : "File"}
        </a>

        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-6 py-4 text-sm font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Process Another
        </button>
      </div>

      {/* Instant Purge Option */}
      <div className="mt-8 pt-6 border-t border-border/80 flex items-center justify-center">
        {deleted ? (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            File permanently erased from server memory.
          </span>
        ) : (
          <button
            onClick={handleDeleteNow}
            disabled={deleting}
            className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? "Purging..." : "Delete now from server"}
          </button>
        )}
      </div>
    </div>
  );
}
