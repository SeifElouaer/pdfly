import math
from pathlib import Path
from typing import List, Optional
import fitz  # PyMuPDF

def hex_to_rgb(hex_str: str):
    """Converts #RRGGBB to tuple of floats (0.0 to 1.0)."""
    hex_str = hex_str.lstrip("#")
    if len(hex_str) != 6:
        return (0.5, 0.5, 0.5)
    return tuple(int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def rotate_pdf(file_path: Path, angle: int, pages: Optional[List[int]], output_path: Path) -> Path:
    """Rotates specified pages (or all pages if pages is None) by angle (90, 180, 270)."""
    doc = fitz.open(str(file_path))
    for idx, page in enumerate(doc):
        if pages is None or idx in pages:
            page.set_rotation((page.rotation + angle) % 360)
    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return output_path

def watermark_pdf(
    file_path: Path,
    text: str,
    position: str = "center",
    opacity: float = 0.3,
    font_size: int = 36,
    rotation: int = 45,
    color_hex: str = "#888888",
    output_path: Path = None
) -> Path:
    """
    Applies custom text watermark on all pages with position grid and opacity.
    Positions: top-left, top-center, top-right,
               middle-left, center, middle-right,
               bottom-left, bottom-center, bottom-right
    """
    doc = fitz.open(str(file_path))
    rgb_color = hex_to_rgb(color_hex)

    for page in doc:
        rect = page.rect
        w, h = rect.width, rect.height

        # Calculate anchor coordinates
        pos_map = {
            "top-left": (w * 0.2, h * 0.15),
            "top-center": (w * 0.5, h * 0.15),
            "top-right": (w * 0.8, h * 0.15),
            "middle-left": (w * 0.2, h * 0.5),
            "center": (w * 0.5, h * 0.5),
            "middle-right": (w * 0.8, h * 0.5),
            "bottom-left": (w * 0.2, h * 0.85),
            "bottom-center": (w * 0.5, h * 0.85),
            "bottom-right": (w * 0.8, h * 0.85),
        }
        x, y = pos_map.get(position.lower(), (w * 0.5, h * 0.5))

        point = fitz.Point(x, y)
        
        # PyMuPDF insert_text supports arbitrary rotation using morph=(point, fitz.Matrix(rotation))
        # and fill_opacity for alpha transparency
        morph_val = (point, fitz.Matrix(rotation)) if rotation != 0 else None
        
        page.insert_text(
            point,
            text,
            fontsize=font_size,
            color=rgb_color,
            fill_opacity=opacity,
            morph=morph_val,
            overlay=True
        )

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return output_path

def add_page_numbers(
    file_path: Path,
    format_template: str = "{n} of {total}",
    position: str = "bottom-center",
    start_page: int = 1,
    font_size: int = 10,
    margin: int = 25,
    output_path: Path = None
) -> Path:
    """
    Applies page numbers to all pages with customizable positioning and formats:
    format_template can be "{n}", "Page {n}", "{n} / {total}", "Page {n} of {total}"
    """
    doc = fitz.open(str(file_path))
    total_pages = len(doc)

    for idx, page in enumerate(doc):
        current_num = start_page + idx
        num_str = format_template.replace("{n}", str(current_num)).replace("{total}", str(total_pages))
        rect = page.rect
        w, h = rect.width, rect.height

        # Position mappings
        if "top" in position:
            y = margin + font_size
        else:
            y = h - margin

        if "left" in position:
            x = margin
            align = 0  # Left
        elif "right" in position:
            x = w - margin
            align = 2  # Right
        else:  # Center
            x = w / 2
            align = 1  # Center

        point = fitz.Point(x, y)
        page.insert_text(
            point,
            num_str,
            fontsize=font_size,
            color=(0.2, 0.2, 0.2),
            overlay=True
        )

    doc.save(str(output_path), garbage=4, deflate=True)
    doc.close()
    return output_path
