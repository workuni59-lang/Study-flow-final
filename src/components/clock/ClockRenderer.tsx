import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';
import type { ClockConfig, ClockFocusState } from './types';
import { getDefaultConfig, loadClockConfig, saveClockConfig, getVariantType } from './ThemeEngine';
import { styleFadeTransition, floatHover, focusPulse, softTransition } from './ClockAnimations';
import DigitalClock from './DigitalClock';
import AnalogClock from './AnalogClock';
import FocusSyncLayer from './FocusSyncLayer';
import ClockCustomizer from './ClockCustomizer';

interface ClockRendererProps {
  time: Date;
  focusState?: ClockFocusState | null;
  onToggleCustomizer?: () => void;
}

export default function ClockRenderer({ time, focusState }: ClockRendererProps) {
  const [config, setConfig] = useState<ClockConfig>(() => loadClockConfig() || getDefaultConfig());
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>();

  useEffect(() => {
    saveClockConfig(config);
  }, [config]);

  const handleConfigChange = useCallback((newConfig: ClockConfig) => {
    setConfig(newConfig);
  }, []);

  const handlePresetChange = useCallback((id?: string) => {
    setCurrentPresetId(id);
  }, []);

  const isAnalog = getVariantType(config.variant) === 'analog';

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const formattedTime = useMemo(() => {
    const h = config.hour12 ? (hours % 12 || 12) : hours;
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return { hours: h, minutes: m, seconds: s, ampm };
  }, [hours, minutes, seconds, config.hour12]);

  const isInFocus = focusState?.isActive && focusState.mode === 'focus';

  const style = useMemo(() => ({
    opacity: config.opacity / 100,
    filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
  }), [config.opacity, config.blur]);

  const shadowStyle = useMemo(() => {
    if (config.shadowSoftness === 0) return {};
    const s = config.shadowSoftness * 0.3;
    return {
      boxShadow: `0 ${s * 0.5}px ${s}px ${config.accentColor}22, 0 ${s}px ${s * 2}px ${config.accentColor}11`,
    };
  }, [config.shadowSoftness, config.accentColor]);

  return (
    <>
      <motion.div
        className="relative flex flex-col items-center justify-center"
        style={{
          ...style,
          ...shadowStyle,
          borderRadius: config.borderRadius,
          fontFamily: isAnalog ? undefined : config.fontFamily,
        }}
        variants={floatHover}
        animate="animate"
      >
        {/* Clock face */}
        <motion.div
          className="relative"
          style={{ transform: `scale(${config.size / 100})`, transformOrigin: 'center center' }}
          variants={isInFocus ? focusPulse : undefined}
          animate={isInFocus ? 'animate' : undefined}
        >
          {/* Focus sync ring — only for analog clocks, inside the scaled container */}
          {isAnalog && <FocusSyncLayer focusState={focusState} accentColor={config.accentColor} glowIntensity={config.glowIntensity} />}
          <AnimatePresence mode="wait">
            <motion.div
              key={config.variant}
              variants={styleFadeTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={softTransition}
            >
              {isAnalog ? (
                <AnalogClock
                  hours={hours}
                  minutes={minutes}
                  seconds={seconds}
                  config={config}
                />
              ) : (
                <DigitalClock
                  hours={formattedTime.hours}
                  minutes={minutes}
                  seconds={seconds}
                  ampm={ampm}
                  config={config}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Customize button */}
        <motion.button
          onClick={() => setShowCustomizer(true)}
          className="mt-4 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] text-white/40 hover:text-white/70 transition-all flex items-center gap-1.5 backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Clock className="w-3 h-3" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Customize</span>
        </motion.button>
      </motion.div>

      {/* Customizer panel */}
      <ClockCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        config={config}
        onChange={handleConfigChange}
        currentPresetId={currentPresetId}
        onPresetChange={handlePresetChange}
      />
    </>
  );
}
