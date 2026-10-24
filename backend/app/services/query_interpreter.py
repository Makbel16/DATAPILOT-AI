import re
import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from app.services.profiling_service import ProfilingService

class QueryInterpreter:
    @staticmethod
    def _find_matching_column(user_query: str, columns: List[str]) -> Optional[str]:
        """Matches column names mentioned in query fuzzily and by word boundary."""
        q_lower = user_query.lower()
        # Direct exact or normalized match
        for col in columns:
            col_norm = col.lower().replace("_", " ").strip()
            # Check if normalized col is in query
            if re.search(r'\b' + re.escape(col_norm) + r'\b', q_lower):
                return col
            # Or token match
            if col.lower() in q_lower:
                return col
        return None

    @staticmethod
    def _find_numeric_column(user_query: str, df: pd.DataFrame) -> Optional[str]:
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        matched = QueryInterpreter._find_matching_column(user_query, numeric_cols)
        if matched:
            return matched
        # Common aliases
        q = user_query.lower()
        aliases = {
            "revenue": ["revenue", "sales", "amount", "total", "income", "price"],
            "sales": ["sales", "revenue", "amount", "turnover"],
            "quantity": ["quantity", "volume", "units", "count", "items"],
            "price": ["price", "cost", "unit_price", "rate"],
            "profit": ["profit", "margin", "gain"],
            "score": ["score", "rating", "satisfaction"]
        }
        for alias_key, alias_words in aliases.items():
            for word in alias_words:
                if word in q:
                    for col in numeric_cols:
                        if alias_key in col.lower() or word in col.lower():
                            return col
        # Fallback to first numeric column if available
        return numeric_cols[0] if numeric_cols else None

    @staticmethod
    def _find_category_column(user_query: str, df: pd.DataFrame) -> Optional[str]:
        cat_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c]) and not pd.api.types.is_datetime64_any_dtype(df[c])]
        matched = QueryInterpreter._find_matching_column(user_query, cat_cols)
        if matched:
            return matched
        q = user_query.lower()
        aliases = {
            "product": ["product", "item", "service", "offering"],
            "region": ["region", "country", "location", "area", "market", "territory"],
            "category": ["category", "type", "group", "class"],
            "segment": ["segment", "customer", "client", "tier"],
            "status": ["status", "stage", "state"]
        }
        for alias_key, alias_words in aliases.items():
            for word in alias_words:
                if word in q:
                    for col in cat_cols:
                        if alias_key in col.lower() or word in col.lower():
                            return col
        return cat_cols[0] if cat_cols else None

    @staticmethod
    def _find_time_column(df: pd.DataFrame) -> Optional[str]:
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                return col
            if "date" in col.lower() or "time" in col.lower() or "day" in col.lower() or "month" in col.lower() or "year" in col.lower():
                return col
        return None

    @classmethod
    def execute_query(cls, df: pd.DataFrame, query: str) -> Dict[str, Any]:
        """
        Interprets natural-language question deterministically and executes on DataFrame.
        """
        start_time = time.time()
        q = query.strip()
        q_lower = q.lower()
        warnings: List[str] = []

        # 1. SUMMARY / OVERVIEW
        if any(w in q_lower for w in ["summary", "overview", "describe", "profile", "tell me about", "what is this"]):
            prof = ProfilingService.profile_dataframe(df)
            rows = len(df)
            cols = len(df.columns)
            missing_pct = prof["missing_cells_pct"]
            
            num_cols = [c["name"] for c in prof["columns_meta"] if c["is_numeric"]]
            cat_cols = [c["name"] for c in prof["columns_meta"] if not c["is_numeric"] and not c["is_datetime"]]

            data = [
                {"Metric": "Total Records", "Value": f"{rows:,}"},
                {"Metric": "Total Attributes", "Value": f"{cols}"},
                {"Metric": "Numerical Attributes", "Value": f"{len(num_cols)} ({', '.join(num_cols[:3])})"},
                {"Metric": "Categorical Attributes", "Value": f"{len(cat_cols)} ({', '.join(cat_cols[:3])})"},
                {"Metric": "Missing Cell Rate", "Value": f"{missing_pct}%"},
                {"Metric": "Duplicate Records", "Value": f"{prof['duplicate_rows']:,}"}
            ]

            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": "Dataset Architecture and Health Summary",
                "explanation": f"Evaluated {rows:,} records across {cols} columns. Identified {len(num_cols)} numerical fields and {len(cat_cols)} categorical fields with {missing_pct}% overall missing rate.",
                "visualization_recommendation": "table",
                "data": data,
                "columns": ["Metric", "Value"],
                "metric_value": f"{rows:,} rows",
                "metric_label": "Dataset Size",
                "execution_time_ms": elapsed,
                "warnings": warnings
            }

        # 2. MISSING VALUES INSPECTION
        if any(w in q_lower for w in ["missing value", "null value", "empty cell", "data quality", "missing columns"]):
            null_counts = df.isna().sum()
            missing_data = []
            for col, count in null_counts.items():
                pct = round(count / len(df) * 100, 2) if len(df) > 0 else 0
                missing_data.append({
                    "Column": col,
                    "Missing_Count": int(count),
                    "Missing_Percentage": pct,
                    "Completeness": round(100 - pct, 2)
                })
            missing_data = sorted(missing_data, key=lambda x: x["Missing_Count"], reverse=True)
            total_missing = sum(d["Missing_Count"] for d in missing_data)

            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": "Missing Values & Data Completeness Audit",
                "explanation": f"Inspected null and missing cell frequencies across all {len(df.columns)} columns. Found {total_missing} total missing entries.",
                "visualization_recommendation": "bar",
                "data": missing_data,
                "columns": ["Column", "Missing_Count", "Missing_Percentage", "Completeness"],
                "metric_value": f"{total_missing:,}",
                "metric_label": "Total Missing Cells",
                "execution_time_ms": elapsed,
                "warnings": warnings
            }

        # 3. TOP N / RANKING QUERIES (e.g. "top 5 products by revenue", "highest sales")
        if any(w in q_lower for w in ["top", "highest", "best", "leading", "bottom", "lowest", "worst", "rank"]):
            # Extract N (number)
            n_match = re.search(r'\b(top|bottom|highest|lowest)\s+(\d+)\b', q_lower)
            n = int(n_match.group(2)) if n_match else 5
            word_numbers = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
            for word, val in word_numbers.items():
                if f"top {word}" in q_lower or f"bottom {word}" in q_lower or f"highest {word}" in q_lower:
                    n = val
                    break

            is_bottom = any(w in q_lower for w in ["bottom", "lowest", "worst"])
            num_col = cls._find_numeric_column(q, df)
            cat_col = cls._find_category_column(q, df)

            if not num_col:
                num_col = next((c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])), None)
            if not cat_col:
                cat_col = next((c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])), None)

            if not num_col or not cat_col:
                return cls._unsupported_response(q, df, "Could not identify an appropriate numeric and categorical column for ranking.")

            # Aggregation: sum or mean
            agg_type = "sum"
            agg_label = "Total"
            if any(w in q_lower for w in ["average", "mean", "avg"]):
                agg_type = "mean"
                agg_label = "Average"

            grouped = df.groupby(cat_col)[num_col].agg(agg_type).reset_index()
            grouped[num_col] = grouped[num_col].round(2)
            grouped = grouped.sort_values(by=num_col, ascending=is_bottom).head(n)

            # Rename for display
            metric_col_name = f"{agg_label} {num_col}"
            result_data = []
            for _, r in grouped.iterrows():
                result_data.append({
                    cat_col: str(r[cat_col]),
                    metric_col_name: float(r[num_col])
                })

            direction = "Lowest" if is_bottom else "Top"
            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": f"{direction} {n} {cat_col} by {agg_label} {num_col}",
                "explanation": f"Aggregated {agg_label.lower()} '{num_col}' grouped by '{cat_col}', sorted in {'ascending' if is_bottom else 'descending'} order, and selected top {n} records.",
                "visualization_recommendation": "bar",
                "data": result_data,
                "columns": [cat_col, metric_col_name],
                "metric_value": f"{result_data[0][cat_col]} ({result_data[0][metric_col_name]:,.2f})" if result_data else None,
                "metric_label": f"#1 {cat_col}",
                "execution_time_ms": elapsed,
                "warnings": warnings
            }

        # 4. GROUP COMPARISONS (e.g. "compare average sales by region", "sales by category")
        if any(w in q_lower for w in ["compare", "breakdown", "by", "per", "grouped", "distribution of"]):
            cat_col = cls._find_category_column(q, df)
            num_col = cls._find_numeric_column(q, df)
            
            if not cat_col:
                cat_col = next((c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])), None)
            if not num_col:
                num_col = next((c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])), None)

            if not cat_col or not num_col:
                return cls._unsupported_response(q, df, "Please specify a category to group by and a numerical metric to measure.")

            agg_func = "mean" if any(w in q_lower for w in ["average", "mean", "avg"]) else "sum"
            agg_word = "Average" if agg_func == "mean" else "Total"

            agg_res = df.groupby(cat_col)[num_col].agg(agg_func).reset_index()
            agg_res[num_col] = agg_res[num_col].round(2)
            agg_res = agg_res.sort_values(by=num_col, ascending=False).head(15)

            display_col = f"{agg_word} {num_col}"
            res_data = [
                {cat_col: str(r[cat_col]), display_col: float(r[num_col])}
                for _, r in agg_res.iterrows()
            ]

            vis = "pie" if len(res_data) <= 6 else "bar"
            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": f"{agg_word} {num_col} by {cat_col}",
                "explanation": f"Grouped all rows by '{cat_col}' and calculated the {agg_word.lower()} value of '{num_col}'. Displaying top {len(res_data)} categories.",
                "visualization_recommendation": vis,
                "data": res_data,
                "columns": [cat_col, display_col],
                "metric_value": f"{sum(d[display_col] for d in res_data):,.2f}",
                "metric_label": f"Sum of {display_col}",
                "execution_time_ms": elapsed,
                "warnings": warnings
            }

        # 5. TIME TRENDS (e.g. "monthly sales trends", "trends over time")
        if any(w in q_lower for w in ["trend", "monthly", "daily", "timeline", "over time", "history"]):
            time_col = cls._find_time_column(df)
            num_col = cls._find_numeric_column(q, df)

            if not time_col:
                return {
                    "success": False,
                    "query": q,
                    "interpreted_action": "Time Series Trend Analysis",
                    "explanation": "No date or timestamp column detected in this dataset. Time trend visualizations require a temporal attribute (e.g. 'Date', 'CreatedAt').",
                    "visualization_recommendation": "table",
                    "data": [],
                    "columns": [],
                    "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                    "warnings": ["Temporal column missing. Suggest categorical aggregation instead."]
                }

            if not num_col:
                num_col = next((c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])), None)

            # Copy and parse date
            temp_df = df[[time_col, num_col]].dropna().copy()
            try:
                temp_df["_dt"] = pd.to_datetime(temp_df[time_col])
                # Determine frequency: monthly or daily
                if "month" in q_lower or len(temp_df) > 90:
                    temp_df["Period"] = temp_df["_dt"].dt.to_period("M").astype(str)
                else:
                    temp_df["Period"] = temp_df["_dt"].dt.strftime("%Y-%m-%d")
                    
                trend_df = temp_df.groupby("Period")[num_col].sum().reset_index()
                trend_df[num_col] = trend_df[num_col].round(2)
                trend_df = trend_df.sort_values(by="Period")

                trend_data = [
                    {"Period": str(r["Period"]), num_col: float(r[num_col])}
                    for _, r in trend_df.iterrows()
                ]

                elapsed = round((time.time() - start_time) * 1000, 2)
                return {
                    "success": True,
                    "query": q,
                    "interpreted_action": f"Time Trend of {num_col} across {time_col}",
                    "explanation": f"Converted '{time_col}' to datetime, aggregated total '{num_col}' by period, and generated temporal progression across {len(trend_data)} periods.",
                    "visualization_recommendation": "area",
                    "data": trend_data,
                    "columns": ["Period", num_col],
                    "metric_value": f"{trend_data[-1][num_col]:,.2f}" if trend_data else None,
                    "metric_label": f"Latest Period ({trend_data[-1]['Period']})" if trend_data else "",
                    "execution_time_ms": elapsed,
                    "warnings": warnings
                }
            except Exception as e:
                warnings.append(f"Date conversion issue: {str(e)}")

        # 6. ANOMALIES (e.g. "unusually large transactions", "find outliers")
        if any(w in q_lower for w in ["unusual", "outlier", "anomaly", "extreme", "large transaction"]):
            from app.services.anomaly_service import AnomalyService
            num_col = cls._find_numeric_column(q, df)
            target_cols = [num_col] if num_col else [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])][:2]
            if not target_cols:
                return cls._unsupported_response(q, df, "Anomaly detection requires at least one numerical column.")

            res = AnomalyService.detect_anomalies(df, target_cols, method="z_score")
            flagged = res.get("flagged_records", [])[:10]
            display_data = []
            for item in flagged:
                row_dict = item["data"]
                row_dict["_anomaly_score"] = item["anomaly_score"]
                row_dict["_flag_reason"] = item["flag_reason"]
                display_data.append(row_dict)

            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": f"Outlier & Anomaly Detection on {', '.join(target_cols)}",
                "explanation": f"Executed statistical anomaly detection on '{', '.join(target_cols)}'. Identified {res.get('anomaly_count', 0)} atypical observations ({res.get('anomaly_percentage', 0)}% of data).",
                "visualization_recommendation": "table",
                "data": display_data,
                "columns": list(display_data[0].keys()) if display_data else [],
                "metric_value": f"{res.get('anomaly_count', 0)} flagged",
                "metric_label": "Unusual Records Found",
                "execution_time_ms": elapsed,
                "warnings": warnings
            }

        # 7. FORECAST (e.g. "forecast next 3 periods", "predict revenue")
        if any(w in q_lower for w in ["forecast", "predict", "project", "future periods"]):
            from app.services.forecasting_service import ForecastingService
            num_col = cls._find_numeric_column(q, df)
            time_col = cls._find_time_column(df)
            
            h_match = re.search(r'\b(next|horizon)\s+(\d+)\b', q_lower)
            horizon = int(h_match.group(2)) if h_match else 3
            if "three" in q_lower:
                horizon = 3

            if not num_col:
                num_col = next((c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])), None)

            if not num_col or not time_col:
                return cls._unsupported_response(q, df, "Forecasting requires both a time/date column and a target numeric column.")

            fc_res = ForecastingService.generate_forecast(df, num_col, time_col, horizon_periods=horizon)
            pts_data = [
                {
                    "Period": p["period"],
                    "Historical": p["historical_value"],
                    "Forecast": p["forecast_value"],
                    "Lower Bound": p["lower_bound"],
                    "Upper Bound": p["upper_bound"]
                }
                for p in fc_res["points"]
            ]

            elapsed = round((time.time() - start_time) * 1000, 2)
            return {
                "success": True,
                "query": q,
                "interpreted_action": f"{horizon}-Period Statistical Forecast of {num_col}",
                "explanation": fc_res["method_description"],
                "visualization_recommendation": "line",
                "data": pts_data,
                "columns": ["Period", "Historical", "Forecast", "Lower Bound", "Upper Bound"],
                "metric_value": f"{fc_res['points'][-1]['forecast_value']:,.2f}" if fc_res["points"] else None,
                "metric_label": f"Projected Value ({fc_res['points'][-1]['period']})" if fc_res["points"] else "",
                "execution_time_ms": elapsed,
                "warnings": fc_res.get("warnings", [])
            }

        # Fallback: Unsupported question
        return cls._unsupported_response(q, df)

    @classmethod
    def _unsupported_response(cls, query: str, df: pd.DataFrame, reason: str = "") -> Dict[str, Any]:
        num_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        cat_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
        first_num = num_cols[0] if num_cols else "Value"
        first_cat = cat_cols[0] if cat_cols else "Category"

        suggestions = [
            f"Give me a summary of this dataset.",
            f"Show top 5 {first_cat} by {first_num}.",
            f"Compare average {first_num} by {first_cat}.",
            f"Which columns contain missing values?",
            f"Show monthly {first_num} trends.",
            f"Find unusually large {first_num} records.",
            f"Forecast the next 3 periods for {first_num}."
        ]

        explanation = (
            f"DataPilot AI's deterministic engine did not recognize the pattern of '{query}'. "
            + (f"({reason}) " if reason else "")
            + "To ensure mathematical correctness without hallucination, questions must match supported analytical patterns."
        )

        return {
            "success": False,
            "query": query,
            "interpreted_action": "Unsupported Query Pattern",
            "explanation": explanation,
            "visualization_recommendation": "table",
            "data": [{"Supported Question Pattern": s} for s in suggestions],
            "columns": ["Supported Question Pattern"],
            "metric_value": None,
            "metric_label": None,
            "execution_time_ms": 1.0,
            "warnings": [
                "No external LLM hallucination was used. Try one of the suggested query patterns above."
            ]
        }
