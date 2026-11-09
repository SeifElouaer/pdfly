import os
import shutil
import uuid
import zipfile
from pathlib import Path
from typing import List, Tuple
from fastapi import UploadFile
from backend.config import UPLOAD_DIR, OUTPUT_DIR, MAX_FILE_SIZE_BYTES

def generate_session_id() -> str:
    return str(uuid.uuid4())

def get_session_upload_dir(session_id: str) -> Path:
    path = UPLOAD_DIR / session_id
    path.mkdir(parents=True, exist_ok=True)
    return path

def get_session_output_dir(session_id: str) -> Path:
    path = OUTPUT_DIR / session_id
    path.mkdir(parents=True, exist_ok=True)
    return path

async def save_upload_file(upload_file: UploadFile, session_id: str) -> Tuple[Path, int]:
    """Save an incoming multipart file to session upload folder, validating file size."""
    session_dir = get_session_upload_dir(session_id)
    safe_filename = Path(upload_file.filename).name.replace(" ", "_")
    destination = session_dir / safe_filename
    
    # In case of filename collisions within the same session
    if destination.exists():
        stem = destination.stem
        suffix = destination.suffix
        destination = session_dir / f"{stem}_{uuid.uuid4().hex[:6]}{suffix}"

    total_bytes = 0
    with open(destination, "wb") as buffer:
        while chunk := await upload_file.read(1024 * 1024):  # 1MB chunks
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE_BYTES:
                destination.unlink(missing_ok=True)
                raise ValueError(f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)} MB")
            buffer.write(chunk)
            
    return destination, total_bytes

def create_zip_archive(files: List[Path], archive_name: str, session_id: str) -> Path:
    """Bundle a list of files into a .zip archive in the output directory."""
    output_dir = get_session_output_dir(session_id)
    zip_path = output_dir / f"{archive_name}.zip"
    
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            zipf.write(file, arcname=file.name)
            
    return zip_path

def delete_session(session_id: str):
    """Purge both upload and output directories for a session."""
    up = UPLOAD_DIR / session_id
    out = OUTPUT_DIR / session_id
    if up.exists():
        shutil.rmtree(up, ignore_errors=True)
    if out.exists():
        shutil.rmtree(out, ignore_errors=True)

def format_size(bytes_num: int) -> str:
    """Format bytes into readable string (e.g. 1.2 MB)."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_num < 1024.0:
            return f"{bytes_num:.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} TB"
