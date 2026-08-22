import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Flame,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Quote,
  Zap,
  Target,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ThemeItem, UserRole } from '../types/loop';

interface ThemeTrendsViewProps {
  themes: ThemeItem[];
  onRecluster: () => Promise<void>;
  userRole: UserRole;
  onFilterByTheme: (themeName: string) => void;
}

export const ThemeTrendsView: React.FC<ThemeTrendsViewProps> = ({
  themes,
  onRecluster,
  userRole,
  onFilterByTheme,
}) => {
  const [isClustering, setIsClustering] = useState(false);
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(themes[0]?.id || null);

  const handleClusterClick = async () => {
    if (userRole === 'VIEWER') return;
    setIsClustering(true);
    try {
      await onRecluster();
    } finally {
      setIsClustering(false);
    }
  };

  const sortedThemes = [...themes].sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-6">
      {/* Header with AI Recluster Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>Theme Trends & Spike Detection</span>
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              AI Cluster Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gemini continuously groups unstructured feedback into coherent problem statements, ranks them by priority (1-100), and flags sudden velocity spikes.
          </p>
        </div>

        <button
          onClick={handleClusterClick}
          disabled={isClustering || userRole === 'VIEWER'}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          title="Run Gemini 3.7 unsupervised clustering on all workspace tickets"
        >
          <RefreshCw className={`w-4 h-4 ${isClustering ? 'animate-spin' : ''}`} />
          <span>{isClustering ? 'Clustering via Gemini...' : 'Re-Cluster Themes with AI'}</span>
        </button>
      </div>

      {/* Themes Grid / Stack */}
      <div className="space-y-4">
        {sortedThemes.map((theme, index) => {
          const isExpanded = expandedThemeId === theme.id;
          const isSpike = theme.isSpike || theme.growthPct >= 30;

          return (
            <div
              key={theme.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSpike
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900/80 border-slate-800 shadow-lg'
              }`}
            >
              {/* Theme Header Bar */}
              <div
                onClick={() => setExpandedThemeId(isExpanded ? null : theme.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-[280px]">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl font-mono font-bold text-sm flex items-center justify-center border shrink-0 ${
                      index === 0
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : index === 1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {theme.featureArea}
                      </span>
                      {isSpike && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Flame className="w-3 h-3 text-amber-400" />
                          +{theme.growthPct}% Spike
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl">{theme.description}</p>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="flex items-center gap-5 text-xs text-slate-300">
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-100 text-sm">
                      {theme.feedbackCount}
                    </div>
                    <div className="text-[10px] text-slate-400">Total Mentions</div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      {theme.priorityScore} / 100
                    </div>
                    <div className="text-[10px] text-slate-400">Priority Score</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono font-bold text-sm ${
                        theme.averageSentimentScore < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {theme.averageSentimentScore > 0
                        ? `+${theme.averageSentimentScore}`
                        : theme.averageSentimentScore}
                    </div>
                    <div className="text-[10px] text-slate-400">Avg Sentiment</div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>
              </div>

              {/* Expanded Theme Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                  {/* Action Recommendation Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-800/40 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                        AI Recommended Engineering & Product Action
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-mono">
                        {theme.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* Representative Sample Customer Quotes */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-slate-500" />
                      <span>Verbatim Customer Evidence</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {theme.sampleQuotes.map((quote, qIdx) => (
                        <div
                          key={qIdx}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic"
                        >
                          "{quote}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Bar Distribution */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-medium">Sentiment Breakdown:</span>
                      <span className="text-emerald-400 font-semibold">
                        Positive: {theme.sentimentDistribution.positive}
                      </span>
                      <span className="text-slate-400">
                        Neutral: {theme.sentimentDistribution.neutral}
                      </span>
                      <span className="text-rose-400 font-semibold">
                        Negative: {theme.sentimentDistribution.negative}
                      </span>
                    </div>

                    <button
                      onClick={() => onFilterByTheme(theme.name)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>Filter related feedback in Inbox</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
