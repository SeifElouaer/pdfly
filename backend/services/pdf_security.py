from pathlib import Path
import fitz  # PyMuPDF

def protect_pdf(file_path: Path, user_password: str, output_path: Path, owner_password: str = None) -> Path:
    """Encrypts a PDF using modern AES-256 encryption with user password."""
    if not owner_password:
        owner_password = user_password

    doc = fitz.open(str(file_path))
    perm = (
        fitz.PDF_PERM_ACCESSIBILITY |
        fitz.PDF_PERM_PRINT |
        fitz.PDF_PERM_COPY
    )

    doc.save(
        str(output_path),
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw=user_password,
        owner_pw=owner_password,
        permissions=perm,
        deflate=True
    )
    doc.close()
    return output_path

def unlock_pdf(file_path: Path, password: str, output_path: Path) -> Path:
    """Removes encryption and password protection from a PDF."""
    doc = fitz.open(str(file_path))
    
    if doc.is_encrypted:
        success = doc.authenticate(password)
        if not success:
            doc.close()
            raise ValueError("Incorrect password for protected PDF.")

    # Save without encryption
    doc.save(str(output_path), encryption=fitz.PDF_ENCRYPT_NONE, deflate=True)
    doc.close()
    return output_path
