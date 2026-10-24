import React, { useState, useEffect } from 'react';
import {
  History,
  Sparkles,
  ArrowRight,
  Trash2,
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalysisHistory();
      setHistoryItems(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAnalysis(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Analysis Session History
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Audit trail of natural-language analytical questions and executed queries.
        </p>
      </div>

      {/* History Items Container */}
      <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#21352B]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Past Executions ({historyItems.length})
          </h3>
          <span className="text-xs text-[#69E7B8] font-mono">Real-time Telemetry</span>
        </div>

        {historyItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7A8E85] space-y-2">
            <History className="w-8 h-8 text-[#69E7B8]/30 mx-auto" />
            <p>No queries executed yet.</p>
            <button
              onClick={() => navigate('/analyze')}
              className="text-xs text-[#69E7B8] font-bold underline"
            >
              Ask your first data question &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#14241F] border border-[#23352C] hover:border-[#69E7B8]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#69E7B8] bg-[#69E7B8]/10 px-2 py-0.5 rounded-full border border-[#69E7B8]/20">
                      {item.interpreted_action}
                    </span>
                    <span className="text-xs text-[#7E938A] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.execution_time_ms} ms
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">"{item.query_text}"</p>
                  <p className="text-xs text-[#7F948B]">Dataset: {item.dataset_name}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => navigate('/analyze')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1A2D25] hover:bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/30 transition-colors"
                  >
                    <span>Re-run in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-[#6B7D75] hover:text-red-400 hover:bg-red-950/20 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
