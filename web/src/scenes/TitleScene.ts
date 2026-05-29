import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { dialogueManager } from '../core/DialogueManager';
import { bindKeyboard, GAME_HEIGHT, GAME_WIDTH, isKeyDown, type Keys } from '../core/config';
import { CONTROLS_HINT } from '../core/Controls';

export class TitleScene extends Phaser.Scene {
  private keys!: Keys;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.keys = bindKeyboard(this);

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a12);
    this.add.text(GAME_WIDTH / 2, 64, 'PAKER KUJOR', {
      fontFamily: 'monospace', fontSize: '32px', color: '#ffd700',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 100, 'Producent. Paker. CHDK.', {
      fontFamily: 'monospace', fontSize: '11px', color: '#888888',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 118, 'Bicepsy duże. Piwnica głośna.', {
      fontFamily: 'monospace', fontSize: '10px', color: '#666666',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 190, '►  GRAJ', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffd700',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 300, `Z / Space — start  |  ${CONTROLS_HINT}`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#555555',
    }).setOrigin(0.5);
  }

  update(): void {
    if (isKeyDown(this.keys.Z) || isKeyDown(this.keys.SPACE) || isKeyDown(this.keys.ENTER)) {
      GameState.resetNewGame();
      dialogueManager.reset();
      this.scene.start('BasementScene');
    }
  }
}
