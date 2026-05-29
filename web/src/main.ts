import Phaser from 'phaser';
import { createGameConfig, GAME_HEIGHT, GAME_WIDTH } from './core/config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { BasementScene } from './scenes/BasementScene';
import { CharacterHubScene } from './scenes/CharacterHubScene';
import { PauseOverlay } from './scenes/PauseOverlay';
import { StairsScene } from './scenes/StairsScene';

const config = createGameConfig('game-container');
config.scene = [BootScene, TitleScene, BasementScene, StairsScene, CharacterHubScene, PauseOverlay];

// eslint-disable-next-line no-new
new Phaser.Game(config);

console.info(`Paker Kujor loaded — ${GAME_WIDTH}x${GAME_HEIGHT}`);
