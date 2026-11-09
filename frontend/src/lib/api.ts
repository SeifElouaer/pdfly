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

export async function mergePdfs(files: File[]): Promise<ProcessResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  
  const res = await fetch("/api/pdf/merge", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to merge PDF files.");
  }
  return res.json();
}

export async function splitPdf(file: File, mode: "all" | "ranges", ranges: string): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  formData.append("ranges", ranges);

  const res = await fetch("/api/pdf/split", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to split PDF file.");
  }
  return res.json();
}

export async function organizePdf(
  file: File,
  pages: { page_index: number; rotation: number }[]
): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pages_json", JSON.stringify(pages));

  const res = await fetch("/api/pdf/organize", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to organize PDF pages.");
  }
  return res.json();
}

export async function compressPdf(file: File, level: "extreme" | "recommended" | "low"): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("level", level);

  const res = await fetch("/api/pdf/compress", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to compress PDF.");
  }
  return res.json();
}

export async function pdfToImages(file: File, format = "jpg", dpi = 150): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);
  formData.append("dpi", dpi.toString());

  const res = await fetch("/api/pdf/to-images", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to convert PDF to images.");
  }
  return res.json();
}

export async function imagesToPdf(
  files: File[],
  pageSize = "a4",
  orientation = "auto",
  margin = 0
): Promise<ProcessResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("page_size", pageSize);
  formData.append("orientation", orientation);
  formData.append("margin", margin.toString());

  const res = await fetch("/api/pdf/from-images", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to convert images to PDF.");
  }
  return res.json();
}

export async function pdfToWord(file: File): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/pdf/to-word", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to convert PDF to Word.");
  }
  return res.json();
}

export async function rotatePdf(file: File, angle = 90): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("angle", angle.toString());

  const res = await fetch("/api/pdf/rotate", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to rotate PDF.");
  }
  return res.json();
}

export interface WatermarkOptions {
  text: string;
  position: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  color: string;
}

export async function watermarkPdf(file: File, opts: WatermarkOptions): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("text", opts.text);
  formData.append("position", opts.position);
  formData.append("opacity", opts.opacity.toString());
  formData.append("font_size", opts.fontSize.toString());
  formData.append("rotation", opts.rotation.toString());
  formData.append("color", opts.color);

  const res = await fetch("/api/pdf/watermark", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to watermark PDF.");
  }
  return res.json();
}

export interface PageNumberOptions {
  formatTemplate: string;
  position: string;
  startPage: number;
  margin: number;
}

export async function pageNumbersPdf(file: File, opts: PageNumberOptions): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format_template", opts.formatTemplate);
  formData.append("position", opts.position);
  formData.append("start_page", opts.startPage.toString());
  formData.append("margin", opts.margin.toString());

  const res = await fetch("/api/pdf/page-numbers", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to add page numbers.");
  }
  return res.json();
}

export async function protectPdf(file: File, password: string): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const res = await fetch("/api/pdf/protect", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to protect PDF.");
  }
  return res.json();
}

export async function unlockPdf(file: File, password: string): Promise<ProcessResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);

  const res = await fetch("/api/pdf/unlock", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to unlock PDF. Please check your password.");
  }
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`/api/session/${sessionId}`, { method: "DELETE" }).catch(() => {});
}
