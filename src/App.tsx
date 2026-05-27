import { useState, useEffect } from 'react';
import { 
  Calendar, BookOpen, CheckCircle, Menu, X, ArrowRight, Zap, 
  ChevronDown, Mail, Github, Twitter, Instagram, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import Dashboard from './components/Dashboard';
import { SubjectsView } from './components/subjects/SubjectsView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { SettingsView } from './components/navigation/SettingsView';
import { AchievementNotification } from './components/notifications/AchievementNotification';
import { Confetti } from './components/notifications/Confetti';
import { LevelUpModal } from './components/modals/LevelUpModal';
import { PanicModeUI } from './components/dashboard/PanicModeUI';
import { WallpaperEngine } from './components/navigation/WallpaperEngine';
import { storage } from './services/storage';
import { NavRail } from './components/navigation/NavRail';

// --- Landing Page Components ---

const Navbar = ({ isDark, setIsDark, onOpenAuth }: { isDark: boolean, setIsDark: (val: boolean) => void, onOpenAuth: () => void }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-100/50 dark:border-slate-800/30' : 'py-6'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-brand rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
          </div>
          <span className="text-lg md:text-xl font-display font-bold tracking-tight dark:text-white">StudyFlow</span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {['Features', 'How it Works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-brand transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onOpenAuth}
            className="hidden md:block bg-brand hover:bg-brand-dark text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand/20"
          >
            {user ? 'Go to App' : 'Get Started'}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 dark:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full left-6 right-6 mt-3 p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 lg:hidden"
            >
              <div className="flex flex-col gap-4 text-center">
                {['Features', 'How it Works', 'Pricing'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setIsOpen(false)} className="text-base font-medium text-slate-700 dark:text-white/80">{item}</a>
                ))}
                <hr className="border-slate-100 dark:border-slate-800" />
                <button 
                  onClick={() => { onOpenAuth(); setIsOpen(false); }}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-semibold text-sm"
                >
                  Sign In
                </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="p-8 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand/20 dark:hover:border-brand/20 transition-all group"
  >
    <div className="w-14 h-14 md:w-16 md:h-16 bg-brand/10 dark:bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6 md:mb-8 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 md:w-8 md:h-8" />
    </div>
    <h3 className="text-xl md:text-2xl font-display font-semibold mb-3 dark:text-white tracking-tight">{title}</h3>
    <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group"
      >
        <span className="text-base md:text-lg font-medium dark:text-white/90 tracking-tight group-hover:text-brand transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 shrink-0 ml-4 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ isDark, setIsDark, onOpenAuth }: { isDark: boolean, setIsDark: (val: boolean) => void, onOpenAuth: () => void }) => {
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0c10]">
      <Navbar isDark={isDark} setIsDark={setIsDark} onOpenAuth={onOpenAuth} />
      
      {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-brand/5 dark:bg-brand/5 -skew-x-12 translate-x-32 z-0" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wide mb-8 md:mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Prep smarter, not harder
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 md:mb-10 leading-[1.05] dark:text-white">
                Your Exam <br/>
                <span className="text-brand">On Autopilot.</span>
              </h1>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-10 md:mb-12 max-w-lg leading-relaxed">
                Generate the perfect study timetable tailored for any academic challenge—from Finals and Boards to Professional Certifications—with seamless Google integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <button 
                  onClick={onOpenAuth}
                  className="bg-brand hover:bg-brand-dark text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-semibold transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 group"
                >
                  Build My Flow <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-base md:text-lg font-medium shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 md:mt-20 glass p-6 md:p-8 rounded-3xl shadow-sm flex items-center gap-4 md:gap-6 max-w-md">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm md:text-base italic text-slate-500 dark:text-slate-400 leading-tight">"Kept me organized and productive through the most intense semester of my life."</p>
                  <p className="text-[10px] font-semibold tracking-wide text-brand mt-2">Arjun S., University Junior</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-brand/5 border border-slate-100 dark:border-slate-800 flex flex-col">
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-5">
                    <Zap className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2 dark:text-white tracking-tight">Adaptive Scheduling</h3>
                  <p className="text-sm text-slate-400">Missed a session? StudyFlow redistributes your tasks automatically.</p>
                </div>

                <div className="bg-brand rounded-3xl p-8 shadow-xl shadow-brand/20 flex flex-col text-white transform translate-y-12">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2 tracking-tight">Pre-built Templates</h3>
                  <p className="text-sm text-white/70">One-click setups for Finals, LSAT, GRE, and professional licensure exams.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-brand/5 border border-slate-100 dark:border-slate-800 flex flex-col translate-x-4">
                  <div className="w-full h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-5 flex items-end gap-2 p-4">
                    <div className="flex-1 bg-brand/20 dark:bg-brand/30 rounded-t-xl" style={{ height: '40%' }}></div>
                    <div className="flex-1 bg-brand/40 dark:bg-brand/50 rounded-t-xl" style={{ height: '70%' }}></div>
                    <div className="flex-1 bg-brand/30 dark:bg-brand/40 rounded-t-xl" style={{ height: '55%' }}></div>
                    <div className="flex-1 bg-brand/60 dark:bg-brand/70 rounded-t-xl" style={{ height: '90%' }}></div>
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2 dark:text-white tracking-tight">Progress Tracker</h3>
                  <p className="text-sm text-slate-400">Visualise your mastery across subjects with real-time analytics.</p>
                </div>

                <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-center items-center text-center text-white translate-y-16">
                  <p className="text-[10px] font-semibold tracking-wide text-brand-light mb-2">Launch Offer</p>
                  <h3 className="text-3xl font-bold mb-1 font-display">$0/mo</h3>
                  <p className="text-xs text-slate-500 mb-5 tracking-wide font-medium">Free for first 10k users</p>
                  <button className="w-full py-4 bg-white text-slate-900 font-semibold rounded-2xl text-sm tracking-wide">Join Waitlist</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

       <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mb-16 md:mb-20">
            <span className="text-[10px] font-semibold tracking-wide text-brand mb-4 inline-block">Capabilities</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-4 md:mb-6 dark:text-white tracking-tight">
              Everything you need <br />
              <span className="text-brand">to succeed.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">Ace your exams without the exhaustion. Our tools are built around the way students actually learn.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Zap}
              title="Dynamic Flows"
              description="Get a personalized schedule that adapts to your speed and changing deadlines automatically."
              delay={0.1}
            />
            <FeatureCard 
              icon={BookOpen}
              title="Syllabus Maps"
              description="Break down complex syllabi into manageable daily study goals based on high-yield topics."
              delay={0.2}
            />
            <FeatureCard 
              icon={Calendar}
              title="Workspace Sync"
              description="Seamlessly sync your study sessions with Google Calendar and Tasks to stay organized across devices."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-brand text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-15deg] translate-x-20" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
           <div className="max-w-4xl mb-12 md:mb-16">
            <span className="text-xs tracking-wide font-medium text-white/60 mb-4 inline-block">Simple Process</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              How it works.
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-10 md:gap-14">
            {[
              { n: "01", t: "Exam Details", d: "Tell us about your upcoming finals, certification, or board exams and the subjects you're tackling." },
              { n: "02", t: "AI Generation", d: "Our algorithm calculates an optimal distribution of study sessions and revision milestones." },
              { n: "03", t: "Follow & Master", d: "Sync with Google Calendar and start your flow. The AI adapts your schedule if you need more time." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-4 md:gap-5">
                <div className="text-6xl md:text-8xl font-display font-bold leading-none opacity-20">{step.n}</div>
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight font-display">{step.t}</h3>
                <p className="text-base md:text-lg text-white/70 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-10 items-end">
            <div className="lg:col-span-1 mb-10 lg:mb-0">
               <span className="text-[10px] font-semibold tracking-wide text-brand mb-4 inline-block">Pricing</span>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 md:mb-6 dark:text-white tracking-tight">
                Focus on <br />
                <span className="text-brand">The Grade,</span> <br />
                Not the cost.
              </h2>
              <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">Simple plans for every student budget. Start for free and upgrade as you grow.</p>
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                 </div>
                 <p className="font-medium text-sm dark:text-white leading-tight">No credit card required to start.</p>
              </div>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-5 md:gap-6">
              <div className="p-8 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
                <h3 className="text-[9px] font-semibold tracking-wide text-brand mb-6 md:mb-8">Basic Plan</h3>
                <div className="flex items-end gap-1 mb-6 md:mb-8">
                   <div className="text-5xl md:text-7xl font-display font-bold leading-[0.8] dark:text-white tracking-tight">Free</div>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                  {['Single Study Plan', 'Web Dashboard', 'Sync to Tasks', 'Standard Templates'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onOpenAuth}
                  className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                >
                  Sign Up
                </button>
              </div>

              <div className="p-8 md:p-10 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6">
                   <Zap className="w-6 h-6 md:w-7 md:h-7 text-brand-light" />
                </div>
                <h3 className="text-[9px] font-semibold tracking-wide text-brand-light mb-6 md:mb-8">Pro Plan</h3>
                <div className="flex items-end gap-1 mb-6 md:mb-8">
                   <div className="text-5xl md:text-7xl font-display font-bold leading-[0.8] tracking-tight">$9</div>
                   <div className="text-sm md:text-base font-medium text-slate-500 mb-1">/mo</div>
                </div>
                <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                  {['AI Adaptive Scheduling', 'Google Calendar Sync', 'Priority Support', 'Full Analytics Panel', 'Progress Export'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm md:text-base font-medium">
                      <CheckCircle className="w-4 h-4 text-brand-light shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={onOpenAuth}
                  className="w-full py-4 rounded-2xl bg-brand text-white font-semibold text-sm shadow-xl shadow-brand/30 hover:scale-[1.02] transition-transform"
                >
                  Go Pro Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-28 bg-white dark:bg-slate-900/30">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6 md:mb-8 dark:text-white tracking-tight">
                Frequently Asked <br />
                <span className="text-brand">Questions.</span>
              </h2>
              <p className="text-base md:text-lg text-slate-500 font-medium max-w-sm">Find answers to common questions about syncing and schedules.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
              <FAQItem 
                question="How does Google Calendar sync work?" 
                answer="Once you generate a plan in your dashboard, you can click 'Sync to Google Apps'. StudyFlow will create a dedicated Task List and add key study milestones to your Primary Calendar automatically." 
              />
              <FAQItem 
                question="Can I customize subjects for specific exams?" 
                answer="Yes, when creating a new plan you can list any subjects. Our algorithm will distribute study time based on the number of subjects and your specific exam date (e.g. Finals or Certifications)." 
              />
              <FAQItem 
                question="What happens if I miss a study day?" 
                answer="The AI scheduler is dynamic. It will automatically re-allocate your missed sessions into your remaining available slots while maintaining optimal break ratios." 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="bg-slate-900 dark:bg-brand/10 rounded-3xl md:rounded-4xl p-12 md:p-24 text-center text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl lg:text-7xl font-display font-bold mb-8 md:mb-10 tracking-tight leading-[1.05]">
                Ace Your Exams. <br />
                <span className="text-brand-light italic">No Excuses.</span>
              </h2>
              <button 
                  onClick={onOpenAuth}
                className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-semibold text-lg md:text-xl hover:scale-105 transition-all shadow-2xl"
              >
                Join StudyFlow Today
              </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-16 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-lg font-display font-bold tracking-tight dark:text-white">StudyFlow</span>
            </div>
            <p className="text-slate-400 text-sm">© 2024 StudyFlow AI. All rights reserved.</p>
            <div className="flex gap-5">
              {[Twitter, Github, Instagram, Mail].map((Icon, i) => (
                <Icon key={i} className="w-5 h-5 text-slate-400 hover:text-brand cursor-pointer transition-colors" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { themeConfig, userStats, activeNotification, confettiActive, closeNotification } = useStudy();
  const [activeView, setActiveView] = useState<'dashboard' | 'subjects' | 'achievements' | 'settings'>('dashboard');
  const [isDark, setIsDark] = useState(() => {
    const saved = storage.getTheme();
    return saved !== null ? saved : false;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(userStats ? userStats.level : 1);

  useEffect(() => {
    if (userStats && userStats.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(userStats.level);
    }
  }, [userStats?.level, prevLevel]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.saveTheme(isDark);
  }, [isDark]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0c10]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Zap className="w-10 h-10 text-brand" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <LandingPage isDark={isDark} setIsDark={setIsDark} onOpenAuth={() => setAuthModalOpen(true)} />
      ) : (
        <div className="min-h-screen flex flex-col lg:flex-row transition-colors duration-1000 relative overflow-hidden">
          <WallpaperEngine />
          
          <NavRail activeView={activeView} onViewChange={setActiveView} />
          
          <main className="flex-1 lg:pl-24 pb-24 lg:pb-0 relative z-10">
            <AnimatePresence mode="wait" initial={false}>
              {activeView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard />
                </motion.div>
              )}
              {activeView === 'subjects' && (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-12"
                >
                  <SubjectsView />
                </motion.div>
              )}
              {activeView === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-12"
                >
                  <AchievementsView />
                </motion.div>
              )}
              {activeView === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-12"
                >
                  <SettingsView />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <AchievementNotification 
            achievement={activeNotification} 
            onClose={closeNotification} 
          />

          <Confetti active={confettiActive} />

          <LevelUpModal 
            level={userStats.level} 
            isOpen={showLevelUp} 
            onClose={() => setShowLevelUp(false)} 
          />

          <PanicModeUI />
        </div>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <AppContent />
      </StudyProvider>
    </AuthProvider>
  );
}
