import React, { useState, useEffect } from 'react';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Table as TableIcon,
  BarChart2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, Dataset } from '../api/client';

export const DatasetsPage: React.FC = () => {
  const { datasets, activeDataset, setActiveDataset, refreshDatasets, setIsUploadModalOpen, loadDemo } = useApp();

  const [selectedDs, setSelectedDs] = useState<Dataset | null>(activeDataset);
  const [activeTab, setActiveTab] = useState<'profiler' | 'preview' | 'stats'>('profiler');
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeDataset && !selectedDs) {
      setSelectedDs(activeDataset);
    }
  }, [activeDataset]);

  useEffect(() => {
    if (selectedDs && activeTab === 'preview') {
      loadPreview(selectedDs.id, page);
    }
  }, [selectedDs, activeTab, page]);

  const loadPreview = async (id: string, pg: number) => {
    try {
      setPreviewLoading(true);
      const res = await api.getDatasetPreview(id, pg, 20);
      setPreviewRows(res.rows);
      setPreviewCols(res.columns);
      setTotalPages(Math.ceil(res.total_rows / 20));
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      try {
        await api.deleteDataset(id);
        await refreshDatasets();
        if (selectedDs?.id === id) {
          setSelectedDs(null);
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
            Dataset Catalog & Profiler
          </h2>
          <p className="text-xs text-[#8BA097] mt-1">
            Automated schema introspection, missing value audit, and statistical summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDemo()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#152720] hover:bg-[#1E362C] text-[#69E7B8] border border-[#69E7B8]/30 transition-all"
          >
            Load Sample Dataset
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] shadow-lg shadow-[#69E7B8]/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Grid / Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((ds) => {
          const isSelected = selectedDs?.id === ds.id;
          return (
            <div
              key={ds.id}
              onClick={() => {
                setSelectedDs(ds);
                setActiveDataset(ds);
              }}
              className={`p-5 rounded-2xl cursor-pointer transition-all border
                ${isSelected
                  ? 'bg-[#152B22] border-[#69E7B8] shadow-[0_0_30px_-5px_rgba(105,231,184,0.3)]'
                  : 'bg-[#101D18]/80 hover:bg-[#14231E] border-[#22332A] hover:border-[#69E7B8]/30'
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                    ${isSelected ? 'bg-[#69E7B8] text-[#071B16] border-[#69E7B8]' : 'bg-[#172721] text-[#69E7B8] border-[#69E7B8]/20'}
                  `}>
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm text-white truncate">{ds.name}</p>
                    <p className="text-[11px] text-[#7E938A] truncate">{ds.original_filename}</p>
                  </div>
                </div>

                {ds.is_demo && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#69E7B8]/15 text-[#69E7B8] border border-[#69E7B8]/30">
                    Demo
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-inherit text-center text-xs">
                <div>
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Rows</p>
                  <p className="font-mono font-bold text-white mt-0.5">{ds.row_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Cols</p>
                  <p className="font-mono font-bold text-white mt-0.5">{ds.column_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Missing</p>
                  <p className="font-mono font-bold text-[#69E7B8] mt-0.5">
                    {ds.profiling_data ? `${ds.profiling_data.missing_cells_pct}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Dataset Detail Inspection View */}
      {selectedDs && (
        <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-6">
          {/* Top Inspector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#21352B]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{selectedDs.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#172721] text-[#69E7B8] border border-[#69E7B8]/30">
                  {(selectedDs.file_size_bytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <p className="text-xs text-[#7E938A] mt-0.5">
                Ingested {new Date(selectedDs.created_at).toLocaleDateString()} • {selectedDs.original_filename}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Tab Switcher */}
              <div className="flex items-center bg-[#172721] p-1 rounded-xl border border-[#273B30] text-xs">
                <button
                  onClick={() => setActiveTab('profiler')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all
                    ${activeTab === 'profiler' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}
                  `}
                >
                  Schema Profiler
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all
                    ${activeTab === 'stats' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}
                  `}
                >
                  Numeric Stats
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all
                    ${activeTab === 'preview' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}
                  `}
                >
                  Data Preview
                </button>
              </div>

              {/* Working Export CSV */}
              <a
                href={api.getExportUrl(selectedDs.id)}
                download={selectedDs.original_filename}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#172721] hover:bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/30 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>

              {/* Delete Dataset */}
              <button
                onClick={() => handleDelete(selectedDs.id)}
                className="p-2 rounded-xl text-[#7E938A] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Delete dataset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TAB 1: Schema Profiler */}
          {activeTab === 'profiler' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#14231E] border border-[#23352C]">
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Total Records</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {selectedDs.row_count.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14231E] border border-[#23352C]">
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Attributes</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {selectedDs.column_count}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14231E] border border-[#23352C]">
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Duplicate Rows</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {selectedDs.profiling_data?.duplicate_rows || 0}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14231E] border border-[#23352C]">
                  <p className="text-[10px] text-[#7E938A] uppercase font-semibold">Missing Rate</p>
                  <p className="text-xl font-bold text-[#69E7B8] font-mono mt-1">
                    {selectedDs.profiling_data?.missing_cells_pct || 0}%
                  </p>
                </div>
              </div>

              {/* Column Meta Table */}
              <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                    <tr>
                      <th className="p-3.5">Column Name</th>
                      <th className="p-3.5">Inferred Type</th>
                      <th className="p-3.5">Non-Null Count</th>
                      <th className="p-3.5">Distinct Values</th>
                      <th className="p-3.5">Sample Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B2A22]">
                    {selectedDs.columns_meta?.map((col) => (
                      <tr key={col.name} className="hover:bg-[#152720] transition-colors">
                        <td className="p-3.5 font-bold text-white">{col.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#172721] text-[#69E7B8] border border-[#69E7B8]/20">
                            {col.dtype}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[#D0DFD8]">{col.non_null_count.toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-[#D0DFD8]">{col.distinct_count}</td>
                        <td className="p-3.5 text-[#7E938A] font-mono text-[11px] truncate max-w-xs">
                          {col.sample_values?.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Numeric Stats */}
          {activeTab === 'stats' && (
            <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                  <tr>
                    <th className="p-3.5">Numeric Field</th>
                    <th className="p-3.5">Mean</th>
                    <th className="p-3.5">Std Dev</th>
                    <th className="p-3.5">Min</th>
                    <th className="p-3.5">25% (Q1)</th>
                    <th className="p-3.5">Median</th>
                    <th className="p-3.5">75% (Q3)</th>
                    <th className="p-3.5">Max</th>
                    <th className="p-3.5">Outliers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2A22]">
                  {selectedDs.profiling_data?.numeric_stats?.map((st) => (
                    <tr key={st.column} className="hover:bg-[#152720] transition-colors font-mono">
                      <td className="p-3.5 font-bold text-white">{st.column}</td>
                      <td className="p-3.5 text-[#69E7B8] font-bold">{st.mean?.toLocaleString()}</td>
                      <td className="p-3.5 text-[#D0DFD8]">{st.std?.toLocaleString()}</td>
                      <td className="p-3.5 text-[#D0DFD8]">{st.min?.toLocaleString()}</td>
                      <td className="p-3.5 text-[#D0DFD8]">{st.q25?.toLocaleString()}</td>
                      <td className="p-3.5 text-white font-bold">{st.median?.toLocaleString()}</td>
                      <td className="p-3.5 text-[#D0DFD8]">{st.q75?.toLocaleString()}</td>
                      <td className="p-3.5 text-[#D0DFD8]">{st.max?.toLocaleString()}</td>
                      <td className="p-3.5 text-amber-400">{st.outliers_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Data Preview Table */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              {previewLoading ? (
                <div className="p-8 text-center text-xs text-[#69E7B8]">Loading preview rows...</div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                        <tr>
                          {previewCols.map((col) => (
                            <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1B2A22]">
                        {previewRows.map((r, i) => (
                          <tr key={i} className="hover:bg-[#152720] transition-colors font-mono">
                            {previewCols.map((col) => (
                              <td key={col} className="p-3 whitespace-nowrap text-[#D0DFD8]">
                                {r[col] !== null ? String(r[col]) : <span className="text-red-400/80">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between text-xs text-[#7E938A] pt-2">
                    <span>Page {page} of {totalPages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                        className="px-3 py-1.5 rounded-lg bg-[#162721] hover:bg-[#1E362C] text-white disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-3 py-1.5 rounded-lg bg-[#162721] hover:bg-[#1E362C] text-white disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
