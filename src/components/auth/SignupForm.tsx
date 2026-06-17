import { useState, useMemo, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import VerificationCodeInput from './VerificationCodeInput';

interface Props {
  onSuccess?: () => void;
  onVerificationSuccess?: (email: string) => void;
  onSwitchToLogin: () => void;
}

type Step = 'form' | 'verify';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score < 2) return { score, label: 'Weak', color: 'bg-rose-500' };
  if (score < 3) return { score, label: 'Fair', color: 'bg-orange-400' };
  if (score < 4) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-emerald-400' };
}

export default function SignupForm({ onSuccess, onVerificationSuccess, onSwitchToLogin }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError('Display name is required'); return; }
    if (!email.trim()) { setError('Email is required'); return; }

    const missing: string[] = [];
    if (password.length < 8) missing.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) missing.push('one uppercase letter');
    if (!/[a-z]/.test(password)) missing.push('one lowercase letter');
    if (!/\d/.test(password)) missing.push('one number');
    if (!/[^A-Za-z0-9]/.test(password)) missing.push('one special character');
    if (missing.length) {
      setError('Password needs: ' + missing.join(', '));
      return;
    }

    if (password !== confirm) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    const result = await signUp(email, password, name.trim());
    setSubmitting(false);
    if (result.error) {
      setError(
        result.error.message === 'User already registered'
          ? 'An account with this email already exists'
          : result.error.message
      );
      return;
    }
    if (result.user?.id) {
      setCreatedUserId(result.user.id);
      setCreatedEmail(email);
      setStep('verify');
    } else {
      onSuccess?.();
    }
  };

    if (step === 'verify' && createdUserId) {
    return (
      <VerificationCodeInput
        userId={createdUserId}
        email={createdEmail}
        password={password}
        onVerified={() => onVerificationSuccess ? onVerificationSuccess(createdEmail) : onSuccess?.()}
        onBack={() => setStep('form')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
          {error}
        </p>
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
            placeholder="8+ chars, A-Z, 0-9, symbol"
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white/80 placeholder-white/20 focus:ring-1 ring-brand outline-none transition-all" />
          {password.length > 0 && (
            <div className="mt-1.5 space-y-1">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color}`}
                  style={{ width: `${(strength.score / 5) * 100}%` }} />
              </div>
              <p className="text-[8px] text-white/30 uppercase tracking-wider">{strength.label}</p>
            </div>
          )}
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
