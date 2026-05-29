import Phaser from 'phaser';
import type { Keys } from './config';

const SPEED = 90;

export class PlayerController {
  sprite: Phaser.Physics.Arcade.Sprite;
  private lastDir: 'down' | 'left' | 'right' | 'up' = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player', 0);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 10);
    body.setOffset(9, 20);
    this.sprite.anims.play('player_down_idle');
  }

  update(keys: Keys, locked: boolean): void {
    if (locked) {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.play(`player_${this.lastDir}_idle`, true);
      return;
    }

    let vx = 0;
    let vy = 0;
    if (keys.A.isDown || keys.LEFT.isDown) vx = -1;
    if (keys.D.isDown || keys.RIGHT.isDown) vx = 1;
    if (keys.W.isDown || keys.UP.isDown) vy = -1;
    if (keys.S.isDown || keys.DOWN.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.sprite.setVelocity(vx * SPEED, vy * SPEED);

    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vy) >= Math.abs(vx)) {
        this.lastDir = vy < 0 ? 'up' : 'down';
      } else {
        this.lastDir = vx < 0 ? 'left' : 'right';
      }
      this.sprite.anims.play(`player_${this.lastDir}`, true);
    } else {
      this.sprite.anims.play(`player_${this.lastDir}_idle`, true);
    }
  }
}

export function registerPlayerAnimations(scene: Phaser.Scene): void {
  const dirs = ['down', 'left', 'right', 'up'] as const;
  dirs.forEach((dir, row) => {
    const start = row * 4;
    if (!scene.anims.exists(`player_${dir}`)) {
      scene.anims.create({
        key: `player_${dir}`,
        frames: scene.anims.generateFrameNumbers('player', { start, end: start + 3 }),
        frameRate: 8,
        repeat: -1,
      });
      scene.anims.create({
        key: `player_${dir}_idle`,
        frames: [{ key: 'player', frame: start }],
      });
    }
  });

  if (!scene.anims.exists('trener_idle')) {
    scene.anims.create({
      key: 'trener_idle',
      frames: scene.anims.generateFrameNumbers('trener', { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });
  }

  if (!scene.anims.exists('bench_idle')) {
    scene.anims.create({
      key: 'bench_idle',
      frames: [{ key: 'bench', frame: 0 }],
    });
    scene.anims.create({
      key: 'bench_press',
      frames: scene.anims.generateFrameNumbers('bench', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });
  }
}
