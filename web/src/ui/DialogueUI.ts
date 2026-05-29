import Phaser from 'phaser';
import { dialogueManager } from '../core/DialogueManager';
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config';

export class DialogueUI {
  private container: Phaser.GameObjects.Container;
  private panel: Phaser.GameObjects.Rectangle;
  private speakerText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(1000).setVisible(false);
    this.panel = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 56, GAME_WIDTH - 32, 80, 0xffffff, 0.95)
      .setStrokeStyle(2, 0x111111);
    this.speakerText = scene.add.text(24, GAME_HEIGHT - 88, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#d4a017',
    });
    this.bodyText = scene.add.text(100, GAME_HEIGHT - 88, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#111111',
      wordWrap: { width: GAME_WIDTH - 120 },
    });
    this.hintText = scene.add.text(GAME_WIDTH - 40, GAME_HEIGHT - 28, '▼ Z', {
      fontFamily: 'monospace', fontSize: '12px', color: '#333333',
    }).setVisible(false);
    this.container.add([this.panel, this.speakerText, this.bodyText, this.hintText]);
  }

  update(): void {
    const st = dialogueManager.state;
    if (!st.active) {
      this.container.setVisible(false);
      return;
    }
    this.container.setVisible(true);
    this.speakerText.setText(st.speaker);
    this.bodyText.setText(dialogueManager.getDisplayText());
    this.hintText.setVisible(st.waitingAdvance);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}

export class HudBar {
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#cccccc',
    }).setDepth(900);
  }

  setText(t: string): void {
    this.text.setText(t);
  }

  destroy(): void {
    this.text.destroy();
  }
}
