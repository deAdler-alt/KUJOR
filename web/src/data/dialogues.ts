import trener from './dialogues/trener.json';
import items from './dialogues/items.json';

export interface DialogueEntry {
  speaker: string;
  lines: string[];
}

export type DialogueBank = Record<string, DialogueEntry>;

export const DIALOGUES = {
  trener: trener as DialogueBank,
  items: items as DialogueBank,
};

export function getDialogue(bank: DialogueBank, id: string): DialogueEntry | null {
  return bank[id] ?? null;
}
