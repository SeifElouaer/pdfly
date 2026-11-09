import os
import time
import shutil
import logging
from pathlib import Path
from backend.config import UPLOAD_DIR, OUTPUT_DIR, FILE_TTL_SECONDS

logger = logging.getLogger(__name__)

def purge_expired_sessions():
    """Scans upload and output folders and removes directories older than FILE_TTL_SECONDS."""
    now = time.time()
    for root_dir in [UPLOAD_DIR, OUTPUT_DIR]:
        if not root_dir.exists():
            continue
        for session_folder in root_dir.iterdir():
            if session_folder.is_dir():
                try:
                    stat = session_folder.stat()
                    age = now - stat.st_mtime
                    if age > FILE_TTL_SECONDS:
                        shutil.rmtree(session_folder, ignore_errors=True)
                        logger.info(f"Purged expired session folder: {session_folder.name} (age: {int(age)}s)")
                except Exception as e:
                    logger.warning(f"Failed to inspect or purge {session_folder}: {e}")
