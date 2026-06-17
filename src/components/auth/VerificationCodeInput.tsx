import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Props {
  userId: string;
  email: string;
  password: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function VerificationCodeInput({ userId, email, password, onVerified, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const mountedRef = useRef(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleSendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const resp = await fetch(`${API_URL}/api/send-verification-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, email }),
      });
      const data: any = await resp.json();
      if (!resp.ok) {
        setError(data.error || 'Failed to send code');
        return;
      }
      setSent(true);
      if (data.devCode) setDevCode(data.devCode);
    } catch {
      setError('Could not reach server. Is the API server running?');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    handleSendCode();
  }, []);

  const handleVerify = async (code?: string) => {
    const verificationCode = code || digits.join('');
    if (verificationCode.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const resp = await fetch(`${API_URL}/api/verify-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, email, password, code: verificationCode }),
      });
      const data: any = await resp.json();
      if (!resp.ok) {
        setError(data.error || 'Invalid code');
        setDigits(Array(6).fill(''));
        inputsRef.current[0]?.focus();
        return;
      }
      onVerified();
    } catch {
      setError('Could not reach server');
      setDigits(Array(6).fill(''));
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(0, 1);
    setDigits(next);
    setError(null);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) {
      setTimeout(() => handleVerify(next.join('')), 200);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...digits];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    if (text.length === 6) {
      setTimeout(() => handleVerify(text), 200);
    } else {
      inputsRef.current[text.length]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-medium text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
          {error}
        </motion.p>
      )}

      <div className="text-center">
        <div className="w-10 h-10 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-5 h-5 text-brand" />
        </div>
        <p className="text-sm font-semibold text-white/90 mb-1">Verify your email</p>
        <p className="text-[10px] text-white/40 leading-relaxed">
          {sending ? 'Sending code...' : sent ? 'Enter the 6-digit code sent to' : 'Click below to send a code to'}
          <br />
          <span className="text-white/60 font-medium">{email}</span>
        </p>
      </div>

      {sent && !devCode && (
        <p className="text-center text-[9px] text-white/30 leading-relaxed">
          Check your spam folder if it doesn't arrive within a minute
        </p>
      )}

      {devCode && (
        <p className="text-center text-[9px] text-amber-400/70 bg-amber-400/10 px-3 py-2 rounded-lg">
          Dev mode: code is <span className="font-mono font-bold text-amber-300">{devCode}</span>
        </p>
      )}

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className="w-10 h-12 text-center text-lg font-bold bg-white/[0.06] border border-white/10 rounded-xl text-white/90 outline-none focus:ring-1 ring-brand transition-all"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button onClick={() => handleVerify()} disabled={digits.some(d => !d) || verifying}
        className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand/80 text-white text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
        {verifying ? 'Verifying...' : 'Verify'}
      </button>

      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-wider hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1.5">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <button onClick={handleSendCode} disabled={sending}
          className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 text-[9px] font-bold uppercase tracking-wider hover:bg-white/[0.08] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
          <RefreshCw className={`w-3 h-3 ${sending ? 'animate-spin' : ''}`} /> {sent ? 'Resend' : 'Send Code'}
        </button>
      </div>

      {verifying && (
        <div className="flex items-center justify-center gap-2 py-2">
          <RefreshCw className="w-3.5 h-3.5 text-white/40 animate-spin" />
          <span className="text-[10px] text-white/40">Verifying...</span>
        </div>
      )}
    </div>
  );
}
