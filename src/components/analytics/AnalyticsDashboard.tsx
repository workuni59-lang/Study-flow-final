import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Activity, TrendingUp, BookOpen, History, Crown, Lock, Sparkles } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import AnalyticsOverview from './AnalyticsOverview';
import AnalyticsHeatmap from './AnalyticsHeatmap';
import AnalyticsTrends from './AnalyticsTrends';
import AnalyticsSubjects from './AnalyticsSubjects';
import AnalyticsSessions from './AnalyticsSessions';

type Tab = 'overview' | 'heatmap' | 'trends' | 'subjects' | 'sessions';

const TABS: { id: Tab; icon: typeof BarChart3; label: string }[] = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'trends', icon: TrendingUp, label: 'Trends' },
  { id: 'sessions', icon: History, label: 'Sessions' },
  { id: 'heatmap', icon: Activity, label: 'Heatmap' },
  { id: 'subjects', icon: BookOpen, label: 'Subjects' },
];

const PREMIUM_TABS: Tab[] = ['heatmap', 'subjects'];

export default function AnalyticsDashboard() {
  const { userStats, subjects, setShowPremiumModal } = useStudy();
  const isPremium = userStats.isPremium;
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const isPremiumBlocked = !isPremium && PREMIUM_TABS.includes(activeTab);

  const renderContent = () => {
    if (isPremiumBlocked) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="relative mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 blur-3xl rounded-full"
            />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">Elite Analytics</h3>
          <p className="text-xs text-white/40 max-w-[280px] leading-relaxed mb-8 font-medium">
            Unlock high-resolution activity heatmaps and subject-specific performance tracking.
          </p>

          <button
            onClick={() => setShowPremiumModal(true)}
            className="group relative px-8 py-4 rounded-2xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Upgrade to Premium
            </span>
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return <AnalyticsOverview userStats={userStats} />;
      case 'heatmap': return <AnalyticsHeatmap userStats={userStats} />;
      case 'trends': return <AnalyticsTrends userStats={userStats} />;
      case 'subjects': return <AnalyticsSubjects subjects={subjects} />;
      case 'sessions': return <AnalyticsSessions userStats={userStats} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isPremiumTab = PREMIUM_TABS.includes(tab.id);
          const isLocked = !isPremium && isPremiumTab;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !isLocked && setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-white/[0.12] backdrop-blur-sm text-white border-white/[0.15] shadow-xl'
                  : isLocked
                    ? 'text-white/20 border-white/5 cursor-not-allowed grayscale'
                    : 'text-white/40 border-white/5 hover:text-white/70 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-light' : 'text-current'}`} />
              {tab.label}
              {isLocked && (
                <div className="ml-1 p-1 bg-amber-500/10 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-amber-500" />
                </div>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl ring-2 ring-brand/20 pointer-events-none"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="min-h-[400px]"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
