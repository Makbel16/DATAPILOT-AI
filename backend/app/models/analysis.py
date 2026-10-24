from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    
    id = Column(String, primary_key=True, index=True) # UUID
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(String, nullable=False)
    interpreted_action = Column(String, nullable=False)
    explanation = Column(String, nullable=True)
    visualization_type = Column(String, nullable=True) # bar, line, area, pie, table, scatter, metric
    result_data = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="analyses")
    dataset = relationship("Dataset", back_populates="analyses")
