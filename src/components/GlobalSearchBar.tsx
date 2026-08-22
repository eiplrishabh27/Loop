import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building,
  User,
  ArrowRight,
  Tag,
  Radio,
  Layers,
  Flame,
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus, UrgencyLevel } from '../types/loop';

interface GlobalSearchBarProps {
  feedbackList: FeedbackItem[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchPriority: string;
  onSearchPriorityChange: (priority: string) => void;
  searchStatus: string;
  onSearchStatusChange: (status: string) => void;
  onSelectFeedbackItem: (item: FeedbackItem) => void;
  onNavigateToInbox: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  feedbackList = [],
  searchQuery,
  onSearchQueryChange,
  searchPriority,
  onSearchPriorityChange,
  searchStatus,
  onSearchStatusChange,
  onSelectFeedbackItem,
  onNavigateToInbox,
  placeholder = 'Search feedback by keyword, customer, theme, quote...',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcut: Cmd+K or Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFilterDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search & filter
  const safeList = Array.isArray(feedbackList) ? feedbackList : [];
  const term = (searchQuery || '').toLowerCase().trim();

  const filteredResults = safeList.filter((item) => {
    if (!item) return false;
    const title = (item.title || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const customerName = (item.customerName || '').toLowerCase();
    const customerCompany = (item.customerCompany || '').toLowerCase();
    const featureArea = (item.featureArea || '').toLowerCase();
    const themes = Array.isArray(item.themes) ? item.themes : [];
    const tags = Array.isArray(item.tags) ? item.tags : [];

    const matchesTerm =
      !term ||
      title.includes(term) ||
      content.includes(term) ||
      customerName.includes(term) ||
      customerCompany.includes(term) ||
      featureArea.includes(term) ||
      themes.some((t) => (t || '').toLowerCase().includes(term)) ||
      tags.some((t) => (t || '').toLowerCase().includes(term));

    const matchesPriority =
      searchPriority === 'ALL' || !searchPriority || item.urgency === searchPriority;
    const matchesStatus =
      searchStatus === 'ALL' || !searchStatus || item.status === searchStatus;

    return matchesTerm && matchesPriority && matchesStatus;
  });

  const hasActiveFilters =
    Boolean(term) || (searchPriority && searchPriority !== 'ALL') || (searchStatus && searchStatus !== 'ALL');

  const handleResetFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSearchQueryChange('');
    onSearchPriorityChange('ALL');
    onSearchStatusChange('ALL');
  };

  const handleItemClick = (item: FeedbackItem) => {
    onSelectFeedbackItem(item);
    setIsOpen(false);
    setShowFilterDropdown(false);
  };

  const handleViewAllInInbox = () => {
    onNavigateToInbox();
    setIsOpen(false);
    setShowFilterDropdown(false);
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
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

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input Container */}
      <div
        className={`flex items-center gap-1.5 bg-slate-950/90 border rounded-xl px-3 transition-all ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
            : 'border-slate-700/80 hover:border-slate-600'
        } ${compact ? 'py-1.5' : 'py-2'}`}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchQueryChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleViewAllInInbox();
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        {/* Clear Search Input */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchQueryChange('');
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-md"
            title="Clear search text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quick Filter Toggle Button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilterDropdown(!showFilterDropdown);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
              (searchPriority && searchPriority !== 'ALL') || (searchStatus && searchStatus !== 'ALL')
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-850 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Filter by priority or status"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">
              {searchPriority !== 'ALL' || searchStatus !== 'ALL' ? 'Filtered' : 'Filters'}
            </span>
            <ChevronDown className="w-2.5 h-2.5 opacity-70" />
          </button>

          {/* Filter Popover Menu */}
          {showFilterDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-fade-in space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>Search Filters</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Priority / Urgency Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Priority / Urgency
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Priorities' },
                    { id: 'CRITICAL', label: '🚨 Critical' },
                    { id: 'HIGH', label: '⚡ High' },
                    { id: 'MEDIUM', label: '🔷 Medium' },
                    { id: 'LOW', label: '⚪ Low' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSearchPriorityChange(p.id)}
                      className={`px-2 py-1 rounded-lg text-left text-[11px] font-medium transition-colors cursor-pointer ${
                        searchPriority === p.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Workflow Status
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Statuses' },
                    { id: 'NEW', label: '🟡 NEW' },
                    { id: 'REVIEWED', label: '🔵 REVIEWED' },
                    { id: 'ACTIONED', label: '🟢 ACTIONED' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onSearchStatusChange(s.id)}
                      className={`px-2 py-1 rounded-lg text-left text-[11px] font-medium transition-colors cursor-pointer ${
                        searchStatus === s.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="hidden md:flex items-center gap-1 pl-1 text-[10px] font-mono text-slate-500 border-l border-slate-800">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">⌘K</kbd>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px]">
          <span className="text-slate-500 text-[10px]">Active filters:</span>
          {term && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
              <span>"{term}"</span>
              <button
                onClick={() => onSearchQueryChange('')}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {searchPriority && searchPriority !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
              <span>Priority: {searchPriority}</span>
              <button
                onClick={() => onSearchPriorityChange('ALL')}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {searchStatus && searchStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
              <span>Status: {searchStatus}</span>
              <button
                onClick={() => onSearchStatusChange('ALL')}
                className="hover:text-white cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Live Search Results Dropdown Popover */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in max-h-[460px] flex flex-col"
        >
          {/* Results Header */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {filteredResults.length === 0
                  ? 'No matching feedback items'
                  : `Found ${filteredResults.length} matching feedback item${filteredResults.length === 1 ? '' : 's'}`}
              </span>
            </span>
            <span className="text-[10px] text-slate-500">
              {filteredResults.length > 0 && 'Click item to inspect'}
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">
                  No feedback matches "{searchQuery || searchPriority || searchStatus}"
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Try searching by different keywords, customer names, themes, or adjusting your priority and status filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 font-medium cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredResults.slice(0, 7).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="p-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/80 transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getUrgencyBadge(
                          item.urgency
                        )}`}
                      >
                        {item.urgency}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                        {item.channel}
                      </span>
                      {item.customerTier && (
                        <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded">
                          {item.customerTier}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                    {highlightMatch(item.title, term)}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {highlightMatch(item.content, term)}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-800/40 text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">
                        {item.customerCompany || item.customerName || 'Anonymous Customer'}
                      </span>
                      {item.featureArea && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400">{item.featureArea}</span>
                        </>
                      )}
                    </div>
                    {item.themes && item.themes.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        <span className="text-slate-400 truncate max-w-[120px]">
                          {item.themes[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Footer Action */}
          {filteredResults.length > 0 && (
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Showing {Math.min(7, filteredResults.length)} of {filteredResults.length} matches
              </span>
              <button
                onClick={handleViewAllInInbox}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>View all {filteredResults.length} in Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
