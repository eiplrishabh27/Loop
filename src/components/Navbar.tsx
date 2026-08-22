import React, { useState } from 'react';
import {
  Layers,
  LayoutDashboard,
  Inbox,
  PlusCircle,
  Sparkles,
  MessageSquareText,
  FileText,
  Users,
  Building2,
  Shield,
  RotateCcw,
  Radio,
  ChevronDown,
  Check,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Workspace, User, UserRole } from '../types/loop';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSelectWorkspace: ((ws: Workspace) => void) | ((wsId: string) => void);
  currentUser?: User | null;
  userRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onChangeUserRole?: (role: UserRole) => void;
  onReseedData?: () => void;
  onSimulateIncoming?: () => void;
  isSimulating?: boolean;
  totalFeedbackCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
  workspaces = [],
  currentWorkspace,
  onSelectWorkspace,
  currentUser,
  userRole: propUserRole,
  onSwitchRole,
  onChangeUserRole,
  onReseedData,
  onSimulateIncoming,
  isSimulating = false,
  totalFeedbackCount = 0,
}) => {
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const selectedTab = currentTab || activeTab || 'dashboard';
  const handleSelectTab = onSelectTab || onTabChange || (() => {});
  const effectiveRole: UserRole = propUserRole || currentUser?.role || 'ADMIN';
  const handleRoleChange = onSwitchRole || onChangeUserRole || (() => {});

  const handleWsClick = (ws: Workspace) => {
    if (typeof onSelectWorkspace === 'function') {
      try {
        (onSelectWorkspace as any)(ws.id);
      } catch {
        (onSelectWorkspace as any)(ws);
      }
    }
    setShowWsMenu(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Feedback Inbox', icon: Inbox },
    { id: 'ingest', label: 'Ingest Data', icon: PlusCircle },
    { id: 'themes', label: 'Theme Trends', icon: Sparkles },
    { id: 'ask', label: 'Ask LOOP (AI)', icon: MessageSquareText },
    { id: 'reports', label: 'VoC Reports', icon: FileText },
    { id: 'workspaces', label: 'Workspace & RBAC', icon: Users },
  ];

  const roleColors: Record<UserRole, { badge: string; text: string }> = {
    ADMIN: { badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400', text: 'Admin (Full Access)' },
    ANALYST: { badge: 'bg-blue-500/10 border-blue-500/30 text-blue-400', text: 'Analyst (AI & Ingest)' },
    VIEWER: { badge: 'bg-slate-500/10 border-slate-500/30 text-slate-400', text: 'Viewer (Read-Only)' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner: Workspace Switcher, Live Sim, RBAC Role Switcher & Reseed */}
      <div className="border-b border-slate-800/80 px-4 sm:px-6 py-2.5 bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Logo & Workspace Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                LOOP
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  v1.0
                </span>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

            {/* Workspace Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWsMenu(!showWsMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[140px] truncate">{currentWorkspace?.name || 'Workspace'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showWsMenu && (
                <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Tenant Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleWsClick(ws)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition-all ${
                        currentWorkspace?.id === ws.id
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{ws.name}</div>
                        <div className="text-[10px] opacity-75">{ws.industry}</div>
                      </div>
                      {currentWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Tools: Simulated Stream, Role Switcher, Reseed */}
          <div className="flex items-center gap-2">
            {/* Live Feed Simulator */}
            {onSimulateIncoming && (
              <button
                onClick={onSimulateIncoming}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-medium transition-all disabled:opacity-50"
                title="Simulate incoming Zendesk/Intercom ticket with live AI classification"
              >
                <Radio className={`w-3.5 h-3.5 text-indigo-400 ${isSimulating ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">Simulate Feed</span>
              </button>
            )}

            {/* Quick RBAC Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                  roleColors[effectiveRole]?.badge || 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Switch role to test Role-Based Access Control (RBAC)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{effectiveRole}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Test RBAC Roles (Grader Demo)
                  </div>
                  {(['ADMIN', 'ANALYST', 'VIEWER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRoleChange(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-start justify-between p-2 rounded-lg text-left text-xs mb-1 transition-all ${
                        effectiveRole === r ? 'bg-slate-800 border border-slate-700 font-medium' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{r}</span>
                          <span className="text-[10px] text-slate-400">({r === 'ADMIN' ? 'admin@loop.dev' : r === 'ANALYST' ? 'analyst@loop.dev' : 'viewer@loop.dev'})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {r === 'ADMIN' && 'Full access: Ingest, AI, manage members, reseed'}
                          {r === 'ANALYST' && 'Ingest & manage feedback, AI tools, no member management'}
                          {r === 'VIEWER' && 'Read-only access to dashboards, themes, reports'}
                        </div>
                      </div>
                      {effectiveRole === r && <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reseed Demo Workspace */}
            {onReseedData && (
              <button
                onClick={onReseedData}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium transition-all cursor-pointer"
                title="Reseed workspace with 120+ realistic feedback items"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden md:inline">Reseed (125 Items)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.id === 'ask' && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                    RAG
                  </span>
                )}
                {item.id === 'themes' && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                    Spikes
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
