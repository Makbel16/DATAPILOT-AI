import os
import uuid
from pathlib import Path
from typing import Tuple
import pandas as pd
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

class FileService:
    @staticmethod
    def validate_and_save_upload(file: UploadFile) -> Tuple[str, str, int]:
        """
        Validates file size, extension, and saves with a safe UUID filename.
        Returns (saved_file_path, original_filename, file_size_bytes)
        """
        filename = file.filename or "dataset.csv"
        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Only CSV and Excel (.xlsx, .xls) files are supported."
            )

        file_id = str(uuid.uuid4().hex)
        safe_filename = f"{file_id}{ext}"
        target_path = settings.UPLOAD_DIR / safe_filename
        
        # Stream file to disk while enforcing max file size
        size_bytes = 0
        try:
            with open(target_path, "wb") as buffer:
                while chunk := file.file.read(1024 * 1024): # 1MB chunks
                    size_bytes += len(chunk)
                    if size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
                        if target_path.exists():
                            target_path.unlink()
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
                        )
                    buffer.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            if target_path.exists():
                target_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )

        if size_bytes == 0:
            if target_path.exists():
                target_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        return str(target_path), filename, size_bytes

    @staticmethod
    def load_dataframe(file_path: str) -> pd.DataFrame:
        """
        Loads CSV or Excel safely with error handling and column cleanup.
        """
        path = Path(file_path)
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset file not found on disk."
            )

        try:
            if path.suffix.lower() == ".csv":
                try:
                    df = pd.read_csv(file_path, encoding='utf-8')
                except UnicodeDecodeError:
                    df = pd.read_csv(file_path, encoding='latin1')
            elif path.suffix.lower() in [".xlsx", ".xls"]:
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported extension")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error parsing file: {str(e)}"
            )

        # Sanitize column headers: strip whitespace, ensure uniqueness
        cleaned_columns = []
        seen = {}
        for col in df.columns:
            clean = str(col).strip()
            if not clean:
                clean = "Unnamed"
            if clean in seen:
                seen[clean] += 1
                clean = f"{clean}_{seen[clean]}"
            else:
                seen[clean] = 0
            cleaned_columns.append(clean)
        df.columns = cleaned_columns
        return df

    @staticmethod
    def delete_file(file_path: str):
        path = Path(file_path)
        if path.exists():
            try:
                path.unlink()
            except Exception:
                pass
