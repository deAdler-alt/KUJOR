import Phaser from 'phaser';
import { isKeyDown, type Keys } from '../core/config';

export interface KeyboardMenuItem {
  label: string;
  id: string;
}

export class KeyboardMenu {
  items: KeyboardMenuItem[] = [];
  selectedIndex = 0;
  visible = false;
  private texts: Phaser.GameObjects.Text[] = [];
  private highlights: Phaser.GameObjects.Rectangle[] = [];
  private container: Phaser.GameObjects.Container;
  private titleText: Phaser.GameObjects.Text;
  private onSelect: (item: KeyboardMenuItem, index: number) => void;
  private onCancel?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    title: string,
    onSelect: (item: KeyboardMenuItem, index: number) => void,
    onCancel?: () => void,
  ) {
    this.onSelect = onSelect;
    this.onCancel = onCancel;
    this.container = scene.add.container(0, 0).setDepth(930).setVisible(false);
    const dim = scene.add.rectangle(x, y, 280, 220, 0x000000, 0.65);
    const panel = scene.add.rectangle(x, y, 260, 200, 0x1a1020).setStrokeStyle(2, 0xff3344);
    this.titleText = scene.add.text(x, y - 80, title, {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff6644',
    }).setOrigin(0.5);
    this.container.add([dim, panel, this.titleText]);
  }

  open(items: KeyboardMenuItem[], title?: string): void {
    this.items = items;
    this.selectedIndex = 0;
    this.visible = true;
    this.container.setVisible(true);
    if (title) this.titleText.setText(title);
    this.rebuild();
  }

  close(): void {
    this.visible = false;
    this.container.setVisible(false);
    this.clearRows();
  }

  update(keys: Keys): boolean {
    if (!this.visible || this.items.length === 0) return false;

    if (isKeyDown(keys.W) || isKeyDown(keys.UP)) {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
      this.rebuild();
      return true;
    }
    if (isKeyDown(keys.S) || isKeyDown(keys.DOWN)) {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      this.rebuild();
      return true;
    }
    if (isKeyDown(keys.Z) || isKeyDown(keys.SPACE) || isKeyDown(keys.ENTER)) {
      const item = this.items[this.selectedIndex];
      if (item) this.onSelect(item, this.selectedIndex);
      return true;
    }
    if (isKeyDown(keys.ESC) || isKeyDown(keys.X)) {
      this.close();
      this.onCancel?.();
      return true;
    }
    return false;
  }

  private rebuild(): void {
    this.clearRows();
    const baseY = this.titleText.y + 10;
    this.items.forEach((item, i) => {
      const y = baseY + i * 26;
      const x = this.titleText.x;
      const selected = i === this.selectedIndex;
      const hi = this.container.scene.add.rectangle(x, y, 220, 22, selected ? 0x442233 : 0x000000, selected ? 0.9 : 0);
      const prefix = selected ? '► ' : '  ';
      const txt = this.container.scene.add.text(x - 100, y, prefix + item.label, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: selected ? '#ffd700' : '#cccccc',
      }).setOrigin(0, 0.5);
      this.highlights.push(hi);
      this.texts.push(txt);
      this.container.add([hi, txt]);
    });
    const hint = this.container.scene.add.text(this.titleText.x, baseY + this.items.length * 26 + 8,
      'W/S wybór | Z potwierdź | Esc anuluj', {
        fontFamily: 'monospace', fontSize: '9px', color: '#666666',
      }).setOrigin(0.5);
    this.texts.push(hint);
    this.container.add(hint);
  }

  private clearRows(): void {
    this.highlights.forEach((h) => h.destroy());
    this.texts.forEach((t) => t.destroy());
    this.highlights = [];
    this.texts = [];
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
