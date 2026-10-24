from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.dataset import Dataset
from app.models.user import User
from app.models.report import UsageRecord
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.services.file_service import FileService
from app.services.forecasting_service import ForecastingService

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.post("/run", response_model=ForecastResponse)
def run_forecast(
    request: ForecastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")

    df = FileService.load_dataframe(dataset.file_path)
    try:
        result = ForecastingService.generate_forecast(
            df=df,
            target_column=request.target_column,
            time_column=request.time_column,
            horizon_periods=request.horizon_periods,
            method=request.method
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    db.add(UsageRecord(user_id=current_user.id, action_type="forecast", tokens_or_count=1))
    db.commit()
    return result
