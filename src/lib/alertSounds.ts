export interface AlertSound {
  id: string;
  name: string;
  emoji: string;
}

export const ALERT_SOUNDS: AlertSound[] = [
  { id: 'sparkle', name: 'Sparkle', emoji: '✨' },
  { id: 'chime', name: 'Chime', emoji: '🔔' },
  { id: 'soft', name: 'Soft', emoji: '☁️' },
  { id: 'piano', name: 'Piano', emoji: '🎹' },
  { id: 'success', name: 'Success', emoji: '🏆' },
  { id: 'game-show', name: 'Game Show', emoji: '🎲' },
  { id: 'airport', name: 'Airport', emoji: '🛫' },
  { id: 'level-up', name: 'Level Up', emoji: '👾' },
  { id: 'applause', name: 'Applause', emoji: '👏' },
  { id: 'none', name: 'No Alert', emoji: '🔕' },
];

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export const playAlertSound = (alertId: string, volume: number) => {
  if (alertId === 'none' || volume <= 0) return;
  try {
    const ctx = getCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);

    switch (alertId) {
      case 'sparkle': {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = 1200 + i * 400;
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
          osc.connect(gain).connect(masterGain);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        }
        break;
      }
      case 'chime': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
        break;
      }
      case 'soft': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.connect(gain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        break;
      }
      case 'piano': {
        [523, 659, 784].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 1);
          o.connect(g).connect(masterGain);
          o.start(ctx.currentTime + i * 0.15);
          o.stop(ctx.currentTime + i * 0.15 + 1);
        });
        break;
      }
      case 'success': {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
          o.connect(g).connect(masterGain);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.6);
        });
        break;
      }
      case 'game-show': {
        [400, 500, 600, 800, 1000, 1200].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'square';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.15);
          o.connect(g).connect(masterGain);
          o.start(ctx.currentTime + i * 0.08);
          o.stop(ctx.currentTime + i * 0.08 + 0.15);
        });
        break;
      }
      case 'airport': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.connect(gain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 1);
        break;
      }
      case 'level-up': {
        [300, 400, 500, 600, 800].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
          o.connect(g).connect(masterGain);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
        break;
      }
      case 'applause': {
        for (let i = 0; i < 20; i++) {
          const noise = ctx.createOscillator();
          const gain = ctx.createGain();
          noise.type = 'sawtooth';
          noise.frequency.value = 200 + Math.random() * 2000;
          gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.1);
          noise.connect(gain).connect(masterGain);
          noise.start(ctx.currentTime + i * 0.05);
          noise.stop(ctx.currentTime + i * 0.05 + 0.1);
        }
        break;
      }
      default:
        break;
    }
  } catch {}
};
