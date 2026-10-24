import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.dataset import Dataset
from app.models.analysis import AnalysisSession
from app.models.user import User
from app.models.report import UsageRecord
from app.schemas.analysis import QueryRequest, QueryResponse, AnalysisHistoryItem
from app.services.file_service import FileService
from app.services.query_interpreter import QueryInterpreter

router = APIRouter(prefix="/analyses", tags=["Analyses"])

@router.post("/query", response_model=QueryResponse)
def execute_natural_language_query(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")

    df = FileService.load_dataframe(dataset.file_path)
    result = QueryInterpreter.execute_query(df, request.query)

    session_id = str(uuid.uuid4().hex)
    session = AnalysisSession(
        id=session_id,
        user_id=current_user.id,
        dataset_id=dataset.id,
        query_text=request.query,
        interpreted_action=result["interpreted_action"],
        explanation=result["explanation"],
        visualization_type=result["visualization_recommendation"],
        result_data=result,
        execution_time_ms=result["execution_time_ms"]
    )
    db.add(session)
    db.add(UsageRecord(user_id=current_user.id, action_type="query", tokens_or_count=1))
    db.commit()

    result["session_id"] = session_id
    return result

@router.get("/history", response_model=List[AnalysisHistoryItem])
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = (
        db.query(AnalysisSession)
        .filter(AnalysisSession.user_id == current_user.id)
        .order_by(AnalysisSession.created_at.desc())
        .limit(50)
        .all()
    )
    
    items = []
    for s in sessions:
        items.append({
            "id": s.id,
            "dataset_id": s.dataset_id,
            "dataset_name": s.dataset.name if s.dataset else "Unknown Dataset",
            "query_text": s.query_text,
            "interpreted_action": s.interpreted_action,
            "visualization_type": s.visualization_type,
            "execution_time_ms": s.execution_time_ms,
            "created_at": s.created_at
        })
    return items

@router.get("/{session_id}")
def get_analysis_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id, AnalysisSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis session not found.")
    return session.result_data

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id, AnalysisSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    db.delete(session)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
