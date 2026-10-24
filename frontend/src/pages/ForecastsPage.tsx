import React, { useState } from 'react';
import {
  TrendingUp,
  Sliders,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api, ForecastResult } from '../api/client';

export const ForecastsPage: React.FC = () => {
  const { activeDataset, refreshMetrics } = useApp();

  const [targetCol, setTargetCol] = useState<string>('Revenue');
  const [horizon, setHorizon] = useState<number>(6);
  const [method, setMethod] = useState<string>('holt_winters');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numColumns = activeDataset?.columns_meta?.filter(c => c.is_numeric) || [];

  const handleGenerateForecast = async () => {
    if (!activeDataset) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.runForecast({
        dataset_id: activeDataset.id,
        target_column: targetCol,
        horizon_periods: horizon,
        method: method
      });
      setResult(res);
      await refreshMetrics();
    } catch (err: any) {
      setErrorMsg(err.message || 'Forecast computation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Statistical Forecasting
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Holt-Winters exponential smoothing and linear trend models with empirical confidence bounds.
        </p>
      </div>

      {/* Control Configuration Card */}
      <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/25 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Target Column */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">Target Numeric Metric</label>
            <select
              value={targetCol}
              onChange={(e) => setTargetCol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              {numColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">Statistical Algorithm</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              <option value="holt_winters">Holt's Linear Trend (Double Exp)</option>
              <option value="linear_trend">Linear Regression Baseline (OLS)</option>
            </select>
          </div>

          {/* Horizon Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-[#8BA097]">
              <span>Horizon Periods</span>
              <span className="text-[#69E7B8] font-mono">{horizon} steps</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="w-full accent-[#69E7B8]"
            />
          </div>

          {/* Action Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateForecast}
              disabled={!activeDataset || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] disabled:opacity-40 transition-all shadow-lg shadow-[#69E7B8]/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Compute Forecast</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Forecast Output */}
      {result && (
        <div className="space-y-6">
          {/* Methodology Banner & Metrics */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/30 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#21352B]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#69E7B8] bg-[#69E7B8]/15 px-3 py-1 rounded-full border border-[#69E7B8]/30">
                  {result.method.replace('_', ' ').toUpperCase()} MODEL
                </span>
                <p className="text-sm font-semibold text-white mt-2">{result.method_description}</p>
              </div>

              {/* Model Metrics */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#0D1814] border border-[#21352B] text-center">
                  <p className="text-[10px] text-[#7F948B] uppercase">MAE</p>
                  <p className="text-[#69E7B8] font-bold mt-0.5">{result.metrics.mae?.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0D1814] border border-[#21352B] text-center">
                  <p className="text-[10px] text-[#7F948B] uppercase">RMSE</p>
                  <p className="text-[#69E7B8] font-bold mt-0.5">{result.metrics.rmse?.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0D1814] border border-[#21352B] text-center">
                  <p className="text-[10px] text-[#7F948B] uppercase">Hist Periods</p>
                  <p className="text-white font-bold mt-0.5">{result.metrics.historical_periods}</p>
                </div>
              </div>
            </div>

            {/* Warnings Disclaimer */}
            <div className="p-3 rounded-xl bg-[#162721] border border-[#2D4236] text-[11px] text-[#A6BCB2] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#69E7B8] shrink-0" />
              <span>
                Empirical 95% confidence intervals expand across future periods to reflect statistical variance.
              </span>
            </div>
          </div>

          {/* Main Forecast Chart */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Historical Trajectory vs Projected Horizon ({result.target_column})
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  Historical Actuals
                </span>
                <span className="flex items-center gap-1.5 text-[#69E7B8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#69E7B8]" />
                  Projected Values
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.points}>
                  <defs>
                    <linearGradient id="boundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#69E7B8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#087A5C" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                  <XAxis dataKey="period" stroke="#5F736A" fontSize={11} tickLine={false} />
                  <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }}
                  />
                  {/* Confidence Interval Upper/Lower */}
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="transparent"
                    fill="url(#boundGradient)"
                    name="Upper Bound (95%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="historical_value"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    dot={{ fill: '#FFFFFF', r: 4 }}
                    name="Historical"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast_value"
                    stroke="#69E7B8"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                    dot={{ fill: '#69E7B8', r: 5 }}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
