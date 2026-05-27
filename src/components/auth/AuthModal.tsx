import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import GoogleButton from './GoogleButton';

type AuthView = 'login' | 'signup' | 'forgot';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [view, setView] = useState<AuthView>('login');

  const handleSuccess = () => {
    onClose();
    setView('login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-violet-600 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-display font-semibold dark:text-white/90">
                  {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mx-6 h-px bg-white/[0.06]" />
            <div className="p-6 space-y-3">
              {view !== 'forgot' && (
                <>
                  <GoogleButton />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-[8px] font-medium text-white/20 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                </>
              )}
              {view === 'login' && (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToSignup={() => setView('signup')}
                  onForgotPassword={() => setView('forgot')}
                />
              )}
              {view === 'signup' && (
                <SignupForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setView('login')}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
