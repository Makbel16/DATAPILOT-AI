from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class ForecastRequest(BaseModel):
    dataset_id: str
    target_column: str
    time_column: Optional[str] = None
    horizon_periods: int = 6
    method: str = "holt_winters" # 'holt_winters', 'exponential_smoothing', 'linear_trend'

class ForecastPoint(BaseModel):
    period: str
    historical_value: Optional[float] = None
    forecast_value: Optional[float] = None
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ForecastResponse(BaseModel):
    success: bool
    target_column: str
    time_column: Optional[str] = None
    method: str
    method_description: str
    horizon_periods: int
    points: list[ForecastPoint]
    metrics: dict[str, Any] = {}
    warnings: list[str] = []

class AnomalyRequest(BaseModel):
    dataset_id: str
    columns: list[str]
    method: str = "isolation_forest" # 'isolation_forest', 'z_score', 'iqr'
    contamination: float = 0.05 # expected outlier fraction

class AnomalyRecord(BaseModel):
    index: int
    data: dict[str, Any]
    anomaly_score: float
    flag_reason: str

class AnomalyResponse(BaseModel):
    success: bool
    method: str
    method_description: str
    total_records: int
    anomaly_count: int
    anomaly_percentage: float
    flagged_records: list[AnomalyRecord]
    warnings: list[str] = []

class ReportCreateRequest(BaseModel):
    dataset_id: str
    title: str

class ReportResponse(BaseModel):
    id: str
    dataset_id: str
    dataset_name: Optional[str] = None
    title: str
    executive_summary: Optional[str] = None
    findings: Optional[list[dict[str, Any]]] = None
    charts_config: Optional[list[dict[str, Any]]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
