import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Display name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    const { error: authError } = await signUp(email, password, name.trim());
    setSubmitting(false);
    if (authError) {
      setError(
        authError.message === 'User already registered'
          ? 'An account with this email already exists'
          : authError.message
      );
      return;
    }
    setDone(true);
    onSuccess?.();
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-6 h-6 text-emerald-400 text-lg">✓</motion.div>
        </div>
        <p className="text-sm font-semibold text-white/90 mb-1">Check your email</p>
        <p className="text-[10px] text-white/40 leading-relaxed">We sent a confirmation link to <span className="text-white/60">{email}</span></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
          {error}
        </motion.p>
      )}
      <div>
        <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Display Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
      </div>
      <div>
        <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@school.edu"
          className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 chars"
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
        </div>
        <div>
          <label className="text-[9px] font-medium text-white/40 uppercase tracking-wider block mb-1">Confirm</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
        </div>
      </div>
      <button type="submit" disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-white text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50">
        {submitting ? 'Creating account…' : 'Create Account'}
      </button>
      <p className="text-center text-[9px] text-white/30">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-brand-light hover:text-brand font-medium">Sign in</button>
      </p>
    </form>
  );
}
