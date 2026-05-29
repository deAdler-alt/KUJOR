import { GameState } from './GameState';
import { DIALOGUES, type DialogueBank, type DialogueEntry } from '../data/dialogues';

export type DialogueCallback = () => void;

export interface DialogueState {
  active: boolean;
  speaker: string;
  lines: string[];
  lineIndex: number;
  charIndex: number;
  waitingAdvance: boolean;
  fullLine: string;
}

export class DialogueManager {
  state: DialogueState = {
    active: false,
    speaker: '',
    lines: [],
    lineIndex: 0,
    charIndex: 0,
    waitingAdvance: false,
    fullLine: '',
  };

  private typewriterTimer = 0;
  private onFinish: DialogueCallback | null = null;
  private readonly CHARS_PER_SEC = 40;

  start(speaker: string, lines: string[], onFinish?: DialogueCallback): void {
    if (this.state.active) {
      this.onFinish = null;
      this.state.active = false;
    }
    this.state = {
      active: true,
      speaker,
      lines,
      lineIndex: 0,
      charIndex: 0,
      waitingAdvance: false,
      fullLine: lines[0] ?? '',
    };
    this.typewriterTimer = 0;
    this.onFinish = onFinish ?? null;
  }

  startFromBank(bank: DialogueBank, id: string, onFinish?: DialogueCallback): void {
    const entry: DialogueEntry | null = bank[id] ?? null;
    if (!entry) {
      onFinish?.();
      return;
    }
    this.start(entry.speaker, entry.lines, onFinish);
  }

  startTrener(id: string, onFinish?: DialogueCallback): void {
    this.startFromBank(DIALOGUES.trener, id, onFinish);
  }

  startItem(id: string, onFinish?: DialogueCallback): void {
    const migrated = id === 'poster_golden' ? 'poster_rap' : id;
    this.startFromBank(DIALOGUES.items, migrated, onFinish);
  }

  update(deltaSec: number): void {
    if (!this.state.active || this.state.waitingAdvance) return;
    this.typewriterTimer += deltaSec;
    const chars = Math.floor(this.typewriterTimer * this.CHARS_PER_SEC);
    const line = this.state.lines[this.state.lineIndex] ?? '';
    this.state.charIndex = Math.min(chars, line.length);
    this.state.fullLine = line;
    if (this.state.charIndex >= line.length) {
      this.state.waitingAdvance = true;
    }
  }

  getDisplayText(): string {
    const line = this.state.lines[this.state.lineIndex] ?? '';
    return line.substring(0, this.state.charIndex);
  }

  advance(): void {
    if (!this.state.active) return;
    if (!this.state.waitingAdvance) {
      const line = this.state.lines[this.state.lineIndex] ?? '';
      this.state.charIndex = line.length;
      this.state.waitingAdvance = true;
      return;
    }
    this.state.lineIndex += 1;
    if (this.state.lineIndex >= this.state.lines.length) {
      this.end();
      return;
    }
    this.state.fullLine = this.state.lines[this.state.lineIndex] ?? '';
    this.state.charIndex = 0;
    this.typewriterTimer = 0;
    this.state.waitingAdvance = false;
  }

  end(): void {
    this.state.active = false;
    const cb = this.onFinish;
    this.onFinish = null;
    cb?.();
  }

  pickTrenerDialogue(): string {
    if (GameState.hasFlag('beat_140')) {
      return GameState.allItemsCollected() ? 'krzysiek_true_ending' : 'krzysiek_boss_win';
    }
    if (!GameState.hasFlag('stairs_cleared')) {
      if (!GameState.hasFlag('quest_stairs') && GameState.hasFlag('met_trainer')) {
        return 'krzysiek_quest_start';
      }
      if (GameState.hasFlag('quest_stairs') && GameState.canEnterStairs()) {
        return 'krzysiek_quest_done';
      }
      if (GameState.hasFlag('quest_stairs')) {
        return 'krzysiek_quest_progress';
      }
    }
    if (!GameState.hasFlag('met_trainer')) return 'krzysiek_intro';
    const w = GameState.maxWeightUnlocked;
    if (w >= 120) return 'krzysiek_before_boss';
    if (w >= 100) return 'krzysiek_after_100';
    if (w >= 80) return 'krzysiek_after_80';
    if (w >= 60) return 'krzysiek_after_60';
    if (w >= 40) return 'krzysiek_after_40';
    return 'krzysiek_reminder';
  }
}

export const dialogueManager = new DialogueManager();
