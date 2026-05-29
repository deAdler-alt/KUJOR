export const WEIGHT_LEVELS = [20, 40, 60, 80, 100, 120, 140] as const;

export const ALL_ITEMS = [
  'proteina',
  'chalk',
  'gazeta',
  'poster_rap',
  'lustro',
  'radio',
  'drzwi',
  'beatpad',
  'przedtreningowka',
  'kreatyna',
  'shaker',
  'mikrofon',
] as const;

export type ItemId = (typeof ALL_ITEMS)[number];

export const XP_PER_WEIGHT: Record<number, number> = {
  20: 50,
  40: 80,
  60: 120,
  80: 180,
  100: 250,
  120: 350,
  140: 500,
};

export interface PlayerStats {
  sila: number;
  wytrzymalosc: number;
  flow: number;
  reputacja: number;
  totalReps: number;
  bossBeaten: boolean;
  level: number;
  xp: number;
}

export interface WeightConfig {
  weightKg: number;
  label: string;
  pressGain: number;
  decayPerSec: number;
  timeLimitSec: number;
  isBoss: boolean;
}

export const WEIGHT_CONFIGS: WeightConfig[] = [
  { weightKg: 20, label: '20 kg', pressGain: 14, decayPerSec: 6, timeLimitSec: 0, isBoss: false },
  { weightKg: 40, label: '40 kg', pressGain: 12, decayPerSec: 10, timeLimitSec: 0, isBoss: false },
  { weightKg: 60, label: '60 kg', pressGain: 10, decayPerSec: 14, timeLimitSec: 0, isBoss: false },
  { weightKg: 80, label: '80 kg', pressGain: 9, decayPerSec: 18, timeLimitSec: 55, isBoss: false },
  { weightKg: 100, label: '100 kg', pressGain: 8, decayPerSec: 22, timeLimitSec: 50, isBoss: false },
  { weightKg: 120, label: '120 kg', pressGain: 7, decayPerSec: 26, timeLimitSec: 45, isBoss: false },
  { weightKg: 140, label: '140 kg BOSS', pressGain: 9, decayPerSec: 24, timeLimitSec: 50, isBoss: true },
];

export function getWeightConfig(kg: number): WeightConfig | undefined {
  return WEIGHT_CONFIGS.find((w) => w.weightKg === kg);
}

export function xpToNextLevel(level: number): number {
  return level * 80 + 50;
}

export function calcStatsFromProgress(
  maxWeight: number,
  inventory: string[],
  level: number,
  completedCount: number,
): Omit<PlayerStats, 'xp' | 'level'> & { level: number } {
  const idx = WEIGHT_LEVELS.indexOf(maxWeight as (typeof WEIGHT_LEVELS)[number]);
  const tier = idx >= 0 ? idx : 0;
  const hasBeatpad = inventory.includes('beatpad');
  const hasChalk = inventory.includes('chalk');
  const hasPre = inventory.includes('przedtreningowka');
  return {
    level,
    sila: 12 + tier * 10 + level * 2 + (hasChalk ? 8 : 0) + (hasPre ? 6 : 0),
    wytrzymalosc: 10 + tier * 7 + level + (inventory.includes('kreatyna') ? 5 : 0),
    flow: 8 + tier * 6 + (hasBeatpad ? 15 : 0) + (inventory.includes('poster_rap') ? 5 : 0)
      + (inventory.includes('mikrofon') ? 8 : 0),
    reputacja: 5 + tier * 12 + inventory.length * 4 + completedCount * 5,
    totalReps: completedCount * 4,
    bossBeaten: maxWeight >= 140,
  };
}

export function getStoryBeat(maxWeight: number, inventory: string[], beat140: boolean): string {
  if (beat140 && inventory.length >= ALL_ITEMS.length) {
    return 'Kujor: beat na beatpadzie, 140 kg na klatę. Polski rap i pakerka w jednym basie. Koniec? Dopiero zaczynasz występy.';
  }
  if (beat140) {
    return '140 kg padło. Krzysiek płacze ze szczęścia. Twój mix na beatpadzie czeka na drop — teraz nagrywasz z pełną klatą.';
  }
  if (maxWeight >= 100) {
    return 'Kujor — producent, paker, fan polskiej sceny. Bicepsy rosną w rytm 808. Boss 140 kg to twój feat z własnym ciałem.';
  }
  if (maxWeight >= 60) {
    return 'W piwnicy leci polski rap. Ty robisz muzykę między seriami. Krzysiek mówi: „Ziomek, te bicepsy to już sample pack.”';
  }
  if (inventory.includes('beatpad')) {
    return 'Beatpad znaleziony. Kujor wraca do korzeni — najpierw loop, potem ławka. Tak buduje się legenda.';
  }
  return 'KUJOR. Tworzysz muzykę. Kochasz polski rap. Jesteś pakerem — bicepsy nie kłamią. Piwnica to twój studio i siłownia w jednym.';
}
