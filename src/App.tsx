import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, BookOpen, CheckCircle, Menu, X, ArrowRight, Zap, 
  ChevronDown, Mail, Github, Twitter, Instagram, Moon, Sun, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyProvider, useStudy } from './context/StudyContext';
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

const Navbar = ({ isDark, setIsDark }: { isDark: boolean, setIsDark: (val: boolean) => void }) => {
  const { user, signIn } = useStudy();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800' : 'py-8'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          </div>
          <span className="text-xl md:text-2xl font-display font-black tracking-tighter dark:text-white uppercase">StudyFlow</span>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          {['Features', 'How it Works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={signIn}
            className="hidden md:block bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
          >
            {user ? 'Go to App' : 'Get Started'}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white"
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
            className="absolute top-full left-6 right-6 mt-4 p-8 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 lg:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              {['Features', 'How it Works', 'Pricing'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setIsOpen(false)} className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">{item}</a>
              ))}
              <hr className="border-slate-100 dark:border-slate-800" />
              <button 
                onClick={() => { signIn(); setIsOpen(false); }}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm"
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
    className="p-10 md:p-12 rounded-[48px] bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group"
  >
    <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 md:mb-10 group-hover:scale-110 transition-transform">
      <Icon className="w-8 h-8 md:w-10 md:h-10" />
    </div>
    <h3 className="text-2xl md:text-3xl font-display font-black mb-4 dark:text-white tracking-tight">{title}</h3>
    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left group"
      >
        <span className="text-xl md:text-2xl font-black dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors">{question}</span>
        <ChevronDown className={`w-6 h-6 text-slate-400 transition-transform duration-500 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ isDark, setIsDark }: { isDark: boolean, setIsDark: (val: boolean) => void }) => {
  const { signIn } = useStudy();
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-indigo-50/50 dark:bg-indigo-900/10 -skew-x-12 translate-x-32 z-0" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8 md:mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Prep smarter, not harder
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[92px] font-display font-black tracking-tighter mb-8 md:mb-10 leading-[0.95] md:leading-[0.9] dark:text-white">
                Your Exam <br/>
                <span className="text-indigo-600">On Autopilot.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 md:mb-12 max-w-lg leading-relaxed font-medium">
                Generate the perfect study timetable tailored for any academic challenge—from Finals and Boards to Professional Certifications—with seamless Google integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <button 
                  onClick={signIn}
                  className="bg-indigo-600 hover:bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                >
                  Build My Flow <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[24px] text-lg md:text-xl font-black shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 md:mt-20 glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-sm flex items-center gap-4 md:gap-6 max-w-md border border-white dark:border-slate-800">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-base md:text-lg italic text-slate-600 dark:text-slate-300 font-medium leading-tight">"Kept me organized and productive through the most intense semester of my life."</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-2">Arjun S., University Junior</p>
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
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 flex flex-col">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-display font-black text-2xl mb-3 dark:text-white tracking-tight">Adaptive Scheduling</h3>
                  <p className="text-slate-500 dark:text-slate-400">Missed a session? StudyFlow redistributes your tasks automatically.</p>
                </div>

                <div className="bg-indigo-600 rounded-[40px] p-8 shadow-2xl shadow-indigo-500/20 flex flex-col text-white transform translate-y-12">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-black text-2xl mb-3 tracking-tight">Pre-built Templates</h3>
                  <p className="text-indigo-100">One-click setups for Finals, LSAT, GRE, and professional licensure exams.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 flex flex-col translate-x-4">
                  <div className="w-full h-28 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 flex items-end gap-2 p-4">
                    <div className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t-xl" style={{ height: '40%' }}></div>
                    <div className="flex-1 bg-indigo-400 dark:bg-indigo-600 rounded-t-xl" style={{ height: '70%' }}></div>
                    <div className="flex-1 bg-indigo-300 dark:bg-indigo-700 rounded-t-xl" style={{ height: '55%' }}></div>
                    <div className="flex-1 bg-indigo-600 dark:bg-indigo-500 rounded-t-xl" style={{ height: '90%' }}></div>
                  </div>
                  <h3 className="font-display font-black text-2xl mb-3 dark:text-white tracking-tight">Progress Tracker</h3>
                  <p className="text-slate-500 dark:text-slate-400">Visualise your mastery across subjects with real-time analytics.</p>
                </div>

                <div className="bg-slate-900 dark:bg-slate-800 rounded-[40px] p-10 shadow-2xl flex flex-col justify-center items-center text-center text-white translate-y-16">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Launch Offer</p>
                  <h3 className="text-4xl font-black mb-2 font-display">$0/mo</h3>
                  <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold">Free for first 10k users</p>
                  <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-sm uppercase tracking-widest">Join Waitlist</button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

       <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mb-16 md:mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 inline-block">Capabilities</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-6 md:mb-8 dark:text-white tracking-tighter leading-[0.95] md:leading-[0.9]">
              Everything you need <br />
              <span className="text-indigo-600">to succeed.</span>
            </h2>
            <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">Ace your exams without the exhaustion. Our tools are built around the way students actually learn.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
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

      <section id="how-it-works" className="py-20 md:py-32 bg-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-15deg] translate-x-20" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
           <div className="max-w-4xl mb-16 md:mb-24">
            <span className="text-xs uppercase tracking-[0.3em] font-black text-indigo-200 mb-6 inline-block opacity-80">Simple Process</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-8 md:mb-10 tracking-tighter leading-[0.95] md:leading-[0.9]">
              How it works.
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 md:gap-16">
            {[
              { n: "01", t: "Exam Details", d: "Tell us about your upcoming finals, certification, or board exams and the subjects you're tackling." },
              { n: "02", t: "AI Generation", d: "Our algorithm calculates an optimal distribution of study sessions and revision milestones." },
              { n: "03", t: "Follow & Master", d: "Sync with Google Calendar and start your flow. The AI adapts your schedule if you need more time." }
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-4 md:gap-6 group">
                <div className="text-7xl md:text-[120px] font-display font-black leading-none opacity-20 group-hover:opacity-100 transition-opacity duration-500">{step.n}</div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight font-display">{step.t}</h3>
                <p className="text-lg md:text-xl text-indigo-100 leading-relaxed font-medium">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-12 items-end">
            <div className="lg:col-span-1 mb-12 lg:mb-0">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 inline-block">Pricing</span>
              <h2 className="text-4xl md:text-6xl font-display font-black mb-6 md:mb-8 dark:text-white tracking-tighter leading-[0.95] md:leading-none">
                Focus on <br />
                <span className="text-indigo-600">The Grade,</span> <br />
                Not the cost.
              </h2>
              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-8 md:mb-10 font-medium">Simple plans for every student budget. Start for free and upgrade as you grow.</p>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl md:rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                 </div>
                 <p className="font-bold text-sm md:text-base dark:text-white leading-tight">No credit card required to start.</p>
              </div>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="p-8 md:p-12 rounded-[32px] md:rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-8 md:mb-12">Basic Plan</h3>
                <div className="flex items-end gap-1 mb-8 md:mb-12">
                   <div className="text-6xl md:text-[92px] font-display font-black leading-[0.8] dark:text-white tracking-tighter">Free</div>
                </div>
                <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                  {['Single Study Plan', 'Web Dashboard', 'Sync to Tasks', 'Standard Templates'].map(item => (
                    <li key={item} className="flex items-center gap-3 md:gap-4 text-base md:text-lg font-bold text-slate-600 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={signIn}
                  className="w-full py-4 md:py-5 rounded-2xl md:rounded-[24px] border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-black text-lg md:text-xl hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
                >
                  Sign Up
                </button>
              </div>

              <div className="p-8 md:p-12 rounded-[32px] md:rounded-[48px] bg-slate-900 dark:bg-slate-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 md:p-8">
                   <Zap className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8 md:mb-12">Pro Plan</h3>
                <div className="flex items-end gap-1 mb-8 md:mb-12">
                   <div className="text-6xl md:text-[92px] font-display font-black leading-[0.8] tracking-tighter">$9</div>
                   <div className="text-lg md:text-xl font-black text-slate-500 mb-1 md:mb-2">/MO</div>
                </div>
                <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                  {['AI Adaptive Scheduling', 'Google Calendar Sync', 'Priority Support', 'Full Analytics Panel', 'Progress Export'].map(item => (
                    <li key={item} className="flex items-center gap-3 md:gap-4 text-base md:text-lg font-bold">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" /> {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={signIn}
                  className="w-full py-4 md:py-5 rounded-2xl md:rounded-[24px] bg-indigo-600 text-white font-black text-lg md:text-xl shadow-xl shadow-indigo-600/30 hover:scale-[1.03] transition-transform uppercase tracking-widest"
                >
                  Go Pro Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-32 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20">
            <div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-black mb-8 md:mb-10 dark:text-white tracking-tighter leading-[0.95] md:leading-[0.9]">
                Frequently Asked <br />
                <span className="text-indigo-600">Questions.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-500 font-bold max-w-sm">Find answers to common questions about syncing and schedules.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[48px] p-8 md:p-16 shadow-sm border border-slate-100 dark:border-slate-800">
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

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="bg-slate-900 dark:bg-indigo-900/30 rounded-[40px] md:rounded-[64px] p-12 md:p-32 text-center text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl lg:text-8xl font-display font-black mb-10 md:mb-12 tracking-tighter leading-[0.95] md:leading-[0.8]">
                Ace Your Exams. <br />
                <span className="text-indigo-500 italic">No Excuses.</span>
              </h2>
              <button 
                onClick={signIn}
                className="bg-white text-slate-900 px-12 py-6 rounded-3xl font-black text-xl md:text-2xl hover:scale-105 transition-all shadow-2xl"
              >
                Join StudyFlow Today
              </button>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.2),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-20 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <span className="text-xl font-display font-black tracking-tighter dark:text-white uppercase">StudyFlow</span>
            </div>
            <p className="text-slate-500 font-bold text-sm">© 2024 StudyFlow AI. All rights reserved.</p>
            <div className="flex gap-6">
              {[Twitter, Github, Instagram, Mail].map((Icon, i) => (
                <Icon key={i} className="w-6 h-6 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors" />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AppContent = () => {
  const { user, loading, themeConfig, userStats, activeNotification, confettiActive, closeNotification } = useStudy();
  const [activeView, setActiveView] = useState<'dashboard' | 'subjects' | 'achievements' | 'settings'>('dashboard');
  const [isDark, setIsDark] = useState(() => {
    const saved = storage.getTheme();
    return saved !== null ? saved : false;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Zap className="w-12 h-12 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage isDark={isDark} setIsDark={setIsDark} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row transition-colors duration-1000 relative overflow-hidden"
    >
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
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
