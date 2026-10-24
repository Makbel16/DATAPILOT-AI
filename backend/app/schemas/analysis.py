from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class QueryRequest(BaseModel):
    dataset_id: str
    query: str

class QueryResponse(BaseModel):
    success: bool
    query: str
    interpreted_action: str
    explanation: str
    visualization_recommendation: str # 'bar', 'line', 'pie', 'table', 'scatter', 'area', 'metric'
    data: list[dict[str, Any]] = []
    columns: list[str] = []
    metric_value: Optional[Any] = None
    metric_label: Optional[str] = None
    execution_time_ms: float = 0.0
    warnings: list[str] = []
    session_id: Optional[str] = None

class AnalysisHistoryItem(BaseModel):
    id: str
    dataset_id: str
    dataset_name: Optional[str] = None
    query_text: str
    interpreted_action: str
    visualization_type: Optional[str] = None
    execution_time_ms: float
    created_at: datetime

    class Config:
        from_attributes = True
