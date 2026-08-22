import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  MessageSquarePlus,
  Globe,
  Check,
  TrendingUp,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { User, UserRole, Workspace } from '../types/loop';

interface LoginScreenProps {
  onLoginSuccess: (user: User, workspace?: Workspace) => void;
  onOpenPublicFeedback: () => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenPublicFeedback,
  workspaces,
  currentWorkspace,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo 1-Click Accounts
  const demoAccounts = [
    {
      name: 'Alex Rivera',
      email: 'admin@loop.dev',
      role: 'ADMIN' as UserRole,
      title: 'Head of Product & Operations',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      badge: 'Admin (Full Access)',
      color: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
      desc: 'Can ingest feedback, run AI clustering, trigger VoC digests & manage RBAC.',
    },
    {
      name: 'Sarah Jenkins',
      email: 'analyst@loop.dev',
      role: 'ANALYST' as UserRole,
      title: 'Lead VoC Product Analyst',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      badge: 'Analyst (AI & Ingest)',
      color: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
      desc: 'Triage feedback, run Ask LOOP queries, and analyze sentiment trends.',
    },
    {
      name: 'Marcus Brody',
      email: 'viewer@loop.dev',
      role: 'VIEWER' as UserRole,
      title: 'Executive Stakeholder',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge: 'Viewer (Read-Only)',
      color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
      desc: 'Read-only access to executive intelligence dashboards and trends.',
    },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      setSuccessMessage(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please enter your name and email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          company: regCompany.trim(),
          workspaceName: regCompany.trim() ? `${regCompany.trim()} Workspace` : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      setSuccessMessage(`Account created for ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        onLoginSuccess(data.user, data.workspace);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (account: (typeof demoAccounts)[0]) => {
    setIsLoading(true);
    setErrorMessage(null);

    const userObj: User = {
      id: `usr-${account.role.toLowerCase()}-1`,
      name: account.name,
      email: account.email,
      role: account.role,
      workspaceId: currentWorkspace?.id || 'ws-acme-101',
      avatar: account.avatar,
      title: account.title,
    };

    setTimeout(() => {
      onLoginSuccess(userObj);
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Brand & Value Highlights */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Product Intelligence</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn raw feedback into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">product velocity</span>.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              LOOP continuously ingests customer conversations, runs unsupervised AI theme clustering, detects emergent friction spikes, and powers grounded Voice of Customer reporting.
            </p>
          </div>

          {/* Key Feature Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Gemini 3.7 AI Clustering</div>
                <div className="text-[11px] text-slate-400">Zero-configuration theme discovery and friction priority scoring.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Spike & Anomaly Detection</div>
                <div className="text-[11px] text-slate-400">Real-time alerts when customer issues cross critical velocity thresholds.</div>
              </div>
            </div>
          </div>

          {/* Direct Public Portal CTA */}
          <div className="pt-2">
            <div className="text-xs text-slate-400 mb-2">Want to submit customer feedback directly?</div>
            <button
              onClick={onOpenPublicFeedback}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold transition-all cursor-pointer group"
            >
              <MessageSquarePlus className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Open Public Feedback Portal (/feedback)</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Right Column: Authentication Card (Sign In & Register) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Project LOOP Authentication</h2>
                  <p className="text-[11px] text-slate-400">Enterprise Voice of Customer Intelligence</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form: Sign In */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@loop.dev"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[10px] text-slate-500">Demo enabled (any password)</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-950"
                    />
                    <span>Remember this device</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setLoginEmail('admin@loop.dev')}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Auto-fill Admin Email
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !loginEmail.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to LOOP Intelligence</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Form: Register */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan Lee"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Work Email <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. jordan@acme.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Acme Cloud Systems"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Initial Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="ADMIN">Admin (Full Control)</option>
                      <option value="ANALYST">Analyst (Ingest & VoC)</option>
                      <option value="VIEWER">Viewer (Dashboards Only)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !regName.trim() || !regEmail.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Workspace...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account & Enter Platform</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Persona Logins */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant 1-Click Demo Profiles</span>
                </span>
                <span className="text-[10px] text-slate-500">No password required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{acc.role}</div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                      {acc.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
