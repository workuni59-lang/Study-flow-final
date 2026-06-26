import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

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
  const frozenTimeRef = useRef(time);
  const prevFrozenRef = useRef(false);

  // Freeze time display while customizer panel is open
  if (showCustomizer) {
    if (!prevFrozenRef.current) {
      frozenTimeRef.current = time;
    }
    prevFrozenRef.current = true;
  } else {
    prevFrozenRef.current = false;
    frozenTimeRef.current = time;
  }
  const displayTime = frozenTimeRef.current;

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

  const hours = displayTime.getHours();
  const minutes = displayTime.getMinutes();
  const seconds = displayTime.getSeconds();
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
          fontSize: isAnalog ? undefined : 'clamp(2.5rem, 8vw, 5.5rem)',
          lineHeight: isAnalog ? undefined : 1,
          whiteSpace: isAnalog ? undefined : 'nowrap',
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
          className="mt-4 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-full px-6 py-2 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Customize
        </motion.button>
      </motion.div>

      {/* Customizer panel (portal to body to escape backdrop-filter containing block) */}
      {createPortal(
        <ClockCustomizer
          isOpen={showCustomizer}
          onClose={() => setShowCustomizer(false)}
          config={config}
          onChange={handleConfigChange}
          currentPresetId={currentPresetId}
          onPresetChange={handlePresetChange}
        />,
        document.body
      )}
    </>
  );
}
