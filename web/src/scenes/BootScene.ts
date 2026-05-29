import Phaser from 'phaser';
import { ASSETS } from '../core/AssetKeys';
import { AudioManager, AUDIO_ASSETS } from '../core/AudioManager';
import { registerPlayerAnimations } from '../core/PlayerController';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.tilemapTiledJSON('basement', ASSETS.maps.basement);
    this.load.tilemapTiledJSON('stairs', ASSETS.maps.stairs);
    this.load.image('piwnica_tileset', ASSETS.tilesets.piwnica);
    this.load.spritesheet('player', ASSETS.sprites.player, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('trener', ASSETS.sprites.trener, { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bench', ASSETS.sprites.bench, { frameWidth: 48, frameHeight: 32 });
    this.load.spritesheet('props', ASSETS.sprites.props, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('decor', ASSETS.sprites.decor, { frameWidth: 32, frameHeight: 32 });

    for (const key of AUDIO_ASSETS) {
      this.load.audio(key, `assets/audio/${key}.wav`);
    }

    const bar = this.add.rectangle(320, 180, 200, 8, 0xffd700);
    const txt = this.add.text(320, 200, 'Ładowanie Paker Kujor...', {
      fontFamily: 'monospace', fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);
    this.load.on('progress', (v: number) => bar.setScale(v, 1));
    this.load.once('complete', () => { bar.destroy(); txt.destroy(); });
  }

  create(): void {
    AudioManager.init(this.game);
    registerPlayerAnimations(this);
    this.scene.start('TitleScene');
  }
}
