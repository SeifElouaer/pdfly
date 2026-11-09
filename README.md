# PDFly — High-Performance Full-Stack PDF Suite

A modern, privacy-first, full-stack PDF manipulation platform built with **Next.js 14**, **FastAPI**, **PyMuPDF**, and **Tailwind CSS**, designed with an electric indigo aesthetic for an elite, frictionless SaaS experience.

---

## Features & Tool Suite

### 1. Organize
- **Merge PDF**: Combine multiple PDFs into a single file with custom ordering.
- **Split PDF**: Split by custom page ranges (e.g., `1-3, 5, 8-10`) or extract every page into separate files (downloaded as a `.zip`).
- **Organize & Delete Pages**: Visual drag-and-drop page canvas to rearrange, delete, or rotate individual pages.

### 2. Optimize
- **Compress PDF**: Three preset compression profiles (*Extreme*, *Recommended*, *Low*) with PyMuPDF garbage collection, stream deflation, and raster image downsampling.

### 3. Convert
- **PDF to Images**: High-resolution conversion of PDF pages to JPG or PNG with quality selection.
- **Images to PDF**: Transform JPG, PNG, and WebP images into a structured PDF with orientation, margin, and page size options (A4, US Letter, Fit).
- **PDF to Word (.docx)**: Layout-preserving document conversion using `pdf2docx`.

### 4. Edit & Style
- **Rotate PDF**: 90°, 180°, or 270° rotation for all or selected pages.
- **Watermark PDF**: Text watermarks with 3×3 grid positioning, opacity slider, font size, and diagonal rotation.
- **Page Numbers**: Customizable page numbering (`Page {n} of {total}`, `{n} / {total}`, etc.) with position and margin controls.

### 5. Security
- **Protect PDF**: Standard AES-256 document encryption with password.
- **Unlock PDF**: Decrypt password-protected PDFs and export unrestricted copies.

---

## Architecture & Design Highlights

- **Distinctive Electric Indigo Design**: Built with clean typography, crisp 1px borders, tactile micro-interactions (2px hover lift, button depression states), and dark/light theme toggle.
- **Client-Side Instant Previews**: Client-side rendering via `pdfjs-dist` lets users inspect and reorder pages instantly with zero upload lag.
- **100% Ephemeral Privacy**: Files are processed in session-isolated temporary storage and automatically wiped after download or within 60 minutes by background TTL cleanup.
- **Zero-CORS Next.js Rewrites**: Next.js automatically proxies `/api/*` requests to the FastAPI backend at `http://localhost:8000/api/*`.

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js** v18+ or v20+
- **Python** 3.9+ or 3.10+

### One-Command Setup
```bash
# 1. Install root & frontend dependencies
npm install
cd frontend && npm install && cd ..

# 2. Setup Python virtual environment & backend dependencies
python -m venv backend/.venv
.\backend\.venv\Scripts\pip install -r backend/requirements.txt
```

### Launch Both Services Concurrently
```bash
npm run dev
```
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
