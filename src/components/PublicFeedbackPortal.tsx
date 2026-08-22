import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Star,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Layers,
  Heart,
  Smile,
  Meh,
  Frown,
  Flame,
  ArrowRight,
  ShieldCheck,
  Building,
  Mail,
  User as UserIcon,
  Tag,
  Paperclip,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { CustomerTier, FeedbackChannel, UrgencyLevel, Workspace } from '../types/loop';

interface PublicFeedbackPortalProps {
  currentWorkspace: Workspace;
  onFeedbackSubmitted?: (item: any) => void;
  onViewDashboard?: () => void;
}

export const PublicFeedbackPortal: React.FC<PublicFeedbackPortalProps> = ({
  currentWorkspace,
  onFeedbackSubmitted,
  onViewDashboard,
}) => {
  // Form State
  const [rating, setRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('Feature Request');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerTier, setCustomerTier] = useState<CustomerTier>('PRO');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Usability']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Submission & AI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    { id: 'Feature Request', label: 'Feature Request', icon: Sparkles, desc: 'Ideas to make the product better' },
    { id: 'Bug Report', label: 'Bug / Issue', icon: AlertCircle, desc: 'Something is broken or failing' },
    { id: 'UX Improvement', label: 'UX & Design', icon: Layers, desc: 'Clarity, layout, or design thoughts' },
    { id: 'Performance', label: 'Speed & Latency', icon: Flame, desc: 'Slow loading, timeouts, or freezes' },
    { id: 'Security & SSO', label: 'Security & Auth', icon: ShieldCheck, desc: 'SAML, OAuth, or permissions' },
    { id: 'Praise', label: 'General Praise', icon: Heart, desc: 'Things you love about the platform' },
  ];

  const popularTags = [
    'Usability',
    'SSO / Auth',
    'Mobile App',
    'Dark Mode',
    'API & Webhooks',
    'Billing',
    'Analytics Reports',
    'Performance',
    'Search & Filter',
    'Export CSV',
  ];

  const ratingLabels = ['Terrible', 'Bad', 'Neutral', 'Good', 'Loved It!'];
  const ratingIcons = [Frown, Frown, Meh, Smile, Heart];

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const cleaned = customTagInput.trim();
      if (!selectedTags.includes(cleaned)) {
        setSelectedTags([...selectedTags, cleaned]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('Please share some details in your feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        workspaceId: currentWorkspace.id,
        title: title.trim() || `${category}: Feedback from ${customerName || 'Customer'}`,
        content: content.trim(),
        category,
        customerName: customerName.trim() || 'Anonymous User',
        customerEmail: customerEmail.trim() || 'customer@example.com',
        customerCompany: customerCompany.trim() || 'Independent',
        customerTier,
        channel: 'INTERCOM' as FeedbackChannel,
        urgency,
        tags: selectedTags,
        rating,
      };

      const res = await fetch('/api/feedback/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': currentWorkspace.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback.');

      setSubmissionResult(data.item);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(data.item);
      }
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setErrorMessage(err.message || 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setTitle('');
    setContent('');
    setCategory('Feature Request');
    setRating(4);
    setAttachmentName(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 animate-fade-in space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/30 border border-blue-800/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <MessageSquarePlus className="w-48 h-48 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Voice Portal • {currentWorkspace.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            We value your thoughts.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Every submission is instantly evaluated by Gemini AI to identify friction, categorize themes, and route directly to product engineering leadership.
          </p>
        </div>
      </div>

      {/* Success Confirmation Card */}
      {submissionResult ? (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Feedback Successfully Captured!</h2>
              <p className="text-xs text-slate-400">
                Your ticket ID <span className="font-mono text-emerald-400 font-semibold">{submissionResult.id}</span> has been logged and synchronized into the {currentWorkspace.name} intelligence pipeline.
              </p>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Sparkles className="w-4 h-4" /> Real-Time Gemini AI Classification
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Score: {submissionResult.sentimentScore > 0 ? `+${submissionResult.sentimentScore}` : submissionResult.sentimentScore}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Sentiment</div>
                <div className={`font-bold mt-0.5 ${
                  submissionResult.sentiment === 'POSITIVE'
                    ? 'text-emerald-400'
                    : submissionResult.sentiment === 'NEGATIVE'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}>
                  {submissionResult.sentiment}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Feature Area</div>
                <div className="font-bold text-slate-200 mt-0.5 truncate">
                  {submissionResult.featureArea}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Priority Urgency</div>
                <div className="font-bold text-indigo-400 mt-0.5">
                  {submissionResult.urgency}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-500">Thematic Tag</div>
                <div className="font-bold text-purple-400 mt-0.5 truncate">
                  {submissionResult.themes?.[0] || 'General'}
                </div>
              </div>
            </div>

            {submissionResult.aiSummary && (
              <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                <span className="font-semibold text-blue-300">Executive Summary:</span> &ldquo;{submissionResult.aiSummary}&rdquo;
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Submit Another Feedback</span>
            </button>

            {onViewDashboard && (
              <button
                onClick={onViewDashboard}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>View in Workspace Intelligence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* The Feedback Submission Form */
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6"
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Rating & Experience */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              How would you rate your overall experience with {currentWorkspace.name}?
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = (hoverRating || rating) >= star;
                const IconComponent = ratingIcons[star - 1];
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                      (hoverRating || rating) === star
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                        : isSelected
                        ? 'bg-blue-950/60 border-blue-700/60 text-blue-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-xs font-semibold">{ratingLabels[star - 1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              What kind of feedback are you sharing?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-200">{cat.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Feedback Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Headline / One-line Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Exporting monthly reports should allow custom date filtering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Detailed Thoughts & Experience <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe what happened, what you expected, or specific improvements that would help your team..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* 4. Tag Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Topic Tags (Select or add keywords)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {popularTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    selectedTags.includes(t)
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom tag (Press Enter)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 5. Contact & Organization Info */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Your Information (For follow-ups)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. jordan@company.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Company / Team</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Analytics"
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Screenshot / File attachment mockup */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Attachments (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 cursor-pointer transition-all">
                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                <span>{attachmentName ? `Attached: ${attachmentName}` : 'Attach Screenshot or Log File'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachmentName(e.target.files[0].name);
                    }
                  }}
                />
              </label>
              {attachmentName && (
                <button
                  type="button"
                  onClick={() => setAttachmentName(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing & Transmitting Feedback with Gemini AI...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Real-Time Customer Feedback</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
