import Phaser from 'phaser';

const VOLUME_KEY = 'paker_kujor_volume';
const DEFAULT_VOLUME = 0.65;

type BgmTrack = 'bgm_basement' | 'bgm_hub' | 'bgm_minigame' | 'bgm_boss';

class AudioManagerClass {
  private game: Phaser.Game | null = null;
  private currentBgm: Phaser.Sound.BaseSound | null = null;
  private currentTrack: BgmTrack | null = null;
  private _volume = DEFAULT_VOLUME;
  private muted = false;

  init(game: Phaser.Game): void {
    this.game = game;
    const saved = localStorage.getItem(VOLUME_KEY);
    if (saved !== null) {
      const v = parseFloat(saved);
      if (!Number.isNaN(v)) this._volume = Phaser.Math.Clamp(v, 0, 1);
    }
  }

  get volume(): number {
    return this._volume;
  }

  get volumePercent(): number {
    return Math.round(this._volume * 100);
  }

  setVolume(v: number): void {
    this._volume = Phaser.Math.Clamp(v, 0, 1);
    localStorage.setItem(VOLUME_KEY, String(this._volume));
    if (this.currentBgm && 'setVolume' in this.currentBgm) {
      (this.currentBgm as Phaser.Sound.WebAudioSound).setVolume(this.muted ? 0 : this._volume);
    }
  }

  adjustVolume(delta: number): void {
    this.setVolume(this._volume + delta);
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.currentBgm && 'setVolume' in this.currentBgm) {
      (this.currentBgm as Phaser.Sound.WebAudioSound).setVolume(this.muted ? 0 : this._volume);
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  playBgm(track: BgmTrack): void {
    if (!this.game || this.currentTrack === track) return;
    this.stopBgm();
    this.currentTrack = track;
    try {
      this.currentBgm = this.game.sound.add(track, {
        loop: true,
        volume: this.muted ? 0 : this._volume,
      });
      this.currentBgm.play();
    } catch {
      /* audio optional */
    }
  }

  stopBgm(): void {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
    this.currentTrack = null;
  }

  playSfx(key: string): void {
    if (!this.game) return;
    try {
      this.game.sound.play(key, { volume: this.muted ? 0 : this._volume * 0.9 });
    } catch {
      /* optional */
    }
  }

  volumeBar(width = 10): string {
    const filled = Math.round(this._volume * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  }
}

export const AudioManager = new AudioManagerClass();

export const AUDIO_ASSETS = [
  'bgm_basement',
  'bgm_hub',
  'bgm_minigame',
  'bgm_boss',
  'press',
  'success',
  'fail',
  'levelup',
  'item_pickup',
] as const;
