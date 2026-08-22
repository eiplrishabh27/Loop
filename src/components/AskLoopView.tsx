import React, { useState } from 'react';
import {
  MessageSquareText,
  Sparkles,
  Send,
  Loader2,
  Quote,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Tag,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, GroundedSource, FeedbackItem } from '../types/loop';

interface AskLoopViewProps {
  workspaceId: string;
  onSelectFeedbackItem?: (item: FeedbackItem) => void;
}

export const AskLoopView: React.FC<AskLoopViewProps> = ({ workspaceId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `Hello! I am **Ask LOOP**, your evidence-grounded AI product intelligence assistant. 

Ask me anything about customer sentiment, emerging bugs, feature requests, or enterprise churn risks. I answer **strictly from your real feedback records** and cite exact ticket quotes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowups: [
        'What are Enterprise users complaining about regarding login or SSO?',
        'Why are finance teams having issues with invoices?',
        'What is driving positive sentiment in onboarding?',
        'Which mobile app issues need urgent engineering fixes?',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSourceDrawer, setActiveSourceDrawer] = useState<GroundedSource | null>(null);

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputText;
    if (!q || !q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to query Ask LOOP');
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources,
        suggestedFollowups: data.suggestedFollowups,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        text: `Error retrieving grounded answer: ${err.message}. Please verify Gemini API key configuration.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span>Ask LOOP — Grounded Q&A (RAG)</span>
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                100% Grounded
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Query your feedback repository with natural language. Every answer is backed by real customer citations, timestamps, and verifiable ticket IDs.
            </p>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'msg-welcome-reset',
                  role: 'assistant',
                  text: 'Chat history cleared. What would you like to investigate across your customer feedback data?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  suggestedFollowups: [
                    'What are Enterprise users complaining about regarding login or SSO?',
                    'Why are finance teams having issues with invoices?',
                    'What is driving positive sentiment in onboarding?',
                  ],
                },
              ])
            }
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[640px]">
        {/* Messages Stream Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-[13px]">{msg.text}</div>

                {/* Grounded Citation Sources Box */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Retrieved Verifiable Evidence ({msg.sources.length} Sources)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveSourceDrawer(src)}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-200 truncate max-w-[130px]">
                              {src.customerName}
                            </span>
                            <span className="font-mono text-cyan-400">{src.channel}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic line-clamp-2">
                            "{src.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    {msg.suggestedFollowups.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(f)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-blue-900/40 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-700/50 transition-all text-left"
                      >
                        ↳ {f}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0 mt-0.5 border border-slate-700">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 p-2">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Scanning feedback repository & grounding evidence with Gemini...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask a question about customer feedback (e.g., 'What is causing SAML session drops?')..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>

      {/* Modal / Inspector for Source Item */}
      {activeSourceDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-slate-100">Grounded Citation Source</span>
              </div>
              <button
                onClick={() => setActiveSourceDrawer(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 rounded-md"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 font-medium">Customer:</div>
              <div className="text-sm font-bold text-slate-100">{activeSourceDrawer.customerName}</div>
              <div className="text-xs text-cyan-400 font-mono">
                Tier: {activeSourceDrawer.customerTier} | Channel: {activeSourceDrawer.channel} | Feature: {activeSourceDrawer.featureArea}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
              "{activeSourceDrawer.snippet}"
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Recorded at: {new Date(activeSourceDrawer.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
