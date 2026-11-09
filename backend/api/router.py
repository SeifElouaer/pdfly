import json
import logging
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from backend.utils.storage import (
    generate_session_id,
    save_upload_file,
    get_session_output_dir,
    create_zip_archive,
    delete_session,
    format_size
)
from backend.services.pdf_organize import merge_pdfs, split_pdf, reorder_and_delete_pages
from backend.services.pdf_optimize import compress_pdf
from backend.services.pdf_convert import pdf_to_images, images_to_pdf, pdf_to_docx_file
from backend.services.pdf_edit import rotate_pdf, watermark_pdf, add_page_numbers
from backend.services.pdf_security import protect_pdf, unlock_pdf

logger = logging.getLogger(__name__)
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
def health_check():
    return {"status": "ok", "service": "pdfly-backend"}

@api_router.delete("/session/{session_id}")
def purge_session(session_id: str):
    delete_session(session_id)
    return {"status": "purged", "session_id": session_id}

@api_router.get("/download/{session_id}/{filename}")
def download_file(session_id: str, filename: str):
    out_dir = get_session_output_dir(session_id)
    file_path = out_dir / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Requested file not found or has expired.")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream"
    )

@api_router.post("/pdf/merge")
async def handle_merge(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required for merging.")
    
    session_id = generate_session_id()
    saved_paths: List[Path] = []
    
    try:
        for f in files:
            path, _ = await save_upload_file(f, session_id)
            saved_paths.append(path)
            
        out_dir = get_session_output_dir(session_id)
        out_filename = f"merged_{Path(files[0].filename).stem}.pdf"
        out_path = out_dir / out_filename
        
        merge_pdfs(saved_paths, out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_merge")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/split")
async def handle_split(
    file: UploadFile = File(...),
    mode: str = Form("all"),
    ranges: str = Form("")
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        
        split_files = split_pdf(saved_path, mode=mode, ranges_str=ranges, output_dir=out_dir)
        if not split_files:
            raise HTTPException(status_code=400, detail="No pages were matched for splitting.")
        
        if len(split_files) == 1:
            out_file = split_files[0]
            out_filename = out_file.name
        else:
            # Multiple files -> ZIP archive
            zip_path = create_zip_archive(split_files, f"split_{saved_path.stem}", session_id)
            out_filename = zip_path.name
            out_file = zip_path
            
        out_size = out_file.stat().st_size
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size),
            "parts_count": len(split_files)
        }
    except Exception as e:
        logger.exception("Error in handle_split")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/organize")
async def handle_organize(
    file: UploadFile = File(...),
    pages_json: str = Form(...)  # '[{"page_index": 0, "rotation": 0}, ...]'
):
    session_id = generate_session_id()
    try:
        page_settings = json.loads(pages_json)
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"organized_{saved_path.name}"
        out_path = out_dir / out_filename
        
        reorder_and_delete_pages(saved_path, page_settings, out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_organize")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/compress")
async def handle_compress(
    file: UploadFile = File(...),
    level: str = Form("recommended")
):
    session_id = generate_session_id()
    try:
        saved_path, original_size = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"compressed_{saved_path.name}"
        out_path = out_dir / out_filename
        
        compress_pdf(saved_path, level=level, output_path=out_path)
        out_size = out_path.stat().st_size
        
        saved_bytes = max(0, original_size - out_size)
        reduction_pct = round((saved_bytes / original_size * 100), 1) if original_size > 0 else 0
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "original_size": original_size,
            "original_size_formatted": format_size(original_size),
            "size_bytes": out_size,
            "size_formatted": format_size(out_size),
            "reduction_percentage": reduction_pct
        }
    except Exception as e:
        logger.exception("Error in handle_compress")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/to-images")
async def handle_to_images(
    file: UploadFile = File(...),
    format: str = Form("jpg"),
    dpi: int = Form(150)
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        
        images = pdf_to_images(saved_path, out_dir, img_format=format, dpi=dpi)
        if not images:
            raise HTTPException(status_code=400, detail="No pages found in PDF.")
            
        if len(images) == 1:
            out_file = images[0]
            out_filename = out_file.name
        else:
            zip_path = create_zip_archive(images, f"{saved_path.stem}_images", session_id)
            out_filename = zip_path.name
            out_file = zip_path
            
        out_size = out_file.stat().st_size
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size),
            "pages_count": len(images)
        }
    except Exception as e:
        logger.exception("Error in handle_to_images")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/from-images")
async def handle_from_images(
    files: List[UploadFile] = File(...),
    page_size: str = Form("a4"),
    orientation: str = Form("auto"),
    margin: int = Form(0)
):
    session_id = generate_session_id()
    try:
        saved_paths: List[Path] = []
        for f in files:
            p, _ = await save_upload_file(f, session_id)
            saved_paths.append(p)
            
        out_dir = get_session_output_dir(session_id)
        out_filename = f"images_converted.pdf"
        out_path = out_dir / out_filename
        
        images_to_pdf(saved_paths, out_path, page_size=page_size, orientation=orientation, margin=margin)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_from_images")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/to-word")
async def handle_to_word(file: UploadFile = File(...)):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"{saved_path.stem}.docx"
        out_path = out_dir / out_filename
        
        pdf_to_docx_file(saved_path, out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_to_word")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/rotate")
async def handle_rotate(
    file: UploadFile = File(...),
    angle: int = Form(90)
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"rotated_{saved_path.name}"
        out_path = out_dir / out_filename
        
        rotate_pdf(saved_path, angle=angle, pages=None, output_path=out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_rotate")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/watermark")
async def handle_watermark(
    file: UploadFile = File(...),
    text: str = Form("CONFIDENTIAL"),
    position: str = Form("center"),
    opacity: float = Form(0.3),
    font_size: int = Form(36),
    rotation: int = Form(45),
    color: str = Form("#888888")
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"watermarked_{saved_path.name}"
        out_path = out_dir / out_filename
        
        watermark_pdf(
            saved_path,
            text=text,
            position=position,
            opacity=opacity,
            font_size=font_size,
            rotation=rotation,
            color_hex=color,
            output_path=out_path
        )
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_watermark")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/page-numbers")
async def handle_page_numbers(
    file: UploadFile = File(...),
    format_template: str = Form("Page {n} of {total}"),
    position: str = Form("bottom-center"),
    start_page: int = Form(1),
    margin: int = Form(25)
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"numbered_{saved_path.name}"
        out_path = out_dir / out_filename
        
        add_page_numbers(
            saved_path,
            format_template=format_template,
            position=position,
            start_page=start_page,
            margin=margin,
            output_path=out_path
        )
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_page_numbers")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/protect")
async def handle_protect(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")
        
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"protected_{saved_path.name}"
        out_path = out_dir / out_filename
        
        protect_pdf(saved_path, password, out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except Exception as e:
        logger.exception("Error in handle_protect")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/pdf/unlock")
async def handle_unlock(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    session_id = generate_session_id()
    try:
        saved_path, _ = await save_upload_file(file, session_id)
        out_dir = get_session_output_dir(session_id)
        out_filename = f"unlocked_{saved_path.name}"
        out_path = out_dir / out_filename
        
        unlock_pdf(saved_path, password, out_path)
        out_size = out_path.stat().st_size
        
        return {
            "session_id": session_id,
            "filename": out_filename,
            "download_url": f"/api/download/{session_id}/{out_filename}",
            "size_bytes": out_size,
            "size_formatted": format_size(out_size)
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Error in handle_unlock")
        raise HTTPException(status_code=500, detail=str(e))
