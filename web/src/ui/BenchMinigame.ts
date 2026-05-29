import Phaser from 'phaser';
import { AudioManager } from '../core/AudioManager';
import { getWeightConfig } from '../data/gameData';
import { GameState } from '../core/GameState';
import { dialogueManager } from '../core/DialogueManager';
import { GAME_HEIGHT, GAME_WIDTH } from '../core/config';

export interface BenchMinigameCallbacks {
  onComplete: (success: boolean) => void;
}

const BOSS_PHASE2_DECAY_MULT = 1.12;
const BOSS_PHASE2_DURATION = 8;
const MASH_INTERVAL_SEC = 0.065;
const BAR_X = GAME_WIDTH / 2 - 140;
const BAR_Y = 118;
const BAR_W = 280;
const BAR_H = 24;

export class BenchMinigame {
  private scene: Phaser.Scene;
  private backdrop: Phaser.GameObjects.Rectangle;
  private weightLabel: Phaser.GameObjects.Text;
  private barBg: Phaser.GameObjects.Rectangle;
  private barFill: Phaser.GameObjects.Rectangle;
  private repLabel: Phaser.GameObjects.Text;
  private timerLabel: Phaser.GameObjects.Text;
  private hintLabel: Phaser.GameObjects.Text;
  private pctLabel: Phaser.GameObjects.Text;
  private callbacks: BenchMinigameCallbacks;

  private active = false;
  private progress = 0;
  private timeLeft = 0;
  private wasAboveZero = false;
  private bossPhase2 = false;
  private bossPhase2Timer = 0;
  private bossPause = false;
  private bossPauseDone = false;
  private weightKg = 20;
  private mashCooldown = 0;

  constructor(scene: Phaser.Scene, callbacks: BenchMinigameCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;

    this.backdrop = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050510, 0.92)
      .setDepth(948).setVisible(false);
    this.weightLabel = scene.add.text(GAME_WIDTH / 2, 72, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(952).setVisible(false);

    this.barBg = scene.add.rectangle(BAR_X + BAR_W / 2, BAR_Y + BAR_H / 2, BAR_W, BAR_H, 0x333344)
      .setDepth(952).setVisible(false);
    this.barBg.setStrokeStyle(2, 0xffffff);

    this.barFill = scene.add.rectangle(BAR_X, BAR_Y + BAR_H / 2, 0, BAR_H, 0xffd700)
      .setOrigin(0, 0.5).setDepth(953).setVisible(false);

    this.pctLabel = scene.add.text(GAME_WIDTH / 2, BAR_Y + BAR_H / 2, '0%', {
      fontFamily: 'monospace', fontSize: '11px', color: '#111111',
    }).setOrigin(0.5).setDepth(954).setVisible(false);

    this.repLabel = scene.add.text(GAME_WIDTH / 2, 158, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(952).setVisible(false);

    this.timerLabel = scene.add.text(GAME_WIDTH / 2, 183, '', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(952).setVisible(false);

    this.hintLabel = scene.add.text(GAME_WIDTH / 2, 210, 'Trzymaj Z / Space!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(952).setVisible(false);
  }

  start(weightKg: number): boolean {
    const cfg = getWeightConfig(weightKg);
    if (!cfg) {
      GameState.setPlayerLocked(false);
      return false;
    }
    dialogueManager.reset();
    this.weightKg = weightKg;
    this.progress = 0;
    this.timeLeft = cfg.timeLimitSec;
    this.wasAboveZero = false;
    this.bossPhase2 = false;
    this.bossPhase2Timer = 0;
    this.bossPause = false;
    this.bossPauseDone = false;
    this.mashCooldown = 0;
    this.active = true;
    this.setVisible(true);
    GameState.setPlayerLocked(true);
    AudioManager.playBgm(cfg.isBoss ? 'bgm_boss' : 'bgm_minigame');
    this.refreshBar(cfg.label);
    return true;
  }

  isActive(): boolean {
    return this.active || this.bossPause;
  }

  isBossPause(): boolean {
    return this.bossPause;
  }

  cancel(): void {
    if (!this.isActive()) return;
    this.active = false;
    this.bossPause = false;
    this.setVisible(false);
    AudioManager.playBgm('bgm_basement');
    GameState.setPlayerLocked(false);
    dialogueManager.reset();
    this.callbacks.onComplete(false);
  }

  update(deltaSec: number, mashHeld: boolean): void {
    if (!this.active || this.bossPause) return;
    const cfg = getWeightConfig(this.weightKg);
    if (!cfg) {
      this.cancel();
      return;
    }

    this.mashCooldown -= deltaSec;
    let mashPressed = false;
    if (mashHeld && this.mashCooldown <= 0) {
      mashPressed = true;
      this.mashCooldown = MASH_INTERVAL_SEC;
    }

    let decay = cfg.decayPerSec;
    if (this.bossPhase2) {
      decay *= BOSS_PHASE2_DECAY_MULT;
      this.bossPhase2Timer -= deltaSec;
      if (this.bossPhase2Timer <= 0) this.bossPhase2 = false;
    }

    if (mashPressed) {
      this.progress += cfg.pressGain * GameState.getPressGainMultiplier();
      AudioManager.playSfx('press');
    }
    this.progress -= decay * deltaSec;
    this.progress = Phaser.Math.Clamp(this.progress, 0, 100);
    if (this.progress > 0.5) this.wasAboveZero = true;

    if (cfg.timeLimitSec > 0) {
      this.timeLeft -= deltaSec;
      if (this.timeLeft <= 0) {
        this.fail('Czas minął! Sztanga cię przygniotła.');
        return;
      }
    }

    if (cfg.isBoss && !this.bossPauseDone && this.progress >= 50) {
      this.triggerBossPause();
      return;
    }

    if (this.progress >= 100) {
      this.success();
      return;
    }

    if (this.wasAboveZero && this.progress <= 0) {
      this.fail('Sztanga spadła. Spamuj mocniej!');
      return;
    }

    this.refreshBar(cfg.label);
  }

  private triggerBossPause(): void {
    this.bossPause = true;
    this.bossPauseDone = true;
    const resume = () => {
      this.bossPause = false;
      this.bossPhase2 = true;
      this.bossPhase2Timer = BOSS_PHASE2_DURATION;
    };
    dialogueManager.start('140 kg', [
      'Bicepsy płaczą. Bas już nie.',
      'FINALNA SERIA — daj ten drop!',
    ], resume);
    this.scene.time.delayedCall(8000, () => {
      if (this.bossPause) resume();
    });
  }

  private success(): void {
    this.active = false;
    this.bossPause = false;
    this.setVisible(false);
    AudioManager.playSfx('success');
    AudioManager.playBgm('bgm_basement');
    GameState.unlockNextWeight(this.weightKg);
    const xp = GameState.lastLevelUp ? ' LEVEL UP!' : '';
    const lines = this.weightKg === 140
      ? ['140 KG! PAK KUJORA!', 'Krzysiek: „Teraz nagrywamy hymn piwnicy.”' + xp]
      : [`${this.weightKg} kg — wchodzi w historię.${xp}`, 'Kolejna waga odblokowana.'];
    dialogueManager.start('Krzysiek', lines, () => {
      GameState.setPlayerLocked(false);
      this.callbacks.onComplete(true);
    });
  }

  private fail(reason: string): void {
    this.active = false;
    this.bossPause = false;
    this.setVisible(false);
    AudioManager.playSfx('fail');
    AudioManager.playBgm('bgm_basement');
    dialogueManager.start('Krzysiek', [reason, 'Jeszcze raz, ziom. Oddychaj i wal w klawisz.'], () => {
      GameState.setPlayerLocked(false);
      this.callbacks.onComplete(false);
    });
  }

  private refreshBar(label: string): void {
    this.weightLabel.setText(label);
    const reps = Math.min(Math.floor(this.progress / 25), 4);
    this.repLabel.setText(`Seria: ${reps} / 4`);
    const cfg = getWeightConfig(this.weightKg)!;
    this.timerLabel.setVisible(cfg.timeLimitSec > 0);
    if (cfg.timeLimitSec > 0) {
      this.timerLabel.setText(`Czas: ${Math.max(0, Math.ceil(this.timeLeft))} s`);
    }
    this.hintLabel.setText(this.bossPhase2 ? 'BOSS FAZA 2! TRZYMAJ Z!' : 'Trzymaj Z / Space!  Esc = wyjście');

    const fillW = BAR_W * (this.progress / 100);
    this.barFill.width = Math.max(0, fillW);
    this.barFill.x = BAR_X;
    this.pctLabel.setText(`${Math.floor(this.progress)}%`);
  }

  private setVisible(v: boolean): void {
    this.backdrop.setVisible(v);
    this.weightLabel.setVisible(v);
    this.barBg.setVisible(v);
    this.barFill.setVisible(v);
    this.pctLabel.setVisible(v);
    this.repLabel.setVisible(v);
    this.timerLabel.setVisible(v);
    this.hintLabel.setVisible(v);
  }

  destroy(): void {
    this.backdrop.destroy();
    this.weightLabel.destroy();
    this.barBg.destroy();
    this.barFill.destroy();
    this.pctLabel.destroy();
    this.repLabel.destroy();
    this.timerLabel.destroy();
    this.hintLabel.destroy();
  }
}
