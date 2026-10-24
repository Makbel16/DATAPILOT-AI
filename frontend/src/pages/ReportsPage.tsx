import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, ReportItem } from '../api/client';

export const ReportsPage: React.FC = () => {
  const { activeDataset, refreshMetrics } = useApp();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      setReports(res);
      if (res.length > 0 && !selectedReport) {
        setSelectedReport(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!activeDataset) return;
    try {
      setGenerating(true);
      const newRep = await api.generateReport(activeDataset.id, `Executive Intelligence Brief: ${activeDataset.name}`);
      await loadReports();
      setSelectedReport(newRep);
      await refreshMetrics();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this report?')) {
      try {
        await api.deleteReport(id);
        await loadReports();
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            Executive Intelligence Reports
          </h2>
          <p className="text-xs text-[#8BA097] mt-1">
            Automated executive summaries and data audit syntheses.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!activeDataset || generating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] disabled:opacity-40 transition-all shadow-lg shadow-[#69E7B8]/20"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Generate New Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#8BA097] uppercase tracking-wider">
            Generated Reports ({reports.length})
          </p>

          {reports.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#101D18]/80 border border-[#22352B] text-center space-y-2">
              <FileText className="w-8 h-8 text-[#69E7B8]/40 mx-auto" />
              <p className="text-xs text-[#8BA097]">No reports generated yet.</p>
              <button
                onClick={handleGenerate}
                disabled={!activeDataset}
                className="text-xs text-[#69E7B8] font-bold underline"
              >
                Generate First Report
              </button>
            </div>
          ) : (
            reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border
                    ${isSelected
                      ? 'bg-[#152B22] border-[#69E7B8] shadow-lg shadow-[#69E7B8]/15'
                      : 'bg-[#101D18]/80 hover:bg-[#14241F] border-[#22352B]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-xs text-white truncate">{rep.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(rep.id);
                      }}
                      className="text-[#65766E] hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#71857B] mt-1 truncate">{rep.dataset_name}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#69E7B8] mt-3 pt-2 border-t border-[#1C2C24]">
                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                    <span className="font-mono">{rep.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Report Viewer */}
        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="p-8 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/30 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#21352B]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#69E7B8] bg-[#69E7B8]/15 px-2.5 py-0.5 rounded-full border border-[#69E7B8]/30">
                    Verified Analysis Brief
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedReport.title}</h3>
                  <p className="text-xs text-[#7E938A] mt-0.5">
                    Dataset: {selectedReport.dataset_name} • Generated {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#172721] hover:bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>

              {/* Executive Summary Block */}
              <div className="p-5 rounded-2xl bg-[#0F1B16] border border-[#69E7B8]/20 space-y-2">
                <p className="text-xs font-bold uppercase text-[#69E7B8] tracking-wider">Executive Synthesis</p>
                <p className="text-xs text-[#D8E6DF] leading-relaxed">
                  {selectedReport.executive_summary}
                </p>
              </div>

              {/* Key Findings List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Automated Key Findings</p>
                <div className="space-y-2.5">
                  {selectedReport.findings?.map((find, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#14231E] border border-[#21352B] flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#69E7B8] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">{find.title}</p>
                        <p className="text-xs text-[#A6BCB2] mt-0.5 leading-relaxed">{find.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#101D18]/90 border border-[#21352B] text-center text-xs text-[#7A8E85]">
              Select a report from the left or generate a new report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
