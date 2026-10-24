import React, { useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, AnomalyResult } from '../api/client';

export const AnomalyDetectionPage: React.FC = () => {
  const { activeDataset, refreshMetrics } = useApp();

  const [method, setMethod] = useState<'isolation_forest' | 'z_score' | 'iqr'>('isolation_forest');
  const [contamination, setContamination] = useState<number>(0.05);
  const [selectedCols, setSelectedCols] = useState<string[]>(['Revenue']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const numColumns = activeDataset?.columns_meta?.filter(c => c.is_numeric) || [];

  const handleToggleCol = (colName: string) => {
    if (selectedCols.includes(colName)) {
      if (selectedCols.length > 1) {
        setSelectedCols(selectedCols.filter(c => c !== colName));
      }
    } else {
      setSelectedCols([...selectedCols, colName]);
    }
  };

  const handleRunDetection = async () => {
    if (!activeDataset || selectedCols.length === 0) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.detectAnomalies({
        dataset_id: activeDataset.id,
        columns: selectedCols,
        method: method,
        contamination: contamination
      });
      setResult(res);
      await refreshMetrics();
    } catch (err: any) {
      setErrorMsg(err.message || 'Anomaly detection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Anomaly & Outlier Detection
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Machine-learning and statistical algorithms to flag multivariate divergences and atypical observations.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/25 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          {/* Algorithm Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-[#8BA097]">Detection Algorithm</label>
            <div className="space-y-1.5">
              {[
                { id: 'isolation_forest', label: 'Isolation Forest (Scikit-Learn ML)', desc: 'Multivariate decision trees' },
                { id: 'z_score', label: 'Z-Score (|Z| > 2.8)', desc: 'Standard deviation threshold' },
                { id: 'iqr', label: "Tukey's IQR Fences", desc: 'Interquartile range (1.5 * IQR)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl cursor-pointer border transition-all
                    ${method === opt.id
                      ? 'bg-[#152B22] border-[#69E7B8] text-white'
                      : 'bg-[#172721] border-[#273B30] text-[#A6BCB2] hover:bg-[#1C3228]'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="method"
                    value={opt.id}
                    checked={method === opt.id}
                    onChange={() => setMethod(opt.id as any)}
                    className="mt-0.5 accent-[#69E7B8]"
                  />
                  <div>
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] text-[#7E938A]">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Numerical Columns to Evaluate */}
          <div className="space-y-2">
            <label className="font-semibold text-[#8BA097]">Evaluated Numerical Columns</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {numColumns.map((c) => {
                const checked = selectedCols.includes(c.name);
                return (
                  <label
                    key={c.name}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border text-xs transition-colors
                      ${checked ? 'bg-[#152B22] border-[#69E7B8]/40 text-white' : 'bg-[#172721] border-[#273B30] text-[#8BA097]'}
                    `}
                  >
                    <span>{c.name}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCol(c.name)}
                      className="accent-[#69E7B8]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sensitivity & Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-[#8BA097]">
                <span>Contamination Factor</span>
                <span className="text-[#69E7B8] font-mono">{(contamination * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.15}
                step={0.01}
                value={contamination}
                onChange={(e) => setContamination(Number(e.target.value))}
                className="w-full accent-[#69E7B8]"
              />
              <p className="text-[10px] text-[#71857C]">
                Expected proportion of outliers in dataset.
              </p>
            </div>

            <button
              onClick={handleRunDetection}
              disabled={!activeDataset || loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] disabled:opacity-40 transition-all shadow-lg shadow-[#69E7B8]/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execute Anomaly Detection</span>
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

      {/* Detection Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#101D18]/90 border border-[#69E7B8]/20 text-center">
              <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Total Records Inspected</p>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                {result.total_records.toLocaleString()}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#101D18]/90 border border-[#69E7B8]/20 text-center">
              <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Flagged as Unusual</p>
              <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {result.anomaly_count} records
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-[#101D18]/90 border border-[#69E7B8]/20 text-center">
              <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Anomaly Rate</p>
              <p className="text-2xl font-bold text-[#69E7B8] font-mono mt-1">
                {result.anomaly_percentage}%
              </p>
            </div>
          </div>

          {/* Flagged Records Table */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Flagged Observations & Evidence
              </h3>
              <span className="text-xs text-[#7E938A]">{result.method_description}</span>
            </div>

            {result.flagged_records.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#69E7B8]">
                No significant statistical anomalies detected with current sensitivity settings.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                    <tr>
                      <th className="p-3.5">Row Index</th>
                      <th className="p-3.5">Anomaly Score</th>
                      <th className="p-3.5">Flag Reason / Deviation</th>
                      <th className="p-3.5">Key Record Attributes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B2A22]">
                    {result.flagged_records.map((rec) => (
                      <tr key={rec.index} className="hover:bg-[#152720] transition-colors font-mono">
                        <td className="p-3.5 font-bold text-white">#{rec.index}</td>
                        <td className="p-3.5 text-amber-400 font-bold">{rec.anomaly_score}</td>
                        <td className="p-3.5 text-[#D0DFD8] text-xs font-sans">{rec.flag_reason}</td>
                        <td className="p-3.5 text-[11px] text-[#7E938A] truncate max-w-sm">
                          {Object.entries(rec.data).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#162721] border border-[#273B30] text-[11px] text-[#8BA097] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#69E7B8] shrink-0" />
              <span>
                "Flagged as unusual" denotes statistical divergence from baseline patterns. Outliers can represent valuable business milestones or data collection events.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
