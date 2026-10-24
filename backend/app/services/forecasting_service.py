from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from datetime import timedelta
from statsmodels.tsa.holtwinters import SimpleExpSmoothing, ExponentialSmoothing

class ForecastingService:
    @staticmethod
    def generate_forecast(
        df: pd.DataFrame,
        target_column: str,
        time_column: Optional[str] = None,
        horizon_periods: int = 6,
        method: str = "holt_winters"
    ) -> Dict[str, Any]:
        """
        Executes statistical time-series forecasting with historical and projected points.
        """
        warnings: List[str] = []
        if target_column not in df.columns or not pd.api.types.is_numeric_dtype(df[target_column]):
            raise ValueError(f"Target column '{target_column}' is not numeric or not found.")

        # Identify time column if not supplied
        if not time_column:
            for c in df.columns:
                if pd.api.types.is_datetime64_any_dtype(df[c]) or "date" in c.lower() or "time" in c.lower():
                    time_column = c
                    break

        if not time_column:
            raise ValueError("A date or time column is required to construct a time-series forecast.")

        # Clean and sort
        sub_df = df[[time_column, target_column]].dropna().copy()
        try:
            sub_df["_dt"] = pd.to_datetime(sub_df[time_column])
        except Exception as e:
            raise ValueError(f"Could not parse '{time_column}' into valid datetimes: {str(e)}")

        sub_df = sub_df.sort_values(by="_dt")
        total_days = (sub_df["_dt"].max() - sub_df["_dt"].min()).days

        # Aggregate by month or week or day depending on span
        if total_days > 120:
            sub_df["Period"] = sub_df["_dt"].dt.to_period("M").astype(str)
            period_freq = "M"
        elif total_days > 30:
            sub_df["Period"] = sub_df["_dt"].dt.to_period("W").astype(str)
            period_freq = "W"
        else:
            sub_df["Period"] = sub_df["_dt"].dt.strftime("%Y-%m-%d")
            period_freq = "D"

        agg_series = sub_df.groupby("Period")[target_column].sum().reset_index()
        agg_series = agg_series.sort_values(by="Period")

        hist_vals = agg_series[target_column].values.astype(float)
        periods = list(agg_series["Period"].astype(str))
        n_hist = len(hist_vals)

        if n_hist < 3:
            raise ValueError(f"At least 3 aggregated historical time periods are required (found {n_hist}).")

        # Forecast modeling
        method_desc = ""
        forecast_future: List[float] = []
        mae = 0.0

        if method == "holt_winters" and n_hist >= 6:
            try:
                # Double exponential smoothing (trend)
                model = ExponentialSmoothing(hist_vals, trend="add", seasonal=None, initialization_method="estimated")
                fit = model.fit()
                forecast_future = list(fit.forecast(horizon_periods))
                fitted_past = fit.fittedvalues
                mae = float(np.mean(np.abs(hist_vals - fitted_past)))
                method_desc = f"Holt's Linear Trend Exponential Smoothing (additive trend) with {n_hist} historical {period_freq} periods."
            except Exception:
                method = "linear_trend"

        if method == "linear_trend" or not forecast_future:
            # Linear trend baseline with OLS
            x = np.arange(n_hist)
            slope, intercept = np.polyfit(x, hist_vals, 1)
            future_x = np.arange(n_hist, n_hist + horizon_periods)
            forecast_future = list(intercept + slope * future_x)
            fitted_past = intercept + slope * x
            mae = float(np.mean(np.abs(hist_vals - fitted_past)))
            method_desc = f"Linear Trend Statistical Regression with OLS trajectory across {n_hist} historical {period_freq} periods."

        # Compute standard error of residuals for confidence bounds
        residuals = hist_vals - fitted_past
        std_err = float(np.std(residuals)) if len(residuals) > 1 else (np.mean(hist_vals) * 0.1)

        # Assemble points
        points: List[Dict[str, Any]] = []

        # Historical points
        for i in range(n_hist):
            val = round(float(hist_vals[i]), 2)
            points.append({
                "period": periods[i],
                "historical_value": val,
                "forecast_value": None,
                "lower_bound": None,
                "upper_bound": None
            })

        # Future projected points
        last_period = periods[-1]
        for step in range(1, horizon_periods + 1):
            f_val = max(0.0, float(forecast_future[step - 1]))
            # Bound widening with future horizon
            margin = 1.96 * std_err * np.sqrt(1 + step * 0.15)
            l_bound = max(0.0, round(f_val - margin, 2))
            u_bound = round(f_val + margin, 2)
            
            future_label = f"+{step} {period_freq}"
            points.append({
                "period": future_label,
                "historical_value": None,
                "forecast_value": round(f_val, 2),
                "lower_bound": l_bound,
                "upper_bound": u_bound
            })

        rmse = float(np.sqrt(np.mean(residuals ** 2)))
        warnings.append("Forecasts assume historical conditions and patterns remain constant; statistical variance widens over time.")

        return {
            "success": True,
            "target_column": target_column,
            "time_column": time_column,
            "method": method,
            "method_description": method_desc,
            "horizon_periods": horizon_periods,
            "points": points,
            "metrics": {
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "historical_periods": n_hist
            },
            "warnings": warnings
        }
