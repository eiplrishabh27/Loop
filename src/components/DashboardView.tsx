import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Flame,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Workspace, FeedbackItem, ThemeItem, VoCReport, User } from '../types/loop';

interface DashboardViewProps {
  workspace?: Workspace;
  currentUser?: User | null;
  analyticsData?: any;
  feedbackList?: FeedbackItem[];
  themes?: ThemeItem[];
  latestReport?: VoCReport | null;
  onNavigate?: (tab: string) => void;
  onSelectFeedback?: (item: FeedbackItem) => void;
  onSelectFeedbackItem?: (item: FeedbackItem) => void;
  onNavigateToInbox?: () => void;
  onNavigateToIngest?: () => void;
  onNavigateToThemes?: () => void;
  onNavigateToAsk?: () => void;
  onNavigateToReports?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  workspace,
  currentUser,
  analyticsData,
  feedbackList = [],
  themes = [],
  latestReport,
  onNavigate: customNavigate,
  onSelectFeedback: customSelectFeedback,
  onSelectFeedbackItem,
  onNavigateToInbox,
  onNavigateToIngest,
  onNavigateToThemes,
  onNavigateToAsk,
  onNavigateToReports,
}) => {
  const safeList = Array.isArray(feedbackList) ? feedbackList : [];
  const safeThemes = Array.isArray(themes) ? themes : [];

  const handleNav = (tab: string) => {
    if (customNavigate) {
      customNavigate(tab);
      return;
    }
    if (tab === 'inbox' && onNavigateToInbox) onNavigateToInbox();
    else if (tab === 'ingest' && onNavigateToIngest) onNavigateToIngest();
    else if (tab === 'themes' && onNavigateToThemes) onNavigateToThemes();
    else if (tab === 'ask' && onNavigateToAsk) onNavigateToAsk();
    else if (tab === 'reports' && onNavigateToReports) onNavigateToReports();
  };

  const handleSelect = (item: FeedbackItem) => {
    if (customSelectFeedback) {
      customSelectFeedback(item);
    } else if (onSelectFeedbackItem) {
      onSelectFeedbackItem(item);
    }
  };

  const posCount = safeList.filter((i) => i.sentiment === 'POSITIVE').length;
  const neuCount = safeList.filter((i) => i.sentiment === 'NEUTRAL').length;
  const negCount = safeList.filter((i) => i.sentiment === 'NEGATIVE').length;
  const actionedCount = safeList.filter((i) => i.status === 'ACTIONED').length;
  const criticalCount = safeList.filter((i) => i.urgency === 'CRITICAL').length;
  const avgSentimentScore = safeList.length > 0
    ? Math.round((safeList.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0) / safeList.length) * 100) / 100
    : 0.38;

  const stats = analyticsData?.summaryStats || {
    totalFeedback: safeList.length,
    avgSentiment: avgSentimentScore,
    criticalCount,
    actionedPct: safeList.length ? Math.round((actionedCount / safeList.length) * 100) : 0,
  };

  // Compute dynamic timeline from real items or fallback
  const volumeTimeline = React.useMemo(() => {
    if (analyticsData?.volumeTimeline && analyticsData.volumeTimeline.length > 0) {
      return analyticsData.volumeTimeline;
    }

    if (safeList.length === 0) {
      return [
        { date: 'Mon', positive: 12, neutral: 4, negative: 6 },
        { date: 'Tue', positive: 18, neutral: 6, negative: 8 },
        { date: 'Wed', positive: 15, neutral: 5, negative: 12 },
        { date: 'Thu', positive: 22, neutral: 8, negative: 9 },
        { date: 'Fri', positive: 28, neutral: 7, negative: 5 },
        { date: 'Sat', positive: 10, neutral: 3, negative: 2 },
        { date: 'Sun', positive: 14, neutral: 4, negative: 3 },
      ];
    }

    // Group items by last 7 days or date slice
    const dayMap: Record<string, { positive: number; neutral: number; negative: number }> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach((d) => (dayMap[d] = { positive: 0, neutral: 0, negative: 0 }));

    safeList.forEach((item) => {
      try {
        const d = new Date(item.createdAt);
        const dayName = days[d.getDay()] || 'Mon';
        if (item.sentiment === 'POSITIVE') dayMap[dayName].positive += 1;
        else if (item.sentiment === 'NEGATIVE') dayMap[dayName].negative += 1;
        else dayMap[dayName].neutral += 1;
      } catch {
        dayMap['Mon'].neutral += 1;
      }
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      date: day,
      ...dayMap[day],
    }));
  }, [analyticsData, safeList]);

  const sentimentBreakdown = analyticsData?.sentimentBreakdown || [
    { name: 'Positive Sentiment', value: posCount || 58, color: '#10b981' },
    { name: 'Neutral Feedback', value: neuCount || 24, color: '#64748b' },
    { name: 'Negative / Friction', value: negCount || 33, color: '#f43f5e' },
  ];

  // Dynamic feature area aggregation
  const topFeatureAreas = React.useMemo(() => {
    if (analyticsData?.topFeatureAreas && analyticsData.topFeatureAreas.length > 0) {
      return analyticsData.topFeatureAreas;
    }
    const areaMap: Record<string, { total: number; negative: number }> = {};
    safeList.forEach((item) => {
      const area = item.featureArea || 'General Platform';
      if (!areaMap[area]) areaMap[area] = { total: 0, negative: 0 };
      areaMap[area].total += 1;
      if (item.sentiment === 'NEGATIVE') areaMap[area].negative += 1;
    });

    const list = Object.entries(areaMap).map(([name, val]) => ({
      name,
      total: val.total,
      negative: val.negative,
    }));
    list.sort((a, b) => b.total - a.total);
    return list.length > 0 ? list : [
      { name: 'Security & SSO', total: 24, negative: 18 },
      { name: 'Billing & Invoicing', total: 19, negative: 11 },
      { name: 'Analytics & Reporting', total: 32, negative: 8 },
      { name: 'API & Webhooks', total: 15, negative: 6 },
    ];
  }, [analyticsData, safeList]);

  const urgentItems = safeList.filter((f) => f.urgency === 'CRITICAL' && f.status !== 'ACTIONED').slice(0, 5);
  const spikeThemes = safeThemes.filter((t) => t.isSpike || t.growthPct >= 30).slice(0, 3);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs backdrop-blur-md">
          <div className="font-semibold text-slate-200 mb-1 border-b border-slate-800 pb-1">
            {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Workspace: {workspace?.name || 'Production Workspace'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {workspace?.industry || 'B2B SaaS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Customer Feedback Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Turn scattered tickets, reviews, sales notes, and NPS into a ranked, evidence-backed list of what to build next.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleNav('ask')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask LOOP (AI Q&A)</span>
            </button>
            <button
              onClick={() => handleNav('reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>VoC Digest</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Total Feedback Ingested</span>
            <Inbox className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalFeedback}</div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">+18%</span> vs last 30 days
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Net Sentiment Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats.avgSentiment > 0 ? `+${stats.avgSentiment}` : stats.avgSentiment}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Scale: -1.0 (Critical Friction) to +1.0 (Delight)
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Active Critical Friction</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{stats.criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-2">
            High-urgency Enterprise / Security issues
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-400">Workflow Actioned Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.actionedPct}%</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Triaged through NEW → ACTIONED workflow
          </p>
        </div>
      </div>

      {/* Main Charts Row: Volume Timeline & Sentiment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Volume Over Time */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                Feedback Volume & Sentiment Velocity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily multi-channel ingestion volume segmented by sentiment polarity.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-800">
              Live Stream
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#64748b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative" name="Negative" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sentiment Distribution Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                Sentiment Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Overall customer sentiment distribution across all active channels.
            </p>

            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {sentimentBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
            {sentimentBreakdown.map((item: any, idx: number) => (
              <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-bold text-slate-100">{item.value}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.name.split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Feature Friction & Spike Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Feature Areas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Volume & Friction by Feature Area
            </h3>
            <button
              onClick={() => handleNav('inbox')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View In Inbox →
            </button>
          </div>

          <div className="space-y-3">
            {topFeatureAreas.slice(0, 6).map((area: any, idx: number) => {
              const negPct = area.total > 0 ? Math.round((area.negative / area.total) * 100) : 0;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{area.name}</span>
                    <span className="text-slate-400 font-mono">
                      {area.total} tickets ({negPct}% negative)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${100 - negPct}%` }}
                      className="bg-emerald-500 h-full"
                    ></div>
                    <div style={{ width: `${negPct}%` }} className="bg-rose-500 h-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spike Themes & Action Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                Spiking Theme Alerts & Priority Ranking
              </h3>
              <button
                onClick={() => handleNav('themes')}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                All Themes ({safeThemes.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {spikeThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => handleNav('themes')}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-100">{theme.name}</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{theme.growthPct}% Spike
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{theme.description}</p>
                  <div className="mt-2 text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800/80 font-mono">
                    <span className="text-cyan-400 font-semibold">Action:</span> {theme.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Priority score calculated from volume, tier & urgency</span>
            <button
              onClick={() => handleNav('ask')}
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              Ask AI about spikes →
            </button>
          </div>
        </div>
      </div>

      {/* Critical Triage Queue */}
      {urgentItems.length > 0 && (
        <div className="bg-slate-900/90 border border-rose-950/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Critical Enterprise Escalation Queue ({urgentItems.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Un-actioned critical issues flagged by AI classification.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNav('inbox')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
            >
              Open Inbox Triage
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {urgentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-lg transition-all cursor-pointer"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.2 rounded border border-rose-500/20">
                      CRITICAL
                    </span>
                    <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded">
                      {item.customerTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{item.content}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{item.customerCompany || item.customerName}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-[11px]">{item.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
