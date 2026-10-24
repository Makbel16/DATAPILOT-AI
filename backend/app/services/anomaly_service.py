from typing import Any, Dict, List
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyService:
    @staticmethod
    def detect_anomalies(
        df: pd.DataFrame,
        columns: List[str],
        method: str = "isolation_forest",
        contamination: float = 0.05
    ) -> Dict[str, Any]:
        """
        Executes statistical or machine learning anomaly detection on eligible numeric columns.
        """
        valid_cols = [c for c in columns if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
        if not valid_cols:
            raise ValueError(f"No valid numerical columns found among: {columns}")

        clean_df = df[valid_cols].dropna().copy()
        total_records = len(df)
        if len(clean_df) < 5:
            return {
                "success": False,
                "method": method,
                "method_description": "Insufficient observations for statistical anomaly detection.",
                "total_records": total_records,
                "anomaly_count": 0,
                "anomaly_percentage": 0.0,
                "flagged_records": [],
                "warnings": ["Dataset has fewer than 5 non-null rows in selected columns."]
            }

        flagged: List[Dict[str, Any]] = []
        method_desc = ""

        if method == "isolation_forest":
            method_desc = f"Isolation Forest algorithm (scikit-learn) with contamination factor of {contamination*100}%."
            clf = IsolationForest(contamination=contamination, random_state=42)
            preds = clf.fit_predict(clean_df[valid_cols])
            scores = clf.decision_function(clean_df[valid_cols])

            for idx, (pred, score) in enumerate(zip(preds, scores)):
                if pred == -1: # Outlier
                    original_idx = clean_df.index[idx]
                    orig_row = df.loc[original_idx].to_dict()
                    cleaned_row = {
                        k: (float(v) if isinstance(v, (np.floating, float)) and not np.isnan(v) else
                            int(v) if isinstance(v, (np.integer, int)) else str(v))
                        for k, v in orig_row.items()
                    }
                    flagged.append({
                        "index": int(original_idx),
                        "data": cleaned_row,
                        "anomaly_score": round(float(abs(score)), 4),
                        "flag_reason": f"Multivariate divergence detected across {', '.join(valid_cols)}."
                    })

        elif method == "iqr":
            method_desc = "Tukey's Fences Interquartile Range (IQR) with 1.5 * IQR threshold."
            outlier_indices = set()
            reasons = {}

            for col in valid_cols:
                q25 = clean_df[col].quantile(0.25)
                q75 = clean_df[col].quantile(0.75)
                iqr = q75 - q25
                lower = q25 - 1.5 * iqr
                upper = q75 + 1.5 * iqr

                mask = (clean_df[col] < lower) | (clean_df[col] > upper)
                for o_idx in clean_df[mask].index:
                    val = clean_df.loc[o_idx, col]
                    outlier_indices.add(o_idx)
                    dist = "below lower threshold" if val < lower else "above upper threshold"
                    reasons[o_idx] = f"{col} ({val:,.2f}) is {dist} [{lower:,.2f}, {upper:,.2f}]."

            for o_idx in outlier_indices:
                orig_row = df.loc[o_idx].to_dict()
                cleaned_row = {
                    k: (float(v) if isinstance(v, (np.floating, float)) and not np.isnan(v) else
                        int(v) if isinstance(v, (np.integer, int)) else str(v))
                    for k, v in orig_row.items()
                }
                flagged.append({
                    "index": int(o_idx),
                    "data": cleaned_row,
                    "anomaly_score": 1.0,
                    "flag_reason": reasons.get(o_idx, "Exceeded 1.5 * IQR fence")
                })

        else: # z_score
            method_desc = "Standard Z-Score threshold (|Z| > 2.8 standard deviations from mean)."
            outlier_indices = set()
            reasons = {}

            for col in valid_cols:
                mean = clean_df[col].mean()
                std = clean_df[col].std()
                if std > 0:
                    z_scores = (clean_df[col] - mean) / std
                    mask = z_scores.abs() > 2.8
                    for o_idx in clean_df[mask].index:
                        z_val = z_scores.loc[o_idx]
                        outlier_indices.add(o_idx)
                        reasons[o_idx] = f"{col} has Z-score of {z_val:.2f} (mean={mean:,.2f}, std={std:,.2f})."

            for o_idx in outlier_indices:
                orig_row = df.loc[o_idx].to_dict()
                cleaned_row = {
                    k: (float(v) if isinstance(v, (np.floating, float)) and not np.isnan(v) else
                        int(v) if isinstance(v, (np.integer, int)) else str(v))
                    for k, v in orig_row.items()
                }
                flagged.append({
                    "index": int(o_idx),
                    "data": cleaned_row,
                    "anomaly_score": round(float(abs(clean_df.loc[o_idx, valid_cols[0]] - clean_df[valid_cols[0]].mean()) / (clean_df[valid_cols[0]].std() or 1)), 2),
                    "flag_reason": reasons.get(o_idx, "Elevated Z-score")
                })

        flagged.sort(key=lambda x: x["anomaly_score"], reverse=True)
        anomaly_count = len(flagged)
        anomaly_pct = round((anomaly_count / total_records * 100), 2) if total_records > 0 else 0.0

        return {
            "success": True,
            "method": method,
            "method_description": method_desc,
            "total_records": total_records,
            "anomaly_count": anomaly_count,
            "anomaly_percentage": anomaly_pct,
            "flagged_records": flagged,
            "warnings": [
                "Flagged records are statistical outliers, which does not necessarily mean they are fraudulent or invalid."
            ]
        }
