from typing import Any, Dict, List
import numpy as np
import pandas as pd

class ProfilingService:
    @staticmethod
    def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Performs thorough exploratory profiling on a pandas DataFrame.
        """
        row_count = int(len(df))
        col_count = int(len(df.columns))
        duplicate_count = int(df.duplicated().sum()) if row_count > 0 else 0
        total_cells = row_count * col_count
        missing_cells = int(df.isna().sum().sum())
        missing_pct = round((missing_cells / total_cells * 100), 2) if total_cells > 0 else 0.0

        columns_meta: List[Dict[str, Any]] = []
        numeric_stats: List[Dict[str, Any]] = []
        categorical_stats: List[Dict[str, Any]] = []

        for col in df.columns:
            series = df[col]
            non_null = int(series.count())
            null_count = int(series.isna().sum())
            distinct = int(series.nunique(dropna=True))
            
            # Type classification
            is_numeric = False
            is_datetime = False
            dtype_label = "string"

            if pd.api.types.is_numeric_dtype(series):
                is_numeric = True
                dtype_label = "integer" if pd.api.types.is_integer_dtype(series) else "float"
            elif pd.api.types.is_datetime64_any_dtype(series):
                is_datetime = True
                dtype_label = "datetime"
            elif pd.api.types.is_bool_dtype(series):
                dtype_label = "boolean"
            else:
                # Check if parseable as datetime
                if non_null > 0:
                    sample_non_null = series.dropna().iloc[:10]
                    try:
                        pd.to_datetime(sample_non_null)
                        is_datetime = True
                        dtype_label = "datetime"
                    except Exception:
                        dtype_label = "categorical" if distinct < max(20, row_count * 0.1) else "text"
                else:
                    dtype_label = "text"

            sample_vals = series.dropna().unique()[:5].tolist()
            # Clean samples for JSON serialization
            cleaned_samples = []
            for v in sample_vals:
                if isinstance(v, (np.integer, int)):
                    cleaned_samples.append(int(v))
                elif isinstance(v, (np.floating, float)):
                    cleaned_samples.append(round(float(v), 2) if not np.isnan(v) else None)
                else:
                    cleaned_samples.append(str(v))

            columns_meta.append({
                "name": col,
                "dtype": dtype_label,
                "non_null_count": non_null,
                "null_count": null_count,
                "distinct_count": distinct,
                "sample_values": cleaned_samples,
                "is_numeric": is_numeric,
                "is_datetime": is_datetime
            })

            # Numeric summary calculations
            if is_numeric and non_null > 0:
                s_clean = series.dropna()
                q25 = float(s_clean.quantile(0.25))
                median = float(s_clean.median())
                q75 = float(s_clean.quantile(0.75))
                iqr = q75 - q25
                outliers_count = int(((s_clean < (q25 - 1.5 * iqr)) | (s_clean > (q75 + 1.5 * iqr))).sum())

                numeric_stats.append({
                    "column": col,
                    "mean": round(float(s_clean.mean()), 2),
                    "std": round(float(s_clean.std()), 2) if len(s_clean) > 1 else 0.0,
                    "min": round(float(s_clean.min()), 2),
                    "q25": round(q25, 2),
                    "median": round(median, 2),
                    "q75": round(q75, 2),
                    "max": round(float(s_clean.max()), 2),
                    "sum": round(float(s_clean.sum()), 2),
                    "outliers_count": outliers_count
                })

            # Categorical distribution
            if not is_numeric and distinct > 0 and distinct <= 50:
                top_counts = series.value_counts(dropna=False).head(8)
                categorical_stats.append({
                    "column": col,
                    "distribution": [
                        {"value": str(k) if pd.notna(k) else "(Missing)", "count": int(v), "percentage": round(int(v) / row_count * 100, 1)}
                        for k, v in top_counts.items()
                    ]
                })

        return {
            "total_rows": row_count,
            "total_columns": col_count,
            "duplicate_rows": duplicate_count,
            "total_missing_cells": missing_cells,
            "missing_cells_pct": missing_pct,
            "columns_meta": columns_meta,
            "numeric_stats": numeric_stats,
            "categorical_stats": categorical_stats
        }
