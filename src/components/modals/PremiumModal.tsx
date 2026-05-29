import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Zap, Shield, Sparkles, CheckCircle2, Monitor, Palette, Headphones, Brain, Lock, Star } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';

const features = [
  { icon: Monitor, t: 'Elite Environments', d: 'Cyber Library, Zen Garden, Animated Mesh & more.', free: '3 wallpapers', premium: '12+ wallpapers' },
  { icon: Palette, t: 'Clock Customizer', d: 'Full control over fonts, hands, faces, and presets.', free: 'Basic variants', premium: 'All variants + presets' },
  { icon: Headphones, t: 'Ambience Library', d: 'Premium soundscapes for deep focus sessions.', free: 'Lofi & Rain', premium: '6+ tracks' },
  { icon: Sparkles, t: 'Deep Analytics', d: 'Heatmaps, subject breakdown, and velocity tracking.', free: 'Overview & Trends', premium: 'All charts' },
  { icon: Brain, t: 'Brain Scan', d: 'Full proficiency heatmap with mastery insights.', free: 'Locked', premium: 'Unlocked' },
  { icon: Crown, t: 'Exclusive Pets', d: 'Rare pet species and premium skins.', free: 'Pixie only', premium: 'All species + skins' },
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
        const devRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/dev-activate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.uid }),
        });
        const devData = await devRes.json();
        if (!devData.ok) { setError(devData.error || 'Activation failed'); setActivating(false); return; }
        window.location.href = '/settings?upgrade=success';
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/create-checkout`, {
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
      console.warn('Server unreachable, using dev toggle:', err.message);
      await new Promise(r => setTimeout(r, 800));
      togglePremium();
      setActivated(true);
      setTimeout(() => {
        setShowPremiumModal(false);
        setActivated(false);
        setActivating(false);
      }, 1800);
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
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-white dark:border-slate-800"
          >
            {/* Hero Header */}
            <div className="p-8 md:p-10 bg-slate-900 text-white relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
                <Crown className="w-36 h-36" />
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-fuchsia-500 rounded-full blur-[80px]" />
              </div>

              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md mb-4 border border-white/10">
                  <Crown className="w-3 h-3 text-amber-300" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Elite Scholar Tier</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black tracking-tighter mb-3 leading-none">
                  Unlock Full Potential
                </h2>
                <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto">
                  Upgrade to Elite Scholar and unlock every feature Study Flow has to offer.
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Feature Comparison */}
              <div className="space-y-2 mb-6">
                <div className="grid grid-cols-[1fr_56px_56px] gap-1 px-3 py-2 text-[8px] font-bold uppercase tracking-widest text-white/30">
                  <span>Feature</span>
                  <span className="text-center">Free</span>
                  <span className="text-center text-amber-400">Pro</span>
                </div>
                {features.map((f, i) => (
                  <motion.div
                    key={f.t}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[1fr_56px_56px] gap-1 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <f.icon className="w-3 h-3 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-white/90 truncate">{f.t}</p>
                        <p className="text-[7px] text-white/30 truncate">{f.d}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-white/30 text-center font-medium">{f.free}</span>
                    <span className="text-[9px] flex items-center justify-center gap-0.5 text-amber-400 font-semibold text-center">
                      {f.free === 'Locked' ? <Lock className="w-2.5 h-2.5 text-amber-400" /> : <Star className="w-2.5 h-2.5 text-amber-400" />}
                      {f.premium}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] text-red-300 font-medium text-center">
                    {error}
                  </div>
                )}
                {/* Billing Toggle */}
                <div className="flex bg-white/[0.04] rounded-xl p-0.5 border border-white/[0.06]">
                  <button
                    onClick={() => setBilling('monthly')}
                    className={`flex-1 py-2 rounded-[10px] text-[9px] font-bold uppercase tracking-wider transition-all ${
                      billing === 'monthly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    Monthly<br /><span className="text-[10px] font-black">$9.99</span>
                  </button>
                  <button
                    onClick={() => setBilling('yearly')}
                    className={`flex-1 py-2 rounded-[10px] text-[9px] font-bold uppercase tracking-wider transition-all ${
                      billing === 'yearly' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    Yearly<br /><span className="text-[10px] font-black">$69.99</span>
                    <span className="text-[7px] text-emerald-400 ml-1">Save 42%</span>
                  </button>
                </div>

                {activated ? (
                  <div className="w-full py-5 rounded-[20px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-300">Elite Scholar Activated!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade()}
                    disabled={activating || userStats.isPremium}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-[20px] font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {activating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Get Elite Access Now
                      </>
                    )}
                  </button>
                )}
                {error && (
                  <button onClick={() => handleUpgrade(true)}
                    className="text-[8px] text-center text-white/20 hover:text-white/40 underline underline-offset-2 transition-colors"
                  >
                    Dev: Activate without Polar
                  </button>
                )}
                <p className="text-[8px] text-center text-white/30 font-bold uppercase tracking-widest">
                  {billing === 'monthly' ? '$9.99/MO' : '$69.99/YR'} • CANCEL ANYTIME • 7-DAY FREE TRIAL
                </p>
                {!userStats.isPremium && (
                  <p className="text-[8px] text-center text-white/15">
                    Secure payment via Polar.sh • No code changes needed for production checkout
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
