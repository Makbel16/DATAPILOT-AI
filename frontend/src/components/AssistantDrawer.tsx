import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Database,
  ArrowUpRight,
  TrendingUp,
  Table,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, QueryResult } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const AssistantDrawer: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, activeDataset } = useApp();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  if (!isAssistantOpen) return null;

  const exampleQuestions = [
    'Give me a summary of this dataset.',
    'Show the top five products by revenue.',
    'Compare average sales by region.',
    'Which columns contain missing values?',
    'Show monthly sales trends.',
    'Find unusually large transactions.',
    'Forecast the next three periods.'
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || !activeDataset) return;

    try {
      setLoading(true);
      setInputQuery(q);
      const res = await api.queryDataset(activeDataset.id, q);
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0F1A16] border-l border-[#69E7B8]/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#22352B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A3329] border border-[#69E7B8]/40 flex items-center justify-center text-[#69E7B8] shadow-md shadow-[#69E7B8]/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              DataPilot Assistant
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/30">
                Deterministic
              </span>
            </h2>
            <p className="text-[11px] text-[#788C83]">
              {activeDataset ? `Context: ${activeDataset.name}` : 'No dataset selected'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAssistantOpen(false)}
          className="p-2 rounded-xl text-[#6B7D75] hover:text-white hover:bg-[#1E2E27] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body: Chat & Results */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {!activeDataset ? (
          <div className="text-center py-12 space-y-3">
            <Database className="w-10 h-10 text-[#69E7B8]/40 mx-auto" />
            <p className="text-sm font-semibold text-white">Select a dataset to begin</p>
            <p className="text-xs text-[#7A8E85] max-w-xs mx-auto">
              Please load or select a dataset from the top bar before executing natural-language queries.
            </p>
          </div>
        ) : (
          <>
            {/* Suggested Question Chips */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[#69E7B8] uppercase tracking-wider">
                Contextual Questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(q)}
                    disabled={loading}
                    className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#172721] hover:bg-[#1F362E] text-[#CBE2D8] hover:text-white border border-[#2B4036] hover:border-[#69E7B8]/40 transition-all active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="p-4 rounded-2xl bg-[#14231E] border border-[#69E7B8]/20 flex items-center gap-3 text-xs text-[#69E7B8] animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Interpreting question and calculating exact dataset metrics...</span>
              </div>
            )}

            {/* Result Card */}
            {result && !loading && (
              <div className="p-4 rounded-2xl bg-[#14241F] border border-[#69E7B8]/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#69E7B8] bg-[#69E7B8]/10 px-2 py-0.5 rounded-full border border-[#69E7B8]/20">
                    {result.interpreted_action}
                  </span>
                  <span className="text-[10px] font-mono text-[#7D9188]">
                    {result.execution_time_ms} ms
                  </span>
                </div>

                <p className="text-xs text-[#D8E6DF] leading-relaxed">
                  {result.explanation}
                </p>

                {result.metric_value && (
                  <div className="p-3 rounded-xl bg-[#0D1814] border border-[#69E7B8]/20 flex items-center justify-between">
                    <span className="text-xs text-[#7F948B] font-medium">{result.metric_label || 'Calculated Metric'}</span>
                    <span className="text-sm font-extrabold text-[#69E7B8] font-mono">{result.metric_value}</span>
                  </div>
                )}

                {/* Data preview snippet */}
                {result.data && result.data.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-[#7F948B]">Result Sample</p>
                    <div className="max-h-36 overflow-y-auto rounded-lg bg-[#0E1A16] border border-[#253930] p-2 text-[11px] font-mono text-[#BCD0C7] space-y-1">
                      {result.data.slice(0, 4).map((row, i) => (
                        <div key={i} className="flex justify-between border-b border-[#1B2C24] pb-0.5 last:border-0">
                          <span className="truncate max-w-[160px]">{Object.values(row)[0] as string}</span>
                          <span className="text-[#69E7B8] font-bold">{Object.values(row)[1] as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link to full studio */}
                <button
                  onClick={() => {
                    setIsAssistantOpen(false);
                    navigate('/analyze');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#1D322A] hover:bg-[#69E7B8]/20 text-[#69E7B8] text-xs font-bold transition-colors"
                >
                  <span>Open Full Analysis Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer: Input Bar */}
      <div className="p-4 border-t border-[#22352B] bg-[#0E1714]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ask a question about your data..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={!activeDataset || loading}
            className="w-full pl-4 pr-11 py-2.5 text-xs rounded-xl bg-[#172520] border border-[#2F443A] focus:border-[#69E7B8] text-white placeholder-[#687C72] outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || !activeDataset || loading}
            className="absolute right-1.5 p-2 rounded-lg bg-[#69E7B8] text-[#071B16] disabled:opacity-40 transition-all hover:bg-[#45DDA8]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-[#63766D] text-center mt-2">
          Mathematical answers computed via Pandas & NumPy • Zero LLM hallucinations
        </p>
      </div>
    </div>
  );
};
