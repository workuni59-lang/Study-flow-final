import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Menu, X, Clock, Crown, Sparkles,
  CheckCircle2, TrendingUp, Sliders, Volume2,
} from "lucide-react";

interface LandingPageProps {
  onOpenAuth: () => void;
}

export default function LandingPage({ onOpenAuth }: LandingPageProps) {
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
              onClick={onOpenAuth}
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
                  onOpenAuth();
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
              <span className="text-xs font-semibold tracking-wider text-brand-light uppercase">
                Captivity & Focus System
              </span>
            </div>

            {/* Title with staggered words reveal */}
            <h1 className="font-display font-extrabold text-5xl md:text-6xl tracking-tight text-white leading-[1.1] mb-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Enter the Flow.
              </span>
              <span className="block text-brand">
                Lock in your study.
              </span>
            </h1>

            <p className="text-[#9ca3af] text-lg mb-8 max-w-lg font-normal leading-relaxed">
              StudyFlow is a clinical space styled for pure cognitive leverage. Command your timer, adapt your calendar, customize your view, and tune spatial ambience to dominate boards and competitive exams.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4" id="hero-ctas">
              <button
                onClick={onOpenAuth}
                className="group relative bg-brand hover:bg-[#5254e3] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Enter the Flow</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#pricing"
                className="text-[#9ca3af] hover:text-white border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.01] px-8 py-4 rounded-xl font-semibold text-base text-center transition-all duration-200 cursor-pointer"
              >
                View Plans
              </a>
            </div>
          </div>

          {/* Hero Right / Device Screenshot */}
          <div className="lg:col-span-7 flex justify-center w-full" id="hero-mockup-wrapper">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
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
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION (Smooth scroll target) */}
      <section className="py-24 border-t border-white/[0.06] bg-[#0c0e14] relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2 block">
              Architected for Performance
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Six tools. One continuous flow.
            </h2>
            <div className="w-12 h-1 bg-brand mx-auto mt-4 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <Clock className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Adaptive Study Timer</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Circular Pomodoro flow custom-engineered for heavy focus blocks. Track sessions with customized study/break intervals built into your daily curriculum.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">High-Yield Queue</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Check off critical concepts and session milestones directly inside the visual timer interface, binding tasks immediately into scheduled cycles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <Volume2 className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Spatial Audio Lab</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Layer immersive background frequencies including Lofi beats, wind, heavy rain, and active libraries. Premium subscribers gain custom playlist URL support.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <TrendingUp className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Spaced Analytics</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Earn XP, stack continuous study days, level progression, and master tracking heatmaps designed to expose weaknesses in key competitive syllabus fields.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Immersive Visuals</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Tune your visual environment. Gain full workspace customization with 7 premium design themes, 7 animated presets, and 57 immersive layouts.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-brand/40 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                <Sliders className="w-5 h-5 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">13+ Clock Customizers</h3>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Shape your aesthetic playground. Configure clock aesthetics across 13+ combinations of digital faces, dials, and custom serif headings.
              </p>
            </div>
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
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              One focused space, scaled to your goal.
            </h2>
            <p className="text-[#9ca3af] text-sm mt-3 font-normal">
              No hidden contracts. Seamless billing with instant calendar hooks.
            </p>
          </div>

          {/* Pricing cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" id="pricing-grid">
            {/* Free Card */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between transition-all duration-200">
              <div>
                <span className="text-[#6b7280] text-xs uppercase font-bold tracking-widest font-mono">
                  Standard Access
                </span>
                <h3 className="text-2xl font-display font-extrabold text-white mt-1 mb-2">
                  StudyFlow Free
                </h3>
                <div className="h-12 flex items-center mb-6">
                  <span className="text-sm font-semibold text-[#6b7280]">
                    Core Dashboard Sandbox
                  </span>
                </div>
                <div className="w-full h-[1px] bg-white/[0.06] mb-6" />

                <ul className="space-y-4 text-xs font-medium text-[#c0c4cc]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#6b7280]" />
                    <span>Single Active Study Plan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#6b7280]" />
                    <span>Focus Web Dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#6b7280]" />
                    <span>Standard Focus Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#6b7280]" />
                    <span>Basic Wallpapers (3 variations)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#6b7280]" />
                    <span>Basic Clock Variants</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={onOpenAuth}
                  className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] py-4 rounded-xl font-bold text-sm text-center transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Pro Card (VIsually Elevated) */}
            <div className="relative bg-[#0c0d16] border-2 border-brand rounded-3xl p-8 flex flex-col justify-between shadow-[0_0_35px_rgba(99,102,241,0.15)] transition-all duration-200">
              {/* Popular badge */}
              <div className="absolute -top-3.5 right-6 bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                Most Popular
              </div>

              <div>
                <span className="text-brand-light text-xs uppercase font-bold tracking-widest font-mono">
                  Full Spatial Engine
                </span>
                <h3 className="text-2xl font-display font-extrabold text-white mt-1 mb-2">
                  StudyFlow Pro
                </h3>
                
                {/* Dual price presentation inline as mandated */}
                <div className="h-12 flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-display font-extrabold text-white">
                    $7.99
                  </span>
                  <span className="text-xs text-[#9ca3af] font-medium mr-2">
                    / mo
                  </span>
                  <span className="text-xs text-[#9ca3af] font-semibold border-l border-white/[0.1] pl-2">
                    or <strong className="text-white">$65</strong> / yr
                  </span>
                  <span className="text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded ml-1 font-mono uppercase">
                    Save 32%
                  </span>
                </div>

                <div className="w-full h-[1px] bg-white/[0.06] mb-6" />

                <ul className="space-y-4 text-xs font-medium text-[#c0c4cc]">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>All 7 Space Themes & Color Presets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>Google Calendar Auto Sync</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>Full Spatial Sound Library (6+ tracks)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>Custom Ambience Playlist URLs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>7 Animated & 57 Immersive Wallpapers</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>All Clock Customization Formats + Presets</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span>Advanced Analytics + Brain Scan Heatmap</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <button
                  onClick={onOpenAuth}
                  className="w-full bg-brand hover:bg-[#5254e3] text-white py-4 rounded-xl font-bold text-sm text-center transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
                >
                  Go Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 border-t border-white/[0.06] bg-[#07090d]" id="footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2" id="footer-logo">
             <img src="/logo.png" alt="StudyFlow" className="w-6 h-6 object-contain" />
             <span className="font-display font-bold text-sm tracking-wider text-white">
               STUDY<span className="text-brand">FLOW</span>
             </span>
           </div>

          <div className="text-xs text-[#4b5563]" id="copyright">
            &copy; {new Date().getFullYear()} StudyFlow. Designed for extreme visual containment. All rights reserved.
          </div>

          <div className="flex gap-4" id="footer-socials">
            <span className="text-xs text-[#4b5563] hover:text-white transition-colors cursor-pointer">
              Privacy Outline
            </span>
            <span className="text-xs text-[#4b5563] hover:text-white transition-colors cursor-pointer">
              Terms of Focus
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
