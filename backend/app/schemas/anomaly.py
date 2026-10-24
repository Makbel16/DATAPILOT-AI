from typing import Any, List
from pydantic import BaseModel

class AnomalyRequest(BaseModel):
    dataset_id: str
    columns: List[str]
    method: str = "isolation_forest" # 'isolation_forest', 'z_score', 'iqr'
    contamination: float = 0.05

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
    flagged_records: List[AnomalyRecord]
    warnings: List[str] = []
