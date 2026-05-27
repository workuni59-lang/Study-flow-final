import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess?: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup, onForgotPassword }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    setSubmitting(false);
    if (authError) {
      const msg =
        authError.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : authError.message === 'Email not confirmed'
            ? 'Please verify your email first'
            : authError.message;
      setError(msg);
      return;
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
          {error}
        </motion.p>
      )}
      <div>
        <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@school.edu"
          className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
      </div>
      <div>
        <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
      </div>
      <button type="submit" disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-white text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50">
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={onForgotPassword}
          className="text-[9px] text-white/30 hover:text-white/50 transition-colors">
          Forgot password?
        </button>
        <button type="button" onClick={onSwitchToSignup}
          className="text-[9px] text-brand-light hover:text-brand transition-colors font-medium">
          Create account
        </button>
      </div>
    </form>
  );
}
