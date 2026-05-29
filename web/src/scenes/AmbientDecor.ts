import Phaser from 'phaser';
import { DECOR_FRAME } from '../core/AssetKeys';

/** Large ambient sprites + neon flicker — więcej życia na planszy. */
export class AmbientDecor {
  private neonSprites: Phaser.GameObjects.Sprite[] = [];
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;

  spawn(scene: Phaser.Scene): void {
    const placements: { frame: number; x: number; y: number; scale?: number; depth?: number }[] = [
      { frame: DECOR_FRAME.speaker, x: 48, y: 310, scale: 1.2, depth: 3 },
      { frame: DECOR_FRAME.speaker, x: 592, y: 310, scale: 1.2, depth: 3 },
      { frame: DECOR_FRAME.neon, x: 80, y: 52, scale: 1, depth: 6 },
      { frame: DECOR_FRAME.rack, x: 480, y: 240, scale: 1, depth: 4 },
      { frame: DECOR_FRAME.cables, x: 360, y: 250, scale: 0.9, depth: 2 },
      { frame: DECOR_FRAME.light, x: 320, y: 36, scale: 0.8, depth: 5 },
      { frame: DECOR_FRAME.light, x: 400, y: 36, scale: 0.8, depth: 5 },
    ];

    for (const p of placements) {
      const spr = scene.add.sprite(p.x, p.y, 'decor', p.frame);
      spr.setDepth(p.depth ?? 3);
      if (p.scale) spr.setScale(p.scale);
      if (p.frame === DECOR_FRAME.neon) {
        this.neonSprites.push(spr);
        scene.tweens.add({
          targets: spr,
          alpha: { from: 0.7, to: 1 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        scene.tweens.add({
          targets: spr,
          tint: { from: 0xff44aa, to: 0xff88cc },
          duration: 1200,
          yoyo: true,
          repeat: -1,
        });
      }
      if (p.frame === DECOR_FRAME.light) {
        scene.tweens.add({
          targets: spr,
          alpha: { from: 0.5, to: 0.95 },
          duration: 2000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    // pył w powietrzu
    if (scene.textures.exists('pixel')) {
      this.particles = scene.add.particles(0, 0, 'pixel', {
        x: { min: 0, max: 640 },
        y: { min: 0, max: 360 },
        lifespan: 4000,
        speedY: { min: -8, max: -3 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.25, end: 0 },
        frequency: 300,
        tint: [0xff44aa, 0x888899, 0xffd700],
      });
      this.particles.setDepth(1);
    }
  }

  static createPixelTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('pixel')) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('pixel', 2, 2);
    g.destroy();
  }
}
