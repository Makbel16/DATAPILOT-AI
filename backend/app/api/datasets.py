import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.dataset import Dataset
from app.models.user import User
from app.models.report import UsageRecord
from app.schemas.dataset import DatasetResponse, DatasetPreviewResponse
from app.services.file_service import FileService
from app.services.profiling_service import ProfilingService
from app.services.demo_data import get_sample_csv_bytes

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_path, orig_name, size_bytes = FileService.validate_and_save_upload(file)
    
    try:
        df = FileService.load_dataframe(saved_path)
    except Exception as e:
        FileService.delete_file(saved_path)
        raise e

    profiling = ProfilingService.profile_dataframe(df)

    dataset_id = str(uuid.uuid4().hex)
    dataset_name = name.strip() if name and name.strip() else orig_name.rsplit(".", 1)[0].replace("_", " ").title()

    dataset = Dataset(
        id=dataset_id,
        user_id=current_user.id,
        name=dataset_name,
        original_filename=orig_name,
        file_path=saved_path,
        file_size_bytes=size_bytes,
        row_count=profiling["total_rows"],
        column_count=profiling["total_columns"],
        columns_meta=profiling["columns_meta"],
        profiling_data=profiling,
        is_demo=False
    )
    db.add(dataset)
    
    # Record usage
    db.add(UsageRecord(user_id=current_user.id, action_type="upload", tokens_or_count=1))
    db.commit()
    db.refresh(dataset)
    return dataset

@router.post("/load-demo", response_model=DatasetResponse)
def load_demo_dataset(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user already has an active demo dataset
    existing_demo = db.query(Dataset).filter(
        Dataset.user_id == current_user.id,
        Dataset.is_demo == True
    ).first()
    
    if existing_demo and Path(existing_demo.file_path).exists():
        return existing_demo

    csv_bytes = get_sample_csv_bytes()
    file_id = str(uuid.uuid4().hex)
    file_path = str(settings.UPLOAD_DIR / f"{file_id}.csv")
    
    with open(file_path, "wb") as f:
        f.write(csv_bytes)

    df = FileService.load_dataframe(file_path)
    profiling = ProfilingService.profile_dataframe(df)

    dataset = Dataset(
        id=file_id,
        user_id=current_user.id,
        name="Global SaaS Revenue & Analytics (Demo)",
        original_filename="global_saas_revenue_sample.csv",
        file_path=file_path,
        file_size_bytes=len(csv_bytes),
        row_count=profiling["total_rows"],
        column_count=profiling["total_columns"],
        columns_meta=profiling["columns_meta"],
        profiling_data=profiling,
        is_demo=True
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset

@router.get("", response_model=List[DatasetResponse])
def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Always ensure the demo dataset exists for immediate exploration
    demo_exists = db.query(Dataset).filter(Dataset.user_id == current_user.id, Dataset.is_demo == True).first()
    if not demo_exists:
        try:
            load_demo_dataset(db, current_user)
        except Exception:
            pass

    return db.query(Dataset).filter(Dataset.user_id == current_user.id).order_by(Dataset.created_at.desc()).all()

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")
    return dataset

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def get_dataset_preview(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    df = FileService.load_dataframe(dataset.file_path)
    total_rows = len(df)
    total_cols = len(df.columns)

    start = (page - 1) * page_size
    end = start + page_size
    sliced = df.iloc[start:end]

    # Convert to JSON serializable rows
    rows = []
    for _, r in sliced.iterrows():
        row_dict = {}
        for col in df.columns:
            val = r[col]
            if pd.isna(val):
                row_dict[col] = None
            elif isinstance(val, (int, float)):
                row_dict[col] = val
            else:
                row_dict[col] = str(val)
        rows.append(row_dict)

    return {
        "dataset_id": dataset.id,
        "columns": list(df.columns),
        "rows": rows,
        "total_rows": total_rows,
        "total_columns": total_cols
    }

@router.get("/{dataset_id}/export")
def export_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    path = Path(dataset.file_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on server.")

    return FileResponse(
        path=str(path),
        filename=dataset.original_filename,
        media_type="text/csv"
    )

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    FileService.delete_file(dataset.file_path)
    db.delete(dataset)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
