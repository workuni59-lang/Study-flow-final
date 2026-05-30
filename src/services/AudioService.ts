import { Howl } from 'howler';
import { AUDIO_ASSETS, SoundAsset } from '../lib/audioAssets';

export type AudioLayer = 'ambience' | 'music';

class AudioService {
  private static instance: AudioService;
  private instances: Map<string, Howl> = new Map();
  private activeTracks: Map<string, { layer: AudioLayer; baseVolume: number }> = new Map();
  private masterVolume: number = 0.5;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Preload high-priority assets into memory.
   */
  public preloadEssentials(): void {
    const highPriority = ['rain', 'birds', 'lofi'];
    highPriority.forEach(id => this.getOrCreateHowl(id));
  }

  /**
   * Toggle a track on/off.
   */
  public toggleTrack(id: string, layer: AudioLayer = 'ambience'): void {
    if (this.activeTracks.has(id)) {
      this.stopTrack(id);
    } else {
      this.playTrack(id, layer);
    }
  }

  /**
   * Play a track on a specific layer.
   * If layer is 'music', it stops existing music tracks first.
   */
  public playTrack(id: string, layer: AudioLayer = 'ambience'): void {
    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) {
      console.warn(`[AudioService] Asset not found: ${id}`);
      return;
    }

    // Music layer is exclusive - only one track at a time
    if (layer === 'music') {
      this.stopLayer('music');
    }

    const howl = this.getOrCreateHowl(id);
    
    if (!howl.playing()) {
      howl.play();
    }

    this.activeTracks.set(id, { layer, baseVolume: asset.baseVolume });
    this.updateInstanceVolume(id);
  }

  /**
   * Stop a specific track.
   */
  public stopTrack(id: string): void {
    const howl = this.instances.get(id);
    if (howl) {
      howl.stop();
    }
    this.activeTracks.delete(id);
  }

  /**
   * Stop all tracks in a specific layer.
   */
  public stopLayer(layer: AudioLayer): void {
    for (const [id, info] of this.activeTracks.entries()) {
      if (info.layer === layer) {
        this.stopTrack(id);
      }
    }
  }

  /**
   * Stop everything.
   */
  public stopAll(): void {
    this.instances.forEach(howl => howl.stop());
    this.activeTracks.clear();
  }

  /**
   * Update the volume for a specific track.
   */
  public setTrackVolume(id: string, volume: number): void {
    const info = this.activeTracks.get(id);
    if (info) {
      this.activeTracks.set(id, { ...info, baseVolume: volume });
      this.updateInstanceVolume(id);
    }
  }

  /**
   * Global master volume update.
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = volume;
    for (const id of this.activeTracks.keys()) {
      this.updateInstanceVolume(id);
    }
  }

  /**
   * Internal helper to sync Howl volume with layer/master settings.
   */
  private updateInstanceVolume(id: string): void {
    const howl = this.instances.get(id);
    const info = this.activeTracks.get(id);
    if (howl && info) {
      howl.volume(info.baseVolume * this.masterVolume);
    }
  }

  /**
   * Lazy-load or return existing Howl instance.
   */
  private getOrCreateHowl(id: string): Howl {
    if (this.instances.has(id)) {
      return this.instances.get(id)!;
    }

    const asset = AUDIO_ASSETS.find(a => a.id === id);
    if (!asset) throw new Error(`Asset ${id} not found`);

    const howl = new Howl({
      src: [asset.url],
      loop: true,
      html5: asset.strategy === 'html5',
      preload: true,
      volume: 0, // Start silent, playTrack will set volume
      onloaderror: (id, error) => {
        console.error(`[AudioService] Failed to load ${asset.id}:`, error);
      }
    });

    this.instances.set(id, howl);
    return howl;
  }

  /**
   * Returns metadata about active tracks for UI binding.
   */
  public getActiveTrackIds(): string[] {
    return Array.from(this.activeTracks.keys());
  }

  public getTrackInfo(id: string) {
    return this.activeTracks.get(id);
  }
}

export const audioService = AudioService.getInstance();
