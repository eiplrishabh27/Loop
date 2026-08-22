import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  Plus,
  CheckCircle2,
  Key,
  Database,
  RefreshCw,
  Layers,
  Lock,
} from 'lucide-react';
import { Workspace, UserProfile, UserRole } from '../types/loop';

interface WorkspaceTeamViewProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string, domain?: string) => Promise<void>;
  currentUserRole: UserRole;
  onReseedData: () => Promise<void>;
}

export const WorkspaceTeamView: React.FC<WorkspaceTeamViewProps> = ({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  currentUserRole,
  onReseedData,
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDomain, setNewWorkspaceDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    setIsCreating(true);
    try {
      await onCreateWorkspace(newWorkspaceName.trim(), newWorkspaceDomain.trim() || undefined);
      setSuccessNotice(`Workspace "${newWorkspaceName}" created successfully!`);
      setNewWorkspaceName('');
      setNewWorkspaceDomain('');
    } catch (err: any) {
      alert(err.message || 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleReseed = async () => {
    if (currentUserRole !== 'ADMIN') {
      alert('Only workspace Admins can reseed baseline data.');
      return;
    }
    if (!confirm('Reseed this workspace with multi-channel customer tickets?')) return;
    setIsReseeding(true);
    try {
      await onReseedData();
      setSuccessNotice('Workspace data reseeded with fresh multi-channel customer tickets!');
    } catch (err: any) {
      alert(err.message || 'Failed to reseed');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-500" />
          <span>Workspaces & RBAC Governance</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Project LOOP is built for multi-tenant isolation. Manage your team, switch between product workspaces, and enforce strict Role-Based Access Control (RBAC).
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workspace Selector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Available Workspaces</span>
            </h3>
            <span className="text-xs text-slate-500">{workspaces.length} active tenants</span>
          </div>

          <div className="space-y-2.5">
            {workspaces.map((ws) => {
              const isCurrent = ws.id === currentWorkspace.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-blue-600/10 border-blue-500 text-blue-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>{ws.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Tenant ID: {ws.id} {ws.domain ? `• Domain: ${ws.domain}` : ''}
                    </div>
                  </div>
                  <button className="text-xs text-blue-400 font-medium">
                    {isCurrent ? 'Selected' : 'Switch →'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reset Baseline Data Tool */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-xs font-bold text-slate-300 mb-1">Developer & Testing Tools</div>
            <p className="text-[11px] text-slate-500 mb-3">
              Reset this workspace to baseline multi-channel customer records across Zendesk, Discord, App Store, and Gong.
            </p>
            <button
              onClick={handleReseed}
              disabled={isReseeding || currentUserRole !== 'ADMIN'}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
              <span>{isReseeding ? 'Reseeding...' : 'Reseed Workspace with Realistic Data'}</span>
            </button>
          </div>
        </div>

        {/* Create New Tenant Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create New Product Workspace</span>
          </h3>
          <p className="text-xs text-slate-400">
            Create an isolated tenant space for a new product, mobile app, or client engagement.
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Workspace Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Mobile App / AI Studio Enterprise"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Company Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. acme.corp"
                value={newWorkspaceDomain}
                onChange={(e) => setNewWorkspaceDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !newWorkspaceName.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
          </form>
        </div>
      </div>

      {/* RBAC Governance Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-slate-100">
            Role-Based Access Control (RBAC) Matrix
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Enforce enterprise permissions across your product managers, analysts, and executive stakeholders.
        </p>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] text-slate-400 font-mono uppercase">
              <tr>
                <th className="p-3">Capability / Action</th>
                <th className="p-3 text-center">Admin</th>
                <th className="p-3 text-center">Analyst</th>
                <th className="p-3 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/50">
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  View Analytics & Filter Feedback Inbox
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  Ask LOOP Evidence-Grounded Q&A (RAG)
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  Ingest Manual Tickets & Upload Bulk CSV
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-400 font-mono">✕ Blocked</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  Update Ticket Status (NEW → REVIEWED → ACTIONED)
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-400 font-mono">✕ Blocked</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  Trigger Gemini AI Re-Clustering & VoC Synthesis
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-400 font-mono">✕ Blocked</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-200">
                  Reseed Workspace Data & Manage RBAC
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-rose-400 font-mono">✕ Blocked</td>
                <td className="p-3 text-center text-rose-400 font-mono">✕ Blocked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
