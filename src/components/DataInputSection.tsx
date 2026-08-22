import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  ClipboardCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquareText,
  ShoppingBag,
  DollarSign,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { AnalysisFocus, ParsedDataset, SampleDataset } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { parseDataset } from '../lib/parser';

interface DataInputSectionProps {
  onDatasetLoaded: (dataset: ParsedDataset, focus: AnalysisFocus, userNotes: string) => void;
  isAnalyzing: boolean;
}

export const DataInputSection: React.FC<DataInputSectionProps> = ({
  onDatasetLoaded,
  isAnalyzing,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<ParsedDataset | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<AnalysisFocus>('comprehensive');
  const [customGoal, setCustomGoal] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content || content.trim().length === 0) {
          setErrorMsg('The selected file appears to be empty.');
          return;
        }
        const parsed = parseDataset(content, file.name);
        if (parsed.totalRows === 0) {
          setErrorMsg('Could not detect any data rows in this file.');
          return;
        }
        setCurrentDataset(parsed);
      } catch (err: any) {
        setErrorMsg(`Failed to parse file: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    setErrorMsg(null);
    if (!pasteText.trim()) {
      setErrorMsg('Please paste some data (CSV, TSV, JSON, or text) first.');
      return;
    }
    try {
      const parsed = parseDataset(pasteText, 'pasted_dataset.csv');
      if (parsed.totalRows === 0) {
        setErrorMsg('Could not detect any records in the pasted text.');
        return;
      }
      setCurrentDataset(parsed);
    } catch (err: any) {
      setErrorMsg(`Failed to parse pasted data: ${err.message}`);
    }
  };

  const handleSelectSample = (sample: SampleDataset) => {
    setErrorMsg(null);
    try {
      const parsed = parseDataset(sample.rawContent, `${sample.id}.${sample.format}`);
      setCurrentDataset(parsed);
    } catch (err: any) {
      setErrorMsg(`Failed to load sample dataset: ${err.message}`);
    }
  };

  const handleTriggerAnalysis = () => {
    if (!currentDataset) {
      setErrorMsg('Please load or paste a real-world dataset first.');
      return;
    }
    onDatasetLoaded(currentDataset, selectedFocus, customGoal);
  };

  const focusOptions: { id: AnalysisFocus; title: string; desc: string; icon: any }[] = [
    {
      id: 'comprehensive',
      title: 'Executive Intelligence',
      desc: 'Holistic overview, KPIs, cross-cutting patterns & strategic actions',
      icon: Sparkles,
    },
    {
      id: 'financial',
      title: 'Financial & Unit Economics',
      desc: 'Revenue drivers, cost concentrations, margins, burn & ROI',
      icon: DollarSign,
    },
    {
      id: 'sentiment',
      title: 'Customer Sentiment & Voice',
      desc: 'Pain points, satisfaction friction, feature requests & NPS impact',
      icon: MessageSquareText,
    },
    {
      id: 'growth',
      title: 'Growth & Cohort Dynamics',
      desc: 'Acquisition velocity, segment performance, conversion & retention',
      icon: TrendingUp,
    },
    {
      id: 'risk_anomaly',
      title: 'Risk, Churn & Anomaly Audit',
      desc: 'Statistical outliers, escalations, churn indicators & vulnerabilities',
      icon: AlertCircle,
    },
    {
      id: 'operational',
      title: 'Operational & SLA Efficiency',
      desc: 'Throughput bottlenecks, resolution times, capacity & distribution',
      icon: Layers,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Real-World Data Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
          Turn Real Data into Deep Executive Insights
        </h2>
        <p className="mt-2.5 text-base text-slate-400">
          Upload spreadsheets, CSVs, customer logs, financial metrics, or text transcripts. We inspect original content, extract statistical patterns, and generate actionable strategic intelligence with Gemini AI.
        </p>
      </div>

      {/* Main Input Container Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Input Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (CSV / JSON / TSV)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'paste'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Paste Raw Data / Text
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'samples'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Real-World Presets
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.json,.txt,.md,.jsonl"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                Drag and drop your real dataset here
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto">
                Supports CSV, TSV, JSON, JSONL, Markdown tables, or plain text logs. Click anywhere to browse your files.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <span>Maximum 50MB</span>
                <span>•</span>
                <span>Instant local profiling</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Data */}
        {activeTab === 'paste' && (
          <div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Paste Spreadsheet Data, JSON Array, or Notes
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Paste CSV rows, Excel table copy-paste, or JSON array, e.g.:

Date,Channel,Spend,Conversions,CAC,Revenue
2026-08-01,Google Search,1200,42,28.5,8400
2026-08-02,Meta Ads,950,28,33.9,5200
2026-08-03,LinkedIn B2B,1500,18,83.3,14200`}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
                >
                  <ClipboardCheck className="w-4 h-4 text-blue-400" />
                  Parse Pasted Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sample Real-World Presets */}
        {activeTab === 'samples' && (
          <div>
            <p className="text-xs text-slate-400 mb-4">
              Explore how DataPulse extracts insights across diverse real-world domain scenarios:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_DATASETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    currentDataset?.name.includes(sample.id)
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        {sample.category}
                      </span>
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        {sample.format}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-xs font-medium text-blue-400">
                    Load Dataset <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dataset Preview Badge / Inspector */}
        {currentDataset && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {currentDataset.name}
                      </span>
                      <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {currentDataset.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentDataset.totalRows} {currentDataset.type === 'text' ? 'lines' : 'rows'} • {currentDataset.totalColumns} fields • {currentDataset.fileSizeFormatted}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ready for Analysis
                  </span>
                </div>
              </div>

              {/* Column Pills */}
              {currentDataset.headers.length > 0 && currentDataset.type !== 'text' && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">
                    Detected Fields & Profiles:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentDataset.columnProfiles.slice(0, 10).map((col) => (
                      <span
                        key={col.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        <span className="font-semibold text-slate-200">{col.name}</span>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1 py-0.2 rounded">
                          {col.type}
                        </span>
                      </span>
                    ))}
                    {currentDataset.columnProfiles.length > 10 && (
                      <span className="text-[11px] text-slate-500 self-center">
                        +{currentDataset.columnProfiles.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Configuration & Focus */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                  Select Strategic Focus Lens
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {focusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedFocus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedFocus(opt.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
                            : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-semibold text-slate-200">
                            {opt.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Custom Context / Query */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Specific Questions or Context (Optional)
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g., Focus on Q3 APAC retention, explain top 3 refund drivers, evaluate CAC efficiency"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Primary Action Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ring-1 ring-white/20"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing Real-World Dataset with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Real-World Intelligence & Insights</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
