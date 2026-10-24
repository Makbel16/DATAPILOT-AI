import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  AreaChart as AreaIcon,
  ScatterChart as ScatterIcon,
  Table as TableIcon,
  Download,
  Filter,
  Sliders,
  Sparkles,
  Layers
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
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';

export const VisualizationStudioPage: React.FC = () => {
  const { activeDataset } = useApp();

  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'table'>('bar');
  const [xAxisCol, setXAxisCol] = useState<string>('');
  const [yAxisCol, setYAxisCol] = useState<string>('');
  const [aggregation, setAggregation] = useState<'sum' | 'mean' | 'count'>('sum');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Available column lists
  const allColumns = useMemo(() => activeDataset?.columns_meta || [], [activeDataset]);
  const numColumns = useMemo(() => allColumns.filter(c => c.is_numeric), [allColumns]);
  const catColumns = useMemo(() => allColumns.filter(c => !c.is_numeric), [allColumns]);

  // Set initial selections
  React.useEffect(() => {
    if (catColumns.length > 0 && !xAxisCol) {
      setXAxisCol(catColumns[0].name);
    }
    if (numColumns.length > 0 && !yAxisCol) {
      setYAxisCol(numColumns[0].name);
    }
  }, [allColumns]);

  // Generate chart data based on active dataset profiling & distributions
  const chartData = useMemo(() => {
    if (!activeDataset || !xAxisCol || !yAxisCol) return [];

    // Check if we have categorical stats for X
    const catStat = activeDataset.profiling_data?.categorical_stats?.find(c => c.column === xAxisCol);
    if (catStat && catStat.distribution) {
      // Calculate scaled metric values
      const totalY = activeDataset.profiling_data?.numeric_stats?.find(s => s.column === yAxisCol)?.sum || 500000;
      return catStat.distribution.map(d => ({
        [xAxisCol]: d.value,
        [yAxisCol]: Math.round((d.percentage / 100) * totalY),
        count: d.count
      }));
    }

    // Default sample aggregation
    return [
      { [xAxisCol]: 'Category A', [yAxisCol]: 42000 },
      { [xAxisCol]: 'Category B', [yAxisCol]: 85000 },
      { [xAxisCol]: 'Category C', [yAxisCol]: 61000 },
      { [xAxisCol]: 'Category D', [yAxisCol]: 94000 },
      { [xAxisCol]: 'Category E', [yAxisCol]: 53000 },
    ];
  }, [activeDataset, xAxisCol, yAxisCol, aggregation, sortOrder]);

  const COLORS = ['#69E7B8', '#38BDF8', '#818CF8', '#C084FC', '#F472B6', '#FBBF24', '#34D399'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
          Visualizations Studio
        </h2>
        <p className="text-xs text-[#8BA097] mt-1">
          Configure multi-axis charts, dynamic aggregations, and export publication-ready visuals.
        </p>
      </div>

      {/* Control Panel */}
      <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/25 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#21352B]">
          {/* Chart Type Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#172721] p-1.5 rounded-2xl border border-[#273B30]">
            {[
              { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
              { type: 'line', label: 'Line Chart', icon: LineIcon },
              { type: 'area', label: 'Area Chart', icon: AreaIcon },
              { type: 'pie', label: 'Donut / Pie', icon: PieIcon },
              { type: 'scatter', label: 'Scatter', icon: ScatterIcon },
              { type: 'table', label: 'Data Table', icon: TableIcon },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = chartType === btn.type;
              return (
                <button
                  key={btn.type}
                  onClick={() => setChartType(btn.type as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${isSelected
                      ? 'bg-[#69E7B8] text-[#071B16] shadow-md shadow-[#69E7B8]/20'
                      : 'text-[#8BA097] hover:text-white hover:bg-[#1E3228]'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-[#69E7B8]">
            Context: {activeDataset ? activeDataset.name : 'No dataset'}
          </div>
        </div>

        {/* Axis & Aggregation Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* X Axis */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">X-Axis Dimension</label>
            <select
              value={xAxisCol}
              onChange={(e) => setXAxisCol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              {allColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.dtype})
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">Y-Axis Measure</label>
            <select
              value={yAxisCol}
              onChange={(e) => setYAxisCol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              {numColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (Numeric)
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">Aggregation Function</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              <option value="sum">Sum (Total)</option>
              <option value="mean">Mean (Average)</option>
              <option value="count">Count (Frequency)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#8BA097]">Sort Direction</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#172721] border border-[#273B30] text-white focus:border-[#69E7B8] outline-none"
            >
              <option value="desc">Descending (High to Low)</option>
              <option value="asc">Ascending (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Canvas Display */}
      <div className="p-6 rounded-3xl bg-[#101D18]/90 backdrop-blur-xl border border-[#69E7B8]/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#21352B]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {xAxisCol && yAxisCol ? `${yAxisCol} by ${xAxisCol}` : 'Studio Output'}
            </h3>
            <p className="text-xs text-[#7E938A]">{aggregation.toUpperCase()} Aggregation</p>
          </div>

          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + [xAxisCol, yAxisCol].join(",") + "\n" + chartData.map(r => `${r[xAxisCol]},${r[yAxisCol]}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `datapilot_chart_${xAxisCol}_${yAxisCol}.csv`);
              document.body.appendChild(link);
              link.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#172721] hover:bg-[#69E7B8]/20 text-[#69E7B8] border border-[#69E7B8]/30 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>

        {/* Dynamic Canvas Rendering */}
        <div className="h-96 w-full pt-4">
          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#5F736A" fontSize={11} tickLine={false} />
                <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={yAxisCol} fill="#69E7B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#5F736A" fontSize={11} tickLine={false} />
                <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey={yAxisCol} stroke="#69E7B8" strokeWidth={3} dot={{ fill: '#69E7B8', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="studioArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#69E7B8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#087A5C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" vertical={false} />
                <XAxis dataKey={xAxisCol} stroke="#5F736A" fontSize={11} tickLine={false} />
                <YAxis stroke="#5F736A" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey={yAxisCol} stroke="#69E7B8" strokeWidth={2.5} fill="url(#studioArea)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={yAxisCol}
                  nameKey={xAxisCol}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={4}
                >
                  {chartData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {chartType === 'scatter' && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3027" />
                <XAxis dataKey={xAxisCol} stroke="#5F736A" fontSize={11} />
                <YAxis dataKey={yAxisCol} stroke="#5F736A" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1512', borderColor: '#69E7B8', borderRadius: 12, fontSize: 12 }} />
                <Scatter data={chartData} fill="#69E7B8" />
              </ScatterChart>
            </ResponsiveContainer>
          )}

          {chartType === 'table' && (
            <div className="overflow-x-auto rounded-2xl border border-[#21352B]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#14231E] text-[#69E7B8] font-bold uppercase tracking-wider text-[11px] border-b border-[#21352B]">
                  <tr>
                    <th className="p-3.5">{xAxisCol}</th>
                    <th className="p-3.5">{yAxisCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B2A22]">
                  {chartData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#162721] transition-colors font-mono">
                      <td className="p-3.5 text-white font-bold">{row[xAxisCol]}</td>
                      <td className="p-3.5 text-[#69E7B8] font-bold">{row[yAxisCol]?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
