import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Input, Label } from './components';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister, forgotPassword, resetPassword, ApiError } from '../lib/api';

type View = 'login' | 'register' | 'forgot' | 'forgot-sent' | 'reset' | 'reset-done';

export default function Auth() {
  const { login } = useAuth();
  const [view, setView] = useState<View>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState('');

  // ── On mount: check if the URL contains a password reset token ─────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token && window.location.pathname.includes('reset-password')) {
      setResetToken(token);
      setView('reset');
      // Clean the token from the URL bar without a hard reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password (from email link)
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const handleApiError = (err: unknown) => {
    const apiErr = err as ApiError;
    if (apiErr?.details) {
      const first = Object.values(apiErr.details)[0]?.[0];
      setError(first ?? apiErr.message);
    } else {
      setError(apiErr?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiRegister({
        email: regEmail,
        username: regUsername,
        firstName: regFirstName,
        lastName: regLastName,
        password: regPassword,
      });
      // Auto-login after registration
      await login({ email: regEmail, password: regPassword });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setView('forgot-sent');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(resetToken, resetNewPassword);
      setView('reset-done');
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTo = (v: View) => { setView(v); setError(null); };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-left-4 duration-700">

          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                F
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-lime-600">
                FoodGenie
              </span>
            </div>

            {view === 'login' && <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Chef!</h1>
              <p className="text-slate-500">Enter your details to access your kitchen.</p>
            </>}
            {view === 'register' && <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Join the Kitchen</h1>
              <p className="text-slate-500">Create an account to start cooking smarter.</p>
            </>}
            {(view === 'forgot' || view === 'forgot-sent') && <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
              <p className="text-slate-500">We'll send a reset link to your email.</p>
            </>}
            {view === 'reset' && <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h1>
              <p className="text-slate-500">Choose a strong new password for your account.</p>
            </>}
            {view === 'reset-done' && <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Password Updated!</h1>
              <p className="text-slate-500">You can now sign in with your new password.</p>
            </>}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login form ── */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="login-email" type="email" placeholder="chef@example.com" className="pl-10"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Password</Label>
                  <button type="button" onClick={() => resetTo('forgot')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="login-password" type="password" placeholder="••••••••" className="pl-10"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full py-3 text-base shadow-lg shadow-emerald-900/10" disabled={isLoading}>
                {isLoading ? 'Signing in…' : <span className="flex items-center gap-2">Sign In <ArrowRight size={18} /></span>}
              </Button>
            </form>
          )}

          {/* ── Register form ── */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="reg-first">First Name</Label>
                  <Input id="reg-first" type="text" placeholder="Gordon"
                    value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="reg-last">Last Name</Label>
                  <Input id="reg-last" type="text" placeholder="Ramsay"
                    value={regLastName} onChange={e => setRegLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="reg-username" type="text" placeholder="gordonramsay" className="pl-10"
                    value={regUsername} onChange={e => setRegUsername(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="reg-email" type="email" placeholder="chef@example.com" className="pl-10"
                    value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="reg-password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="pl-10"
                    value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full py-3 text-base shadow-lg shadow-emerald-900/10" disabled={isLoading}>
                {isLoading ? 'Creating account…' : <span className="flex items-center gap-2">Create Account <ArrowRight size={18} /></span>}
              </Button>
            </form>
          )}

          {/* ── Forgot password form ── */}
          {view === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="forgot-email" type="email" placeholder="chef@example.com" className="pl-10"
                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full py-3 text-base" disabled={isLoading}>
                {isLoading ? 'Sending…' : <span className="flex items-center gap-2">Send Reset Link <ArrowRight size={18} /></span>}
              </Button>
              <button type="button" onClick={() => resetTo('login')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mx-auto">
                <ChevronLeft size={16} /> Back to login
              </button>
            </form>
          )}

          {/* ── Forgot sent confirmation ── */}
          {view === 'forgot-sent' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <p className="text-slate-600">
                If <strong>{forgotEmail}</strong> is registered, a reset link has been sent. Check your inbox.
              </p>
              <button type="button" onClick={() => resetTo('login')}
                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mx-auto font-medium">
                <ChevronLeft size={16} /> Back to login
              </button>
            </div>
          )}

          {/* ── Reset password form (from email link) ── */}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="reset-pw">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="reset-pw" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="pl-10"
                    value={resetNewPassword} onChange={e => setResetNewPassword(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="reset-pw-confirm">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input id="reset-pw-confirm" type="password" placeholder="••••••••" className="pl-10"
                    value={resetConfirmPassword} onChange={e => setResetConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <Button className="w-full py-3 text-base" disabled={isLoading}>
                {isLoading ? 'Saving…' : <span className="flex items-center gap-2">Set New Password <ArrowRight size={18} /></span>}
              </Button>
            </form>
          )}

          {/* ── Reset done confirmation ── */}
          {view === 'reset-done' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <p className="text-slate-600">Your password has been updated. You can now sign in.</p>
              <Button onClick={() => resetTo('login')} className="mx-auto">
                Go to Sign In
              </Button>
            </div>
          )}

          {/* Toggle login / register */}
          {(view === 'login' || view === 'register') && (
            <p className="text-center text-sm text-slate-600">
              {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => resetTo(view === 'login' ? 'register' : 'login')}
                className="text-emerald-600 font-semibold hover:underline focus:outline-none">
                {view === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Visual panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1600&q=80"
            className="w-full h-full object-cover" alt="Cooking Background" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-slate-900/90" />
        <div className="relative z-10 max-w-lg p-12 text-white">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Manage your kitchen,<br />
            <span className="text-emerald-400">master your meals.</span>
          </h2>
          <div className="space-y-6">
            {[
              "Track your pantry inventory automatically",
              "Generate recipes based on what you have",
              "Plan meals and automate shopping lists",
              "Connect with other chefs in your network",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400 text-sm">✓</span>
                </div>
                <p className="text-lg text-slate-200">{feature}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-bold">Join 10,000+ Chefs</p>
              <p className="text-slate-400">Cooking smarter every day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
