import Phaser from 'phaser';
import { AudioManager } from '../core/AudioManager';
import { bindKeyboard, GAME_HEIGHT, GAME_WIDTH, isKeyDown } from '../core/config';
import { CONTROLS_HINT } from '../core/Controls';

export class PauseOverlay extends Phaser.Scene {
  private keys!: ReturnType<typeof bindKeyboard>;
  private menuIndex = 0;
  private items: { label: string; action: () => void }[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private volumeText!: Phaser.GameObjects.Text;

  constructor() {
    super('PauseOverlay');
  }

  create(): void {
    this.keys = bindKeyboard(this);
    this.menuIndex = 0;

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
    this.add.text(GAME_WIDTH / 2, 48, 'PAUZA', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ff3344',
    }).setOrigin(0.5);

    this.volumeText = this.add.text(GAME_WIDTH / 2, 78, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#888888',
    }).setOrigin(0.5);
    this.updateVolume();

    this.items = [
      { label: 'Wznów', action: () => this.close() },
      { label: 'Menu główne', action: () => this.goTitle() },
    ];

    this.items.forEach((item, i) => {
      const t = this.add.text(GAME_WIDTH / 2, 110 + i * 30, item.label, {
        fontFamily: 'monospace', fontSize: '13px', color: '#cccccc',
      }).setOrigin(0.5);
      this.labels.push(t);
    });
    this.refreshMenu();

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 24, `W/S | Z | [ ] vol | M wycisz | ${CONTROLS_HINT}`, {
      fontFamily: 'monospace', fontSize: '8px', color: '#555555',
    }).setOrigin(0.5);
  }

  update(): void {
    if (isKeyDown(this.keys.W) || isKeyDown(this.keys.UP)) {
      this.menuIndex = (this.menuIndex - 1 + this.items.length) % this.items.length;
      this.refreshMenu();
    }
    if (isKeyDown(this.keys.S) || isKeyDown(this.keys.DOWN)) {
      this.menuIndex = (this.menuIndex + 1) % this.items.length;
      this.refreshMenu();
    }
    if (isKeyDown(this.keys.Z) || isKeyDown(this.keys.SPACE) || isKeyDown(this.keys.ENTER)) {
      this.items[this.menuIndex]?.action();
    }
    if (isKeyDown(this.keys.ESC) || isKeyDown(this.keys.X)) {
      this.close();
    }
    if (isKeyDown(this.keys.BRACKET_LEFT)) {
      AudioManager.adjustVolume(-0.05);
      this.updateVolume();
    }
    if (isKeyDown(this.keys.BRACKET_RIGHT)) {
      AudioManager.adjustVolume(0.05);
      this.updateVolume();
    }
    if (isKeyDown(this.keys.M)) {
      AudioManager.toggleMute();
      this.updateVolume();
    }
  }

  private refreshMenu(): void {
    this.labels.forEach((t, i) => {
      const sel = i === this.menuIndex;
      t.setText((sel ? '► ' : '  ') + this.items[i].label);
      t.setColor(sel ? '#ffd700' : '#cccccc');
    });
  }

  private updateVolume(): void {
    this.volumeText.setText(
      `Głośność: ${AudioManager.volumeBar(14)} ${AudioManager.volumePercent}%` +
      (AudioManager.isMuted() ? ' (M=włącz)' : ''),
    );
  }

  private goTitle(): void {
    this.scene.stop('BasementScene');
    this.scene.stop('CharacterHubScene');
    this.close();
    this.scene.start('TitleScene');
  }

  private close(): void {
    this.scene.stop('PauseOverlay');
    this.scene.resume('BasementScene');
    this.scene.resume('CharacterHubScene');
  }
}
