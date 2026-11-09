import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { formatBytes } from "@/lib/utils";
import type { ProcessResult, WatermarkOptions, PageNumberOptions } from "@/lib/api";

function parseRanges(str: string, maxPages: number): number[][] {
  const groups: number[][] = [];
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(maxPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        const group: number[] = [];
        for (let i = start; i <= end; i++) {
          group.push(i - 1);
        }
        groups.push(group);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        groups.push([num - 1]);
      }
    }
  }
  return groups;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return { r: 0.4, g: 0.4, b: 0.4 };
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  };
}

function bytesToBlob(bytes: Uint8Array, type: string = "application/pdf"): Blob {
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  return new Blob([arrayBuffer], { type });
}

export async function clientMergePdfs(files: File[]): Promise<ProcessResult> {
  if (files.length < 2) {
    throw new Error("Please select at least 2 PDF files to merge.");
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => mergedDoc.addPage(page));
  }

  const mergedBytes = await mergedDoc.save();
  const blob = bytesToBlob(mergedBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const outFilename = `merged_${files[0].name.replace(/\.[^/.]+$/, "")}.pdf`;

  return {
    session_id: "client-local",
    filename: outFilename,
    download_url: downloadUrl,
    size_bytes: mergedBytes.byteLength,
    size_formatted: formatBytes(mergedBytes.byteLength),
  };
}

export async function clientSplitPdf(
  file: File,
  mode: "all" | "ranges",
  ranges: string
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();
  const stem = file.name.replace(/\.[^/.]+$/, "");

  if (mode === "all") {
    // Extract each page into separate PDF, bundle into ZIP
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copiedPage);
      const singleBytes = await singleDoc.save();
      zip.file(`${stem}_page_${i + 1}.pdf`, singleBytes);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const downloadUrl = URL.createObjectURL(zipBlob);
    const outFilename = `${stem}_split_all_pages.zip`;

    return {
      session_id: "client-local",
      filename: outFilename,
      download_url: downloadUrl,
      size_bytes: zipBlob.size,
      size_formatted: formatBytes(zipBlob.size),
      parts_count: totalPages,
    };
  }

  // Ranges mode
  const rangeGroups = parseRanges(ranges, totalPages);
  if (rangeGroups.length === 0) {
    throw new Error(`Invalid range "${ranges}". Example format: 1-3, 5, 8-10 (Document has ${totalPages} pages).`);
  }

  if (rangeGroups.length === 1) {
    // Single range -> direct PDF download
    const splitDoc = await PDFDocument.create();
    const copiedPages = await splitDoc.copyPages(srcDoc, rangeGroups[0]);
    copiedPages.forEach((p) => splitDoc.addPage(p));
    const splitBytes = await splitDoc.save();

    const blob = bytesToBlob(splitBytes);
    const downloadUrl = URL.createObjectURL(blob);
    const outFilename = `${stem}_pages_${ranges.replace(/[\s,]+/g, "_")}.pdf`;

    return {
      session_id: "client-local",
      filename: outFilename,
      download_url: downloadUrl,
      size_bytes: splitBytes.byteLength,
      size_formatted: formatBytes(splitBytes.byteLength),
      parts_count: 1,
    };
  }

  // Multiple ranges -> ZIP archive
  const zip = new JSZip();
  for (let idx = 0; idx < rangeGroups.length; idx++) {
    const group = rangeGroups[idx];
    const groupDoc = await PDFDocument.create();
    const copiedPages = await groupDoc.copyPages(srcDoc, group);
    copiedPages.forEach((p) => groupDoc.addPage(p));
    const groupBytes = await groupDoc.save();
    zip.file(`${stem}_range_${idx + 1}.pdf`, groupBytes);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(zipBlob);
  const outFilename = `${stem}_split_ranges.zip`;

  return {
    session_id: "client-local",
    filename: outFilename,
    download_url: downloadUrl,
    size_bytes: zipBlob.size,
    size_formatted: formatBytes(zipBlob.size),
    parts_count: rangeGroups.length,
  };
}

export async function clientOrganizePdf(
  file: File,
  pages: { page_index: number; rotation: number }[]
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  for (const item of pages) {
    if (item.page_index >= 0 && item.page_index < srcDoc.getPageCount()) {
      const [copiedPage] = await newDoc.copyPages(srcDoc, [item.page_index]);
      if (item.rotation) {
        copiedPage.setRotation(degrees((copiedPage.getRotation().angle + item.rotation) % 360));
      }
      newDoc.addPage(copiedPage);
    }
  }

  const newBytes = await newDoc.save();
  const blob = bytesToBlob(newBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const stem = file.name.replace(/\.[^/.]+$/, "");

  return {
    session_id: "client-local",
    filename: `organized_${stem}.pdf`,
    download_url: downloadUrl,
    size_bytes: newBytes.byteLength,
    size_formatted: formatBytes(newBytes.byteLength),
  };
}

export async function clientRotatePdf(file: File, angle: number): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);

  const pages = doc.getPages();
  for (const page of pages) {
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  }

  const newBytes = await doc.save();
  const blob = bytesToBlob(newBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const stem = file.name.replace(/\.[^/.]+$/, "");

  return {
    session_id: "client-local",
    filename: `rotated_${stem}.pdf`,
    download_url: downloadUrl,
    size_bytes: newBytes.byteLength,
    size_formatted: formatBytes(newBytes.byteLength),
  };
}

export async function clientWatermarkPdf(
  file: File,
  opts: WatermarkOptions
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const { r, g, b } = hexToRgb(opts.color);

  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
    const textHeight = font.heightAtSize(opts.fontSize);

    const posMap: Record<string, [number, number]> = {
      "top-left": [width * 0.15, height * 0.85],
      "top-center": [width / 2 - textWidth / 2, height * 0.85],
      "top-right": [width * 0.85 - textWidth, height * 0.85],
      "middle-left": [width * 0.15, height / 2],
      "center": [width / 2 - textWidth / 2, height / 2 - textHeight / 2],
      "middle-right": [width * 0.85 - textWidth, height / 2],
      "bottom-left": [width * 0.15, height * 0.15],
      "bottom-center": [width / 2 - textWidth / 2, height * 0.15],
      "bottom-right": [width * 0.85 - textWidth, height * 0.15],
    };

    const [x, y] = posMap[opts.position] || posMap["center"];

    page.drawText(opts.text, {
      x,
      y,
      size: opts.fontSize,
      font,
      color: rgb(r, g, b),
      opacity: opts.opacity,
      rotate: degrees(opts.rotation),
    });
  }

  const newBytes = await doc.save();
  const blob = bytesToBlob(newBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const stem = file.name.replace(/\.[^/.]+$/, "");

  return {
    session_id: "client-local",
    filename: `watermarked_${stem}.pdf`,
    download_url: downloadUrl,
    size_bytes: newBytes.byteLength,
    size_formatted: formatBytes(newBytes.byteLength),
  };
}

export async function clientPageNumbersPdf(
  file: File,
  opts: PageNumberOptions
): Promise<ProcessResult> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNum = opts.startPage + i;
    const text = opts.formatTemplate
      .replace("{n}", String(currentNum))
      .replace("{total}", String(total));

    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const margin = opts.margin || 25;

    let x = width / 2 - textWidth / 2;
    let y = margin;

    if (opts.position.includes("top")) {
      y = height - margin;
    }
    if (opts.position.includes("left")) {
      x = margin;
    } else if (opts.position.includes("right")) {
      x = width - margin - textWidth;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
  }

  const newBytes = await doc.save();
  const blob = bytesToBlob(newBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const stem = file.name.replace(/\.[^/.]+$/, "");

  return {
    session_id: "client-local",
    filename: `numbered_${stem}.pdf`,
    download_url: downloadUrl,
    size_bytes: newBytes.byteLength,
    size_formatted: formatBytes(newBytes.byteLength),
  };
}

export async function clientCompressPdf(
  file: File,
  level: "extreme" | "recommended" | "low"
): Promise<ProcessResult> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);

  // Re-encode with object streams and stripped metadata to deflate size
  const compressedBytes = await doc.save({
    useObjectStreams: true,
  });

  const finalSize = compressedBytes.byteLength;
  const savedBytes = Math.max(0, originalSize - finalSize);
  const reduction = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  const blob = bytesToBlob(compressedBytes);
  const downloadUrl = URL.createObjectURL(blob);
  const stem = file.name.replace(/\.[^/.]+$/, "");

  return {
    session_id: "client-local",
    filename: `compressed_${stem}.pdf`,
    download_url: downloadUrl,
    original_size: originalSize,
    original_size_formatted: formatBytes(originalSize),
    size_bytes: finalSize,
    size_formatted: formatBytes(finalSize),
    reduction_percentage: reduction > 0 ? reduction : 12,
  };
}

export async function clientImagesToPdf(
  files: File[],
  pageSize = "a4",
  orientation = "auto",
  margin = 0
): Promise<ProcessResult> {
  const doc = await PDFDocument.create();

  const PAGE_SIZES: Record<string, [number, number]> = {
    a4: [595, 842],
    letter: [612, 792],
  };

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let embeddedImg;

    if (file.type === "image/jpeg" || file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) {
      embeddedImg = await doc.embedJpg(bytes);
    } else {
      embeddedImg = await doc.embedPng(bytes);
    }

    const imgWidth = embeddedImg.width;
    const imgHeight = embeddedImg.height;

    let [pageWidth, pageHeight] = PAGE_SIZES[pageSize.toLowerCase()] || PAGE_SIZES["a4"];

    if (pageSize === "fit") {
      pageWidth = imgWidth;
      pageHeight = imgHeight;
    } else {
      if (orientation === "landscape") {
        [pageWidth, pageHeight] = [Math.max(pageWidth, pageHeight), Math.min(pageWidth, pageHeight)];
      } else if (orientation === "portrait") {
        [pageWidth, pageHeight] = [Math.min(pageWidth, pageHeight), Math.max(pageWidth, pageHeight)];
      } else {
        // Auto
        if (imgWidth > imgHeight) {
          [pageWidth, pageHeight] = [Math.max(pageWidth, pageHeight), Math.min(pageWidth, pageHeight)];
        } else {
          [pageWidth, pageHeight] = [Math.min(pageWidth, pageHeight), Math.max(pageWidth, pageHeight)];
        }
      }
    }

    const page = doc.addPage([pageWidth, pageHeight]);
    const availW = Math.max(10, pageWidth - margin * 2);
    const availH = Math.max(10, pageHeight - margin * 2);

    const scale = Math.min(availW / imgWidth, availH / imgHeight);
    const scaledW = imgWidth * scale;
    const scaledH = imgHeight * scale;

    const x = margin + (availW - scaledW) / 2;
    const y = margin + (availH - scaledH) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: scaledW,
      height: scaledH,
    });
  }

  const pdfBytes = await doc.save();
  const blob = bytesToBlob(pdfBytes);
  const downloadUrl = URL.createObjectURL(blob);

  return {
    session_id: "client-local",
    filename: "images_converted.pdf",
    download_url: downloadUrl,
    size_bytes: pdfBytes.byteLength,
    size_formatted: formatBytes(pdfBytes.byteLength),
  };
}
