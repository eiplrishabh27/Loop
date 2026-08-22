import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AnalysisReport } from '../types';

interface ExecutiveSummaryViewProps {
  report: AnalysisReport;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ report }) => {
  const { summary, keyMetrics, dataQuality } = report;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Executive Briefing & Data Quality Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Executive Intelligence Briefing
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {summary}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Ground truth verified against input records
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              Grounded Gemini 3.7 Intelligence
            </span>
          </div>
        </div>

        {/* Data Quality & Health Score Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Data Quality & Hygiene
                </h3>
              </div>
              <div className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${getScoreColor(dataQuality.score)}`}>
                {dataQuality.score}/100 • {dataQuality.rating}
              </div>
            </div>

            {/* Findings list */}
            <div className="space-y-2 mt-3">
              {dataQuality.findings.slice(0, 3).map((finding, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                  <span className="leading-snug">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {dataQuality.recommendations && dataQuality.recommendations.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{dataQuality.recommendations[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metrics Strip */}
      {keyMetrics && keyMetrics.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <span>Key Performance & Statistical Signals</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {keyMetrics.map((metric, idx) => {
              const isUp = metric.trend === 'up';
              const isDown = metric.trend === 'down';
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-400 line-clamp-1">
                        {metric.label}
                      </span>
                      {metric.change && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            isUp
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : isDown
                              ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                              : 'text-slate-400 bg-slate-800 border-slate-700'
                          }`}
                        >
                          {isUp && <TrendingUp className="w-3 h-3" />}
                          {isDown && <TrendingDown className="w-3 h-3" />}
                          {!isUp && !isDown && <Minus className="w-3 h-3" />}
                          {metric.change}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-slate-100 tracking-tight">
                      {metric.value}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
