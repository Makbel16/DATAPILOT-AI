import React from 'react';
import {
  User,
  Shield,
  CreditCard,
  HardDrive,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { metrics, theme, toggleTheme } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Settings & Account Telemetry
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Manage system preferences, quota allocations, and computational engine settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Appearance */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Profile Details
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1A3329] border border-[#69E7B8]/40 flex items-center justify-center font-extrabold text-lg text-[#69E7B8] shadow-lg shadow-[#69E7B8]/20">
                AR
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alex R.</p>
                <p className="text-xs text-[#7E938A]">alex.demo@datapilot.ai</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#69E7B8]/15 text-[#69E7B8] border border-[#69E7B8]/30">
                  Pro Plan Active
                </span>
              </div>
            </div>
          </div>

          {/* Theme & Display Preferences */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Visual Design Mode
            </h3>
            <p className="text-xs text-[#7E938A]">
              Toggle between the Emerald Glassmorphism dark mode and clean light mode.
            </p>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#172721] border border-[#273B30] hover:border-[#69E7B8]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-[#69E7B8]" /> : <Sun className="w-5 h-5 text-amber-400" />}
                <div className="text-left">
                  <p className="text-xs font-bold text-white">
                    {theme === 'dark' ? 'Dark Emerald Glassmorphism' : 'Clean Light Emerald'}
                  </p>
                  <p className="text-[10px] text-[#7E938A]">Click to switch theme</p>
                </div>
              </div>
              <span className="text-xs text-[#69E7B8] font-bold uppercase">{theme}</span>
            </button>
          </div>
        </div>

        {/* Middle & Right: Quota and Plan Tiers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Usage Quota Card */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#21352B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resource Usage & Quotas
              </h3>
              <span className="text-xs font-mono text-[#69E7B8]">Pro Plan Limits</span>
            </div>

            <div className="space-y-4">
              {/* Datasets Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8BA097]">Datasets Uploaded</span>
                  <span className="font-mono text-white font-bold">
                    {metrics?.datasets_analyzed || 1} / {metrics?.quota.max_datasets || 100}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#182721] overflow-hidden">
                  <div
                    className="h-full bg-[#69E7B8] rounded-full"
                    style={{ width: `${Math.min(100, ((metrics?.datasets_analyzed || 1) / (metrics?.quota.max_datasets || 100)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rows Processed Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8BA097]">Rows Processed</span>
                  <span className="font-mono text-white font-bold">
                    {(metrics?.rows_processed || 1500).toLocaleString()} / {(metrics?.quota.max_rows || 2000000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#182721] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#69E7B8] to-[#087A5C] rounded-full"
                    style={{ width: `${Math.min(100, ((metrics?.rows_processed || 1500) / (metrics?.quota.max_rows || 2000000)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Natural Language Queries */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8BA097]">Deterministic Queries Answered</span>
                  <span className="font-mono text-white font-bold">
                    {metrics?.questions_answered || 12} / {metrics?.quota.max_queries || 10000}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#182721] overflow-hidden">
                  <div
                    className="h-full bg-[#38BDF8] rounded-full"
                    style={{ width: `${Math.min(100, ((metrics?.questions_answered || 12) / (metrics?.quota.max_queries || 10000)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plan Tiers Overview (Honest Simulation) */}
          <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Available Subscription Tiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#14231E] border border-[#21352B] space-y-2">
                <p className="font-bold text-white">Free Student</p>
                <p className="text-xl font-extrabold text-[#69E7B8] font-mono">$0</p>
                <ul className="space-y-1 text-[#7E938A] text-[11px]">
                  <li>• 10 Datasets</li>
                  <li>• 50,000 Rows</li>
                  <li>• Deterministic NLP</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#162D24] border border-[#69E7B8] space-y-2 relative shadow-lg shadow-[#69E7B8]/15">
                <span className="absolute -top-2.5 right-3 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#69E7B8] text-[#071B16]">
                  Current
                </span>
                <p className="font-bold text-white">Professional</p>
                <p className="text-xl font-extrabold text-[#69E7B8] font-mono">$29/mo</p>
                <ul className="space-y-1 text-[#C6DDD3] text-[11px]">
                  <li>• 100 Datasets</li>
                  <li>• 2,000,000 Rows</li>
                  <li>• ML Anomaly Models</li>
                  <li>• Holt-Winters Forecasts</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#14231E] border border-[#21352B] space-y-2">
                <p className="font-bold text-white">Business Enterprise</p>
                <p className="text-xl font-extrabold text-[#69E7B8] font-mono">$99/mo</p>
                <ul className="space-y-1 text-[#7E938A] text-[11px]">
                  <li>• Unlimited Datasets</li>
                  <li>• 50,000,000 Rows</li>
                  <li>• Dedicated PostgreSQL</li>
                  <li>• Priority Execution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
