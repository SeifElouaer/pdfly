from pathlib import Path
from typing import List
import fitz  # PyMuPDF
from PIL import Image
from pdf2docx import Converter

def pdf_to_images(file_path: Path, output_dir: Path, img_format: str = "jpg", dpi: int = 150) -> List[Path]:
    """Converts each page of a PDF into high-quality image files."""
    doc = fitz.open(str(file_path))
    output_files: List[Path] = []
    
    # Calculate matrix zoom based on DPI (default 72 DPI)
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    doc_stem = file_path.stem
    fmt = "jpeg" if img_format.lower() in ("jpg", "jpeg") else "png"
    ext = "jpg" if fmt == "jpeg" else "png"

    for page_idx, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=matrix, alpha=(fmt == "png"))
        out_file = output_dir / f"{doc_stem}_page_{page_idx}.{ext}"
        pix.save(str(out_file))
        output_files.append(out_file)

    doc.close()
    return output_files

def images_to_pdf(image_paths: List[Path], output_path: Path, page_size: str = "a4", orientation: str = "auto", margin: int = 0) -> Path:
    """Combines one or more images into a structured PDF document."""
    doc = fitz.open()

    # Dimensions in points (72 points per inch)
    PAGE_SIZES = {
        "a4": (595, 842),
        "letter": (612, 792),
        "fit": None
    }

    target_size = PAGE_SIZES.get(page_size.lower(), PAGE_SIZES["a4"])

    for img_path in image_paths:
        with Image.open(img_path) as pil_img:
            img_w, img_h = pil_img.size

        if target_size is None:
            # Fit to image mode
            page_w, page_h = img_w, img_h
        else:
            base_w, base_h = target_size
            if orientation == "landscape":
                page_w, page_h = max(base_w, base_h), min(base_w, base_h)
            elif orientation == "portrait":
                page_w, page_h = min(base_w, base_h), max(base_w, base_h)
            else:  # auto
                if img_w > img_h:
                    page_w, page_h = max(base_w, base_h), min(base_w, base_h)
                else:
                    page_w, page_h = min(base_w, base_h), max(base_w, base_h)

        page = doc.new_page(width=page_w, height=page_h)
        
        # Calculate rect with margin
        avail_w = max(10, page_w - (margin * 2))
        avail_h = max(10, page_h - (margin * 2))
        
        # Scale image to fit inside available rect
        scale = min(avail_w / img_w, avail_h / img_h)
        scaled_w = img_w * scale
        scaled_h = img_h * scale
        
        # Center in page
        rect_x0 = margin + (avail_w - scaled_w) / 2
        rect_y0 = margin + (avail_h - scaled_h) / 2
        rect = fitz.Rect(rect_x0, rect_y0, rect_x0 + scaled_w, rect_y0 + scaled_h)

        page.insert_image(rect, filename=str(img_path))

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return output_path

def pdf_to_docx_file(file_path: Path, output_path: Path) -> Path:
    """Converts a PDF file to Microsoft Word DOCX format."""
    cv = Converter(str(file_path))
    cv.convert(str(output_path), start=0, end=None)
    cv.close()
    return output_path
