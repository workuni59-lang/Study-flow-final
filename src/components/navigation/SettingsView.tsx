import { useState } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  ShieldCheck, 
  Crown, 
  Smartphone, 
  Monitor,
  Sparkles,
  Zap,
  RotateCcw,
  Palette,
  CloudLightning,
  User,
  Layout,
  Clock as ClockIcon,
  MessageSquare,
  SlidersHorizontal,
  Save,
  CheckCircle2,
  Timer,
  LogOut,
  Lock
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardCard } from '../dashboard/DashboardCard';
import { storage } from '../../services/storage';

export const SettingsView = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { 
    userStats, 
    themeConfig, 
    setThemeConfig, 
    setShowPremiumModal,
    triggerConfetti,
  } = useStudy();

  const [name, setName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [showSaved, setShowSaved] = useState(false);

  const handleSaveProfile = async () => {
    const { error } = await updateProfile({ display_name: name, bio: bio || null });
    if (!error) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const handleClearData = () => {
    if (confirm("🚨 DANGER: This will permanently delete all your study progress, subjects, and tasks. There is no undo. Proceed?")) {
      storage.clearAll();
      window.location.reload();
    }
  };

  const updateConfig = (key: keyof typeof themeConfig, value: any) => {
    setThemeConfig({ ...themeConfig, [key]: value });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-slate-200 dark:border-slate-700">
          <Settings className="w-3 h-3" />
          Command Center
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter dark:text-white uppercase mb-2">Control Panel</h1>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Configure your personal study sanctuary.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Environment Architect (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardCard className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <SlidersHorizontal className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Environment Architect</h3>
              </div>
              {!userStats.isPremium && (
                <div className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-amber-500/20">
                  <Crown className="w-2.5 h-2.5" /> Premium Only
                </div>
              )}
            </div>

            <div className={`space-y-8 ${!userStats.isPremium ? 'opacity-40 pointer-events-none' : ''}`}>
               {/* Blur Slider */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Background Blur</span>
                     <span className="text-xs font-bold dark:text-white">{themeConfig.blur}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" step="1" 
                    value={themeConfig.blur} 
                    onChange={(e) => updateConfig('blur', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                  />
               </div>

               {/* Brightness Slider */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Dim Intensity</span>
                     <span className="text-xs font-bold dark:text-white">{100 - themeConfig.brightness}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="100" step="5" 
                    value={themeConfig.brightness} 
                    onChange={(e) => updateConfig('brightness', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                  />
               </div>

               {/* Saturation Slider */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Saturation</span>
                     <span className="text-xs font-bold dark:text-white">{themeConfig.saturation}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="200" step="10" 
                    value={themeConfig.saturation} 
                    onChange={(e) => updateConfig('saturation', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer"
                  />
               </div>
            </div>
          </DashboardCard>

          {/* Interface Focus */}
          <DashboardCard className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                   <Layout className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Interface Focus</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => updateConfig('showGreeting', !themeConfig.showGreeting)}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${themeConfig.showGreeting ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                   <User className="w-5 h-5" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">Greetings</span>
                </button>
                <button 
                   onClick={() => updateConfig('showClock', !themeConfig.showClock)}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${themeConfig.showClock ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                   <ClockIcon className="w-5 h-5" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">Zen Clock</span>
                </button>
                <button 
                   onClick={() => updateConfig('showQuote', !themeConfig.showQuote)}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${themeConfig.showQuote ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                   <MessageSquare className="w-5 h-5" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">Daily Quote</span>
                </button>
                <button 
                   onClick={() => updateConfig('clearMode', !themeConfig.clearMode)}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${themeConfig.clearMode ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                   <Sparkles className="w-5 h-5" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">Clear Mode</span>
                </button>
             </div>
          </DashboardCard>

          {/* Focus Engine Config (Premium) */}
          <DashboardCard className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                      <Timer className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Focus Engine</h3>
                </div>
                {!userStats.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
             </div>

             <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!userStats.isPremium ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="space-y-3">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">Auto-Start Next Session</p>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold dark:text-white uppercase">Disabled</span>
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative"><div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full" /></div>
                   </div>
                </div>
                <div className="space-y-3">
                   <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">Sound Selection</p>
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold dark:text-white uppercase">Minimal Chime</span>
                      <Volume2 className="w-4 h-4 text-indigo-600" />
                   </div>
                </div>
               {/* Scale Slider */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Scale</span>
                     <span className="text-xs font-bold dark:text-white">{Math.round(themeConfig.scaleFactor * 100)}%</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={themeConfig.scaleFactor} onChange={(e) => updateConfig('scaleFactor', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
               </div>
             </div>
          </DashboardCard>
        </div>

        {/* Profile & Account (Right Column) */}
        <div className="space-y-8">
           {/* Profile Update */}
           <DashboardCard className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <User className="w-5 h-5 dark:text-white" />
                 </div>
                 <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Profile</h3>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-2 mb-1 block">Display Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold dark:text-white focus:ring-2 ring-indigo-500 transition-all"
                    />
                 </div>
                 <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-2 mb-1 block">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 160))}
                      maxLength={160}
                      rows={3}
                      placeholder="Tell the world a little about yourself..."
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium dark:text-white focus:ring-2 ring-indigo-500 transition-all resize-none"
                    />
                    <div className="flex justify-between mt-1 px-2">
                      <span className="text-[8px] text-slate-500">{160 - bio.length} characters remaining</span>
                    </div>
                 </div>
                 <button 
                   onClick={handleSaveProfile}
                   className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    {showSaved ? <><CheckCircle2 className="w-4 h-4" /> Profile Saved</> : <><Save className="w-4 h-4" /> Update Profile</>}
                 </button>
              </div>
           </DashboardCard>

           {/* Membership Status */}
           <DashboardCard className={`relative overflow-hidden ${userStats.isPremium ? 'bg-indigo-600 text-white border-none' : ''}`}>
              {userStats.isPremium && <Zap className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 rotate-12" />}
              <div className="relative z-10 space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Membership Status</p>
                 <div className="flex items-center gap-3">
                    {userStats.isPremium ? (
                       <>
                          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                             <Crown className="w-5 h-5 text-amber-300" />
                          </div>
                          <div>
                             <h4 className="font-display font-black uppercase tracking-tight">Elite Scholar Pro</h4>
                             <p className="text-[8px] font-bold opacity-60 uppercase">Lifetime Academic Access</p>
                          </div>
                       </>
                    ) : (
                       <>
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                             <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                             <h4 className="font-display font-black uppercase tracking-tight dark:text-white">Free Plan</h4>
                             <p className="text-[8px] font-bold text-slate-500 uppercase">Standard Limitations Active</p>
                          </div>
                       </>
                    )}
                 </div>
                 <button 
                    onClick={() => userStats.isPremium ? setShowPremiumModal(true) : setShowPremiumModal(true)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${userStats.isPremium ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-slate-900'}`}
                 >
                    {userStats.isPremium ? 'Manage Subscription' : 'Upgrade to Pro'}
                 </button>
              </div>
           </DashboardCard>

            {/* Sign Out */}
            <DashboardCard>
               <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-3 py-4 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
               >
                  <LogOut className="w-4 h-4" />
                  Sign Out
               </button>
            </DashboardCard>

            {/* Dangerous Area */}
           <DashboardCard className="border-rose-500/20 bg-rose-50/5 dark:bg-rose-900/5">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-rose-600">
                    <CloudLightning className="w-5 h-5" />
                    <h4 className="font-display font-black uppercase tracking-tight">Dangerous Area</h4>
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Resetting will purge all your study data. This action is irreversible.</p>
                 <button 
                    onClick={handleClearData}
                    className="w-full py-4 border-2 border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                 >
                    Nuclear Factory Reset
                 </button>
              </div>
           </DashboardCard>
        </div>

      </div>

      <div className="py-12 flex flex-col items-center opacity-30 text-center">
         <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent rounded-full mb-6" />
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 leading-relaxed">
            Designed for excellence. v2.5.0-elite<br/>
            StudyFlow Intelligence System
         </p>
      </div>
    </div>
  );
};
