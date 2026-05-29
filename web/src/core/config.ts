import Phaser from 'phaser';

const KEY_BINDINGS = {
  interact: 'Z',
  pause: 'ESC',
  hub: 'H',
} as const;

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#0a0a12',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [],
  };
}

export type Keys = {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  UP: Phaser.Input.Keyboard.Key;
  DOWN: Phaser.Input.Keyboard.Key;
  LEFT: Phaser.Input.Keyboard.Key;
  RIGHT: Phaser.Input.Keyboard.Key;
  Z: Phaser.Input.Keyboard.Key;
  SPACE: Phaser.Input.Keyboard.Key;
  ENTER: Phaser.Input.Keyboard.Key;
  ESC: Phaser.Input.Keyboard.Key;
  H: Phaser.Input.Keyboard.Key;
  M: Phaser.Input.Keyboard.Key;
  X: Phaser.Input.Keyboard.Key;
  BRACKET_LEFT: Phaser.Input.Keyboard.Key;
  BRACKET_RIGHT: Phaser.Input.Keyboard.Key;
};

export function bindKeyboard(scene: Phaser.Scene): Keys {
  if (!scene.input.keyboard) {
    throw new Error('Keyboard input unavailable');
  }
  const kb = scene.input.keyboard;
  return {
    W: kb.addKey('W'),
    A: kb.addKey('A'),
    S: kb.addKey('S'),
    D: kb.addKey('D'),
    UP: kb.addKey('UP'),
    DOWN: kb.addKey('DOWN'),
    LEFT: kb.addKey('LEFT'),
    RIGHT: kb.addKey('RIGHT'),
    Z: kb.addKey('Z'),
    SPACE: kb.addKey('SPACE'),
    ENTER: kb.addKey('ENTER'),
    ESC: kb.addKey('ESC'),
    H: kb.addKey('H'),
    M: kb.addKey('M'),
    X: kb.addKey('X'),
    BRACKET_LEFT: kb.addKey('OPEN_BRACKET'),
    BRACKET_RIGHT: kb.addKey('CLOSED_BRACKET'),
  };
}

export function isMashHeld(keys: Keys): boolean {
  return keys.Z.isDown || keys.SPACE.isDown || keys.ENTER.isDown;
}

export function isInteractDown(keys: Keys): boolean {
  return Phaser.Input.Keyboard.JustDown(keys.Z) ||
    Phaser.Input.Keyboard.JustDown(keys.SPACE) ||
    Phaser.Input.Keyboard.JustDown(keys.ENTER);
}

export function isKeyDown(key: Phaser.Input.Keyboard.Key): boolean {
  return Phaser.Input.Keyboard.JustDown(key);
}

export { KEY_BINDINGS };
