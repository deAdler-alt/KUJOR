/**
 * Układ klawiatury TKL — bez klawiszy F1–F12.
 */
export const CONTROLS = {
  move: ['W', 'A', 'S', 'D', 'Strzałki'],
  interact: ['Z', 'Space', 'Enter'],
  pause: ['Esc'],
  hub: ['H'],
  volumeDown: ['['],
  volumeUp: [']'],
  mute: ['M'],
  menuUpDown: ['W', 'S'],
  cancel: ['Esc', 'X'],
} as const;

export const CONTROLS_HINT = 'WASD | Z | H hub | [ ] vol | Esc';

export const FORBIDDEN_KEYS = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
] as const;
