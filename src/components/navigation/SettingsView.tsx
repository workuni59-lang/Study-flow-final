import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Lock,
  Download,
  Key,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Wind
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { useAuth } from '../../context/AuthContext';
import { DashboardCard } from '../dashboard/DashboardCard';
import { storage } from '../../services/storage';
import { supabase } from '../../lib/supabase';
import { ALERT_SOUNDS, playAlertSound } from '../../lib/alertSounds';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

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

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<'json' | 'csv' | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedSound, setSelectedSound] = useState(() => {
    try { return JSON.parse(localStorage.getItem('study_flow_alert_sound') || '"sparkle"'); } catch { return 'sparkle'; }
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    try { return JSON.parse(localStorage.getItem('study_flow_alert_volume') || '0.75'); } catch { return 0.75; }
  });

  // Sync local state with context updates
  const prevDisplayName = useRef(user?.displayName);
  const prevBio = useRef(profile?.bio);
  if (prevDisplayName.current !== user?.displayName) {
    prevDisplayName.current = user?.displayName;
    setName(user?.displayName || '');
  }
  if (prevBio.current !== profile?.bio) {
    prevBio.current = profile?.bio;
    setBio(profile?.bio || '');
  }

  // Persist sound settings
  useEffect(() => { localStorage.setItem('study_flow_alert_sound', JSON.stringify(selectedSound)); }, [selectedSound]);
  useEffect(() => { localStorage.setItem('study_flow_alert_volume', JSON.stringify(soundVolume)); }, [soundVolume]);

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/api/delete-account`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error || 'Failed to delete account');
      }

      storage.clearAll();
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      alert(`Failed to delete account: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setExportLoading('json');
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/api/export-data`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error || 'Failed to export data');
      }

      const data: any = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyflow-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportCSV = useCallback(async () => {
    setExportLoading('csv');
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/api/export-data`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error || 'Failed to export data');
      }

      const data: any = await res.json();
      const date = new Date().toISOString().split('T')[0];

      // Generate CSVs for tasks and stats
      const csvRows: { filename: string; content: string }[] = [];

      if (data.tasks?.length) {
        const headers = Object.keys(data.tasks[0]).join(',');
        const rows = data.tasks.map((t: any) => Object.values(t).map(v => `"${v ?? ''}"`).join(','));
        csvRows.push({ filename: `tasks-${date}.csv`, content: [headers, ...rows].join('\n') });
      }
      if (data.subjects?.length) {
        const headers = Object.keys(data.subjects[0]).join(',');
        const rows = data.subjects.map((s: any) => Object.values(s).map(v => `"${v ?? ''}"`).join(','));
        csvRows.push({ filename: `subjects-${date}.csv`, content: [headers, ...rows].join('\n') });
      }
      if (data.daily_stats?.length) {
        const headers = Object.keys(data.daily_stats[0]).join(',');
        const rows = data.daily_stats.map((d: any) => Object.values(d).map(v => `"${v ?? ''}"`).join(','));
        csvRows.push({ filename: `daily-stats-${date}.csv`, content: [headers, ...rows].join('\n') });
      }

      if (csvRows.length === 0) {
        throw new Error('No data to export');
      }

      // Download as a zip-like combined file (for simplicity, download first 3 separately)
      for (const csv of csvRows) {
        const blob = new Blob([csv.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = csv.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(`CSV export failed: ${err.message}`);
    } finally {
      setExportLoading(null);
    }
  }, []);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordNew !== passwordConfirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordNew.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    const strength = passwordStrength(passwordNew);
    if (strength.score < 3) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character');
      return;
    }

    try {
      const { error } = await supabase!.auth.updateUser({ password: passwordNew });
      if (error) {
        setPasswordError(error.message);
        return;
      }
      setPasswordSuccess(true);
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  const handleCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/api/customer-portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err: any = await res.json();
        throw new Error(err.error || 'Failed to open portal');
      }

      const { url } = await res.json() as { url: string };
      window.open(url, '_blank');
    } catch (err: any) {
      // Fall back to upgrade modal
      setShowPremiumModal(true);
    } finally {
      setPortalLoading(false);
    }
  };

  const updateConfig = <K extends keyof typeof themeConfig>(key: K, value: (typeof themeConfig)[K]) => {
    setThemeConfig(prev => ({ ...prev, [key]: value }));
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
                <button 
                   onClick={() => updateConfig('particleMotion', themeConfig.particleMotion === 'moving' ? 'static' : 'moving')}
                  className={`p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${themeConfig.particleMotion === 'moving' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                   <Wind className="w-5 h-5" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">{themeConfig.particleMotion === 'moving' ? 'Moving' : 'Static'}</span>
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
                    <button onClick={() => updateConfig('autoStartNext', !themeConfig.autoStartNext)}
                      className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all border ${themeConfig.autoStartNext ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}>
                       <span className="text-xs font-bold dark:text-white uppercase">{themeConfig.autoStartNext ? 'Enabled' : 'Disabled'}</span>
                       <div className={`w-10 h-5 rounded-full relative transition-all ${themeConfig.autoStartNext ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${themeConfig.autoStartNext ? 'left-6' : 'left-1'}`} />
                       </div>
                    </button>
                 </div>
                 <div className="space-y-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">Sound Selection</p>
                    <div className="space-y-2">
                       {ALERT_SOUNDS.map(a => (
                          <button key={a.id} onClick={() => { setSelectedSound(a.id); playAlertSound(a.id, soundVolume); }}
                             className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${selectedSound === a.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60'}`}>
                             <span className="flex items-center gap-2 text-xs font-bold dark:text-white uppercase">
                                <span className="text-sm">{a.emoji}</span>
                                {a.name}
                             </span>
                             {selectedSound === a.id && <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
                          </button>
                       ))}
                       <div className="flex items-center gap-3 pt-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 w-12">Volume</span>
                          <input type="range" min="0" max="1" step="0.01" value={soundVolume} onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                          <span className="text-[9px] font-bold dark:text-white w-8 text-right">{Math.round(soundVolume * 100)}%</span>
                       </div>
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
                     onClick={() => userStats.isPremium ? handleCustomerPortal() : setShowPremiumModal(true)}
                     disabled={portalLoading}
                     className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${userStats.isPremium ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:bg-slate-900'}`}
                  >
                     {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                     {userStats.isPremium ? 'Manage Subscription' : 'Upgrade to Pro'}
                     {userStats.isPremium ? <ExternalLink className="w-3 h-3" /> : null}
                  </button>
              </div>
           </DashboardCard>

             {/* Password Change */}
            <DashboardCard className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                     <Key className="w-5 h-5 dark:text-white" />
                  </div>
                  <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Change Password</h3>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-2 mb-1 block">New Password</label>
                     <input
                       type="password"
                       value={passwordNew}
                       onChange={(e) => { setPasswordNew(e.target.value); setPasswordError(''); setPasswordSuccess(false); }}
                       className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold dark:text-white focus:ring-2 ring-indigo-500 transition-all"
                       placeholder="Enter new password"
                     />
                     {passwordNew && (
                       <div className="mt-2 space-y-1">
                         <div className="flex gap-1">
                           {[1,2,3,4,5].map(i => (
                             <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength(passwordNew).score ? passwordStrength(passwordNew).color : 'bg-slate-200 dark:bg-slate-700'}`} />
                           ))}
                         </div>
                         <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: passwordStrength(passwordNew).score >= 3 ? '#22c55e' : '#f59e0b' }}>
                           {passwordStrength(passwordNew).label}
                         </p>
                       </div>
                     )}
                  </div>
                  <div>
                     <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-2 mb-1 block">Confirm New Password</label>
                     <input
                       type="password"
                       value={passwordConfirm}
                       onChange={(e) => { setPasswordConfirm(e.target.value); setPasswordError(''); setPasswordSuccess(false); }}
                       className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold dark:text-white focus:ring-2 ring-indigo-500 transition-all"
                       placeholder="Confirm new password"
                     />
                  </div>
                  {passwordError && (
                    <p className="text-rose-500 text-[10px] font-bold">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-green-500 text-[10px] font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Password changed successfully</p>
                  )}
                  <button
                     onClick={handleChangePassword}
                     disabled={!passwordNew || !passwordConfirm}
                     className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-40"
                  >
                     <Key className="w-4 h-4" /> Update Password
                  </button>
               </div>
            </DashboardCard>

            {/* Data Export */}
            <DashboardCard className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                     <Download className="w-5 h-5 dark:text-white" />
                  </div>
                  <h3 className="text-xl font-display font-black dark:text-white uppercase tracking-tight">Export Data</h3>
               </div>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Download all your study data for backup or migration.</p>
               <div className="grid grid-cols-2 gap-3">
                  <button
                     onClick={handleExportJSON}
                     disabled={exportLoading === 'json' || exportLoading === 'csv'}
                     className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                     {exportLoading === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                     JSON
                  </button>
                  <button
                     onClick={handleExportCSV}
                     disabled={exportLoading === 'csv' || exportLoading === 'json'}
                     className="py-4 border-2 border-indigo-600/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                     {exportLoading === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                     CSV
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
              <div className="space-y-5">
                 <div className="flex items-center gap-3 text-rose-600">
                    <CloudLightning className="w-5 h-5" />
                    <h4 className="font-display font-black uppercase tracking-tight">Dangerous Area</h4>
                 </div>

                 <div className="space-y-3 pb-4 border-b border-rose-500/10">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Resetting will purge all your study data. This action is irreversible.</p>
                    <button
                       onClick={handleClearData}
                       className="w-full py-4 border-2 border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                    >
                       Nuclear Factory Reset
                    </button>
                 </div>

                 <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Delete your account and all associated data permanently. This cannot be undone.</p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold dark:text-white focus:ring-2 ring-rose-500 transition-all"
                    />
                    <button
                       onClick={handleDeleteAccount}
                       disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                       className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                       {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                       {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                 </div>
              </div>
           </DashboardCard>
        </div>

      </div>

      <div className="py-12 flex flex-col items-center text-center">
         <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent rounded-full mb-6 opacity-30" />
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 leading-relaxed opacity-30">
            Designed for excellence. v2.5.0-elite<br/>
            StudyFlow Intelligence System
         </p>
         <div className="mt-4 flex gap-8">
           <Link to="/privacy" className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors">Privacy</Link>
           <Link to="/terms" className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors">Terms</Link>
         </div>
      </div>
    </div>
  );
};
