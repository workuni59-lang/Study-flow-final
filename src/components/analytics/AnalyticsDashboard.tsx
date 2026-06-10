import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Activity, TrendingUp, BookOpen, History, Crown, Lock } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import AnalyticsOverview from './AnalyticsOverview';
import AnalyticsHeatmap from './AnalyticsHeatmap';
import AnalyticsTrends from './AnalyticsTrends';
import AnalyticsSubjects from './AnalyticsSubjects';
import AnalyticsSessions from './AnalyticsSessions';

type Tab = 'overview' | 'heatmap' | 'trends' | 'subjects' | 'sessions';

const TABS: { id: Tab; icon: typeof BarChart3; label: string }[] = [
  { id: 'overview', icon: BarChart3, label: 'Overview' },
  { id: 'heatmap', icon: Activity, label: 'Heatmap' },
  { id: 'trends', icon: TrendingUp, label: 'Trends' },
  { id: 'subjects', icon: BookOpen, label: 'Subjects' },
  { id: 'sessions', icon: History, label: 'Sessions' },
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
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Lock className="w-3 h-3 text-white/60" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white/80 mb-1">Premium Feature</h3>
          <p className="text-[10px] text-white/40 max-w-[200px] leading-relaxed mb-4">
            Unlock detailed heatmaps and subject analytics with Premium.
          </p>
          <button onClick={() => setShowPremiumModal(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20">
            Upgrade to Premium
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
    <div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar" role="tablist">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isPremiumTab = PREMIUM_TABS.includes(tab.id);
          const isLocked = !isPremium && isPremiumTab;
          return (
            <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-label={tab.label} onClick={() => !isLocked && setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[7px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : isLocked
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              {isLocked && <Lock className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
