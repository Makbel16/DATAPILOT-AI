from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.dataset import Dataset
from app.models.user import User
from app.models.report import UsageRecord
from app.schemas.anomaly import AnomalyRequest, AnomalyResponse
from app.services.file_service import FileService
from app.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

@router.post("/detect", response_model=AnomalyResponse)
def detect_anomalies(
    request: AnomalyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")

    df = FileService.load_dataframe(dataset.file_path)
    try:
        result = AnomalyService.detect_anomalies(
            df=df,
            columns=request.columns,
            method=request.method,
            contamination=request.contamination
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    db.add(UsageRecord(user_id=current_user.id, action_type="anomaly", tokens_or_count=1))
    db.commit()
    return result
