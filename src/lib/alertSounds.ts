export interface AlertSound {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

export const ALERT_SOUNDS: AlertSound[] = [
  { id: 'sparkle', name: 'Sparkle', emoji: '✨', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/sparkle.mp3' },
  { id: 'chime', name: 'Chime', emoji: '🔔', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/chime.mp3' },
  { id: 'soft', name: 'Soft', emoji: '☁️', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/soft.mp3' },
  { id: 'piano', name: 'Piano', emoji: '🎹', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/piano.mp3' },
  { id: 'success', name: 'Success', emoji: '🏆', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/success.mp3' },
  { id: 'game-show', name: 'Game Show', emoji: '🎲', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/game_show.mp3' },
  { id: 'airport', name: 'Airport', emoji: '🛫', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/airport.mp3' },
  { id: 'level-up', name: 'Level Up', emoji: '👾', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/level_up.mp3' },
  { id: 'applause', name: 'Applause', emoji: '👏', url: 'https://raw.githubusercontent.com/yomink/Study-Flow-Assets/main/audio/alerts/applause.mp3' },
  { id: 'none', name: 'No Alert', emoji: '🔕', url: '' },
];

export const playAlertSound = (alertId: string, volume: number) => {
  const alert = ALERT_SOUNDS.find(a => a.id === alertId);
  if (!alert || !alert.url) return;
  try {
    const audio = new Audio(alert.url);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {}
};
