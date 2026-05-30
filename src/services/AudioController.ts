import { Howl } from 'howler';
import { AUDIO_ASSETS, SoundAsset } from '../lib/audioRegistry';

const MAX_ACTIVE_SOUNDS = 5;

export interface AudioState {
  id: string;
  isPlaying: boolean;
  isLoading: boolean;
  isError: boolean;
  volume: number;
}

class AudioController {
  private static instance: AudioController;
  private pool: Map<string, Howl> = new Map();
  private states: Map<string, 'loading' | 'playing' | 'stopped' | 'error'> = new Map();
  private activeIds: Set<string> = new Set();
  private masterVolume: number = 0.5;
  private onStateChange: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  public setNotifyCallback(callback: (() => void) | null) {
    this.onStateChange = callback;
  }

  private notify() {
    this.onStateChange?.();
  }

  public preload() {
    AUDIO_ASSETS.filter(a => a.preload).forEach(a => this.getOrCreateHowl(a.id));
  }

  public toggle(id: string) {
    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) return;

    if (this.activeIds.has(id)) {
      this.stop(id);
    } else {
      if (this.activeIds.size >= MAX_ACTIVE_SOUNDS) return;
      this.play(id);
    }
  }

  public play(id: string) {
    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) return;

    if (this.activeIds.size >= MAX_ACTIVE_SOUNDS) return;

    if (asset.layer === 'music') {
      AUDIO_ASSETS.filter(a => a.layer === 'music' && a.id !== id).forEach(a => this.stop(a.id));
    }

    const howl = this.getOrCreateHowl(id);
    if (!howl) return;

    if (howl.state() === 'unloaded') {
      howl.load();
    }

    this.states.set(id, howl.state() === 'loaded' ? 'playing' : 'loading');
    this.activeIds.add(id);

    howl.play();
    howl.fade(0, asset.baseVolume * this.masterVolume, 1000);
    this.notify();
  }

  public stop(id: string) {
    const howl = this.pool.get(id);
    if (!howl) {
      this.activeIds.delete(id);
      this.states.set(id, 'stopped');
      this.notify();
      return;
    }

    const currentVol = howl.volume();
    howl.fade(currentVol, 0, 600);

    this.states.set(id, 'stopped');
    this.activeIds.delete(id);

    const pauseTimer = setTimeout(() => {
      if (this.states.get(id) === 'stopped' && !this.activeIds.has(id)) {
        howl.pause();
        howl.seek(0);
      }
    }, 650);

    const origPlay = howl.play.bind(howl);
    const origStop = this.stop.bind(this);
    const origId = id;

    const guard = () => {
      clearTimeout(pauseTimer);
    };

    const cleanup = () => {
      howl.off('play', guard);
    };

    howl.once('play', () => {
      guard();
      cleanup();
    });

    this.notify();
  }

  public stopAll() {
    const ids = Array.from(this.activeIds);
    ids.forEach(id => this.stop(id));
  }

  public setVolume(id: string, volume: number) {
    const howl = this.pool.get(id);
    if (howl) {
      howl.volume(volume * this.masterVolume);
    }
    this.notify();
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = volume;
    this.pool.forEach((howl, id) => {
      if (this.activeIds.has(id)) {
        const asset = AUDIO_ASSETS.find(a => a.id === id);
        if (asset) howl.volume(asset.baseVolume * volume);
      }
    });
    this.notify();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setActiveIds(ids: string[]) {
    this.activeIds = new Set(ids.filter(id => AUDIO_ASSETS.some(a => a.id === id)));
  }

  public restoreVolume(id: string, vol: number) {
    const howl = this.pool.get(id);
    if (howl) {
      howl.volume(vol * this.masterVolume);
    }
  }

  public getActiveIds(): string[] {
    return Array.from(this.activeIds);
  }

  private getOrCreateHowl(id: string): Howl | null {
    if (this.pool.has(id)) return this.pool.get(id)!;

    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) return null;

    const srcs = [asset.url];
    if (asset.fallbackUrl) srcs.push(asset.fallbackUrl);

    const howl = new Howl({
      src: srcs,
      loop: true,
      html5: asset.layer === 'music' || srcs[0].startsWith('https://raw.githubusercontent'),
      preload: true,
      volume: 0,
      onload: () => {
        if (this.activeIds.has(id)) {
          this.states.set(id, 'playing');
          howl.fade(0, asset.baseVolume * this.masterVolume, 1000);
        }
        this.notify();
      },
      onloaderror: (_: number, err: unknown) => {
        console.warn(`[AudioController] Load error for ${asset.id}:`, err);
        this.states.set(id, 'error');
        this.activeIds.delete(id);
        this.notify();
      },
      onplayerror: () => {
        this.states.set(id, 'error');
        howl.once('unlock', () => {
          if (this.activeIds.has(id)) howl.play();
        });
        this.notify();
      }
    });

    this.pool.set(id, howl);
    return howl;
  }

  public getStates(): AudioState[] {
    return AUDIO_ASSETS.map(asset => {
      const howl = this.pool.get(asset.id);
      const status = this.states.get(asset.id) || 'stopped';
      return {
        id: asset.id,
        isPlaying: status === 'playing',
        isLoading: status === 'loading',
        isError: status === 'error',
        volume: howl ? howl.volume() / Math.max(this.masterVolume, 0.01) : asset.baseVolume
      };
    });
  }
}

export const audioController = AudioController.getInstance();
