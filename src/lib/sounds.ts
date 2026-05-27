let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* ─── COOLDOWN TRACKER ───────────────────────────────────────── */

const cooldowns = new Map<string, number>();
const COOLDOWN_MS: Record<string, number> = {
  pop: 100,
  chime: 200,
  chirp: 300,
  celebration: 500,
  feed: 400,
  step: 80,
  heart: 300,
  sparkle: 300,
  yawn: 2000,
  sad: 800,
  confused: 600,
  level_up: 1000,
};

function canPlay(name: string): boolean {
  const last = cooldowns.get(name);
  const now = Date.now();
  if (last && now - last < (COOLDOWN_MS[name] ?? 200)) return false;
  cooldowns.set(name, now);
  return true;
}

/* ─── OSCILLATOR HELPERS ──────────────────────────────────────── */

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, delay = 0) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + delay;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

function arpeggio(notes: number[], duration: number, type: OscillatorType = 'sine', volume = 0.06, spacing = 0.06) {
  notes.forEach((freq, i) => tone(freq, duration, type, volume, i * spacing));
}

function chord(notes: number[], duration: number, type: OscillatorType = 'sine', volume = 0.04) {
  notes.forEach(freq => tone(freq, duration, type, volume));
}

/* ─── SOUND EFFECTS ───────────────────────────────────────────── */

export const sounds = {
  pop: () => {
    if (!canPlay('pop')) return;
    tone(600, 0.06, 'sine', 0.05);
    tone(800, 0.04, 'sine', 0.03);
  },

  chime: () => {
    if (!canPlay('chime')) return;
    arpeggio([523, 659, 784], 0.2, 'sine', 0.05, 0.07);
  },

  chirp: () => {
    if (!canPlay('chirp')) return;
    tone(880, 0.06, 'sine', 0.05);
    setTimeout(() => tone(1100, 0.06, 'sine', 0.04), 60);
  },

  celebration: () => {
    if (!canPlay('celebration')) return;
    arpeggio([523, 659, 784, 1047], 0.3, 'sine', 0.06, 0.08);
    setTimeout(() => arpeggio([784, 1047, 1319], 0.25, 'sine', 0.04, 0.07), 200);
  },

  levelUp: () => {
    if (!canPlay('level_up')) return;
    arpeggio([392, 523, 659, 784, 1047], 0.25, 'triangle', 0.06, 0.09);
    setTimeout(() => chord([1047, 1319, 1568], 0.5, 'sine', 0.03), 450);
  },

  heart: () => {
    if (!canPlay('heart')) return;
    tone(523, 0.12, 'sine', 0.06);
    setTimeout(() => tone(659, 0.12, 'sine', 0.06), 60);
    setTimeout(() => tone(784, 0.15, 'sine', 0.04), 120);
  },

  sparkle: () => {
    if (!canPlay('sparkle')) return;
    tone(784, 0.08, 'sine', 0.05);
    setTimeout(() => tone(988, 0.08, 'sine', 0.05), 50);
    setTimeout(() => tone(1175, 0.1, 'sine', 0.04), 100);
    setTimeout(() => tone(1319, 0.12, 'sine', 0.03), 150);
  },

  feed: () => {
    if (!canPlay('feed')) return;
    tone(262, 0.15, 'triangle', 0.07);
    setTimeout(() => tone(330, 0.15, 'triangle', 0.07), 100);
    setTimeout(() => tone(392, 0.1, 'triangle', 0.05), 200);
  },

  step: () => {
    if (!canPlay('step')) return;
    tone(180, 0.04, 'square', 0.03);
  },

  yawn: () => {
    if (!canPlay('yawn')) return;
    tone(200, 0.4, 'sine', 0.02);
    setTimeout(() => tone(180, 0.3, 'sine', 0.015), 150);
  },

  sad: () => {
    if (!canPlay('sad')) return;
    tone(350, 0.3, 'triangle', 0.04);
    setTimeout(() => tone(280, 0.4, 'triangle', 0.03), 200);
  },

  confused: () => {
    if (!canPlay('confused')) return;
    tone(400, 0.1, 'square', 0.03);
    setTimeout(() => tone(350, 0.1, 'square', 0.02), 120);
    setTimeout(() => tone(420, 0.1, 'square', 0.02), 240);
  },

  mistake: () => {
    if (!canPlay('sad')) return;
    tone(220, 0.25, 'sawtooth', 0.02);
    setTimeout(() => tone(180, 0.3, 'sawtooth', 0.015), 150);
  },

  achievement: () => {
    if (!canPlay('celebration')) return;
    arpeggio([523, 659, 784, 1047, 1319], 0.2, 'sine', 0.05, 0.1);
    setTimeout(() => chord([1319, 1568, 1976], 0.6, 'sine', 0.03), 500);
  },

  streakChime: () => {
    if (!canPlay('chime')) return;
    tone(523, 0.15, 'sine', 0.05);
    setTimeout(() => tone(784, 0.15, 'sine', 0.05), 100);
    setTimeout(() => tone(1047, 0.2, 'sine', 0.04), 200);
  },
};
