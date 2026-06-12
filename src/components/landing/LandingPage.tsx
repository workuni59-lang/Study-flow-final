import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Menu, X, Clock, Crown, Sparkles,
  CheckCircle2, TrendingUp, Sliders, Volume2,
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: () => void;
  onStartDemo?: () => void;
}

export default function LandingPage({ onOpenAuth, onStartDemo }: LandingPageProps) {
  // Navigation states
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll to transform navbar from transparent to glass-morphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div className="min-h-screen font-sans bg-[#0a0c10] text-[#f3f4f6]" id="landing-root">
      {/* 1. NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-[#0a0c10]/80 backdrop-blur-md border-white/[0.08] py-4"
            : "bg-transparent border-transparent py-6"
        }`}
        id="navbar"
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2" id="nav-logo">
             <img src="/logo.png" alt="StudyFlow" className="w-8 h-8 object-contain" />
             <span className="font-display font-extrabold text-lg tracking-wider text-white">
               STUDY<span className="text-brand">FLOW</span>
             </span>
           </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-[#9ca3af]/90 font-medium text-sm" id="nav-links">
            <a href="#features" className="hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">
              Pricing
            </a>
          </div>

          <div className="hidden md:block" id="nav-cta">
            <button
              onClick={onStartDemo ?? onOpenAuth}
              className="bg-brand hover:bg-[#5254e3] px-5 py-2 rounded-xl text-white font-medium text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-brand transition-colors cursor-pointer"
            aria-label="Toggle Menu"
            id="mobile-menu-trigger"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#0c0e14] border-b border-white/[0.08] px-6 py-8 flex flex-col gap-6 md:hidden"
              id="mobile-menu"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9ca3af] hover:text-white font-medium text-base transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9ca3af] hover:text-white font-medium text-base transition-colors"
              >
                Pricing
              </a>
              <button
                 onClick={() => {
                  setMobileMenuOpen(false);
                  (onStartDemo ?? onOpenAuth)();
                }}
                className="w-full bg-brand text-white py-3 rounded-xl font-medium text-base text-center transition-colors hover:bg-brand/90"
              >
                Get Started
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <section
        className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden"
        id="hero"
      >
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-brand/5 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-5 flex flex-col text-left" id="hero-content">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] w-fit mb-6" id="hero-badge">
              <Crown className="w-3.5 h-3.5 text-brand" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-brand-light uppercase">
                Clinical Focus System
              </span>
            </div>

            {/* Title with staggered words reveal */}
            <h1 className="font-display font-black text-6xl md:text-7xl tracking-tighter text-white leading-[0.95] mb-8">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                Enter the Flow.
              </span>
              <span className="block text-brand">
                Lock in.
              </span>
            </h1>

            <p className="text-[#9ca3af] text-xl mb-10 max-w-lg font-medium leading-relaxed">
              Command your timer, adapt your queue, and tune spatial ambience to dominate boards and competitive exams.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4" id="hero-ctas">
              <button
                onClick={onStartDemo ?? onOpenAuth}
                className="group relative bg-brand hover:bg-[#5254e3] text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Hero Right / Device Screenshot */}
          <div className="lg:col-span-7 flex justify-center w-full relative" id="hero-mockup-wrapper">
            {/* Desktop Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[640px] aspect-[16/10] bg-[#1a1c24] rounded-2xl p-2 md:p-3 border border-white/[0.1] shadow-2xl shadow-brand/10 overflow-hidden"
              id="device-mockup"
            >
              <div className="relative w-full h-full bg-[#0d0f14] rounded-xl overflow-hidden flex flex-col border border-white/[0.04]">
                <div className="h-8 border-b border-white/[0.06] bg-white/[0.02] px-4 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <img
                  src="/screenshots/dashboard.png"
                  alt="StudyFlow Dashboard"
                  className="w-full flex-1 object-cover object-top"
                />
              </div>
            </motion.div>

            {/* Mobile Mockup Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -bottom-10 -right-4 md:-right-8 w-[160px] md:w-[200px] aspect-[9/19.5] bg-[#1a1c24] rounded-[2.5rem] p-2 border border-white/[0.1] shadow-2xl shadow-black/50 hidden sm:block"
            >
              <div className="relative w-full h-full bg-[#0d0f14] rounded-[2rem] overflow-hidden border border-white/[0.04]">
                <img
                  src="/screenshots/dashboard-mobile.png"
                  alt="StudyFlow Mobile"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION (Smooth scroll target) */}
      <section className="py-24 border-t border-white/[0.06] bg-[#0c0e14] relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2 block">
              Architected for Performance
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">
              One continuous flow.
            </h2>
            <p className="text-[#9ca3af] mt-4 text-lg">Everything you need to master your competitive exams, unified in a single clinical workspace.</p>
          </div>

          {/* Feature 1: Timer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-white">The Flow State Timer</h3>
              <p className="text-[#9ca3af] text-lg leading-relaxed">
                Circular Pomodoro flow custom-engineered for heavy focus blocks. Adaptive durations adjust to your cognitive load, helping you maintain momentum without the burnout.
              </p>
              <ul className="space-y-3">
                {['Custom study/break intervals', 'Auto-looping sessions', 'Visual progress ring'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-brand/5 bg-[#1a1c24] p-2"
            >
              <img src="/screenshots/timer.png" alt="Focus Timer" className="rounded-xl w-full" />
            </motion.div>
          </div>

          {/* Feature 2: Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-brand/5 bg-[#1a1c24] p-2 order-2 lg:order-1"
            >
              <img src="/screenshots/tasks.png" alt="Tasks Management" className="rounded-xl w-full" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6 order-1 lg:order-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-white">High-Yield Queue</h3>
              <p className="text-[#9ca3af] text-lg leading-relaxed">
                Don't just track tasks—conquer them. Bind your syllabus concepts directly into your focus cycles. Check off milestones without ever leaving your flow environment.
              </p>
              <ul className="space-y-3">
                {['Session-linked task lists', 'Priority level sorting', 'Drag-and-drop organization'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Feature 3: Ambience */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-white">Spatial Audio Lab</h3>
              <p className="text-[#9ca3af] text-lg leading-relaxed">
                Tune out the world with immersive background frequencies. From lofi beats to heavy rain and active library sounds, create the perfect acoustic container for deep work.
              </p>
              <ul className="space-y-3">
                {['Curated lo-fi playlists', 'Natural soundscapes', 'Custom YouTube/Spotify URLs'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-brand/5 bg-[#1a1c24] p-2"
            >
              <img src="/screenshots/ambience.png" alt="Spatial Audio" className="rounded-xl w-full" />
            </motion.div>
          </div>

          {/* Feature 4: Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-brand/5 bg-[#1a1c24] p-2 order-2 lg:order-1"
            >
              <img src="/screenshots/analytics.png" alt="Study Analytics" className="rounded-xl w-full" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6 order-1 lg:order-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-white">Mastery Tracking</h3>
              <p className="text-[#9ca3af] text-lg leading-relaxed">
                Turn your effort into evidence. Track your XP, level up your focus, and view detailed heatmaps of your study sessions to identify exactly where you dominate.
              </p>
              <ul className="space-y-3">
                {['Weekly session heatmaps', 'XP and Level progression', 'Subject-wise distribution'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION (Required) */}
      <section className="py-24 border-t border-white/[0.06] bg-[#0a0c10]" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2 block">
              Investment
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">
              Scale to your goal.
            </h2>
            <p className="text-[#9ca3af] text-lg mt-4 font-normal">
              One focused space, designed for extreme visual containment. No hidden contracts.
            </p>
          </div>

          {/* Pricing cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" id="pricing-grid">
            {/* Free Card */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-[2.5rem] p-10 flex flex-col justify-between transition-all duration-200">
              <div>
                <span className="text-[#9ca3af] text-xs uppercase font-bold tracking-[0.2em] font-mono">
                  Standard Access
                </span>
                <h3 className="text-3xl font-display font-extrabold text-white mt-2 mb-4">
                  StudyFlow Free
                </h3>
                <div className="h-12 flex items-center mb-8">
                  <span className="text-lg font-semibold text-[#9ca3af]">
                    Core Dashboard Sandbox
                  </span>
                </div>
                <div className="w-full h-[1px] bg-white/[0.06] mb-8" />

                <ul className="space-y-5 text-sm font-medium text-[#c0c4cc]">
                  {[
                    'Single Active Study Plan',
                    'Focus Web Dashboard',
                    'Standard Focus Templates',
                    'Basic Wallpapers (3 variations)',
                    'Basic Clock Variants'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#9ca3af]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <button
                  onClick={onStartDemo ?? onOpenAuth}
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] py-5 rounded-2xl font-bold text-base text-center transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Pro Card (VIsually Elevated) */}
            <div className="relative bg-gradient-to-b from-[#0c0d16] to-[#08090f] border-2 border-brand rounded-[2.5rem] p-10 flex flex-col justify-between shadow-[0_0_50px_rgba(99,102,241,0.1)] transition-all duration-200">
              {/* Popular badge */}
              <div className="absolute -top-4 right-10 bg-brand text-white text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                Most Popular
              </div>

              <div>
                <span className="text-brand-light text-xs uppercase font-bold tracking-[0.2em] font-mono">
                  Full Spatial Engine
                </span>
                <h3 className="text-3xl font-display font-extrabold text-white mt-2 mb-4">
                  StudyFlow Pro
                </h3>
                
                {/* Dual price presentation inline as mandated */}
                <div className="h-12 flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-display font-extrabold text-white">
                    $7.99
                  </span>
                  <span className="text-sm text-[#9ca3af] font-medium mr-2">
                    / mo
                  </span>
                  <span className="text-xs text-white/40 font-semibold border-l border-white/10 pl-3">
                    or <strong className="text-white">$65</strong> / yr
                  </span>
                  <span className="text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] px-2 py-1 rounded-md ml-2 font-mono uppercase tracking-wider">
                    Save 32%
                  </span>
                </div>

                <div className="w-full h-[1px] bg-white/[0.1] mb-8" />

                <ul className="space-y-5 text-sm font-medium text-[#c0c4cc]">
                  {[
                    'All 7 Space Themes & Color Presets',
                    'Google Calendar Auto Sync',
                    'Full Spatial Sound Library (6+ tracks)',
                    'Custom Ambience Playlist URLs',
                    '7 Animated & 57 Immersive Wallpapers',
                    'All Clock Customization Formats',
                    'Advanced Analytics + Heatmaps'
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-4">
                      <CheckCircle2 className="w-5 h-5 text-brand" />
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <button
                onClick={onStartDemo ?? onOpenAuth}
                className="w-full bg-brand hover:bg-[#5254e3] text-white py-5 rounded-2xl font-bold text-base text-center transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] cursor-pointer"
                >
                  Go Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-white/[0.06] bg-[#07090d]" id="footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4" id="footer-logo">
             <div className="flex items-center gap-2">
               <img src="/logo.png" alt="StudyFlow" className="w-8 h-8 object-contain" />
               <span className="font-display font-black text-xl tracking-tight text-white">
                 STUDY<span className="text-brand">FLOW</span>
               </span>
             </div>
             <p className="text-white/40 text-xs font-medium tracking-wide">Designed for extreme visual containment.</p>
           </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8" id="footer-socials">
              <span className="text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer uppercase tracking-widest">
                Privacy
              </span>
              <span className="text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer uppercase tracking-widest">
                Terms
              </span>
              <span className="text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer uppercase tracking-widest">
                Support
              </span>
            </div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]" id="copyright">
              &copy; {new Date().getFullYear()} StudyFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
