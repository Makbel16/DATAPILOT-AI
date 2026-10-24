import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.profiling_service import ProfilingService
from app.services.query_interpreter import QueryInterpreter
from app.services.forecasting_service import ForecastingService
from app.services.anomaly_service import AnomalyService
from app.services.demo_data import generate_sample_sales_df

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "DataPilot AI" in data["service"]

def test_demo_dataset_generation():
    df = generate_sample_sales_df()
    assert len(df) > 100
    assert "Revenue" in df.columns
    assert "Product" in df.columns
    assert "Region" in df.columns
    assert "Date" in df.columns

def test_profiling_service():
    df = pd.DataFrame({
        "Age": [25, 30, 35, 40, np.nan],
        "Salary": [50000, 60000, 75000, 90000, 120000],
        "Department": ["Sales", "Engineering", "Engineering", "Marketing", "Sales"]
    })
    prof = ProfilingService.profile_dataframe(df)
    assert prof["total_rows"] == 5
    assert prof["total_columns"] == 3
    assert prof["total_missing_cells"] == 1
    assert len(prof["numeric_stats"]) == 2 # Age, Salary
    
    # Check salary stats
    sal_stat = next(s for s in prof["numeric_stats"] if s["column"] == "Salary")
    assert sal_stat["min"] == 50000
    assert sal_stat["max"] == 120000
    assert sal_stat["mean"] == 79000.0

def test_query_interpreter_summary():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Give me a summary of this dataset.")
    assert res["success"] is True
    assert "Summary" in res["interpreted_action"]
    assert len(res["data"]) > 0

def test_query_interpreter_top_ranking():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Show the top five products by revenue.")
    assert res["success"] is True
    assert "Top 5" in res["interpreted_action"]
    assert len(res["data"]) <= 5
    assert "Product" in res["columns"]

def test_query_interpreter_comparison():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Compare average sales by region.")
    assert res["success"] is True
    assert "Average" in res["interpreted_action"]
    assert len(res["data"]) > 0

def test_query_interpreter_missing_values():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Which columns contain missing values?")
    assert res["success"] is True
    assert "Missing Values" in res["interpreted_action"]

def test_query_interpreter_trends():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Show monthly sales trends.")
    assert res["success"] is True
    assert "Time Trend" in res["interpreted_action"]
    assert len(res["data"]) > 0

def test_query_interpreter_anomalies():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "Find unusually large transactions.")
    assert res["success"] is True
    assert "Outlier" in res["interpreted_action"]

def test_query_interpreter_unsupported():
    df = generate_sample_sales_df()
    res = QueryInterpreter.execute_query(df, "What is the capital of France and what is tomorrow's weather?")
    assert res["success"] is False
    assert res["interpreted_action"] == "Unsupported Query Pattern"
    assert len(res["data"]) > 0 # Contains supported suggestions

def test_anomaly_service():
    df = generate_sample_sales_df()
    res = AnomalyService.detect_anomalies(df, ["Revenue"], method="z_score")
    assert res["success"] is True
    assert res["anomaly_count"] > 0
    assert len(res["flagged_records"]) > 0

def test_forecasting_service():
    df = generate_sample_sales_df()
    res = ForecastingService.generate_forecast(df, target_column="Revenue", time_column="Date", horizon_periods=3)
    assert res["success"] is True
    assert len(res["points"]) > 3
    # Check that future points have forecast_value and confidence bounds
    future_points = [p for p in res["points"] if p["forecast_value"] is not None]
    assert len(future_points) == 3
    assert future_points[0]["lower_bound"] is not None
    assert future_points[0]["upper_bound"] is not None
