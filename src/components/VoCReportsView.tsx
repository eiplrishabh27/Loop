import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Calendar,
  Layers,
  TrendingUp,
  AlertTriangle,
  Target,
  RefreshCw,
  Loader2,
  Quote,
  Zap,
} from 'lucide-react';
import { VoCReport, UserRole } from '../types/loop';

interface VoCReportsViewProps {
  reports: VoCReport[];
  onGenerateReport: (timeRange: string) => Promise<void>;
  userRole: UserRole;
}

export const VoCReportsView: React.FC<VoCReportsViewProps> = ({
  reports,
  onGenerateReport,
  userRole,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerate = async () => {
    if (userRole === 'VIEWER') return;
    setIsGenerating(true);
    try {
      await onGenerateReport(timeRange);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!currentReport) return;
    const md = `# ${currentReport.title}
*Generated on ${new Date(currentReport.generatedAt).toLocaleDateString()} | Timeframe: ${currentReport.timeRange}*

## Executive Summary
${currentReport.summary}

## Key Statistical Snapshot
- Total Feedback Records Analyzed: ${currentReport.statsSnapshot.totalFeedbackAnalyzed}
- Net Sentiment Score: ${currentReport.statsSnapshot.avgSentimentScore} (-1.0 to 1.0)
- Negative Friction Ratio: ${currentReport.statsSnapshot.negativeRatioPct}%
- Critical Urgency Issues: ${currentReport.statsSnapshot.criticalIssuesCount}
- Top Ingestion Channel: ${currentReport.statsSnapshot.topChannel}

## Top Product Themes & Trends
${currentReport.topThemes.map((t) => `- **${t.name}** (${t.featureArea}) - ${t.count} mentions [Trend: ${t.trend}]: ${t.impact}`).join('\n')}

## Critical Product Gaps
${currentReport.criticalGaps.map((g) => `- ${g}`).join('\n')}

## Prioritized Action Plan
${currentReport.prioritizedActions.map((a) => `### [${a.priority}] ${a.action}
- **Owner**: ${a.department} | **Timeline**: ${a.timeline}
- **Expected Impact**: ${a.expectedImpact}
- **Customer Quote Evidence**: ${a.evidenceSnippet}`).join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Generator Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-400" />
                <span>Voice-of-Customer (VoC) Intelligence Digest</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                1-Click Synthesis
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Synthesize 100+ multi-channel customer submissions into an executive-ready action plan with department assignments, timeline milestones, and verified quotes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={isGenerating}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Last 7 Days">Timeframe: Last 7 Days</option>
              <option value="Last 30 Days">Timeframe: Last 30 Days</option>
              <option value="Last Quarter (Q3)">Timeframe: Last Quarter (Q3)</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || userRole === 'VIEWER'}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing VoC Digest...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate New VoC Digest</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Report View Layout */}
      {currentReport ? (
        <div className="space-y-6">
          {/* Report Meta Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Report ID: {currentReport.id}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  {currentReport.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentReport.timeRange}</span>
                  <span>•</span>
                  <span>Generated {new Date(currentReport.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Markdown!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Executive Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <strong className="text-indigo-400 block mb-1 text-xs uppercase tracking-wider font-mono">
                Executive Synthesis
              </strong>
              {currentReport.summary}
            </div>

            {/* Grounded Stats Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {currentReport.statsSnapshot.totalFeedbackAnalyzed}
                </div>
                <div className="text-[10px] text-slate-400">Total Analyzed</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {currentReport.statsSnapshot.avgSentimentScore > 0
                    ? `+${currentReport.statsSnapshot.avgSentimentScore}`
                    : currentReport.statsSnapshot.avgSentimentScore}
                </div>
                <div className="text-[10px] text-slate-400">Sentiment Score</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-lg font-bold text-rose-400 font-mono">
                  {currentReport.statsSnapshot.negativeRatioPct}%
                </div>
                <div className="text-[10px] text-slate-400">Friction Ratio</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <div className="text-lg font-bold text-amber-400 font-mono">
                  {currentReport.statsSnapshot.criticalIssuesCount}
                </div>
                <div className="text-[10px] text-slate-400">Critical Gaps</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <div className="text-xs font-bold text-cyan-400 truncate">
                  {currentReport.statsSnapshot.topChannel}
                </div>
                <div className="text-[10px] text-slate-400">Top Channel</div>
              </div>
            </div>
          </div>

          {/* Prioritized Action Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                Prioritized Action Plan (Ranked P1 → P3)
              </h3>
            </div>

            <div className="space-y-3">
              {currentReport.prioritizedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          action.priority === 'P1'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : action.priority === 'P2'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {action.priority} Action
                      </span>
                      <span className="text-xs font-bold text-slate-200">{action.action}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-indigo-400 font-semibold">{action.department}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono">{action.timeline}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong className="text-slate-400 font-semibold">Expected Impact: </strong>
                    {action.expectedImpact}
                  </p>

                  <div className="text-[11px] text-slate-400 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono">
                    Evidence: {action.evidenceSnippet}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Gaps & Representative Quotes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Friction Gaps */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Identified Friction Gaps</span>
              </h3>
              <div className="space-y-2">
                {currentReport.criticalGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Representative Quotes */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Quote className="w-4 h-4 text-cyan-400" />
                <span>Voice of Customer Evidence Quotes</span>
              </h3>
              <div className="space-y-2">
                {currentReport.representativeQuotes.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                  >
                    <div className="text-xs text-slate-300 italic">"{q.quote}"</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span className="font-semibold text-slate-300">{q.customerName} ({q.customerTier})</span>
                      <span className="font-mono text-cyan-400">{q.channel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No VoC Digest Generated Yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Generate New VoC Digest" above to synthesize current workspace feedback.
          </p>
        </div>
      )}
    </div>
  );
};
