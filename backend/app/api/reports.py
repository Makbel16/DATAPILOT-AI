import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.dataset import Dataset
from app.models.report import Report, UsageRecord
from app.models.user import User
from app.schemas.report import ReportCreateRequest, ReportResponse
from app.services.file_service import FileService
from app.services.profiling_service import ProfilingService
from app.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate", response_model=ReportResponse)
def generate_report(
    request: ReportCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == request.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found or access denied.")

    df = FileService.load_dataframe(dataset.file_path)
    prof = ProfilingService.profile_dataframe(df)

    # Automatically derive analytical findings
    findings = []
    
    # 1. Volume & Completeness
    findings.append({
        "title": "Data Integrity & Volume",
        "description": f"Processed {prof['total_rows']:,} rows across {prof['total_columns']} columns. The dataset exhibits an overall missing rate of {prof['missing_cells_pct']}%, with {prof['duplicate_rows']} duplicate entries.",
        "type": "positive" if prof['missing_cells_pct'] < 5 else "warning"
    })

    # 2. Key Numeric Metrics
    num_cols = [c["name"] for c in prof["columns_meta"] if c["is_numeric"]]
    if num_cols:
        target_num = num_cols[0]
        col_sum = float(df[target_num].sum())
        col_mean = float(df[target_num].mean())
        col_max = float(df[target_num].max())
        findings.append({
            "title": f"Primary Numerical Performance ({target_num})",
            "description": f"Cumulative {target_num} stands at {col_sum:,.2f} with an average per-transaction value of {col_mean:,.2f} (peak: {col_max:,.2f}).",
            "type": "metric"
        })

    # 3. Categorical Leadership
    cat_cols = [c["name"] for c in prof["columns_meta"] if not c["is_numeric"] and not c["is_datetime"]]
    if cat_cols and num_cols:
        top_cat = cat_cols[0]
        grouped = df.groupby(top_cat)[num_cols[0]].sum().sort_values(ascending=False)
        if len(grouped) > 0:
            leader_name = str(grouped.index[0])
            leader_share = round(float(grouped.iloc[0]) / float(df[num_cols[0]].sum()) * 100, 1)
            findings.append({
                "title": f"Leading {top_cat} Concentration",
                "description": f"'{leader_name}' accounts for {leader_share}% of total {num_cols[0]}, indicating substantial market concentration.",
                "type": "insight"
            })

    # 4. Outliers check
    if num_cols:
        anom_res = AnomalyService.detect_anomalies(df, [num_cols[0]], method="z_score")
        if anom_res.get("anomaly_count", 0) > 0:
            findings.append({
                "title": "Atypical Variations & Outliers",
                "description": f"Flagged {anom_res['anomaly_count']} observations ({anom_res['anomaly_percentage']}%) displaying extreme deviation beyond 2.8 standard deviations.",
                "type": "warning"
            })

    executive_summary = (
        f"Executive Data Intelligence briefing for '{dataset.name}'. "
        f"Consolidated analysis of {prof['total_rows']:,} records reveals strong operational consistency "
        f"with {prof['missing_cells_pct']}% null density. "
        + (f"Primary revenue/volume driver is '{top_cat}' led by '{leader_name}'. " if cat_cols and num_cols else "")
        + "System recommends active monitoring of high-value outliers."
    )

    report_id = str(uuid.uuid4().hex)
    report = Report(
        id=report_id,
        user_id=current_user.id,
        dataset_id=dataset.id,
        title=request.title or f"Executive Intelligence: {dataset.name}",
        executive_summary=executive_summary,
        findings=findings,
        charts_config=[{"type": "bar", "columns": [cat_cols[0] if cat_cols else "Index", num_cols[0] if num_cols else "Value"]}],
        status="completed"
    )
    db.add(report)
    db.add(UsageRecord(user_id=current_user.id, action_type="report", tokens_or_count=1))
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "dataset_id": report.dataset_id,
        "dataset_name": dataset.name,
        "title": report.title,
        "executive_summary": report.executive_summary,
        "findings": report.findings,
        "charts_config": report.charts_config,
        "status": report.status,
        "created_at": report.created_at
    }

@router.get("", response_model=List[ReportResponse])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "dataset_id": r.dataset_id,
            "dataset_name": r.dataset.name if r.dataset else "Dataset",
            "title": r.title,
            "executive_summary": r.executive_summary,
            "findings": r.findings,
            "charts_config": r.charts_config,
            "status": r.status,
            "created_at": r.created_at
        })
    return results

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {
        "id": report.id,
        "dataset_id": report.dataset_id,
        "dataset_name": report.dataset.name if report.dataset else "Dataset",
        "title": report.title,
        "executive_summary": report.executive_summary,
        "findings": report.findings,
        "charts_config": report.charts_config,
        "status": report.status,
        "created_at": report.created_at
    }

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    db.delete(report)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
