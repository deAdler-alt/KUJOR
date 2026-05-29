import Phaser from 'phaser';
import { AudioManager } from '../core/AudioManager';
import { bindKeyboard, GAME_HEIGHT, GAME_WIDTH, isKeyDown, type Keys } from '../core/config';
import { CONTROLS_HINT } from '../core/Controls';
import { ALL_ITEMS, getStoryBeat } from '../data/gameData';
import { GameState } from '../core/GameState';

export class CharacterHubScene extends Phaser.Scene {
  private keys!: Keys;
  private preview!: Phaser.GameObjects.Sprite;
  private storyText!: Phaser.GameObjects.Text;
  private volumeText!: Phaser.GameObjects.Text;
  private statBars: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('CharacterHubScene');
  }

  create(): void {
    GameState.currentRoom = 'hub';
    this.keys = bindKeyboard(this);
    AudioManager.playBgm('bgm_hub');

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0608);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 24, GAME_HEIGHT - 24, 0x000000, 0)
      .setStrokeStyle(2, 0xff2233);

    this.add.text(GAME_WIDTH / 2, 18, '◆ PAK KUJORA ◆', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ff3344',
    }).setOrigin(0.5);

    this.preview = this.add.sprite(140, 175, 'player', 0).setScale(3.5).setDepth(5);
    this.preview.anims.play('player_down_idle');

    this.add.text(140, 280, 'KUJOR', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffd700',
    }).setOrigin(0.5);
    this.add.text(140, 298, 'prod · paker · rap head', {
      fontFamily: 'monospace', fontSize: '8px', color: '#888888',
    }).setOrigin(0.5);

    this.renderStats();
    this.renderXpBar();

    this.storyText = this.add.text(300, 230, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#cccccc',
      wordWrap: { width: 310 }, lineSpacing: 4,
    });
    this.storyText.setText(getStoryBeat(
      GameState.maxWeightUnlocked,
      GameState.inventory,
      GameState.hasFlag('beat_140'),
    ));

    this.volumeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#666666',
    }).setOrigin(0.5);
    this.updateVolumeLabel();

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, `H/Esc piwnica | [ ] głośność | ${CONTROLS_HINT}`, {
      fontFamily: 'monospace', fontSize: '8px', color: '#555555',
    }).setOrigin(0.5);
  }

  private renderStats(): void {
    const s = GameState.stats;
    const stats = [
      { label: 'SIŁA', value: s.sila, max: 120, color: 0xff6644 },
      { label: 'WYTRZYMAŁOŚĆ', value: s.wytrzymalosc, max: 100, color: 0x44aa66 },
      { label: 'FLOW', value: s.flow, max: 100, color: 0xaa44ff },
      { label: 'REPUTACJA', value: s.reputacja, max: 150, color: 0x4488ff },
    ];
    stats.forEach((st, i) => {
      const y = 70 + i * 36;
      this.add.text(300, y - 10, st.label, {
        fontFamily: 'monospace', fontSize: '9px', color: '#aaaaaa',
      });
      this.add.rectangle(380, y, 200, 10, 0x222222).setOrigin(0, 0.5);
      const fill = this.add.rectangle(380, y, 200 * Math.min(st.value / st.max, 1), 10, st.color).setOrigin(0, 0.5);
      this.statBars.push(fill);
      this.add.text(590, y, String(st.value), {
        fontFamily: 'monospace', fontSize: '11px', color: '#ffffff',
      }).setOrigin(0, 0.5);
    });

    this.add.text(300, 210, `LV ${GameState.level}  |  Max ${GameState.maxWeightUnlocked} kg  |  ${GameState.inventory.length}/${ALL_ITEMS.length}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888',
    });
  }

  private renderXpBar(): void {
    const y = 48;
    this.add.text(300, y - 12, 'XP', { fontFamily: 'monospace', fontSize: '9px', color: '#ffd700' });
    this.add.rectangle(330, y, 260, 12, 0x222222).setOrigin(0, 0.5);
    const pct = GameState.getXpProgress();
    this.add.rectangle(330, y, 260 * pct, 12, 0xffd700).setOrigin(0, 0.5);
    this.add.text(600, y, `${GameState.xp}/${GameState.getXpToNext()}`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#cccccc',
    }).setOrigin(0, 0.5);
  }

  private updateVolumeLabel(): void {
    this.volumeText.setText(
      `Głośność: ${AudioManager.volumeBar(12)} ${AudioManager.volumePercent}%` +
      (AudioManager.isMuted() ? ' (wycisz)' : ''),
    );
  }

  update(): void {
    if (isKeyDown(this.keys.H) || isKeyDown(this.keys.ESC)) {
      GameState.currentRoom = 'basement';
      this.scene.start('BasementScene');
      return;
    }

    if (isKeyDown(this.keys.BRACKET_LEFT)) {
      AudioManager.adjustVolume(-0.05);
      this.updateVolumeLabel();
    }
    if (isKeyDown(this.keys.BRACKET_RIGHT)) {
      AudioManager.adjustVolume(0.05);
      this.updateVolumeLabel();
    }
    if (isKeyDown(this.keys.M)) {
      AudioManager.toggleMute();
      this.updateVolumeLabel();
    }
  }
}
