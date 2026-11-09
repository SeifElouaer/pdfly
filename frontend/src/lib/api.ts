import {
  clientMergePdfs,
  clientSplitPdf,
  clientOrganizePdf,
  clientRotatePdf,
  clientWatermarkPdf,
  clientPageNumbersPdf,
  clientCompressPdf,
  clientImagesToPdf,
} from "./client-pdf-engine";
import { renderPdfThumbnails } from "./pdf-renderer";
import JSZip from "jszip";
import { formatBytes } from "./utils";

const API_BASE = typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
  : "";

export function getFullApiUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://") || endpoint.startsWith("blob:")) {
    return endpoint;
  }
  return `${API_BASE}${endpoint}`;
}

export interface ProcessResult {
  session_id: string;
  filename: string;
  download_url: string;
  size_bytes: number;
  size_formatted: string;
  original_size?: number;
  original_size_formatted?: string;
  reduction_percentage?: number;
  parts_count?: number;
  pages_count?: number;
}

export interface WatermarkOptions {
  text: string;
  position: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  color: string;
}

export interface PageNumberOptions {
  formatTemplate: string;
  position: string;
  startPage: number;
  margin: number;
}

// 1. MERGE PDF - 100% Client-Side
export async function mergePdfs(files: File[]): Promise<ProcessResult> {
  return await clientMergePdfs(files);
}

// 2. SPLIT PDF - 100% Client-Side
export async function splitPdf(
  file: File,
  mode: "all" | "ranges",
  ranges: string
): Promise<ProcessResult> {
  return await clientSplitPdf(file, mode, ranges);
}

// 3. ORGANIZE & REORDER PAGES - 100% Client-Side
export async function organizePdf(
  file: File,
  pages: { page_index: number; rotation: number }[]
): Promise<ProcessResult> {
  return await clientOrganizePdf(file, pages);
}

// 4. COMPRESS PDF - 100% Client-Side
export async function compressPdf(
  file: File,
  level: "extreme" | "recommended" | "low"
): Promise<ProcessResult> {
  return await clientCompressPdf(file, level);
}

// 5. ROTATE PDF - 100% Client-Side
export async function rotatePdf(file: File, angle = 90): Promise<ProcessResult> {
  return await clientRotatePdf(file, angle);
}

// 6. WATERMARK PDF - 100% Client-Side
export async function watermarkPdf(file: File, opts: WatermarkOptions): Promise<ProcessResult> {
  return await clientWatermarkPdf(file, opts);
}

// 7. PAGE NUMBERS - 100% Client-Side
export async function pageNumbersPdf(file: File, opts: PageNumberOptions): Promise<ProcessResult> {
  return await clientPageNumbersPdf(file, opts);
}

// 8. IMAGES TO PDF - 100% Client-Side
export async function imagesToPdf(
  files: File[],
  pageSize = "a4",
  orientation = "auto",
  margin = 0
): Promise<ProcessResult> {
  return await clientImagesToPdf(files, pageSize, orientation, margin);
}

// 9. PDF TO IMAGES - 100% Client-Side (PDF.js + JSZip)
export async function pdfToImages(file: File, format = "jpg", dpi = 150): Promise<ProcessResult> {
  const renderedPages = await renderPdfThumbnails(file, 200, dpi > 150 ? 1200 : 800);
  if (!renderedPages || renderedPages.length === 0) {
    throw new Error("Could not extract pages from PDF.");
  }

  const stem = file.name.replace(/\.[^/.]+$/, "");
  const ext = format.toLowerCase() === "png" ? "png" : "jpg";

  if (renderedPages.length === 1) {
    // Single page download
    const res = await fetch(renderedPages[0].dataUrl);
    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    return {
      session_id: "client-local",
      filename: `${stem}_page_1.${ext}`,
      download_url: downloadUrl,
      size_bytes: blob.size,
      size_formatted: formatBytes(blob.size),
      pages_count: 1,
    };
  }

  // Multiple pages -> ZIP archive
  const zip = new JSZip();
  for (let i = 0; i < renderedPages.length; i++) {
    const page = renderedPages[i];
    // Remove data:image/...;base64, prefix
    const base64Data = page.dataUrl.split(",")[1];
    zip.file(`${stem}_page_${i + 1}.${ext}`, base64Data, { base64: true });
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(zipBlob);

  return {
    session_id: "client-local",
    filename: `${stem}_images.zip`,
    download_url: downloadUrl,
    size_bytes: zipBlob.size,
    size_formatted: formatBytes(zipBlob.size),
    pages_count: renderedPages.length,
  };
}

// 10. PDF TO WORD (Requires Python pdf2docx backend)
export async function pdfToWord(file: File): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(getFullApiUrl("/api/pdf/to-word"), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Server failed to convert PDF to Word.");
    }
    const data = await res.json();
    data.download_url = getFullApiUrl(data.download_url);
    return data;
  } catch (err: any) {
    throw new Error(
      "Word conversion requires a running Python backend service. Please run backend locally or set NEXT_PUBLIC_API_URL."
    );
  }
}

// 11. PROTECT PDF (Backend or fallback)
export async function protectPdf(file: File, password: string): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  try {
    const res = await fetch(getFullApiUrl("/api/pdf/protect"), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to protect PDF.");
    }
    const data = await res.json();
    data.download_url = getFullApiUrl(data.download_url);
    return data;
  } catch (err: any) {
    throw new Error(
      "AES-256 password protection requires the Python backend service. Please run backend locally or configure NEXT_PUBLIC_API_URL."
    );
  }
}

// 12. UNLOCK PDF (Backend or fallback)
export async function unlockPdf(file: File, password: string): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  try {
    const res = await fetch(getFullApiUrl("/api/pdf/unlock"), {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to unlock PDF.");
    }
    const data = await res.json();
    data.download_url = getFullApiUrl(data.download_url);
    return data;
  } catch (err: any) {
    throw new Error(
      "Password decryption requires the Python backend service. Please run backend locally or configure NEXT_PUBLIC_API_URL."
    );
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  if (sessionId === "client-local") return;
  await fetch(getFullApiUrl(`/api/session/${sessionId}`), { method: "DELETE" }).catch(() => {});
}
