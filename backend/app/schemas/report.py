from typing import Optional, Any, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ReportCreateRequest(BaseModel):
    dataset_id: str
    title: str

class ReportResponse(BaseModel):
    id: str
    dataset_id: str
    dataset_name: Optional[str] = None
    title: str
    executive_summary: Optional[str] = None
    findings: Optional[List[dict[str, Any]]] = None
    charts_config: Optional[List[dict[str, Any]]] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
