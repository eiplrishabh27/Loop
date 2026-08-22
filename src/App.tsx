import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { IngestView } from './components/IngestView';
import { ThemeTrendsView } from './components/ThemeTrendsView';
import { AskLoopView } from './components/AskLoopView';
import { VoCReportsView } from './components/VoCReportsView';
import { WorkspaceTeamView } from './components/WorkspaceTeamView';
import { PublicFeedbackPortal } from './components/PublicFeedbackPortal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import {
  Workspace,
  UserProfile,
  UserRole,
  FeedbackItem,
  ThemeItem,
  VoCReport,
  FeedbackStatus,
  User,
} from './types/loop';
import { SEED_WORKSPACES, SEED_USERS } from './data/seedData';
import { Loader2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation State (Detect /feedback or auth default)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('feedback') || hash.includes('feedback')) {
        return 'public-feedback';
      }
      const stored = localStorage.getItem('loop_user');
      if (!stored) {
        return 'auth';
      }
    }
    return 'dashboard';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('loop_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore parsing error
        }
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Workspaces & User State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(SEED_WORKSPACES);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(SEED_WORKSPACES[0]);
  const [userRole, setUserRole] = useState<UserRole>(currentUser?.role || 'ADMIN');

  // Core Data State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [reports, setReports] = useState<VoCReport[]>([]);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<FeedbackItem | null>(null);

  // Global Search & Filter State (Omnipresent filtering across keyword, priority, and status)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [globalSearchPriority, setGlobalSearchPriority] = useState<string>('ALL');
  const [globalSearchStatus, setGlobalSearchStatus] = useState<string>('ALL');

  // Status & Loading State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Sync role when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
      localStorage.setItem('loop_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('loop_user');
    }
  }, [currentUser]);

  // Fetch all workspace data
  const fetchWorkspaceData = useCallback(async (wsId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch Feedback
      const fbRes = await fetch(`/api/workspaces/${wsId}/feedback?limit=200`);
      if (!fbRes.ok) throw new Error(`Feedback API error: ${fbRes.statusText}`);
      const fbData = await fbRes.json();
      const items = Array.isArray(fbData) ? fbData : (Array.isArray(fbData?.items) ? fbData.items : []);
      setFeedbackList(items);

      // 2. Fetch Themes
      const thRes = await fetch(`/api/workspaces/${wsId}/themes`);
      if (!thRes.ok) throw new Error(`Themes API error: ${thRes.statusText}`);
      const thData = await thRes.json();
      setThemes(Array.isArray(thData) ? thData : []);

      // 3. Fetch Reports
      const rpRes = await fetch(`/api/workspaces/${wsId}/reports`);
      if (!rpRes.ok) throw new Error(`Reports API error: ${rpRes.statusText}`);
      const rpData = await rpRes.json();
      setReports(Array.isArray(rpData) ? rpData : []);
    } catch (err: any) {
      console.error('Data fetch failed:', err);
      setErrorMessage(err.message || 'Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & workspace changes
  useEffect(() => {
    // Fetch available workspaces
    fetch('/api/workspaces')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((wsList: Workspace[]) => {
        if (wsList && wsList.length > 0) {
          setWorkspaces(wsList);
          // Keep current if exists, or pick first
          const found = wsList.find((w) => w.id === currentWorkspace.id);
          if (!found) setCurrentWorkspace(wsList[0]);
        }
      })
      .catch((err) => console.warn('Could not fetch workspaces list:', err));

    fetchWorkspaceData(currentWorkspace.id);
  }, [currentWorkspace.id, fetchWorkspaceData]);

  // Handle Workspace Switch
  const handleSelectWorkspace = (wsId: string) => {
    const ws = workspaces.find((w) => w.id === wsId);
    if (ws) {
      setCurrentWorkspace(ws);
      setSelectedFeedbackItem(null);
      fetchWorkspaceData(ws.id);
      showToast(`Switched to workspace: ${ws.name}`, 'info');
    }
  };

  // Handle Login / Registration Success
  const handleLoginSuccess = (user: User, workspace?: Workspace) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (workspace) {
      setWorkspaces((prev) => {
        if (prev.some((w) => w.id === workspace.id)) return prev;
        return [...prev, workspace];
      });
      setCurrentWorkspace(workspace);
      fetchWorkspaceData(workspace.id);
    }
    setIsAuthModalOpen(false);
    setActiveTab('dashboard');
    showToast(`Signed in as ${user.name} (${user.role})`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('VIEWER');
    setActiveTab('auth');
    showToast('Signed out of session.', 'info');
  };

  // Handle Workspace Creation
  const handleCreateWorkspace = async (name: string, domain?: string) => {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({ name, domain }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create workspace');
    }

    const created: Workspace = await res.json();
    setWorkspaces((prev) => [...prev, created]);
    setCurrentWorkspace(created);
    fetchWorkspaceData(created.id);
    showToast(`Workspace "${created.name}" created!`, 'success');
  };

  // Handle Status Update for Feedback Item
  const handleUpdateStatus = async (id: string, status: FeedbackStatus, actionNotes?: string) => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/feedback/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({ status, actionNotes }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update ticket status');
    }

    const updated: FeedbackItem = await res.json();
    setFeedbackList((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedFeedbackItem?.id === id) {
      setSelectedFeedbackItem(updated);
    }
    showToast(`Feedback transitioned to ${status}`, 'success');
  };

  // Handle Single Ingest with Real-time AI auto-classification
  const handleSingleIngest = async (data: any) => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Ingest failed');
    }

    const created: FeedbackItem = await res.json();
    setFeedbackList((prev) => [created, ...prev]);
    fetchWorkspaceData(currentWorkspace.id);
    showToast(`New feedback classified: "${created.title}"`, 'success');
    return created;
  };

  // Handle Bulk CSV Ingest
  const handleBulkIngest = async (rows: any[]) => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/feedback/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({ items: rows }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Bulk ingest failed');
    }

    const result = await res.json();
    fetchWorkspaceData(currentWorkspace.id);
    showToast(`Bulk imported ${result.count} tickets!`, 'success');
    return result;
  };

  // Handle Live Channel Simulator
  const handleSimulateChannel = async (channel: string) => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/simulate-feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({ channel }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Simulation failed');
    }

    const result = await res.json();
    fetchWorkspaceData(currentWorkspace.id);
    showToast(`Simulated incoming event from ${channel} processed!`, 'success');
    return result;
  };

  // Handle AI Re-Clustering
  const handleRecluster = async () => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/cluster-themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Theme clustering failed');
    }

    const updatedThemes = await res.json();
    setThemes(updatedThemes);
    showToast('Gemini 3.7 unsupervised theme re-clustering completed!', 'success');
  };

  // Handle Generate VoC Report
  const handleGenerateReport = async (timeRange: string) => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
      body: JSON.stringify({ timeRange }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Report generation failed');
    }

    const newReport: VoCReport = await res.json();
    setReports((prev) => [newReport, ...prev]);
    showToast(`Executive VoC Digest generated: "${newReport.title}"`, 'success');
  };

  // Handle Reseed Baseline
  const handleReseed = async () => {
    const res = await fetch(`/api/workspaces/${currentWorkspace.id}/reseed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reseed failed');
    }

    fetchWorkspaceData(currentWorkspace.id);
    showToast('Workspace reseeded with fresh realistic customer feedback!', 'success');
  };

  // View routing helper for selecting feedback
  const handleSelectFeedbackAndNavigate = (item: FeedbackItem) => {
    setSelectedFeedbackItem(item);
    setActiveTab('inbox');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={handleSelectWorkspace}
        currentUser={currentUser}
        userRole={userRole}
        onChangeUserRole={setUserRole}
        onReseedData={handleReseed}
        onSimulateIncoming={() => handleSimulateChannel('ZENDESK')}
        totalFeedbackCount={feedbackList.length}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        feedbackList={feedbackList}
        searchQuery={globalSearchQuery}
        onSearchQueryChange={setGlobalSearchQuery}
        searchPriority={globalSearchPriority}
        onSearchPriorityChange={setGlobalSearchPriority}
        searchStatus={globalSearchStatus}
        onSearchStatusChange={setGlobalSearchStatus}
        onSelectFeedbackItem={handleSelectFeedbackAndNavigate}
      />

      {/* Floating Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
              toastNotice.type === 'error'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : toastNotice.type === 'info'
                ? 'bg-blue-950/90 border-blue-700 text-blue-200'
                : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            }`}
          >
            {toastNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastNotice.message}</span>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && feedbackList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <div className="text-sm font-semibold text-slate-300">
              Connecting to Project LOOP Intelligence Engine...
            </div>
            <p className="text-xs text-slate-500">Loading workspace telemetry & themes</p>
          </div>
        ) : errorMessage ? (
          <div className="bg-rose-950/20 border border-rose-800 rounded-2xl p-6 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-sm font-bold text-rose-200">Data Connection Error</h3>
            <p className="text-xs text-slate-300">{errorMessage}</p>
            <button
              onClick={() => fetchWorkspaceData(currentWorkspace.id)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div>
            {/* View: Authentication Window (Sign In & Register) */}
            {(activeTab === 'auth' || (!currentUser && activeTab !== 'public-feedback')) && (
              <LoginScreen
                onLoginSuccess={handleLoginSuccess}
                onOpenPublicFeedback={() => {
                  setActiveTab('public-feedback');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
              />
            )}

            {/* View: Public Customer Feedback Submission Portal (/feedback) */}
            {activeTab === 'public-feedback' && (
              <PublicFeedbackPortal
                currentWorkspace={currentWorkspace}
                onFeedbackSubmitted={(item) => {
                  setFeedbackList((prev) => [item, ...prev]);
                  showToast('Your real feedback was analyzed and sent to engineering!', 'success');
                }}
                onViewDashboard={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* View 1: Analytics Dashboard */}
            {currentUser && activeTab === 'dashboard' && (
              <DashboardView
                workspace={currentWorkspace}
                feedbackList={feedbackList}
                themes={themes}
                latestReport={reports[0] || null}
                onSelectFeedbackItem={handleSelectFeedbackAndNavigate}
                onSelectFeedback={handleSelectFeedbackAndNavigate}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToInbox={() => setActiveTab('inbox')}
                onNavigateToIngest={() => setActiveTab('ingest')}
                onNavigateToThemes={() => setActiveTab('themes')}
                onNavigateToAsk={() => setActiveTab('ask')}
                onNavigateToReports={() => setActiveTab('reports')}
              />
            )}

            {/* View 2: Feedback Inbox */}
            {currentUser && activeTab === 'inbox' && (
              <InboxView
                feedbackList={feedbackList}
                selectedItem={selectedFeedbackItem}
                onSelectItem={setSelectedFeedbackItem}
                onUpdateStatus={handleUpdateStatus}
                userRole={userRole}
                onNavigateToIngest={() => setActiveTab('ingest')}
                totalFeedbackCount={feedbackList.length}
                searchQuery={globalSearchQuery}
                onSearchQueryChange={setGlobalSearchQuery}
                searchPriority={globalSearchPriority}
                onSearchPriorityChange={setGlobalSearchPriority}
                searchStatus={globalSearchStatus}
                onSearchStatusChange={setGlobalSearchStatus}
              />
            )}

            {/* View 3: Ingest Data */}
            {currentUser && activeTab === 'ingest' && (
              <IngestView
                workspaceId={currentWorkspace.id}
                userRole={userRole}
                onSingleIngest={handleSingleIngest}
                onBulkIngest={handleBulkIngest}
                onSimulateChannel={handleSimulateChannel}
                onSuccessNavigate={() => setActiveTab('inbox')}
                onChangeUserRole={setUserRole}
              />
            )}

            {/* View 4: Theme Trends */}
            {currentUser && activeTab === 'themes' && (
              <ThemeTrendsView
                themes={themes}
                onRecluster={handleRecluster}
                userRole={userRole}
                onFilterByTheme={(themeName) => {
                  setGlobalSearchQuery(themeName);
                  setActiveTab('inbox');
                }}
              />
            )}

            {/* View 5: Ask LOOP (Grounded RAG) */}
            {currentUser && activeTab === 'ask' && (
              <AskLoopView
                workspaceId={currentWorkspace.id}
                onSelectFeedbackItem={handleSelectFeedbackAndNavigate}
              />
            )}

            {/* View 6: VoC Intelligence Digest Reports */}
            {currentUser && activeTab === 'reports' && (
              <VoCReportsView
                reports={reports}
                onGenerateReport={handleGenerateReport}
                userRole={userRole}
              />
            )}

            {/* View 7: Workspaces & Governance */}
            {currentUser && activeTab === 'workspaces' && (
              <WorkspaceTeamView
                workspaces={workspaces}
                currentWorkspace={currentWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                onCreateWorkspace={handleCreateWorkspace}
                currentUserRole={userRole}
                onReseedData={handleReseed}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Project LOOP</span>
            <span>• AI Feedback Intelligence & Product Synthesis</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
            <button
              onClick={() => setActiveTab('public-feedback')}
              className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Public Feedback Portal (/feedback)
            </button>
            <span>•</span>
            <span>Powered by Gemini AI • Multi-Tenant Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
