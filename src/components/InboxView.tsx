import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  UserCheck,
  Building,
  Mail,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowUpDown,
  X,
  FileText,
  Radio,
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus, FeedbackChannel, CustomerTier, UrgencyLevel, UserRole } from '../types/loop';

interface InboxViewProps {
  feedbackList: FeedbackItem[];
  selectedItem: FeedbackItem | null;
  onSelectItem: (item: FeedbackItem | null) => void;
  onUpdateStatus: (id: string, status: FeedbackStatus, notes?: string) => Promise<void>;
  userRole: UserRole;
  onNavigateToIngest: () => void;
  totalFeedbackCount: number;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  searchPriority?: string;
  onSearchPriorityChange?: (priority: string) => void;
  searchStatus?: string;
  onSearchStatusChange?: (status: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  feedbackList,
  selectedItem,
  onSelectItem,
  onUpdateStatus,
  userRole,
  onNavigateToIngest,
  totalFeedbackCount,
  searchQuery: propSearchQuery,
  onSearchQueryChange: propOnSearchQueryChange,
  searchPriority: propSearchPriority,
  onSearchPriorityChange: propOnSearchPriorityChange,
  searchStatus: propSearchStatus,
  onSearchStatusChange: propOnSearchStatusChange,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilterUrgency, setLocalFilterUrgency] = useState<string>('ALL');
  const [localFilterStatus, setLocalFilterStatus] = useState<string>('ALL');

  const searchTerm = propSearchQuery !== undefined ? propSearchQuery : localSearchTerm;
  const setSearchTerm = (term: string) => {
    if (propOnSearchQueryChange) propOnSearchQueryChange(term);
    else setLocalSearchTerm(term);
  };

  const filterUrgency = propSearchPriority !== undefined ? propSearchPriority : localFilterUrgency;
  const setFilterUrgency = (urgency: string) => {
    if (propOnSearchPriorityChange) propOnSearchPriorityChange(urgency);
    else setLocalFilterUrgency(urgency);
  };

  const filterStatus = propSearchStatus !== undefined ? propSearchStatus : localFilterStatus;
  const setFilterStatus = (status: string) => {
    if (propOnSearchStatusChange) propOnSearchStatusChange(status);
    else setLocalFilterStatus(status);
  };

  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [filterDuplicate, setFilterDuplicate] = useState<string>('ALL'); // 'ALL' | 'DUPLICATE' | 'UNIQUE'
  const [actionNotesInput, setActionNotesInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter items safely
  const safeList = Array.isArray(feedbackList) ? feedbackList : [];
  const filteredItems = safeList.filter((item) => {
    if (!item) return false;
    const term = (searchTerm || '').toLowerCase().trim();
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const customerName = (item.customerName || '').toLowerCase();
    const customerCompany = (item.customerCompany || '').toLowerCase();
    const featureArea = (item.featureArea || '').toLowerCase();
    const themes = Array.isArray(item.themes) ? item.themes : [];
    const tags = Array.isArray(item.tags) ? item.tags : [];

    const matchesSearch =
      !term ||
      title.includes(term) ||
      content.includes(term) ||
      customerName.includes(term) ||
      customerCompany.includes(term) ||
      featureArea.includes(term) ||
      themes.some((t) => (t || '').toLowerCase().includes(term)) ||
      tags.some((t) => (t || '').toLowerCase().includes(term));

    const matchesChannel = filterChannel === 'ALL' || item.channel === filterChannel;
    const matchesSentiment = filterSentiment === 'ALL' || item.sentiment === filterSentiment;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesTier = filterTier === 'ALL' || item.customerTier === filterTier;
    const matchesUrgency = filterUrgency === 'ALL' || item.urgency === filterUrgency;
    const matchesDuplicate =
      filterDuplicate === 'ALL' ||
      (filterDuplicate === 'DUPLICATE' && item.isDuplicate) ||
      (filterDuplicate === 'UNIQUE' && !item.isDuplicate);

    return matchesSearch && matchesChannel && matchesSentiment && matchesStatus && matchesTier && matchesUrgency && matchesDuplicate;
  });

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!selectedItem || userRole === 'VIEWER') return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedItem.id, newStatus, actionNotesInput || selectedItem.actionNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-blue-500/30 text-blue-200 font-semibold px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Counts for quick filter pills
  const criticalCount = safeList.filter((i) => i.urgency === 'CRITICAL').length;
  const highCount = safeList.filter((i) => i.urgency === 'HIGH').length;
  const mediumCount = safeList.filter((i) => i.urgency === 'MEDIUM').length;
  const lowCount = safeList.filter((i) => i.urgency === 'LOW').length;

  const newStatusCount = safeList.filter((i) => i.status === 'NEW').length;
  const reviewedStatusCount = safeList.filter((i) => i.status === 'REVIEWED').length;
  const actionedStatusCount = safeList.filter((i) => i.status === 'ACTIONED').length;

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'NEGATIVE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'ACTIONED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REVIEWED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Feedback Inbox</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredItems.length} of {totalFeedbackCount} records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, filter, triage, and transition customer tickets from NEW to REVIEWED to ACTIONED.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'VIEWER' && (
            <button
              onClick={onNavigateToIngest}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Ingest Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
        {/* Top Search Input Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feedback across content, customer names, companies, themes, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active filter count & reset button */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              {filteredItems.length} matched
            </span>
            {(filterChannel !== 'ALL' ||
              filterSentiment !== 'ALL' ||
              filterStatus !== 'ALL' ||
              filterTier !== 'ALL' ||
              filterUrgency !== 'ALL' ||
              searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterChannel('ALL');
                  setFilterSentiment('ALL');
                  setFilterStatus('ALL');
                  setFilterTier('ALL');
                  setFilterUrgency('ALL');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Quick Priority & Status Pill Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          {/* Priority / Urgency Filter Pills */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Filter by Priority (Urgency)</span>
              {filterUrgency !== 'ALL' && (
                <button
                  onClick={() => setFilterUrgency('ALL')}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Clear Priority
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All', count: safeList.length },
                { id: 'CRITICAL', label: '🚨 Critical', count: criticalCount, activeColor: 'bg-rose-600 text-white' },
                { id: 'HIGH', label: '⚡ High', count: highCount, activeColor: 'bg-amber-600 text-white' },
                { id: 'MEDIUM', label: '🔷 Medium', count: mediumCount, activeColor: 'bg-blue-600 text-white' },
                { id: 'LOW', label: '⚪ Low', count: lowCount, activeColor: 'bg-slate-700 text-white' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterUrgency(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    filterUrgency === p.id
                      ? p.activeColor || 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{p.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      filterUrgency === p.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Status Filter Pills */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Filter by Status</span>
              {filterStatus !== 'ALL' && (
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className="text-[10px] text-blue-400 hover:underline"
                >
                  Clear Status
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All', count: safeList.length },
                { id: 'NEW', label: '🟡 NEW', count: newStatusCount, activeColor: 'bg-amber-600 text-white' },
                { id: 'REVIEWED', label: '🔵 REVIEWED', count: reviewedStatusCount, activeColor: 'bg-blue-600 text-white' },
                { id: 'ACTIONED', label: '🟢 ACTIONED', count: actionedStatusCount, activeColor: 'bg-emerald-600 text-white' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFilterStatus(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    filterStatus === s.id
                      ? s.activeColor || 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{s.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      filterStatus === s.id ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Dropdown Strip: Channel, Tier, Sentiment */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>More Filters:</span>
          </div>

          {/* Sentiment Filter */}
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POSITIVE">Positive (+)</option>
            <option value="NEUTRAL">Neutral (~)</option>
            <option value="NEGATIVE">Negative Friction (-)</option>
          </select>

          {/* Channel Filter */}
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Channels</option>
            <option value="ZENDESK">Zendesk</option>
            <option value="INTERCOM">Intercom</option>
            <option value="APP_STORE">App Store</option>
            <option value="SALES_CALL">Sales Calls</option>
            <option value="DISCORD">Discord</option>
            <option value="NPS_SURVEY">NPS Survey</option>
            <option value="EMAIL">Email</option>
          </select>

          {/* Customer Tier */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Tiers</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="PRO">Pro</option>
            <option value="STARTER">Starter</option>
            <option value="FREE">Free</option>
          </select>

          {/* Deduplication Filter */}
          <select
            value={filterDuplicate}
            onChange={(e) => setFilterDuplicate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Duplication States</option>
            <option value="DUPLICATE">Duplicates Only (Flagged)</option>
            <option value="UNIQUE">Unique Records Only</option>
          </select>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 ml-auto text-[11px]">
            <span className="text-slate-500 hidden xl:inline">Presets:</span>
            <button
              onClick={() => {
                setFilterUrgency('CRITICAL');
                setFilterStatus('NEW');
              }}
              className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
            >
              🚨 Critical Triage
            </button>
            <button
              onClick={() => {
                setFilterTier('ENTERPRISE');
                setFilterSentiment('NEGATIVE');
              }}
              className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors"
            >
              🏢 Enterprise Friction
            </button>
            <button
              onClick={() => {
                setFilterDuplicate('DUPLICATE');
              }}
              className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
            >
              🔄 Duplicates
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Feed Table on Left + Inspector Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feedback List (Spans 7 or 12 cols depending on drawer) */}
        <div className={`${selectedItem ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
          {filteredItems.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No Feedback Matches Current Filters</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing your search query or adjusting your channel, sentiment, urgency, or duplicate filters.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-800/70">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`p-4 transition-all cursor-pointer hover:bg-slate-800/50 ${
                      isSelected ? 'bg-blue-950/40 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        {/* Tags Strip */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border ${getSentimentBadge(
                              item.sentiment
                            )}`}
                          >
                            {item.sentiment} ({item.sentimentScore > 0 ? `+${item.sentimentScore}` : item.sentimentScore})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                              item.urgency
                            )}`}
                          >
                            {item.urgency}
                          </span>
                          {item.isDuplicate && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1">
                              <span>🔄 Duplicate</span>
                              {item.duplicateSimilarityScore ? (
                                <span>({Math.round(item.duplicateSimilarityScore * 100)}%)</span>
                              ) : null}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.channel}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                            {item.featureArea}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                          {highlightMatch(item.title, searchTerm)}
                        </h4>

                        {/* Content Snippet */}
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {highlightMatch(item.content, searchTerm)}
                        </p>

                        {/* Customer & Timestamp Bar */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-slate-300">
                            {highlightMatch(item.customerName, searchTerm)}
                          </span>
                          {item.customerCompany && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-300">
                                {highlightMatch(item.customerCompany, searchTerm)}
                              </span>
                            </>
                          )}
                          <span className="text-slate-600">•</span>
                          <span className="text-cyan-400 font-medium">
                            {item.customerTier} Tier
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono text-[10px]">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 mt-2 transition-transform shrink-0 ${
                          isSelected ? 'text-blue-400 rotate-90' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Feedback Inspection Drawer */}
        {selectedItem && (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-28 backdrop-blur-md">
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Feedback ID: {selectedItem.id}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  {selectedItem.title}
                </h3>
              </div>

              <button
                onClick={() => onSelectItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Workflow Action Buttons (Role-Gated) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Workflow State:</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] ${getStatusBadge(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>

              {userRole === 'VIEWER' ? (
                <div className="text-[11px] text-slate-500 italic">
                  Viewer role: Read-only access (switch to Admin or Analyst in top header to action tickets).
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange('NEW')}
                    disabled={isUpdating || selectedItem.status === 'NEW'}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedItem.status === 'NEW'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    Set NEW
                  </button>
                  <button
                    onClick={() => handleStatusChange('REVIEWED')}
                    disabled={isUpdating || selectedItem.status === 'REVIEWED'}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedItem.status === 'REVIEWED'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    REVIEWED
                  </button>
                  <button
                    onClick={() => handleStatusChange('ACTIONED')}
                    disabled={isUpdating || selectedItem.status === 'ACTIONED'}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedItem.status === 'ACTIONED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    ACTIONED ✓
                  </button>
                </div>
              )}

              {/* Triage / Resolution Notes */}
              {userRole !== 'VIEWER' && (
                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Internal Resolution Notes / Sprint Link:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Assigned to Pod 3; patched in PR #342"
                    defaultValue={selectedItem.actionNotes || ''}
                    onChange={(e) => setActionNotesInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {actionNotesInput && (
                    <button
                      onClick={() => handleStatusChange(selectedItem.status)}
                      className="mt-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-md shadow"
                    >
                      Save Note
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Raw Feedback Content & Quotation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Raw Customer Submission
              </label>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                "{selectedItem.content}"
              </div>
            </div>

            {/* AI Synthesized Intelligence Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-800/40 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Auto-Classification & Synthesis</span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-slate-200">Summary: </strong>
                {selectedItem.aiSummary || selectedItem.content.slice(0, 120)}
              </p>
              {selectedItem.keyQuote && (
                <div className="text-[11px] text-indigo-200/90 italic bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800/30">
                  {selectedItem.keyQuote}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {selectedItem.themes.map((t, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Theme: {t}
                  </span>
                ))}
                {selectedItem.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Deduplication & Vector Intelligence Block */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">🔄</span>
                  <span>Deduplication & Vector Intelligence</span>
                </span>
                {selectedItem.isDuplicate ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Flagged Duplicate
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Unique Record
                  </span>
                )}
              </div>

              {selectedItem.contentHash && (
                <div className="text-[11px] text-slate-400 font-mono break-all bg-slate-900/90 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 select-none">SHA-256 Hash: </span>
                  <span className="text-slate-300">{selectedItem.contentHash}</span>
                </div>
              )}

              {selectedItem.isDuplicate && (
                <div className="space-y-1.5 text-[11px] bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg text-amber-200">
                  <div>
                    <strong>Match Type: </strong>
                    <span className="font-mono">{selectedItem.duplicateType || 'SEMANTIC_SIMILARITY'}</span>
                    {selectedItem.duplicateSimilarityScore ? (
                      <span className="ml-1 text-amber-300 font-semibold">
                        ({Math.round(selectedItem.duplicateSimilarityScore * 100)}% similarity)
                      </span>
                    ) : null}
                  </div>
                  {selectedItem.duplicateOfId && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="truncate">
                        Matched Parent: <strong className="text-slate-200">#{selectedItem.duplicateOfId}</strong>
                        {selectedItem.duplicateOfTitle ? ` - "${selectedItem.duplicateOfTitle}"` : ''}
                      </span>
                      {feedbackList.some((f) => f.id === selectedItem.duplicateOfId) && (
                        <button
                          onClick={() => {
                            const parent = feedbackList.find((f) => f.id === selectedItem.duplicateOfId);
                            if (parent) onSelectItem(parent);
                          }}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-amber-600/40 hover:bg-amber-600/60 text-amber-100 rounded border border-amber-500/40 transition-colors shrink-0 ml-2"
                        >
                          View Original
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedItem.duplicateCount && selectedItem.duplicateCount > 1 && (
                <div className="text-[11px] text-blue-300 bg-blue-950/40 border border-blue-800/40 p-2.5 rounded-lg">
                  ℹ️ This item has <strong>{selectedItem.duplicateCount} merged customer submission instances</strong>.
                </div>
              )}
            </div>

            {/* Customer Metadata Profile */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="text-xs font-bold text-slate-300">Customer Profile</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-slate-400">
                  Name: <span className="text-slate-200 font-semibold">{selectedItem.customerName}</span>
                </div>
                <div className="text-slate-400">
                  Tier: <span className="text-cyan-400 font-semibold">{selectedItem.customerTier}</span>
                </div>
                <div className="text-slate-400">
                  Company: <span className="text-slate-200">{selectedItem.customerCompany || 'N/A'}</span>
                </div>
                <div className="text-slate-400">
                  Channel: <span className="font-mono text-slate-200">{selectedItem.channel}</span>
                </div>
                <div className="text-slate-400 col-span-2">
                  Email: <span className="text-slate-300">{selectedItem.customerEmail}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
