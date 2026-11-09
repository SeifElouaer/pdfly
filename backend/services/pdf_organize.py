from pathlib import Path
from typing import List, Dict, Any
import fitz  # PyMuPDF

def merge_pdfs(file_paths: List[Path], output_path: Path) -> Path:
    """Merges multiple PDF documents in the order provided into output_path."""
    merged_doc = fitz.open()
    for file_path in file_paths:
        with fitz.open(str(file_path)) as doc:
            merged_doc.insert_pdf(doc)
    merged_doc.save(str(output_path), garbage=4, deflate=True)
    merged_doc.close()
    return output_path

def parse_page_ranges(range_str: str, max_pages: int) -> List[List[int]]:
    """
    Parses strings like "1-3, 5, 8-10" into list of 0-indexed page list groups:
    e.g. [[0, 1, 2], [4], [7, 8, 9]]
    """
    groups = []
    tokens = [t.strip() for t in range_str.split(",") if t.strip()]
    for token in tokens:
        if "-" in token:
            parts = token.split("-")
            start = max(1, int(parts[0].strip()))
            end = min(max_pages, int(parts[1].strip()))
            if start <= end:
                groups.append(list(range(start - 1, end)))
        else:
            page = int(token.strip())
            if 1 <= page <= max_pages:
                groups.append([page - 1])
    return groups

def split_pdf(file_path: Path, mode: str, ranges_str: str, output_dir: Path) -> List[Path]:
    """
    Splits a PDF:
    - mode="all": extracts every single page into its own PDF
    - mode="ranges": extracts defined ranges into separate PDFs
    """
    output_files: List[Path] = []
    with fitz.open(str(file_path)) as doc:
        total_pages = len(doc)
        doc_stem = file_path.stem

        if mode == "all":
            for page_num in range(total_pages):
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                out_path = output_dir / f"{doc_stem}_page_{page_num + 1}.pdf"
                new_doc.save(str(out_path), deflate=True)
                new_doc.close()
                output_files.append(out_path)
        else:
            # Range mode
            groups = parse_page_ranges(ranges_str, total_pages)
            for idx, page_group in enumerate(groups, start=1):
                if not page_group:
                    continue
                new_doc = fitz.open()
                for p_idx in page_group:
                    new_doc.insert_pdf(doc, from_page=p_idx, to_page=p_idx)
                out_path = output_dir / f"{doc_stem}_part_{idx}.pdf"
                new_doc.save(str(out_path), deflate=True)
                new_doc.close()
                output_files.append(out_path)

    return output_files

def reorder_and_delete_pages(file_path: Path, page_settings: List[Dict[str, Any]], output_path: Path) -> Path:
    """
    Creates a new PDF based on user's page configuration.
    page_settings: [{"page_index": 0, "rotation": 90}, {"page_index": 2, "rotation": 0}]
    """
    with fitz.open(str(file_path)) as src_doc:
        new_doc = fitz.open()
        for item in page_settings:
            p_idx = int(item["page_index"])
            rotation = int(item.get("rotation", 0))
            if 0 <= p_idx < len(src_doc):
                new_doc.insert_pdf(src_doc, from_page=p_idx, to_page=p_idx)
                # Apply extra rotation if specified
                new_page = new_doc[-1]
                if rotation != 0:
                    new_page.set_rotation((new_page.rotation + rotation) % 360)
        new_doc.save(str(output_path), garbage=4, deflate=True)
        new_doc.close()
    return output_path
