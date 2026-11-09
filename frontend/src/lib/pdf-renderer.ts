/**
 * Client-side PDF page thumbnail generator using pdfjs-dist.
 * Renders each page to a lightweight canvas and converts to PNG data URL.
 */

export interface RenderedPage {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

let pdfjsLib: any = null;

async function getPdfJs() {
  if (typeof window === "undefined") return null;
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export async function renderPdfThumbnails(
  file: File,
  maxPages = 50,
  targetWidth = 200
): Promise<RenderedPage[]> {
  const lib = await getPdfJs();
  if (!lib) return [];

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = lib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = Math.min(pdfDoc.numPages, maxPages);

  const pages: RenderedPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    }).promise;

    pages.push({
      pageIndex: i - 1,
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    });
  }

  return pages;
}
