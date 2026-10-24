import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Database,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Cpu,
  Layers,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemo } = useApp();

  const handleStartAnalyzing = () => {
    navigate('/dashboard');
  };

  const handleExploreDemo = async () => {
    await loadDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07130F] text-[#E1E8E5] font-sans selection:bg-[#69E7B8]/30 selection:text-[#69E7B8] overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#69E7B8]/15 to-transparent blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-[#087A5C]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-[#0D261F]/40 rounded-full blur-[180px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between border-b border-[#1C2C24]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#69E7B8] to-[#087A5C] p-0.5 shadow-lg shadow-[#69E7B8]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0D1814] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#69E7B8]" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-[#69E7B8] bg-clip-text text-transparent">
              DATAPILOT AI
            </span>
            <span className="text-[10px] font-semibold text-[#69E7B8]/80 block tracking-wider uppercase">
              SaaS Analytics
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#95A59E]">
          <a href="#features" className="hover:text-[#69E7B8] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#69E7B8] transition-colors">How It Works</a>
          <a href="#methodology" className="hover:text-[#69E7B8] transition-colors">Deterministic AI</a>
          <a href="#security" className="hover:text-[#69E7B8] transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExploreDemo}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69E7B8] bg-[#162921] hover:bg-[#1E362C] border border-[#69E7B8]/30 transition-all"
          >
            Explore Demo
          </button>
          <button
            onClick={handleStartAnalyzing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#69E7B8] hover:bg-[#45DDA8] text-[#071B16] shadow-lg shadow-[#69E7B8]/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Analyzing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#152B22] border border-[#69E7B8]/40 shadow-sm shadow-[#69E7B8]/10 text-xs font-bold text-[#69E7B8] animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Generation Emerald Analytics SaaS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Your Data. Your Questions.{' '}
          <span className="bg-gradient-to-r from-[#69E7B8] via-[#45DDA8] to-[#087A5C] bg-clip-text text-transparent">
            Clear Answers.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#9DB1A7] max-w-2xl mx-auto leading-relaxed">
          Turn CSV and Excel files into useful insights with intelligent analysis, interactive visualizations, and understandable explanations.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleStartAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#69E7B8] to-[#45DDA8] hover:from-[#45DDA8] hover:to-[#69E7B8] text-[#071B16] shadow-[0_0_40px_rgba(105,231,184,0.35)] transition-all transform hover:-translate-y-1 cursor-pointer"
          >
            <span>Start Analyzing</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleExploreDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-[#152720]/80 hover:bg-[#1D362C] border border-[#69E7B8]/40 text-[#69E7B8] shadow-md transition-all cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Explore Demo Dataset</span>
          </button>
        </div>

        {/* Format Badges */}
        <div className="flex items-center justify-center gap-4 pt-6 text-xs text-[#7A8E85]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#69E7B8]" />
            CSV & Excel (.XLSX)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#69E7B8]" />
            Deterministic NLP
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-[#69E7B8]" />
            Zero External API Costs
          </span>
        </div>
      </section>

      {/* Hero Product Preview Card (Emerald Glassmorphism) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-[#69E7B8]/40 via-[#087A5C]/20 to-transparent shadow-[0_0_80px_-20px_rgba(105,231,184,0.3)]">
          <div className="rounded-[22px] bg-[#0E1A16]/90 backdrop-blur-2xl border border-[#69E7B8]/20 p-6 sm:p-8 space-y-6">
            {/* Mock Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#21352B]">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-[#69E7B8]">DataPilot AI v1.0.0 — Live Analytics Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#182B23] text-[#69E7B8] border border-[#69E7B8]/30 font-medium">
                  Dataset: Global SaaS Revenue (1,500 rows)
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#14231E]/80 border border-[#69E7B8]/15">
                <p className="text-xs text-[#7F948B]">Total Revenue</p>
                <p className="text-2xl font-extrabold text-white mt-1">$1.42M</p>
                <span className="text-[10px] text-[#69E7B8] font-bold mt-1 inline-block">+14.2% vs baseline</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#14231E]/80 border border-[#69E7B8]/15">
                <p className="text-xs text-[#7F948B]">Active Transactions</p>
                <p className="text-2xl font-extrabold text-white mt-1">1,500</p>
                <span className="text-[10px] text-[#69E7B8] font-bold mt-1 inline-block">100% Ingested</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#14231E]/80 border border-[#69E7B8]/15">
                <p className="text-xs text-[#7F948B]">Data Completeness</p>
                <p className="text-2xl font-extrabold text-white mt-1">99.8%</p>
                <span className="text-[10px] text-[#69E7B8] font-bold mt-1 inline-block">0 Duplicate Rows</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#14231E]/80 border border-[#69E7B8]/15">
                <p className="text-xs text-[#7F948B]">Flagged Anomalies</p>
                <p className="text-2xl font-extrabold text-white mt-1">3</p>
                <span className="text-[10px] text-[#69E7B8] font-bold mt-1 inline-block">Isolation Forest</span>
              </div>
            </div>

            {/* Interactive Query Simulator Box */}
            <div className="p-4 rounded-2xl bg-[#13221C] border border-[#69E7B8]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1B362A] text-[#69E7B8] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Ask in natural language:</p>
                  <p className="text-xs text-[#69E7B8] font-mono mt-0.5">"Show the top five products by revenue"</p>
                </div>
              </div>
              <button
                onClick={handleExploreDemo}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#69E7B8] text-[#071B16] hover:bg-[#45DDA8] transition-colors"
              >
                Run Live Query
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#1C2C24]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineered for Precision Analytics
          </h2>
          <p className="text-sm text-[#8BA196]">
            Every metric is mathematically calculated from your data. No hallucinated figures, no privacy leaks, and no external AI API dependency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0F1C18] border border-[#69E7B8]/20 hover:border-[#69E7B8]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#172D24] border border-[#69E7B8]/30 flex items-center justify-center text-[#69E7B8]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Natural Language</h3>
            <p className="text-xs text-[#8BA097] leading-relaxed">
              Ask questions like "compare sales by region" or "find top products by revenue". Queries map directly to audited aggregation pipelines.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F1C18] border border-[#69E7B8]/20 hover:border-[#69E7B8]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#172D24] border border-[#69E7B8]/30 flex items-center justify-center text-[#69E7B8]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Statistical Forecasting</h3>
            <p className="text-xs text-[#8BA097] leading-relaxed">
              Holt-Winters double exponential smoothing and linear trend models project future intervals with empirical confidence bounds and error metrics.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0F1C18] border border-[#69E7B8]/20 hover:border-[#69E7B8]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#172D24] border border-[#69E7B8]/30 flex items-center justify-center text-[#69E7B8]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Machine Learning Anomaly Detection</h3>
            <p className="text-xs text-[#8BA097] leading-relaxed">
              Isolation Forest and Z-Score algorithms identify extreme multivariate outliers and anomalous transactions with clear explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Honest Limitations & Architecture */}
      <section id="methodology" className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="p-8 rounded-3xl bg-[#111F1A] border border-[#69E7B8]/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C3329] text-[#69E7B8] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Honest AI Architecture & Scope</h3>
              <p className="text-xs text-[#7F948B]">Academic and production integrity disclosure</p>
            </div>
          </div>
          <p className="text-xs text-[#B5CAC0] leading-relaxed">
            DataPilot AI uses a deterministic grammar interpreter paired with Pandas, NumPy, and Scikit-Learn.
            Unlike generative LLMs that may hallucinate numbers, DataPilot AI guarantees that all calculations are derived from real dataset rows.
            If a question is outside the documented analytical grammar, the system transparently indicates the limitation and suggests supported patterns.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1C2C24] py-12 text-center text-xs text-[#7A8E85]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">DataPilot AI</span>
            <span>— CS Graduation Capstone & Production SaaS</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleStartAnalyzing} className="hover:text-[#69E7B8]">Dashboard</button>
            <button onClick={handleExploreDemo} className="hover:text-[#69E7B8]">Demo</button>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
