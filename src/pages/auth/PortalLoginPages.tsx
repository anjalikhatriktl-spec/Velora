import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { VeloraLogo } from '../../components/VeloraLogo';
import { BRAND_MEDIA } from '../../data/catalog';

interface PortalLoginPageProps {
  portal: 'admin' | 'employee';
}

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({ portal }) => {
  const {
    loading,
    user,
    adminInitialized,
    login,
    setupAdmin,
    activateEmployee,
    forgotPassword,
    resetPassword,
  } = useAuth();
  const { navigate } = useStore();

  const [mode, setMode] = useState<'login' | 'setup' | 'activate' | 'forgot' | 'reset'>(
    portal === 'admin' && !adminInitialized ? 'setup' : 'login'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (portal === 'admin' && !adminInitialized) {
      setMode('setup');
    } else if (portal === 'admin' && adminInitialized && mode === 'setup') {
      setMode('login');
    }
  }, [portal, adminInitialized, mode]);

  useEffect(() => {
    if (loading || !user) return;
    if (portal === 'admin' && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_MANAGER')) {
      navigate('admin-dashboard');
    } else if (portal === 'employee') {
      navigate('employee-dashboard');
    }
  }, [loading, user, portal, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      const signedIn = await login({ email, password, rememberMe, portal });
      if (portal === 'admin' && (signedIn.role === 'SUPER_ADMIN' || signedIn.role === 'ADMIN_MANAGER')) {
        navigate('admin-dashboard');
      } else {
        navigate('employee-dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      await setupAdmin({ name, email, password });
      navigate('admin-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create Super Admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      await activateEmployee({ email, inviteCode, password });
      navigate('employee-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Activation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      const msg = await forgotPassword(email);
      setInfoMessage(msg);
      setMode('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setSubmitting(true);
    try {
      const msg = await resetPassword({ email, code: resetCode, newPassword: password });
      setInfoMessage(msg);
      setPassword('');
      setResetCode('');
      setMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdminPortal = portal === 'admin';

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#181614] grid grid-cols-1 lg:grid-cols-12">
      {/* Left Luxury Editorial Visual Panel */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-[#141210] text-[#FAF8F4] flex-col justify-between p-12 overflow-hidden">
        <img
          src={isAdminPortal ? BRAND_MEDIA.hero : BRAND_MEDIA.atelier}
          alt="VELORA Fragrance Atelier"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/70 to-[#141210]/60" />

        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#E6DDD1] hover:text-[#B8935A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Storefront
          </button>
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#B8935A]">
            {isAdminPortal ? 'Executive Portal' : 'Staff Operations'}
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-5">
          <VeloraLogo tone="light" size="lg" />
          <div className="w-12 h-[1px] bg-[#B8935A]" />
          <h2 className="font-serif text-4xl font-normal leading-tight text-white">
            {isAdminPortal
              ? 'Command the House of VELORA with Precision.'
              : 'Craftsmanship, Fulfillment & Concierge Excellence.'}
          </h2>
          <p className="text-sm text-[#E6DDD1] leading-relaxed">
            {isAdminPortal
              ? 'Real-time Cash on Delivery revenue intelligence, bespoke bottle inventory controls, order dispatch orchestration, and boutique staff governance.'
              : 'Manage daily attendance check-ins, assigned fragrance orders, support tickets, inventory movements, and boutique tasks in one refined workspace.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[#A3998E] border-t border-[#2D2824] pt-6">
          <span>VELORA Parfums India · INR (₹) · COD</span>
          <span>Encrypted Session Control</span>
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="lg:col-span-6 flex flex-col justify-between px-5 sm:px-10 lg:px-16 py-8 sm:py-12">
        <div className="flex items-center justify-between lg:justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="lg:hidden inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#6E655E] hover:text-[#181614]"
          >
            <ArrowLeft className="w-4 h-4" />
            Storefront
          </button>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => navigate('admin-login')}
              className={`px-3 py-1.5 border transition-colors uppercase tracking-[0.14em] text-[11px] ${
                isAdminPortal
                  ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                  : 'border-[#E6DDD1] text-[#6E655E] hover:border-[#B8935A]'
              }`}
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('employee-login')}
              className={`px-3 py-1.5 border transition-colors uppercase tracking-[0.14em] text-[11px] ${
                !isAdminPortal
                  ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                  : 'border-[#E6DDD1] text-[#6E655E] hover:border-[#B8935A]'
              }`}
            >
              Employee Portal
            </button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[#9A7742] font-medium">
              {isAdminPortal ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span>
                {isAdminPortal ? 'VELORA Admin Control' : 'VELORA Employee Workspace'}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#181614]">
              {mode === 'setup'
                ? 'Initialize Super Admin'
                : mode === 'activate'
                ? 'Activate Staff Account'
                : mode === 'forgot'
                ? 'Recover Portal Access'
                : mode === 'reset'
                ? 'Set New Password'
                : isAdminPortal
                ? 'Administrator Sign In'
                : 'Employee Sign In'}
            </h1>
            <p className="text-sm text-[#6E655E] leading-relaxed">
              {mode === 'setup'
                ? 'No primary administrator has been registered yet. Create the Super Admin account to manage VELORA.'
                : mode === 'activate'
                ? 'Enter your boutique work email and the invite code provided by your VELORA Administrator.'
                : mode === 'forgot'
                ? 'Enter your registered email address to issue a time-limited recovery code.'
                : mode === 'reset'
                ? 'Enter the 6-digit recovery code and choose a strong new password.'
                : isAdminPortal
                ? 'Authorized Super Admins and Admin Managers only.'
                : 'Sign in with your VELORA staff credentials to access your shifts, orders, and tasks.'}
            </p>
          </div>

          {!isAdminPortal && (mode === 'login' || mode === 'activate') && (
            <div className="grid grid-cols-2 border border-[#E6DDD1] bg-[#F2ECE4]/50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
                  mode === 'login'
                    ? 'bg-[#181614] text-[#FAF8F4]'
                    : 'text-[#6E655E] hover:text-[#181614]'
                }`}
              >
                Staff Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('activate');
                  setError(null);
                }}
                className={`py-2 text-xs tracking-[0.14em] uppercase transition-colors ${
                  mode === 'activate'
                    ? 'bg-[#181614] text-[#FAF8F4]'
                    : 'text-[#6E655E] hover:text-[#181614]'
                }`}
              >
                Activate Invite
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3.5 bg-[#FDF1F0] border border-[#ECC8C4] text-xs text-[#9E352B] leading-relaxed"
            >
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-[#EDF5EF] border border-[#C5DFCC] text-xs text-[#1F5D37] leading-relaxed">
              {infoMessage}
            </div>
          )}

          {user && isAdminPortal && user.role === 'EMPLOYEE' && (
            <div className="p-4 bg-[#FAF3E6] border border-[#E6D1AD] text-xs text-[#8A5D19] space-y-2">
              <p className="font-medium">
                You are currently signed in as an Employee ({user.email}).
              </p>
              <button
                type="button"
                onClick={() => navigate('employee-dashboard')}
                className="underline font-medium text-[#181614]"
              >
                Go to Employee Dashboard →
              </button>
            </div>
          )}

          {/* SETUP SUPER ADMIN FORM */}
          {mode === 'setup' && (
            <form onSubmit={handleSetupAdmin} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Raghavendra Singhania"
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Administrator Email *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#9A7742] absolute left-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@velorafragrances.in"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Password (min 8 characters) *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#9A7742] absolute left-3.5" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure passphrase"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-60 transition-colors text-xs font-medium tracking-[0.18em] uppercase"
              >
                {submitting ? 'Creating Account...' : 'Create Super Admin & Enter'}
              </button>
            </form>
          )}

          {/* STANDARD LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#9A7742] absolute left-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      isAdminPortal
                        ? 'admin@velorafragrances.in'
                        : 'aarav.mehta@velorafragrances.in'
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#9A7742] absolute left-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-[#2B2623]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-[#181614] w-4 h-4"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setInfoMessage(null);
                    setMode('forgot');
                  }}
                  className="text-[#9A7742] hover:text-[#181614] underline underline-offset-4"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-60 transition-colors text-xs font-medium tracking-[0.18em] uppercase"
              >
                {submitting
                  ? 'Authenticating...'
                  : isAdminPortal
                  ? 'Login to Admin Dashboard'
                  : 'Login to Employee Workspace'}
              </button>
            </form>
          )}

          {/* ACTIVATE EMPLOYEE ACCOUNT FORM */}
          {mode === 'activate' && !isAdminPortal && (
            <form onSubmit={handleActivateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Registered Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.mehta@velorafragrances.in"
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Admin Invite Code *
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="w-4 h-4 text-[#9A7742] absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Issued by VELORA Admin (e.g. VL-JOIN-...)"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Choose Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create your staff password"
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-60 transition-colors text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>{submitting ? 'Activating...' : 'Activate & Sign In'}</span>
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@velorafragrances.in"
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
              >
                {submitting ? 'Generating Code...' : 'Request Recovery Code'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-[#6E655E] hover:text-[#181614]"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  6-Digit Recovery Code *
                </label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-1.5">
                  New Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E6DDD1] focus:border-[#181614] focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs text-[#6E655E] hover:text-[#181614]"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-[#6E655E]">
          © {new Date().getFullYear()} VELORA Luxury Fragrances India · Internal Operations Portal
        </div>
      </div>
    </div>
  );
};
