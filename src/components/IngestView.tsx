import React, { useState, useRef, useEffect } from 'react';
import {
  PlusCircle,
  FileSpreadsheet,
  Radio,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  FileText,
  Trash2,
  Copy,
  Zap,
  Building,
  Mail,
  UserCheck,
  Check,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { FeedbackChannel, CustomerTier, UrgencyLevel, UserRole } from '../types/loop';

interface IngestViewProps {
  workspaceId: string;
  userRole: UserRole;
  onSingleIngest: (data: any) => Promise<any>;
  onBulkIngest: (rows: any[], options?: any) => Promise<any>;
  onSimulateChannel: (channel: string) => Promise<any>;
  onSuccessNavigate: () => void;
  onChangeUserRole?: (role: UserRole) => void;
}

export const IngestView: React.FC<IngestViewProps> = ({
  workspaceId,
  userRole,
  onSingleIngest,
  onBulkIngest,
  onSimulateChannel,
  onSuccessNavigate,
  onChangeUserRole,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'simulate'>('single');

  // Single Entry Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerTier, setCustomerTier] = useState<CustomerTier>('PRO');
  const [channel, setChannel] = useState<FeedbackChannel>('INTERCOM');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastIngestedItem, setLastIngestedItem] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deduplication & Similarity Radar State (Single Ingest)
  const [enableDuplicateCheck, setEnableDuplicateCheck] = useState(true);
  const [deduplicationMode, setDeduplicationMode] = useState<'flag' | 'reject' | 'merge' | 'allow'>('flag');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.88);
  const [preCheckLoading, setPreCheckLoading] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<{
    isDuplicate: boolean;
    matchType: string;
    similarityScore: number;
    matchedItem?: { id: string; title: string; content?: string };
    contentHash?: string;
  } | null>(null);

  // Bulk CSV State
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkDeduplicationMode, setBulkDeduplicationMode] = useState<'skip' | 'flag' | 'allow'>('skip');
  const [bulkSimilarityThreshold, setBulkSimilarityThreshold] = useState<number>(0.88);

  // Simulated Feed State
  const [selectedChannel, setSelectedChannel] = useState<string>('ZENDESK');
  const [isSimulating, setIsSimulating] = useState(false);

  // Real-time Debounced Duplicate Pre-Check Radar for Single Ingest
  useEffect(() => {
    if (!enableDuplicateCheck || activeTab !== 'single' || !content.trim() || content.trim().length < 15) {
      setPreCheckResult(null);
      setPreCheckLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setPreCheckLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/feedback/check-duplicate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole,
          },
          body: JSON.stringify({
            content: content.trim(),
            title: title.trim(),
            customerCompany: customerCompany.trim(),
            customerName: customerName.trim(),
            similarityThreshold,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPreCheckResult(data);
        }
      } catch (err) {
        console.warn('Real-time duplicate check error:', err);
      } finally {
        setPreCheckLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [content, title, customerCompany, customerName, similarityThreshold, enableDuplicateCheck, activeTab, workspaceId, userRole]);

  // Preset quick fill templates for Single Manual Entry
  const singlePresets = [
    {
      label: 'SAML Authentication Incident',
      tag: 'Critical • Security',
      data: {
        title: 'Okta SAML assertion token drops every morning for Tokyo branch',
        content:
          'Our IT security operations center noticed that 45 enterprise employees in Tokyo were locked out during SAML authentication metadata refresh. Error code ERR_AUTH_SAML_ASSERTION_TIMEOUT was thrown continuously.',
        customerName: 'Kenji Takahashi',
        customerEmail: 'k.takahashi@tokyofinance.jp',
        customerCompany: 'Tokyo Finance Group',
        customerTier: 'ENTERPRISE' as CustomerTier,
        channel: 'ZENDESK' as FeedbackChannel,
        urgency: 'CRITICAL' as UrgencyLevel,
      },
    },
    {
      label: 'Billing & Invoice Dispute',
      tag: 'High • Billing',
      data: {
        title: 'Duplicate seats charged on quarterly billing reconciliation',
        content:
          'We reconciled our quarterly statement and found duplicate charges for 12 deactivated engineering team seats. Please credit our account and adjust the invoice schedule before next month.',
        customerName: 'Claire Beauchamp',
        customerEmail: 'claire@nexus.com',
        customerCompany: 'Nexus Global Systems',
        customerTier: 'ENTERPRISE' as CustomerTier,
        channel: 'ZENDESK' as FeedbackChannel,
        urgency: 'HIGH' as UrgencyLevel,
      },
    },
    {
      label: 'Feature Praise: Ask LOOP RAG',
      tag: 'Low • Praise',
      data: {
        title: 'Ask LOOP grounded Q&A is saving our product team hours',
        content:
          'I just used Ask LOOP to research customer reactions to our new export layout. It accurately extracted 4 direct customer quotes with sentiment scores in seconds. Huge workflow breakthrough!',
        customerName: 'Marcus Vance',
        customerEmail: 'm.vance@innovatelabs.io',
        customerCompany: 'Innovate Labs',
        customerTier: 'PRO' as CustomerTier,
        channel: 'INTERCOM' as FeedbackChannel,
        urgency: 'LOW' as UrgencyLevel,
      },
    },
  ];

  // Bulk Dataset Samples
  const bulkSamples = [
    {
      title: 'Enterprise Incident Logs (5 items)',
      csv: `title,content,customerName,customerEmail,customerCompany,customerTier,channel,urgency
SAML session drops in APAC,Okta token session drops every morning for Tokyo users during metadata refresh,Kenji Takahashi,k.takahashi@tokyofinance.jp,Tokyo Finance Group,ENTERPRISE,ZENDESK,CRITICAL
Duplicate invoice line items,Our invoice had duplicate seats charged for 14 deactivated DevOps team members,Claire Beauchamp,claire@nexus.com,Nexus Global,ENTERPRISE,ZENDESK,HIGH
Dashboard latency on large datasets,Querying 90-day timeframes causes HTTP 504 gateway timeout on analytics page,Liam O'Connor,liam@celtictech.ie,Celtic Tech,ENTERPRISE,ZENDESK,HIGH
SCIM directory sync error,Azure AD SCIM user deprovisioning webhook returns 401 unauthorized,Vikram Malhotra,v.malhotra@zenithbank.in,Zenith Global,ENTERPRISE,EMAIL,CRITICAL
Ask LOOP grounded search praise,The evidence citations and customer quotes saved our executive presentation,Amara Okafor,aokafor@summitpay.co,SummitPay,ENTERPRISE,INTERCOM,LOW`,
    },
    {
      title: 'Mobile App Reviews & Crashes (4 items)',
      csv: `title,content,customerName,customerEmail,customerCompany,customerTier,channel,urgency
iOS app crash on biometric auth,App crashes instantly when Face ID prompt triggers on iOS 17.4,Sarah Jenkins,s.jenkins@flowstate.app,FlowState Media,PRO,APP_STORE,HIGH
Offline cache sync delay,Notes written in offline mode take up to 2 minutes to sync after reconnection,David Miller,dmiller@apexops.net,Apex Ops,STARTER,APP_STORE,MEDIUM
Dark mode contrast in widget,Widget text is barely readable against dark backgrounds,Elena Rostova,e.rostova@designcraft.org,DesignCraft,PRO,APP_STORE,LOW
Love the instant search bar,The instant filter and keyword tags make triage super fast!,Toby Henderson,toby@sparkstudio.com,Spark Studio,FREE,APP_STORE,LOW`,
    },
  ];

  const handleApplyPreset = (preset: typeof singlePresets[0]) => {
    setTitle(preset.data.title);
    setContent(preset.data.content);
    setCustomerName(preset.data.customerName);
    setCustomerEmail(preset.data.customerEmail);
    setCustomerCompany(preset.data.customerCompany);
    setCustomerTier(preset.data.customerTier);
    setChannel(preset.data.channel);
    setUrgency(preset.data.urgency);
    setErrorMessage(null);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Feedback content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const created = await onSingleIngest({
        title: title.trim() || `${channel} Customer Feedback`,
        content: content.trim(),
        customerName: customerName.trim() || 'Anonymous Customer',
        customerEmail: customerEmail.trim() || undefined,
        customerCompany: customerCompany.trim() || undefined,
        customerTier,
        channel,
        urgency,
        checkDuplicates: enableDuplicateCheck,
        deduplicationMode,
        similarityThreshold,
      });

      setLastIngestedItem(created);
      const dupInfo = created?.deduplication;
      if (dupInfo?.isDuplicate) {
        setSuccessMessage(
          `Feedback ingested & flagged as duplicate of #${dupInfo.matchedItem?.id} (${Math.round((dupInfo.similarityScore || 0) * 100)}% match)!`
        );
      } else {
        setSuccessMessage(`Feedback item "${created?.title || title || 'New Feedback'}" successfully ingested & classified by Gemini!`);
      }
      setTitle('');
      setContent('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerCompany('');
      setPreCheckResult(null);
    } catch (err: any) {
      console.error('Ingest error:', err);
      setErrorMessage(err.message || 'Failed to ingest feedback item. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Robust CSV parser handling quotes, commas, tabs, semicolons
  const parseDelimitedText = (text: string) => {
    if (!text || !text.trim()) return [];

    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Detect delimiter: comma, tab, or semicolon
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    // Helper to tokenize a line respecting quotes
    const tokenizeLine = (line: string): string[] => {
      const tokens: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          if (inQuotes && line[i + 1] === char) {
            current += char;
            i++; // Skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          tokens.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      tokens.push(current.trim());
      return tokens.map((t) => t.replace(/^["']|["']$/g, '').trim());
    };

    const rawHeaders = tokenizeLine(lines[0]);
    const normalizedHeaders = rawHeaders.map((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (['content', 'feedback', 'text', 'body', 'message', 'description', 'review', 'comment'].includes(lower)) return 'content';
      if (['customername', 'name', 'customer', 'user', 'author'].includes(lower)) return 'customerName';
      if (['customeremail', 'email'].includes(lower)) return 'customerEmail';
      if (['customercompany', 'company', 'org', 'organization'].includes(lower)) return 'customerCompany';
      if (['customertier', 'tier', 'plan'].includes(lower)) return 'customerTier';
      if (['channel', 'source', 'type'].includes(lower)) return 'channel';
      if (['urgency', 'priority', 'severity'].includes(lower)) return 'urgency';
      if (['title', 'summary', 'subject', 'headline'].includes(lower)) return 'title';
      return h;
    });

    const parsed: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = tokenizeLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v)) continue;

      const obj: any = {};
      normalizedHeaders.forEach((headerKey, idx) => {
        obj[headerKey] = values[idx] || '';
      });

      const bodyText = obj.content || obj.feedback || obj.text || obj.body || obj.message || '';
      if (bodyText) {
        parsed.push({
          title: obj.title || `Imported Item #${i}`,
          content: bodyText,
          customerName: obj.customerName || `Customer #${i}`,
          customerEmail: obj.customerEmail || undefined,
          customerCompany: obj.customerCompany || 'Customer Org',
          customerTier: (obj.customerTier || 'PRO').toUpperCase(),
          channel: (obj.channel || 'CSV_IMPORT').toUpperCase(),
          urgency: (obj.urgency || 'MEDIUM').toUpperCase(),
        });
      }
    }

    return parsed;
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      setErrorMessage('Please paste or upload CSV text first.');
      return;
    }
    setErrorMessage(null);
    const rows = parseDelimitedText(csvText);
    if (rows.length === 0) {
      setErrorMessage('No valid rows found. Ensure each row has a feedback/content text column.');
      return;
    }
    setParsedRows(rows);
    setSuccessMessage(`Parsed ${rows.length} valid feedback entries ready to import!`);
  };

  const handleFileChange = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCsvText(content);
        const rows = parseDelimitedText(content);
        setParsedRows(rows);
        setErrorMessage(null);
        setSuccessMessage(`Loaded ${file.name} with ${rows.length} parsed items ready for import.`);
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    const rowsToSubmit = parsedRows.length > 0 ? parsedRows : parseDelimitedText(csvText);
    if (rowsToSubmit.length === 0) {
      setErrorMessage('No records found to import. Please parse CSV or load a template.');
      return;
    }

    setIsBulkSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await onBulkIngest(rowsToSubmit, {
        deduplicationMode: bulkDeduplicationMode,
        similarityThreshold: bulkSimilarityThreshold,
        skipDuplicates: bulkDeduplicationMode === 'skip',
      });
      const dupCount = result?.duplicatesSkipped || result?.duplicatesFlagged || 0;
      const dupMsg = dupCount > 0
        ? ` (${dupCount} duplicate item${dupCount === 1 ? '' : 's'} ${bulkDeduplicationMode === 'skip' ? 'skipped' : 'flagged'})`
        : '';
      setSuccessMessage(`Successfully imported ${result?.count || rowsToSubmit.length} feedback items into workspace${dupMsg}!`);
      setParsedRows([]);
      setCsvText('');
      setFileName(null);
    } catch (err: any) {
      console.error('Bulk ingest error:', err);
      setErrorMessage(err.message || 'Failed to import bulk rows.');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleSimulateClick = async () => {
    setIsSimulating(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await onSimulateChannel(selectedChannel);
      setLastIngestedItem(res);
      setSuccessMessage(`Simulated incoming webhook from ${selectedChannel} classified & appended to workspace!`);
    } catch (err: any) {
      console.error('Simulate error:', err);
      setErrorMessage(err.message || 'Simulation failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-500" />
          <span>Real-World Data Ingestion</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Ingest real customer feedback from any channel. LOOP will automatically analyze sentiment, extract key quotes, tag themes, and compute urgency using Gemini AI.
        </p>
      </div>

      {/* Role Notice & Quick Switcher */}
      {userRole === 'VIEWER' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong>Viewer Mode Active:</strong> Ingestion and simulation are enabled for testing, or you can switch to <strong>Admin</strong> for full RBAC controls.
            </div>
          </div>
          {onChangeUserRole && (
            <button
              onClick={() => onChangeUserRole('ADMIN')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer shadow"
            >
              Switch to Admin Role
            </button>
          )}
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            setActiveTab('single');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'single'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Single Manual Entry (Live AI)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('bulk');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'bulk'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk CSV / TSV Import</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('simulate');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'simulate'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live Webhook Simulator</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-200">{successMessage}</div>
              {lastIngestedItem?.aiSummary && (
                <div className="text-[11px] text-emerald-300/80 mt-0.5">
                  AI Summary: &ldquo;{lastIngestedItem.aiSummary}&rdquo;
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onSuccessNavigate}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer shadow"
          >
            View in Inbox →
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab 1: Single Entry Form */}
      {activeTab === 'single' && (
        <div className="space-y-4">
          {/* Quick Presets Bar */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Test Presets (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {singlePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{preset.tag}</div>
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSingleSubmit}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Customer Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenji Takahashi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. k.takahashi@tokyofinance.jp"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tokyo Finance Group"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Customer Tier
                </label>
                <select
                  value={customerTier}
                  onChange={(e) => setCustomerTier(e.target.value as CustomerTier)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="ENTERPRISE">Enterprise Tier</option>
                  <option value="PRO">Pro Tier</option>
                  <option value="STARTER">Starter Tier</option>
                  <option value="FREE">Free Tier</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Feedback Source Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as FeedbackChannel)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="ZENDESK">Zendesk Support Ticket</option>
                  <option value="INTERCOM">Intercom Live Chat</option>
                  <option value="APP_STORE">App Store / Play Store Review</option>
                  <option value="SALES_CALL">Gong / Sales Discovery Call</option>
                  <option value="DISCORD">Discord Community</option>
                  <option value="NPS_SURVEY">NPS Survey Feedback</option>
                  <option value="EMAIL">Direct Executive Email</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="CRITICAL">Critical (Blocks core workflow / Churn risk)</option>
                  <option value="HIGH">High (Pain point / Escalated)</option>
                  <option value="MEDIUM">Medium (General feedback)</option>
                  <option value="LOW">Low (Minor enhancement / Praise)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Feedback Title / Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Okta SAML token session drops every morning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Customer Feedback Content <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Paste raw customer ticket, chat transcript, call quote, or app review..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Real-time Deduplication Radar & Policy Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${preCheckLoading ? 'animate-spin text-blue-400' : ''}`} />
                    <span>Deduplication & Similarity Radar</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableDuplicateCheck}
                      onChange={(e) => setEnableDuplicateCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-[11px] text-slate-400">
                  Threshold: <strong className="text-slate-200">{Math.round(similarityThreshold * 100)}%</strong>
                </div>
              </div>

              {enableDuplicateCheck && (
                <>
                  {/* Live Radar Scan Status Banner */}
                  {preCheckLoading && (
                    <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[11px] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Scanning vector index for content collisions & semantic similarity...</span>
                    </div>
                  )}

                  {!preCheckLoading && preCheckResult?.isDuplicate && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Duplicate Match Detected ({Math.round((preCheckResult.similarityScore || 0) * 100)}% match)</span>
                      </div>
                      <div className="text-[11px] text-amber-300/90">
                        Matches ticket <strong className="text-slate-100">#{preCheckResult.matchedItem?.id}</strong>: "{preCheckResult.matchedItem?.title}" via{' '}
                        <span className="font-mono">{preCheckResult.matchType === 'EXACT_HASH' ? 'SHA-256 Hash' : 'Vector Cosine Distance'}</span>.
                      </div>
                    </div>
                  )}

                  {!preCheckLoading && preCheckResult && !preCheckResult.isDuplicate && content.trim().length >= 15 && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Content Fingerprint Unique — No duplicate collisions detected in workspace.</span>
                    </div>
                  )}

                  {/* Mode & Threshold Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Collision Ingestion Policy:
                      </label>
                      <select
                        value={deduplicationMode}
                        onChange={(e) => setDeduplicationMode(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="flag">🏷️ Flag Duplicate (Store with reference)</option>
                        <option value="reject">🛑 Strict Rejection (HTTP 409 error)</option>
                        <option value="merge">🔀 Merge / Link Instances</option>
                        <option value="allow">🔓 Allow All (Bypass check)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                        <span>Similarity Cutoff:</span>
                        <span className="font-mono text-slate-200">{similarityThreshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0.70"
                        max="0.98"
                        step="0.01"
                        value={similarityThreshold}
                        onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-blue-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Gemini AI will automatically calculate sentiment score (-1.0 to 1.0), extract quote snippet, map feature area, and assign thematic cluster tags.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running Gemini AI Auto-Classification...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ingest & Auto-Classify Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Bulk CSV Import */}
      {activeTab === 'bulk' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Bulk CSV / TSV Ingestion</h3>
              <p className="text-xs text-slate-400">
                Upload a file or paste comma/tab-separated feedback records with headers: <code>title, content, customerName, customerEmail, customerCompany, customerTier, channel, urgency</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {bulkSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCsvText(sample.csv);
                    setFileName(`sample-${idx + 1}.csv`);
                    const rows = parseDelimitedText(sample.csv);
                    setParsedRows(rows);
                    setErrorMessage(null);
                    setSuccessMessage(`Loaded ${sample.title}. Ready to import!`);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs rounded-lg border border-slate-700 transition-all cursor-pointer font-medium"
                >
                  Load {sample.title.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-200">
              {fileName ? `File Selected: ${fileName}` : 'Drag & drop CSV/TSV file here, or click to browse'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Supports CSV, TSV, or TXT exports</div>
          </div>

          {/* Raw Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Or Paste Delimited Text
              </label>
              {csvText && (
                <button
                  type="button"
                  onClick={() => {
                    setCsvText('');
                    setParsedRows([]);
                    setFileName(null);
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear Text
                </button>
              )}
            </div>
            <textarea
              rows={6}
              placeholder="title,content,customerName,customerEmail,customerCompany,customerTier,channel,urgency..."
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bulk Deduplication Controls */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Bulk Ingestion Deduplication Policy</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Vector Threshold: <strong className="text-slate-200">{Math.round(bulkSimilarityThreshold * 100)}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Deduplication Action:
                </label>
                <select
                  value={bulkDeduplicationMode}
                  onChange={(e) => setBulkDeduplicationMode(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="skip">🛡️ Skip Duplicates (Recommended - Clean Import)</option>
                  <option value="flag">🏷️ Flag Duplicates (Import and Link Parent)</option>
                  <option value="allow">🔓 Allow All (Bypass Vector Deduplication)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Cosine Similarity Threshold:</span>
                  <span className="font-mono text-slate-200">{bulkSimilarityThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="0.98"
                  step="0.01"
                  value={bulkSimilarityThreshold}
                  onChange={(e) => setBulkSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleParseCsv}
              disabled={!csvText.trim()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-40"
            >
              Parse Data Preview ({parsedRows.length} rows ready)
            </button>

            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isBulkSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isBulkSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing & Deduplicating {parsedRows.length} rows...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Import ({parsedRows.length} Items)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-x-auto max-h-64 mt-4">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] text-slate-400 font-mono uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Title</th>
                    <th className="p-2.5">Content Snippet</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Channel</th>
                    <th className="p-2.5">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-sans">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/50">
                      <td className="p-2.5 font-medium text-slate-200">{r.title || 'Untitled'}</td>
                      <td className="p-2.5 text-slate-400 max-w-xs truncate">{r.content}</td>
                      <td className="p-2.5">{r.customerName || 'Anonymous'}</td>
                      <td className="p-2.5">{r.customerCompany || 'N/A'}</td>
                      <td className="p-2.5 font-mono text-[11px]">{r.channel || 'CSV'}</td>
                      <td className="p-2.5 font-mono text-amber-400 text-[11px]">{r.urgency || 'MEDIUM'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Simulated Stream */}
      {activeTab === 'simulate' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Simulate Real-Time Ingestion Event</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulate an incoming webhook from Zendesk, Intercom, or App Store to test how LOOP's AI pipeline classifies sentiment, triggers theme spike alerts, and updates live analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'ZENDESK', label: 'Zendesk Ticket', desc: 'Critical Auth / SAML session drop issue' },
              { id: 'INTERCOM', label: 'Intercom Live Chat', desc: 'Billing & duplicate invoice inquiry' },
              { id: 'APP_STORE', label: 'App Store Review', desc: 'Mobile Face ID crash & performance praise' },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedChannel === ch.id
                    ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">{ch.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{ch.desc}</div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSimulateClick}
            disabled={isSimulating}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Webhook Dispatch & AI Classification...</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>Fire Simulated {selectedChannel} Event</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
