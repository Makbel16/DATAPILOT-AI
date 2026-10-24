import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Database,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Table as TableIcon,
  AreaChart as AreaIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { api, QueryResult } from '../api/client';

export const AnalyzePage: React.FC = () => {
  const { activeDataset, refreshMetrics } = useApp();

  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [activeVisType, setActiveVisType] = useState<string>('bar');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const exampleQuestions = [
    'Give me a summary of this dataset.',
    'Show the top five products by revenue.',
    'Compare average sales by region.',
    'Which columns contain missing values?',
    'Show monthly sales trends.',
    'Find unusually large transactions.',
    'Forecast the next three periods.'
  ];

  const handleQuery = async (queryText?: string) => {
    const q = queryText || queryInput;
    if (!q.trim() || !activeDataset) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setQueryInput(q);
      const res = await api.queryDataset(activeDataset.id, q);
      setResult(res);
      setActiveVisType(res.visualization_recommendation || 'bar');
      await refreshMetrics();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing analytical query.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#69E7B8', '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FBBF24', '#34D399'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Analyze Data Studio
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Query your datasets in natural language. Deterministic execution via Pandas with zero hallucination.
        </p>
      </div>

      {/* Query Input Box */}
      <div className="p-6 rounded-3xl bg-[#111E19]/90 backdrop-blur-xl border border-[#69E7B8]/25 shadow-xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder={activeDataset ? "Ask: 'Show top 5 products by revenue' or 'Compare sales by region'..." : "Please select or upload a dataset first"}
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            disabled={!activeDataset || loading}
            className="w-full pl-5 pr-28 py-3.5 text-sm rounded-2xl bg-[#162721] border border-[#2D4337] focus:border-[#69E7B8] focus:ring-1 focus:ring-[#69E7B8] text-white placeholder-[#6D8378] outline-none transition-all shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!queryInput.trim() || !activeDataset || loading}
            className="absolute right-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#69E7B8] to-[#45DDA8] text-[#071B16] hover:from-[#45DDA8] hover:to-[#69E7B8] disabled:opacity-40 transition-all flex items-center gap-2 shadow-md shadow-[#69E7B8]/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask DataPilot</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Question Chips */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-[#69E7B8] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supported Analytical Questions (Click to Run)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuery(q)}
                disabled={!activeDataset || loading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#172721] hover:bg-[#1E362C] text-[#C6DDD3] hover:text-white border border-[#273B30] hover:border-[#69E7B8]/40 transition-all active:scale-95 disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 rounded-3xl bg-[#101D18]/90 border border-[#69E7B8]/20 text-center space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-[#69E7B8] animate-spin mx-auto" />
          <p className="text-sm font-bold text-white">Interpreting Query and Processing Real Data...</p>
          <p className="text-xs text-[#7B9085]">Executing deterministic pandas aggregation and statistical modeling.</p>
        </div>
      )}

      {/* Results Display */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Action & Explanation Banner */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/30 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#21352B]">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${result.success
                    ? 'bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }
                `}>
                  {result.interpreted_action}
                </span>
                <span className="text-xs text-[#7B9085] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {result.execution_time_ms} ms
                </span>
              </div>

              {/* View Switchers */}
              <div className="flex items-center gap-1.5 bg-[#172721] p-1 rounded-xl border border-[#273B30]">
                <button
                  onClick={() => setActiveVisType('bar')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${activeVisType === 'bar' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveVisType('area')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${activeVisType === 'area' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}`}
                  title="Area Chart"
                >
                  <AreaIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveVisType('pie')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${activeVisType === 'pie' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}`}
                  title="Pie Chart"
                >
                  <PieIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveVisType('table')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${activeVisType === 'table' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}`}
                  title="Data Table"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-[#D7E6DF] leading-relaxed">
              {result.explanation}
            </p>

            {result.metric_value && (
              <div className="p-4 rounded-2xl bg-[#0D1814] border border-[#69E7B8]/20 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#7F948B] font-medium">{result.metric_label || 'Calculated Key Result'}</p>
                  <p className="text-xl font-extrabold text-[#69E7B8] font-mono mt-0.5">{result.metric_value}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-[#69E7B8]" />
              </div>
            )}
          </div>

          {/* Interactive Chart / Table Container */}
          {result.data && result.data.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Calculated Results Visualization
                </h3>
                <span className="text-xs text-[#69E7B8] font-mono">
                  {result.data.length} records computed
                </span>
              </div>

              {/* Render Selected Visualization */}
              {activeVisType === 'bar' && (
                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                      <XAxis dataKey={result.columns[0]} stroke="#5F736A" fontSize={11} tickLine={false} />
                      <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey={result.columns[1]} fill="#69E7B8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeVisType === 'area' && (
                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.data}>
                      <defs>
                        <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#69E7B8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#087A5C" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                      <XAxis dataKey={result.columns[0]} stroke="#5F736A" fontSize={11} tickLine={false} />
                      <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey={result.columns[1]} stroke="#69E7B8" strokeWidth={2.5} fill="url(#areaGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeVisType === 'pie' && (
                <div className="h-80 w-full flex items-center justify-center pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.data}
                        dataKey={result.columns[1]}
                        nameKey={result.columns[0]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {result.data.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeVisType === 'table' && (
                <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                      <tr>
                        {result.columns.map((col) => (
                          <th key={col} className="p-3.5">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B2A22]">
                      {result.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#162721] transition-colors">
                          {result.columns.map((col) => (
                            <td key={col} className="p-3.5 text-[#D0DFD8] font-mono">
                              {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
