import { Howl } from 'howler';
import { AUDIO_ASSETS, SoundAsset, AudioLayer } from '../lib/audioRegistry';

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
  private masterVolume: number = 0.5;
  private onStateChange: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): AudioController {
    if (!AudioController.instance) {
      AudioController.instance = new AudioController();
    }
    return AudioController.instance;
  }

  public setNotifyCallback(callback: () => void) {
    this.onStateChange = callback;
  }

  private notify() {
    this.onStateChange?.();
  }

  /**
   * Preload high-priority assets.
   */
  public preload() {
    AUDIO_ASSETS.filter(a => a.preload).forEach(a => this.getOrCreateHowl(a.id));
  }

  /**
   * Toggle a track with professional cross-fading.
   */
  public toggle(id: string) {
    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) return;

    const currentStatus = this.states.get(id) || 'stopped';

    if (currentStatus === 'playing' || currentStatus === 'loading') {
      this.stop(id);
    } else {
      this.play(id);
    }
  }

  public play(id: string) {
    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) return;

    // Music layer exclusivity
    if (asset.layer === 'music') {
      AUDIO_ASSETS.filter(a => a.layer === 'music' && a.id !== id).forEach(a => this.stop(a.id));
    }

    const howl = this.getOrCreateHowl(id);
    
    this.states.set(id, howl.state() === 'loaded' ? 'playing' : 'loading');
    
    // Smooth fade in
    howl.play();
    howl.fade(0, asset.baseVolume * this.masterVolume, 1000);
    
    this.notify();
  }

  public stop(id: string) {
    const howl = this.pool.get(id);
    if (!howl) return;

    // Smooth fade out then pause
    const currentVol = howl.volume();
    howl.fade(currentVol, 0, 800);
    
    setTimeout(() => {
      if (this.states.get(id) === 'stopped') {
        howl.pause();
        howl.seek(0);
      }
    }, 850);

    this.states.set(id, 'stopped');
    this.notify();
  }

  public stopAll() {
    this.pool.forEach((_, id) => this.stop(id));
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
      if (this.states.get(id) === 'playing') {
        const asset = AUDIO_ASSETS.find(a => a.id === id);
        if (asset) howl.volume(asset.baseVolume * volume);
      }
    });
    this.notify();
  }

  private getOrCreateHowl(id: string): Howl {
    if (this.pool.has(id)) return this.pool.get(id)!;

    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) throw new Error(`Asset ${id} not found`);

    const howl = new Howl({
      src: [asset.url],
      loop: true,
      html5: asset.layer === 'music', // Stream long music, buffer small loops
      preload: true,
      volume: 0,
      onload: () => {
        if (this.states.get(id) === 'loading') {
          this.states.set(id, 'playing');
          howl.fade(0, asset.baseVolume * this.masterVolume, 1000);
        }
        this.notify();
      },
      onloaderror: () => {
        this.states.set(id, 'error');
        this.notify();
      },
      onplayerror: () => {
        this.states.set(id, 'error');
        howl.once('unlock', () => howl.play());
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
        volume: howl ? howl.volume() / this.masterVolume : asset.baseVolume
      };
    });
  }
}

export const audioController = AudioController.getInstance();
