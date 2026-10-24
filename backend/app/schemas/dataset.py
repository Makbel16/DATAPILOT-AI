from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class ColumnMeta(BaseModel):
    name: str
    dtype: str
    non_null_count: int
    null_count: int
    distinct_count: int
    sample_values: list[Any] = []
    is_numeric: bool = False
    is_datetime: bool = False

class NumericStats(BaseModel):
    column: str
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    median: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None

class ProfilingData(BaseModel):
    total_rows: int
    total_columns: int
    duplicate_rows: int
    total_missing_cells: int
    missing_cells_pct: float
    numeric_stats: list[dict[str, Any]] = []
    categorical_stats: list[dict[str, Any]] = []
    columns_meta: list[ColumnMeta] = []

class DatasetResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    file_size_bytes: int
    row_count: int
    column_count: int
    columns_meta: Optional[list[dict[str, Any]]] = None
    profiling_data: Optional[dict[str, Any]] = None
    is_demo: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class DatasetPreviewResponse(BaseModel):
    dataset_id: str
    columns: list[str]
    rows: list[dict[str, Any]]
    total_rows: int
    total_columns: int
