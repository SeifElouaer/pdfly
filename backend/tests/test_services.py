import sys
from pathlib import Path
import fitz

# Add repo root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.services.pdf_organize import merge_pdfs, split_pdf, reorder_and_delete_pages
from backend.services.pdf_optimize import compress_pdf
from backend.services.pdf_convert import pdf_to_images, images_to_pdf
from backend.services.pdf_edit import rotate_pdf, watermark_pdf, add_page_numbers
from backend.services.pdf_security import protect_pdf, unlock_pdf

test_dir = Path(__file__).resolve().parent / "temp_test"
test_dir.mkdir(parents=True, exist_ok=True)

def create_sample_pdf(filename: str, page_count: int = 3) -> Path:
    doc = fitz.open()
    for i in range(page_count):
        page = doc.new_page(width=595, height=842)
        page.insert_text(fitz.Point(100, 150), f"Sample Document Page {i+1}", fontsize=28)
        page.insert_text(fitz.Point(100, 200), "Testing iLovePDF Clone Processing Engine", fontsize=16)
        page.draw_rect(fitz.Rect(90, 90, 500, 300), color=(0.8, 0.2, 0.2), width=2)
    path = test_dir / filename
    doc.save(str(path))
    doc.close()
    return path

def test_all():
    print("1. Creating sample PDFs...")
    pdf1 = create_sample_pdf("doc1.pdf", 3)
    pdf2 = create_sample_pdf("doc2.pdf", 2)

    print("2. Testing Merge...")
    merged = test_dir / "merged.pdf"
    merge_pdfs([pdf1, pdf2], merged)
    assert merged.exists()
    with fitz.open(str(merged)) as mdoc:
        assert len(mdoc) == 5
    print("   -> Merge OK (5 pages)")

    print("3. Testing Split...")
    split_dir = test_dir / "split"
    split_dir.mkdir(exist_ok=True)
    parts = split_pdf(merged, mode="ranges", ranges_str="1-2, 3-5", output_dir=split_dir)
    assert len(parts) == 2
    print(f"   -> Split OK ({len(parts)} parts)")

    print("4. Testing Watermark...")
    watermarked = test_dir / "watermarked.pdf"
    watermark_pdf(pdf1, text="CONFIDENTIAL", position="center", opacity=0.4, font_size=40, output_path=watermarked)
    assert watermarked.exists()
    print("   -> Watermark OK")

    print("5. Testing Page Numbers...")
    numbered = test_dir / "numbered.pdf"
    add_page_numbers(pdf1, format_template="Page {n} of {total}", position="bottom-center", output_path=numbered)
    assert numbered.exists()
    print("   -> Page Numbers OK")

    print("6. Testing Rotate...")
    rotated = test_dir / "rotated.pdf"
    rotate_pdf(pdf1, angle=90, pages=None, output_path=rotated)
    with fitz.open(str(rotated)) as rdoc:
        assert rdoc[0].rotation == 90
    print("   -> Rotate OK")

    print("7. Testing Protect & Unlock...")
    protected = test_dir / "protected.pdf"
    protect_pdf(pdf1, "secret123", protected)
    with fitz.open(str(protected)) as pdoc:
        assert pdoc.is_encrypted
    unlocked = test_dir / "unlocked.pdf"
    unlock_pdf(protected, "secret123", unlocked)
    with fitz.open(str(unlocked)) as udoc:
        assert not udoc.is_encrypted
    print("   -> Protect & Unlock OK")

    print("8. Testing PDF to Images and Images to PDF...")
    img_dir = test_dir / "images"
    img_dir.mkdir(exist_ok=True)
    imgs = pdf_to_images(pdf1, img_dir, img_format="jpg", dpi=100)
    assert len(imgs) == 3
    reconstructed = test_dir / "from_images.pdf"
    images_to_pdf(imgs, reconstructed)
    assert reconstructed.exists()
    print("   -> Image conversions OK")

    print("9. Testing Compress...")
    compressed = test_dir / "compressed.pdf"
    compress_pdf(pdf1, level="recommended", output_path=compressed)
    assert compressed.exists()
    print("   -> Compress OK")

    print("\nALL 9 CORE PDF SERVICES PASSED VERIFICATION!")

if __name__ == "__main__":
    test_all()
