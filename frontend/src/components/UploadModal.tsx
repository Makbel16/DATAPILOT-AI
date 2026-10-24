import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Database
} from 'lucide-react';
import { api, Dataset } from '../api/client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen, refreshDatasets, setActiveDataset, refreshMetrics } = useApp();
  const navigate = useNavigate();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedDataset, setUploadedDataset] = useState<Dataset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext || '')) {
      setErrorMsg('Unsupported format. Please upload a .CSV or .XLSX file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File exceeds 50MB maximum size limit.');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    if (!customName) {
      setCustomName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      setUploadProgress(30);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      const newDs = await api.uploadDataset(selectedFile, customName);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedDataset(newDs);
      await refreshDatasets();
      setActiveDataset(newDs);
      await refreshMetrics();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCustomName('');
    setErrorMsg(null);
    setUploadedDataset(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    handleReset();
    setIsUploadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#111C18] border border-[#69E7B8]/30 shadow-[0_0_60px_-15px_rgba(105,231,184,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#22352B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2E25] border border-[#69E7B8]/30 flex items-center justify-center text-[#69E7B8]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Dataset</h2>
              <p className="text-xs text-[#7F928A]">Upload CSV or Excel for automated deterministic profiling.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#6B7D75] hover:text-white hover:bg-[#1C2C24] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!uploadedDataset ? (
            <>
              {/* Drag and Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center
                  ${dragActive
                    ? 'border-[#69E7B8] bg-[#69E7B8]/10 shadow-[0_0_30px_rgba(105,231,184,0.2)]'
                    : 'border-[#2C4035] hover:border-[#69E7B8]/60 bg-[#16241F]/60'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-[#1C3027] border border-[#69E7B8]/30 flex items-center justify-center mb-4 text-[#69E7B8]">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-white text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-[#69E7B8]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-white text-sm">
                      Click to browse or drag & drop file here
                    </p>
                    <p className="text-xs text-[#71857C]">
                      Supports .CSV and .XLSX files up to 50 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Dataset Custom Name Input */}
              {selectedFile && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#A6B8B0]">Dataset Display Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Q3 Sales Performance 2026"
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#172520] border border-[#2B3F34] focus:border-[#69E7B8] text-white outline-none"
                  />
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[#69E7B8]">
                    <span>Profiling & Parsing Dataset...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#182621] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#69E7B8] to-[#087A5C] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BAEA5] hover:text-white hover:bg-[#1E2E27] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || uploading}
                  onClick={handleUploadSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#69E7B8]/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload & Profile</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Upload Success Inspection Summary */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-[#152821] border border-[#69E7B8]/40 flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#69E7B8] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Dataset Successfully Ingested</h3>
                  <p className="text-xs text-[#8BA097]">{uploadedDataset.name}</p>
                </div>
              </div>

              {/* Key Profiling Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#15231E] border border-[#23352C] text-center">
                  <p className="text-[10px] uppercase font-semibold text-[#69E7B8]">Total Rows</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {uploadedDataset.row_count.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#15231E] border border-[#23352C] text-center">
                  <p className="text-[10px] uppercase font-semibold text-[#69E7B8]">Columns</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {uploadedDataset.column_count}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#15231E] border border-[#23352C] text-center">
                  <p className="text-[10px] uppercase font-semibold text-[#69E7B8]">Duplicates</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {uploadedDataset.profiling_data?.duplicate_rows || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#15231E] border border-[#23352C] text-center">
                  <p className="text-[10px] uppercase font-semibold text-[#69E7B8]">Null Rate</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {uploadedDataset.profiling_data?.missing_cells_pct || 0}%
                  </p>
                </div>
              </div>

              {/* Detected Columns Pills */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#92A59D]">Detected Attributes</p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {uploadedDataset.columns_meta?.map((col) => (
                    <span
                      key={col.name}
                      className="px-2.5 py-1 rounded-lg bg-[#182721] border border-[#69E7B8]/20 text-[11px] font-medium text-white flex items-center gap-1.5"
                    >
                      <span>{col.name}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-[#0F1C17] text-[#69E7B8]">
                        {col.dtype}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23352C]">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BAEA5] hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/analyze');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#69E7B8] text-[#071B16] hover:bg-[#45DDA8] transition-all shadow-lg shadow-[#69E7B8]/20"
                >
                  <span>Start Natural-Language Query</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
