export type ToolCategory = "organize" | "optimize" | "convert" | "edit" | "security";

export interface ToolDef {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  category: ToolCategory;
  categoryLabel: string;
  icon: string;
  accepts: string;
  multiple: boolean;
  featured?: boolean;
}

export const TOOLS: ToolDef[] = [
  // Organize
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    title: "Merge PDF",
    shortDesc: "Combine multiple PDFs into one unified document in any custom order.",
    longDesc: "Merge two or more PDF files easily. Drag and drop to reorder files before combining.",
    category: "organize",
    categoryLabel: "Organize PDF",
    icon: "Combine",
    accepts: ".pdf",
    multiple: true,
    featured: true,
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    title: "Split PDF",
    shortDesc: "Separate one page or a whole range into independent PDF files.",
    longDesc: "Extract specific page ranges (e.g. 1-3, 5-8) or save every page as an individual PDF.",
    category: "organize",
    categoryLabel: "Organize PDF",
    icon: "Split",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },
  {
    id: "organize-pdf",
    slug: "organize-pdf",
    title: "Organize & Delete Pages",
    shortDesc: "Sort, rotate, and delete specific pages from your PDF with visual drag-and-drop.",
    longDesc: "Rearrange page orders, rotate orientation, or delete unnecessary pages interactively.",
    category: "organize",
    categoryLabel: "Organize PDF",
    icon: "LayoutGrid",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },

  // Optimize
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    title: "Compress PDF",
    shortDesc: "Reduce PDF file size significantly while preserving optimal visual clarity.",
    longDesc: "Choose between Extreme, Recommended, or Low compression to reduce file size for email and sharing.",
    category: "optimize",
    categoryLabel: "Optimize PDF",
    icon: "Minimize2",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },

  // Convert
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    title: "PDF to Word",
    shortDesc: "Convert PDF documents to editable Microsoft Word (.docx) files.",
    longDesc: "Accurately preserve paragraphs, tables, fonts, and layouts when converting from PDF to Word.",
    category: "convert",
    categoryLabel: "Convert PDF",
    icon: "FileText",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    shortDesc: "Extract all pages from a PDF as crisp, high-resolution JPG or PNG images.",
    longDesc: "Convert each page of your PDF into high-quality images and download them as a ZIP archive.",
    category: "convert",
    categoryLabel: "Convert PDF",
    icon: "Image",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    title: "Images to PDF",
    shortDesc: "Transform JPG, PNG, and WebP images into a single professional PDF.",
    longDesc: "Reorder images, select page orientation (portrait/landscape), margin, and page size.",
    category: "convert",
    categoryLabel: "Convert PDF",
    icon: "FileImage",
    accepts: "image/*",
    multiple: true,
    featured: true,
  },

  // Edit
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    title: "Rotate PDF",
    shortDesc: "Rotate PDF pages 90°, 180°, or 270° clockwise or counter-clockwise.",
    longDesc: "Permanently adjust the orientation of your PDF document pages.",
    category: "edit",
    categoryLabel: "Edit PDF",
    icon: "RotateCw",
    accepts: ".pdf",
    multiple: false,
  },
  {
    id: "watermark-pdf",
    slug: "watermark-pdf",
    title: "Watermark PDF",
    shortDesc: "Stamp custom text watermarks with custom position, opacity, and rotation.",
    longDesc: "Protect your intellectual property with custom text stamps, opacity control, and 3x3 grid positioning.",
    category: "edit",
    categoryLabel: "Edit PDF",
    icon: "Stamp",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },
  {
    id: "page-numbers",
    slug: "page-numbers",
    title: "Page Numbers",
    shortDesc: "Insert customized page numbering (e.g., 'Page 1 of 10') anywhere on your pages.",
    longDesc: "Select number formatting, margin, position (header/footer/center), and starting count.",
    category: "edit",
    categoryLabel: "Edit PDF",
    icon: "ListOrdered",
    accepts: ".pdf",
    multiple: false,
  },

  // Security
  {
    id: "protect-pdf",
    slug: "protect-pdf",
    title: "Protect PDF",
    shortDesc: "Encrypt your PDF with strong AES-256 password protection.",
    longDesc: "Prevent unauthorized access by setting an encrypted password on your PDF document.",
    category: "security",
    categoryLabel: "PDF Security",
    icon: "Lock",
    accepts: ".pdf",
    multiple: false,
    featured: true,
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    title: "Unlock PDF",
    shortDesc: "Remove password protection from encrypted PDFs to enable open access.",
    longDesc: "Decrypt protected PDF files by supplying the password and saving an unencrypted version.",
    category: "security",
    categoryLabel: "PDF Security",
    icon: "Unlock",
    accepts: ".pdf",
    multiple: false,
  },
];

export const CATEGORIES: { id: ToolCategory; label: string; count: number }[] = [
  { id: "organize", label: "Organize PDF", count: 3 },
  { id: "optimize", label: "Optimize PDF", count: 1 },
  { id: "convert", label: "Convert PDF", count: 3 },
  { id: "edit", label: "Edit PDF", count: 3 },
  { id: "security", label: "Security", count: 2 },
];
