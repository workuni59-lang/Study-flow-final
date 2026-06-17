import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Key, CheckCircle2, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (type === 'recovery' && accessToken) {
      supabase!.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          setError('Invalid or expired reset link. Please request a new one.');
        } else {
          setReady(true);
          window.history.replaceState({}, '', '/reset-password');
        }
      });
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    const strength = passwordStrength(password);
    if (strength.score < 3) {
      setError('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    setLoading(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (!ready && !error) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to StudyFlow
        </button>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-white uppercase tracking-tight">Reset Password</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Choose a new password</p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-rose-400 text-xs font-bold">{error}</p>
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
              <p className="text-green-400 font-bold text-sm">Password reset successful!</p>
              <p className="text-slate-500 text-[10px]">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 rounded-2xl bg-slate-800 border-none text-sm font-bold text-white focus:ring-2 ring-indigo-500 transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 bottom-4 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength(password).score ? passwordStrength(password).color : 'bg-slate-700'}`} />
                      ))}
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: passwordStrength(password).score >= 3 ? '#22c55e' : '#f59e0b' }}>
                      {passwordStrength(password).label}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-800 border-none text-sm font-bold text-white focus:ring-2 ring-indigo-500 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}