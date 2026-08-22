import React, { useState } from 'react';
import {
  ResponsiveContainer,
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
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart2,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ChartConfig } from '../types';

interface VisualizationsSectionProps {
  charts: ChartConfig[];
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

export const VisualizationsSection: React.FC<VisualizationsSectionProps> = ({ charts }) => {
  const [activeChartId, setActiveChartId] = useState<string>(
    charts.length > 0 ? charts[0].id : ''
  );
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  if (!charts || charts.length === 0) {
    return null;
  }

  const activeChart = charts.find((c) => c.id === activeChartId) || charts[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs backdrop-blur-md">
          <div className="font-semibold text-slate-200 mb-2 border-b border-slate-800 pb-1">
            {label}
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  ></span>
                  {entry.name}:
                </span>
                <span className="font-bold font-mono text-slate-100">
                  {typeof entry.value === 'number'
                    ? entry.value.toLocaleString()
                    : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = (chart: ChartConfig) => {
    const data = chart.data || [];
    const chartType = chart.chartType || 'bar';
    const xAxisKey = chart.xAxisKey || 'name';

    // Derive series keys if not provided
    const sampleItem = data[0] || {};
    const numericKeys = Object.keys(sampleItem).filter(
      (k) => typeof sampleItem[k] === 'number' && k !== xAxisKey
    );
    const series = chart.seriesKeys && chart.seriesKeys.length > 0
      ? chart.seriesKeys
      : numericKeys.map((k, i) => ({
          key: k,
          name: k.replace(/_/g, ' ').toUpperCase(),
          color: COLORS[i % COLORS.length],
        }));

    if (chartType === 'pie') {
      const valueKey = series[0]?.key || 'value';
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#94a3b8' }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey={valueKey}
              nameKey={xAxisKey}
              label={({ name, percent }: any) =>
                `${name}: ${((percent || 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: '#94a3b8' }}
            />
            {series.map((s, idx) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color || COLORS[idx % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: s.color || COLORS[idx % COLORS.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              {series.map((s, idx) => {
                const color = s.color || COLORS[idx % COLORS.length];
                return (
                  <linearGradient
                    key={`grad-${s.key}`}
                    id={`grad-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: '#94a3b8' }}
            />
            {series.map((s, idx) => {
              const color = s.color || COLORS[idx % COLORS.length];
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad-${s.key})`}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default Bar chart
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            dataKey={xAxisKey}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 10, fontSize: 12, color: '#94a3b8' }}
          />
          {series.map((s, idx) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color || COLORS[idx % COLORS.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <LineIcon className="w-4 h-4" />;
      case 'pie':
        return <PieIcon className="w-4 h-4" />;
      default:
        return <BarChart2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">
              Interactive Data Visualizations
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic statistical aggregations and metric breakdowns computed from your dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {charts.length > 1 && (
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Focused View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Charts ({charts.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Single Focused View */}
      {viewMode === 'single' && activeChart && (
        <div>
          {/* Chart Selection Tabs */}
          {charts.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {charts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChartId(c.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeChartId === c.id
                      ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 border shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border'
                  }`}
                >
                  {getChartIcon(c.chartType)}
                  <span>{c.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active Chart Presentation */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                {activeChart.title}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {activeChart.chartType}
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{activeChart.description}</p>
            </div>

            <div className="w-full pt-2">
              {renderChart(activeChart)}
            </div>
          </div>
        </div>
      )}

      {/* Grid View of all charts */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5"
            >
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  {chart.title}
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {chart.chartType}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{chart.description}</p>
              </div>
              <div className="w-full pt-2">
                {renderChart(chart)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
