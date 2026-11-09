"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { TOOLS, ToolDef } from "@/lib/tools-config";
import { DropZone } from "@/components/common/DropZone";
import { PageThumbnailGrid, PageItem } from "@/components/preview/PageThumbnailGrid";
import { FileList, FileItem } from "@/components/preview/FileList";
import { ToolOptions, ToolOptionValues } from "@/components/options/ToolOptions";
import { ProcessSuccess } from "@/components/common/ProcessSuccess";
import { renderPdfThumbnails } from "@/lib/pdf-renderer";
import {
  mergePdfs,
  splitPdf,
  organizePdf,
  compressPdf,
  pdfToImages,
  imagesToPdf,
  pdfToWord,
  rotatePdf,
  watermarkPdf,
  pageNumbersPdf,
  protectPdf,
  unlockPdf,
  ProcessResult,
} from "@/lib/api";

const DEFAULT_OPTIONS: ToolOptionValues = {
  compressionLevel: "recommended",
  splitMode: "all",
  splitRanges: "",
  watermarkText: "CONFIDENTIAL",
  watermarkPosition: "center",
  watermarkOpacity: 0.35,
  watermarkFontSize: 40,
  watermarkRotation: 45,
  watermarkColor: "#888888",
  pageNumberTemplate: "Page {n} of {total}",
  pageNumberPosition: "bottom-center",
  pageNumberStart: 1,
  pageNumberMargin: 25,
  password: "",
  imagePageSize: "a4",
  imageOrientation: "auto",
  imageMargin: 0,
  imageFormat: "jpg",
  imageDpi: 150,
  rotateAngle: 90,
};

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const toolSlug = params.tool as string;

  const tool = TOOLS.find((t) => t.slug === toolSlug);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [options, setOptions] = useState<ToolOptionValues>(DEFAULT_OPTIONS);

  if (!tool) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Tool not found</h2>
        <p className="text-sm text-muted-foreground mt-2">The requested PDF tool does not exist.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold">
          Return to Tools
        </Link>
      </div>
    );
  }

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setError(null);
    const newItems: FileItem[] = selectedFiles.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));

    if (tool.multiple) {
      setFiles((prev) => [...prev, ...newItems]);
    } else {
      setFiles(newItems.slice(0, 1));
      // Generate client thumbnails for single PDF workflows
      const singleFile = newItems[0].file;
      if (singleFile.type === "application/pdf" || singleFile.name.endsWith(".pdf")) {
        setLoadingThumbnails(true);
        try {
          const rendered = await renderPdfThumbnails(singleFile);
          setPages(
            rendered.map((r) => ({
              id: `p-${r.pageIndex}`,
              pageIndex: r.pageIndex,
              rotation: 0,
              dataUrl: r.dataUrl,
            }))
          );
        } catch (err) {
          console.error("Client thumbnail rendering fallback:", err);
        } finally {
          setLoadingThumbnails(false);
        }
      }
    }
  };

  const handleRotatePage = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDeletePage = (pageId: string) => {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
  };

  const handleExecute = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      let res: ProcessResult;
      const primaryFile = files[0].file;

      switch (tool.id) {
        case "merge-pdf":
          if (files.length < 2) {
            throw new Error("Please add at least 2 PDF files to merge.");
          }
          res = await mergePdfs(files.map((f) => f.file));
          break;

        case "split-pdf":
          res = await splitPdf(primaryFile, options.splitMode, options.splitRanges);
          break;

        case "organize-pdf":
          const pageConfigs = pages.map((p) => ({
            page_index: p.pageIndex,
            rotation: p.rotation,
          }));
          res = await organizePdf(primaryFile, pageConfigs);
          break;

        case "compress-pdf":
          res = await compressPdf(primaryFile, options.compressionLevel);
          break;

        case "pdf-to-word":
          res = await pdfToWord(primaryFile);
          break;

        case "pdf-to-jpg":
          res = await pdfToImages(primaryFile, options.imageFormat, options.imageDpi);
          break;

        case "jpg-to-pdf":
          res = await imagesToPdf(
            files.map((f) => f.file),
            options.imagePageSize,
            options.imageOrientation,
            options.imageMargin
          );
          break;

        case "rotate-pdf":
          res = await rotatePdf(primaryFile, options.rotateAngle);
          break;

        case "watermark-pdf":
          res = await watermarkPdf(primaryFile, {
            text: options.watermarkText,
            position: options.watermarkPosition,
            opacity: options.watermarkOpacity,
            fontSize: options.watermarkFontSize,
            rotation: options.watermarkRotation,
            color: options.watermarkColor,
          });
          break;

        case "page-numbers":
          res = await pageNumbersPdf(primaryFile, {
            formatTemplate: options.pageNumberTemplate,
            position: options.pageNumberPosition,
            startPage: options.pageNumberStart,
            margin: options.pageNumberMargin,
          });
          break;

        case "protect-pdf":
          if (!options.password) {
            throw new Error("Please enter a password to protect the PDF.");
          }
          res = await protectPdf(primaryFile, options.password);
          break;

        case "unlock-pdf":
          if (!options.password) {
            throw new Error("Please enter the password to decrypt the PDF.");
          }
          res = await unlockPdf(primaryFile, options.password);
          break;

        default:
          throw new Error("Unsupported tool operation.");
      }

      setResult(res);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPages([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Breadcrumb & Tool Headline */}
      <div className="border-b border-border bg-muted/20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Tools
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {tool.title}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {tool.longDesc}
              </p>
            </div>
            {files.length > 0 && !result && (
              <button
                type="button"
                onClick={handleReset}
                className="self-start text-xs font-semibold text-muted-foreground hover:text-red-500 transition-colors"
              >
                Reset / Change files
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Processing Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* STAGE 1: DropZone (No files loaded) */}
        {files.length === 0 && !result && (
          <div className="py-8">
            <DropZone
              onFilesSelected={handleFilesSelected}
              accepts={tool.accepts}
              multiple={tool.multiple}
              title={tool.multiple ? `Select ${tool.title} files` : `Select PDF file`}
              subtitle={`or drop ${tool.multiple ? "files" : "file"} here`}
            />
          </div>
        )}

        {/* STAGE 2: Interactive Workspace (Files loaded, ready to configure & process) */}
        {files.length > 0 && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Visual Canvas / File List */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-muted/10 min-h-[420px] flex flex-col justify-between">
              <div className="p-4 border-b border-border bg-card rounded-t-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  {tool.id === "organize-pdf" || (pages.length > 0 && !tool.multiple)
                    ? `Interactive Page Canvas (${pages.length} Pages)`
                    : `Loaded Documents (${files.length} ${files.length === 1 ? "File" : "Files"})`}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Drag items to reorder
                </span>
              </div>

              {/* Thumbnail rendering spinner */}
              {loadingThumbnails && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-brand mb-2" />
                  Rendering instant page previews in browser...
                </div>
              )}

              {/* Draggable Pages Grid (Single PDF workflows: organize, watermark, split, etc.) */}
              {!loadingThumbnails && pages.length > 0 && !tool.multiple && (
                <div className="flex-1">
                  <PageThumbnailGrid
                    pages={pages}
                    onReorder={setPages}
                    onRotatePage={handleRotatePage}
                    onDeletePage={handleDeletePage}
                    allowDelete={tool.id === "organize-pdf"}
                    allowRotate={tool.id === "organize-pdf" || tool.id === "rotate-pdf"}
                  />
                </div>
              )}

              {/* Draggable File Cards (Multi-file workflows: merge, images to pdf) */}
              {!loadingThumbnails && (tool.multiple || pages.length === 0) && (
                <div className="flex-1">
                  <FileList
                    files={files}
                    onReorder={setFiles}
                    onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                    onAddFiles={handleFilesSelected}
                    accepts={tool.accepts}
                  />
                </div>
              )}
            </div>

            {/* Right 1 Col: Tool Options & Process Button */}
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <ToolOptions
                  toolId={tool.id}
                  values={options}
                  onChange={(updates) => setOptions((prev) => ({ ...prev, ...updates }))}
                />

                {/* Primary Action Button */}
                <div className="mt-8 pt-6 border-t border-border">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleExecute}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-4 text-base font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] disabled:opacity-50 transition-all"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {tool.title} <span className="ml-1">→</span>
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Instant processing with zero server retention
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: Process Success & Download */}
        {result && (
          <ProcessSuccess
            result={result}
            onReset={handleReset}
            title={`${tool.title} completed!`}
          />
        )}
      </div>
    </div>
  );
}
