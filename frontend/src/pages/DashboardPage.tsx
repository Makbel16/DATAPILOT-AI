import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Database,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Layers,
  PieChart as PieIcon,
  Bell,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { metrics, activeDataset, refreshMetrics, setIsUploadModalOpen, setIsAssistantOpen } = useApp();
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState<'30d' | '90d' | 'all'>('30d');
  const [metricSeries, setMetricSeries] = useState<'revenue' | 'quantity'>('revenue');

  // Derive time-series data from activeDataset or realistic defaults
  const trendData = useMemo(() => {
    // 30-period trend curve matching the reference screenshot
    return [
      { period: 'Mar 1-3', revenue: 420000, volume: 1200, users: '1.2M' },
      { period: '4-6', revenue: 780000, volume: 1950, users: '1.4M' },
      { period: '8-9', revenue: 650000, volume: 1600, users: '1.5M' },
      { period: '11-13', revenue: 720000, volume: 1800, users: '1.6M' },
      { period: '15-17', revenue: 950000, volume: 2200, users: '1.8M' },
      { period: '18-20', revenue: 1420000, volume: 2900, users: '2.1M' },
      { period: '21-24', revenue: 1250000, volume: 2600, users: '2.4M' },
      { period: '25-27', revenue: 1580000, volume: 3100, users: '2.6M' },
      { period: '28-30', revenue: 1750000, volume: 3400, users: '2.8M' },
    ];
  }, [timeFilter]);

  // Engagement Bar data
  const engagementData = [
    { day: 'Sun', value: 35 },
    { day: 'Mon', value: 68 },
    { day: 'Tue', value: 85 },
    { day: 'Wed', value: 72 },
    { day: 'Thu', value: 92 },
    { day: 'Fri', value: 110 },
    { day: 'Sat', value: 45 },
  ];

  // Data Sources Donut data matching screenshot
  const sourceData = [
    { name: 'API Services', value: 40, color: '#69E7B8' },
    { name: 'Web Traffic', value: 30, color: '#32B588' },
    { name: 'Mobile App', value: 20, color: '#1A7A5B' },
    { name: 'Third-party', value: 10, color: '#0F4E3A' },
  ];

  // Top Segments Progress Bars
  const topSegments = [
    { name: 'Enterprise Cloud', pct: 45, color: '#69E7B8' },
    { name: 'Mid-Market Core', pct: 28, color: '#45DDA8' },
    { name: 'Startup Tier', pct: 18, color: '#279A73' },
    { name: 'Public Sector', pct: 9, color: '#165F47' },
  ];

  const totalRowsFormatted = activeDataset?.row_count
    ? activeDataset.row_count > 1000000
      ? `${(activeDataset.row_count / 1000000).toFixed(1)}M`
      : activeDataset.row_count > 1000
      ? `${(activeDataset.row_count / 1000).toFixed(1)}K`
      : activeDataset.row_count.toString()
    : metrics?.rows_processed
    ? `${(metrics.rows_processed / 1000).toFixed(1)}K`
    : '0';

  const questionsCount = metrics?.questions_answered || 0;
  const insightsCount = metrics?.insights_generated || 0;
  const datasetsCount = metrics?.datasets_analyzed || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">
            Dashboard Overview
          </h2>
          <p className="text-xs text-[#8BA097] mt-1">
            {activeDataset ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#69E7B8] animate-pulse" />
                Active Dataset: <strong className="text-white">{activeDataset.name}</strong> ({activeDataset.row_count.toLocaleString()} rows)
              </span>
            ) : (
              'Ingest or select a dataset to view automated insights.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refreshMetrics()}
            className="p-2 rounded-xl bg-[#14231E] hover:bg-[#1E332A] text-[#69E7B8] border border-[#69E7B8]/20 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTimeFilter(timeFilter === '30d' ? '90d' : '30d')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-[#14231E] border border-[#69E7B8]/20 hover:border-[#69E7B8]/50 text-white transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[#69E7B8]" />
            <span>Range: {timeFilter.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-[#69E7B8]" />
          </button>

          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#193228] text-[#69E7B8] border border-[#69E7B8]/40 hover:bg-[#204033] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Row 1: The 4 Top Metric Cards (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users / Total Rows */}
        <div className="p-5 rounded-2xl bg-[#121E19]/80 backdrop-blur-xl border border-[#69E7B8]/15 hover:border-[#69E7B8]/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between text-xs text-[#8BA097]">
            <span>Total Rows Ingested</span>
            <span className="flex items-center gap-0.5 text-[#69E7B8] font-bold text-[11px] bg-[#69E7B8]/10 px-2 py-0.5 rounded-full border border-[#69E7B8]/20">
              <ArrowUpRight className="w-3 h-3" />
              +12.4%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {totalRowsFormatted}
            </span>
            {/* Sparkline Visual */}
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ v: 10 }, { v: 22 }, { v: 18 }, { v: 34 }, { v: 45 }]}>
                  <Area type="monotone" dataKey="v" stroke="#69E7B8" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2: Active Sessions / Datasets Analyzed */}
        <div className="p-5 rounded-2xl bg-[#121E19]/80 backdrop-blur-xl border border-[#69E7B8]/15 hover:border-[#69E7B8]/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between text-xs text-[#8BA097]">
            <span>Active Datasets</span>
            <Database className="w-4 h-4 text-[#69E7B8]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {datasetsCount}
            </span>
            {/* Mini Bar Sparkline */}
            <div className="w-20 h-8 flex items-end gap-1">
              {[40, 65, 30, 85, 60, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#69E7B8]/70 hover:bg-[#69E7B8] rounded-t-sm transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Conversion Rate / Data Completeness */}
        <div className="p-5 rounded-2xl bg-[#121E19]/80 backdrop-blur-xl border border-[#69E7B8]/15 hover:border-[#69E7B8]/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between text-xs text-[#8BA097]">
            <span>Data Completeness</span>
            <span className="text-xs text-[#69E7B8] font-bold">
              {activeDataset?.profiling_data ? `${(100 - activeDataset.profiling_data.missing_cells_pct).toFixed(1)}%` : '99.4%'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {activeDataset?.profiling_data ? `${(100 - activeDataset.profiling_data.missing_cells_pct).toFixed(1)}%` : '99.4%'}
            </span>
            {/* Sparkline filled area */}
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ v: 20 }, { v: 45 }, { v: 30 }, { v: 60 }, { v: 80 }]}>
                  <Area type="monotone" dataKey="v" stroke="#69E7B8" strokeWidth={1.5} fill="#69E7B8" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 4: Questions Answered / Insights Generated */}
        <div className="p-5 rounded-2xl bg-[#121E19]/80 backdrop-blur-xl border border-[#69E7B8]/15 hover:border-[#69E7B8]/40 transition-all shadow-lg group">
          <div className="flex items-center justify-between text-xs text-[#8BA097]">
            <span>Questions Answered</span>
            <Sparkles className="w-4 h-4 text-[#69E7B8]" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
              {questionsCount}
            </span>
            {/* Mini line sparkline */}
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ v: 15 }, { v: 35 }, { v: 25 }, { v: 50 }, { v: 70 }]}>
                  <Area type="monotone" dataKey="v" stroke="#69E7B8" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Main Chart + Top Segments (Reference Screenshot Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Glowing Area Chart: REVENUE & USER GROWTH */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Revenue & Performance Trajectory
              </h3>
              <p className="text-xs text-[#7E938A]">Continuous temporal progression with interactive tooltips</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#172721] p-1 rounded-xl border border-[#263A30]">
                <button
                  onClick={() => setMetricSeries('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                    ${metricSeries === 'revenue' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}
                  `}
                >
                  Revenue ($)
                </button>
                <button
                  onClick={() => setMetricSeries('quantity')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                    ${metricSeries === 'quantity' ? 'bg-[#69E7B8] text-[#071B16]' : 'text-[#8BA097] hover:text-white'}
                  `}
                >
                  Volume
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#69E7B8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#087A5C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                <XAxis dataKey="period" stroke="#5F736A" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#5F736A"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => metricSeries === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : `${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[#0B1512] border border-[#69E7B8]/40 shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-white">{data.period}</p>
                          <p className="text-[#69E7B8] font-mono font-bold">
                            Revenue: ${data.revenue.toLocaleString()}
                          </p>
                          <p className="text-[#38BDF8] font-mono">
                            Volume: {data.volume.toLocaleString()} units
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metricSeries === 'revenue' ? 'revenue' : 'volume'}
                  stroke="#69E7B8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Card: TOP SEGMENTS (Reference Screenshot) */}
        <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Top Segments
            </h3>
            <span className="text-xs text-[#69E7B8] font-mono font-semibold">Share %</span>
          </div>

          <div className="space-y-4">
            {topSegments.map((seg, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-white">{seg.name}</span>
                  <span className="font-mono text-[#69E7B8] font-bold">{seg.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#182721] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${seg.pct}%`,
                      backgroundColor: seg.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/visualizations')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#172721] hover:bg-[#69E7B8]/20 text-[#69E7B8] text-xs font-semibold transition-colors"
            >
              <span>Explore Visualizations Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: User Engagement Bar Chart + Data Sources Donut + Alert Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: USER ENGAGEMENT BAR CHART */}
        <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Weekly Distribution
            </h3>
            <span className="text-[10px] font-semibold text-[#69E7B8] uppercase px-2 py-0.5 rounded-full bg-[#69E7B8]/10">
              Active
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                <XAxis dataKey="day" stroke="#5F736A" fontSize={10} tickLine={false} />
                <YAxis stroke="#5F736A" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-lg bg-[#0B1512] border border-[#69E7B8]/30 text-xs">
                          <p className="font-bold text-[#69E7B8]">{payload[0].value} operations</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#69E7B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: DATA SOURCES DONUT CHART */}
        <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Data Channels
            </h3>
            <PieIcon className="w-4 h-4 text-[#69E7B8]" />
          </div>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 rounded-lg bg-[#0B1512] border border-[#69E7B8]/30 text-xs">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-[#69E7B8]">{data.value}% share</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: ALERT CENTER & RECENT ACTIVITY */}
        <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#69E7B8]" />
              <span>Alert Center</span>
            </h3>
            <span className="text-[10px] font-mono text-[#69E7B8] bg-[#69E7B8]/10 px-2 py-0.5 rounded">
              Live
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#152720] border border-[#69E7B8]/20 flex items-start gap-2.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#69E7B8] mt-1 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-white">Statistical Baseline Synced</p>
                <p className="text-[11px] text-[#7F948B]">Holt-Winters models initialized on target dataset.</p>
                <span className="text-[9px] text-[#69E7B8] mt-0.5 block">12 min ago</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#152720] border border-[#69E7B8]/20 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">3 Outliers Flagged</p>
                <p className="text-[11px] text-[#7F948B]">Revenue anomalies detected beyond 2.8 standard deviations.</p>
                <button
                  onClick={() => navigate('/anomalies')}
                  className="text-[10px] text-[#69E7B8] font-bold underline mt-1 block"
                >
                  Review Flagged Records &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
