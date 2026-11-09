import io
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image

def compress_pdf(file_path: Path, level: str, output_path: Path) -> Path:
    """
    Compresses PDF using PyMuPDF stream deflation and raster image downsampling.
    Levels:
    - extreme: low image quality (45%), max 100 DPI
    - recommended: balanced quality (70%), max 150 DPI
    - low: high quality (85%), max 220 DPI
    """
    settings = {
        "extreme": {"quality": 45, "max_dim": 1000},
        "recommended": {"quality": 70, "max_dim": 1600},
        "low": {"quality": 85, "max_dim": 2400}
    }
    config = settings.get(level.lower(), settings["recommended"])
    target_quality = config["quality"]
    max_dim = config["max_dim"]

    doc = fitz.open(str(file_path))

    # Process embedded images
    for page in doc:
        image_list = page.get_images(full=True)
        for img_info in image_list:
            xref = img_info[0]
            try:
                base_image = doc.extract_image(xref)
                if not base_image:
                    continue
                image_bytes = base_image["image"]
                
                # Load with Pillow to inspect and compress
                pil_image = Image.open(io.BytesIO(image_bytes))
                
                # Check dimensions
                w, h = pil_image.size
                if w > max_dim or h > max_dim or pil_image.format != "JPEG":
                    # Resize if too large while maintaining aspect ratio
                    if w > max_dim or h > max_dim:
                        pil_image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

                    # Convert to RGB if RGBA/P to save as JPEG
                    if pil_image.mode in ("RGBA", "P"):
                        pil_image = pil_image.convert("RGB")

                    output_buffer = io.BytesIO()
                    pil_image.save(output_buffer, format="JPEG", quality=target_quality, optimize=True)
                    new_bytes = output_buffer.getvalue()

                    # Only replace if newly compressed bytes are smaller
                    if len(new_bytes) < len(image_bytes):
                        doc.update_stream(xref, new_bytes)
            except Exception:
                # If an image format cannot be converted or is specialized vector/mask, preserve original
                continue

    # Save with full garbage collection and stream deflation
    doc.save(
        str(output_path),
        garbage=4,
        deflate=True,
        clean=True,
        deflate_images=True,
        deflate_fonts=True
    )
    doc.close()
    return output_path
