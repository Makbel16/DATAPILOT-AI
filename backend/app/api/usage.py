from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user
from app.models.dataset import Dataset
from app.models.analysis import AnalysisSession
from app.models.report import Report, UsageRecord
from app.models.user import User

router = APIRouter(prefix="/usage", tags=["Usage & Overview"])

@router.get("/metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Computes verified application telemetry metrics for the dashboard.
    """
    # Datasets owned
    datasets_count = db.query(Dataset).filter(Dataset.user_id == current_user.id).count()
    
    # Total rows processed across all user datasets
    total_rows = db.query(func.coalesce(func.sum(Dataset.row_count), 0)).filter(Dataset.user_id == current_user.id).scalar() or 0
    
    # Natural language questions answered
    queries_count = db.query(AnalysisSession).filter(AnalysisSession.user_id == current_user.id).count()
    
    # Reports and insights generated
    reports_count = db.query(Report).filter(Report.user_id == current_user.id).count()
    
    # Action breakdown
    action_records = (
        db.query(UsageRecord.action_type, func.count(UsageRecord.id))
        .filter(UsageRecord.user_id == current_user.id)
        .group_by(UsageRecord.action_type)
        .all()
    )
    action_counts = {action: cnt for action, cnt in action_records}

    # Recent activity items
    recent_analyses = (
        db.query(AnalysisSession)
        .filter(AnalysisSession.user_id == current_user.id)
        .order_by(AnalysisSession.created_at.desc())
        .limit(6)
        .all()
    )
    
    activity_feed = [
        {
            "id": a.id,
            "type": "query",
            "title": f"Query: {a.query_text}",
            "subtitle": f"{a.interpreted_action} • {a.execution_time_ms}ms",
            "timestamp": a.created_at.isoformat()
        }
        for a in recent_analyses
    ]

    # Quota definitions
    quotas = {
        "free": {"max_datasets": 10, "max_rows": 50000, "max_queries": 200},
        "pro": {"max_datasets": 100, "max_rows": 2000000, "max_queries": 10000},
        "business": {"max_datasets": 1000, "max_rows": 50000000, "max_queries": 100000}
    }
    user_quota = quotas.get(current_user.plan_tier, quotas["pro"])

    return {
        "datasets_analyzed": datasets_count,
        "rows_processed": int(total_rows),
        "questions_answered": queries_count,
        "insights_generated": reports_count + queries_count,
        "plan_tier": current_user.plan_tier,
        "quota": user_quota,
        "usage_breakdown": action_counts,
        "activity_feed": activity_feed
    }
