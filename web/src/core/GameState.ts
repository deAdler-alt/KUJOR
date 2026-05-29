import {
  ALL_ITEMS,
  calcStatsFromProgress,
  type PlayerStats,
  WEIGHT_LEVELS,
  XP_PER_WEIGHT,
  xpToNextLevel,
} from '../data/gameData';
import { AudioManager } from './AudioManager';

class GameStateManager {
  playerLocked = false;
  maxWeightUnlocked = 20;
  inventory: string[] = [];
  flags: Record<string, boolean> = {};
  playerPosition = { x: 320, y: 300 };
  currentRoom: 'basement' | 'hub' = 'basement';
  level = 1;
  xp = 0;
  completedWeights: number[] = [];
  stats: PlayerStats = this.buildStats();
  lastLevelUp = false;

  private buildStats(): PlayerStats {
    const base = calcStatsFromProgress(
      this.maxWeightUnlocked,
      this.inventory,
      this.level,
      this.completedWeights.length,
    );
    return { ...base, xp: this.xp };
  }

  resetNewGame(): void {
    this.playerLocked = false;
    this.maxWeightUnlocked = 20;
    this.inventory = [];
    this.flags = {};
    this.playerPosition = { x: 320, y: 300 };
    this.currentRoom = 'basement';
    this.level = 1;
    this.xp = 0;
    this.completedWeights = [];
    this.lastLevelUp = false;
    this.stats = this.buildStats();
  }

  setPlayerLocked(locked: boolean): void {
    this.playerLocked = locked;
  }

  hasFlag(flag: string): boolean {
    return this.flags[flag] === true;
  }

  setFlag(flag: string, value = true): void {
    this.flags[flag] = value;
  }

  addItem(itemId: string): void {
    const id = this.migrateItemId(itemId);
    if (this.inventory.includes(id)) return;
    this.inventory.push(id);
    this.recalcStats();
  }

  hasItem(itemId: string): boolean {
    const id = this.migrateItemId(itemId);
    return this.inventory.includes(id);
  }

  private migrateItemId(id: string): string {
    if (id === 'poster_golden') return 'poster_rap';
    return id;
  }

  allItemsCollected(): boolean {
    return ALL_ITEMS.every((id) => this.inventory.includes(id));
  }

  getPressGainMultiplier(): number {
    let m = 1;
    if (this.hasItem('chalk')) m += 0.1;
    if (this.hasItem('beatpad')) m += 0.05;
    if (this.hasItem('przedtreningowka')) m += 0.08;
    return m;
  }

  getUnlockedWeights(): number[] {
    return WEIGHT_LEVELS.filter((w) => w <= this.maxWeightUnlocked);
  }

  getXpToNext(): number {
    return xpToNextLevel(this.level);
  }

  getXpProgress(): number {
    return this.xp / this.getXpToNext();
  }

  grantXp(amount: number): boolean {
    this.lastLevelUp = false;
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.getXpToNext()) {
      this.xp -= this.getXpToNext();
      this.level += 1;
      this.lastLevelUp = true;
      leveled = true;
      AudioManager.playSfx('levelup');
    }
    this.recalcStats();
    return leveled;
  }

  unlockNextWeight(completedKg: number): void {
    const idx = WEIGHT_LEVELS.indexOf(completedKg as (typeof WEIGHT_LEVELS)[number]);
    if (idx === -1) return;

    if (!this.completedWeights.includes(completedKg)) {
      this.completedWeights.push(completedKg);
      const xpGain = XP_PER_WEIGHT[completedKg] ?? 50;
      this.grantXp(xpGain);
    }

    if (idx + 1 < WEIGHT_LEVELS.length) {
      const next = WEIGHT_LEVELS[idx + 1];
      if (next > this.maxWeightUnlocked) {
        this.maxWeightUnlocked = next;
      }
    }
    if (completedKg === 140) {
      this.setFlag('beat_140', true);
    }
    this.recalcStats();
  }

  recalcStats(): void {
    this.stats = this.buildStats();
  }
}

export const GameState = new GameStateManager();
