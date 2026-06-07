import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Palette, Sparkles, Image, SwatchBook, Headphones, BarChart3, Brain, Clock, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://studyflow-api.workuni59.workers.dev';

const features = [
  { icon: Palette,     label: '15 Mood Themes',        desc: 'All 15 moods (free users get 5)' },
  { icon: Sparkles,    label: '7 Animated Themes',      desc: 'All animated themes (free users get 3)' },
  { icon: Image,       label: '57 Wallpapers + Custom Upload', desc: 'Full library + use your own image as background' },
  { icon: SwatchBook,  label: 'Full Color Palette',     desc: 'All 9 atmosphere colors unlocked' },
  { icon: Headphones,  label: 'Ambience Library',       desc: '35 sounds + Spotify, YouTube Music & Apple Music playlists' },
  { icon: BarChart3,   label: 'Full Analytics',         desc: 'Heatmaps, subject breakdown & velocity tracking' },
  { icon: Brain,       label: 'Brain Scan',             desc: 'Full proficiency heatmap with mastery insights' },
  { icon: Clock,       label: 'Clock Customizer',       desc: 'All font variants, faces & presets' },
];

export const PremiumModal = () => {
  const { userStats, setShowPremiumModal, showPremiumModal, togglePremium } = useStudy();
  const { user } = useAuth();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleUpgrade = async (forceDev?: boolean) => {
    setActivating(true);
    setError(null);

    try {
      if (forceDev) {
        const devRes = await fetch(`${API_BASE}/api/dev-activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.uid }),
        });
        const devData = await devRes.json();
        if (!devData.ok) { setError(devData.error || 'Activation failed'); setActivating(false); return; }
        window.location.href = '/settings?upgrade=success';
        return;
      }

      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
          returnUrl: window.location.origin + '/settings',
          priceType: billing,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Checkout failed'); setActivating(false); return; }

      window.location.href = data.url;
    } catch (err: any) {
      console.error('API unreachable:', err.message);
      setError('Could not reach payment server. Please try again.');
      setActivating(false);
    }
  };

  return (
    <AnimatePresence>
      {showPremiumModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPremiumModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[400px] max-h-[90vh] rounded-[20px] flex flex-col"
            style={{ backgroundColor: '#0f0f1f', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>

            <div className="px-6 pt-8 pb-0 shrink-0">
              {/* SECTION 1 — HEADER */}
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] mb-3">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/70">Elite Scholar Tier</span>
                </div>
                <h2 className="text-[28px] font-bold text-white leading-none mb-1.5">Unlock Full Potential</h2>
                <p className="text-[13px] text-white/40 font-medium">Upgrade and unlock every feature.</p>
              </div>
            </div>

            {/* SECTION 2 — PRICE TOGGLE */}
            <div className="px-6 pt-5 pb-0 shrink-0">
              <div className="flex bg-white/[0.04] rounded-[10px] p-0.5 border border-white/[0.06]">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`flex-1 py-2 rounded-[8px] text-[9px] font-bold uppercase tracking-wider transition-all ${
                    billing === 'monthly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`flex-1 py-2 rounded-[8px] text-[9px] font-bold uppercase tracking-wider transition-all relative ${
                    billing === 'yearly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  Yearly
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 mt-3 mb-1">
                <span className="text-[32px] font-bold text-white leading-none">
                  {billing === 'monthly' ? '$7.99' : '$64.99'}
                </span>
                <span className="text-[16px] text-white/50 font-medium leading-none">
                  /{billing === 'monthly' ? 'mo' : 'yr'}
                </span>
                {billing === 'yearly' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-bold text-emerald-400 leading-none">
                    SAVE 32%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-center text-white/30 font-medium">7-day free trial · Cancel anytime</p>
            </div>

            {/* SECTION 3 — CTA BUTTON */}
            <div className="px-6 pt-4 pb-0 shrink-0">
              {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-medium text-center">
                  {error}
                </div>
              )}

              {activated ? (
                <div className="w-full py-4 rounded-[14px] bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[12px] font-bold text-emerald-300">Elite Scholar Activated!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade()}
                  disabled={activating || userStats.isPremium}
                  className="w-full h-[52px] bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[14px] font-bold text-[16px] tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {activating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Start Free Trial
                    </>
                  )}
                </button>
              )}

              <p className="mt-2 text-[9px] text-center text-white/20 font-medium">Secure payment via Pulse</p>
            </div>

            {/* SECTION 4 — FEATURES */}
            <div className="px-6 pt-5 pb-6 shrink-0">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {features.map((f) => (
                  <div key={f.label} className="flex items-start gap-2.5 py-1">
                    <div className="w-8 shrink-0 flex items-center justify-center pt-0.5">
                      <f.icon className="w-4 h-4 text-indigo-400/80" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white/90 leading-tight truncate">{f.label}</p>
                      <p className="text-[10px] text-white/30 leading-tight truncate">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev toggle */}
            <div className="px-6 pb-5 shrink-0">
              <button
                onClick={() => { togglePremium(); setShowPremiumModal(false); }}
                className="block mx-auto text-[8px] text-white/15 hover:text-white/30 underline underline-offset-2 transition-colors"
              >
                {userStats.isPremium ? 'Dev: Deactivate Premium' : 'Dev: Activate Premium'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
