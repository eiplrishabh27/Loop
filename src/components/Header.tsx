import React from 'react';
import {
  Sparkles,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Compass,
  Database,
  BarChart3,
} from 'lucide-react';
import { ParsedDataset } from '../types';

interface HeaderProps {
  dataset: ParsedDataset | null;
  hasReport: boolean;
  onOpenDataViewer: () => void;
  onOpenCustomLens: () => void;
  onOpenExport: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dataset,
  hasReport,
  onOpenDataViewer,
  onOpenCustomLens,
  onOpenExport,
  onReset,
  isAnalyzing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold ring-1 ring-white/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
                DataPulse
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Intelligence Lab
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-World Data Ingestion & Automated Executive Insights
            </p>
          </div>
        </div>

        {/* Dataset Status & Action Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {dataset && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium truncate max-w-[140px] text-slate-200">{dataset.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{dataset.totalRows} {dataset.type === 'text' ? 'lines' : 'rows'}</span>
            </div>
          )}

          {dataset && (
            <button
              onClick={onOpenDataViewer}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              title="Inspect Original Content & Column Profiles"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Raw Data</span>
            </button>
          )}

          {hasReport && (
            <button
              onClick={onOpenCustomLens}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 px-3 py-2 rounded-lg border border-indigo-700/50 transition-colors shadow-sm"
              title="Analyze via Specialized Analytical Lens"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Custom Lens</span>
            </button>
          )}

          {hasReport && (
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              title="Export Executive Report"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {dataset && (
            <button
              onClick={onReset}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 px-3 py-2 rounded-lg border border-slate-700 hover:border-rose-800/60 transition-colors shadow-sm disabled:opacity-50"
              title="Load or paste a different dataset"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">New Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
