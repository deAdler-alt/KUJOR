import Phaser from 'phaser';
import { PROPS_FRAME } from '../core/AssetKeys';
import { AudioManager } from '../core/AudioManager';
import { bindKeyboard, GAME_HEIGHT, GAME_WIDTH, isInteractDown, isKeyDown, isMashHeld, type Keys } from '../core/config';
import { CONTROLS_HINT } from '../core/Controls';
import { GameState } from '../core/GameState';
import { dialogueManager } from '../core/DialogueManager';
import { getSpawnPoint, loadTiledMap, type MapObjectDef } from '../core/MapHelper';
import { PlayerController } from '../core/PlayerController';
import { BenchMinigame } from '../ui/BenchMinigame';
import { DialogueUI, HudBar } from '../ui/DialogueUI';
import { KeyboardMenu } from '../ui/KeyboardMenu';
import { AmbientDecor } from './AmbientDecor';

interface WorldObject {
  def: MapObjectDef;
  sprite?: Phaser.GameObjects.Sprite;
}

const MAP_LABEL_Y = 36;

export class BasementScene extends Phaser.Scene {
  private keys!: Keys;
  private playerCtrl!: PlayerController;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer;
  private worldObjects: WorldObject[] = [];
  private dialogueUI!: DialogueUI;
  private hud!: HudBar;
  private benchMinigame!: BenchMinigame;
  private weightMenu!: KeyboardMenu;
  private nearest: MapObjectDef | null = null;

  constructor() {
    super('BasementScene');
  }

  create(): void {
    GameState.currentRoom = 'basement';
    GameState.setPlayerLocked(false);
    dialogueManager.reset();
    this.keys = bindKeyboard(this);
    AudioManager.playBgm('bgm_basement');

    const { wallsLayer, objects } = loadTiledMap(this, 'basement', 'piwnica_tileset');
    this.wallsLayer = wallsLayer;
    this.spawnWorldSprites(objects);
    AmbientDecor.createPixelTexture(this);
    new AmbientDecor().spawn(this);

    const spawn = getSpawnPoint(objects);
    const pos = GameState.playerPosition.x > 0 ? GameState.playerPosition : spawn;
    this.playerCtrl = new PlayerController(this, pos.x, pos.y);
    this.physics.add.collider(this.playerCtrl.sprite, this.wallsLayer);

    this.dialogueUI = new DialogueUI(this);
    this.hud = new HudBar(this);
    this.benchMinigame = new BenchMinigame(this, {
      onComplete: () => {
        const bench = this.worldObjects.find((o) => o.def.objectType === 'bench');
        if (bench?.sprite instanceof Phaser.GameObjects.Sprite) {
          bench.sprite.anims.play('bench_idle');
        }
        this.updateHud();
      },
    });

    this.weightMenu = new KeyboardMenu(
      this, GAME_WIDTH / 2, GAME_HEIGHT / 2,
      'Wybierz wagę',
      (item) => {
        if (item.id === 'cancel') {
          this.weightMenu.close();
          GameState.setPlayerLocked(false);
          return;
        }
        this.weightMenu.close();
        this.startBench(parseInt(item.id, 10));
      },
      () => GameState.setPlayerLocked(false),
    );

    this.add.text(48, MAP_LABEL_Y, 'STUDIO RAP', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff44aa',
    }).setDepth(20).setStroke('#000000', 1);
    this.add.text(520, MAP_LABEL_Y, 'REGAŁ', {
      fontFamily: 'monospace', fontSize: '10px', color: '#aa8866',
    }).setDepth(20);

    this.updateHud();
    if (GameState.hasFlag('beat_140')) {
      this.add.text(GAME_WIDTH / 2, 170, '★ 140 KG — PAK KUJORA ★', {
        fontFamily: 'monospace', fontSize: '11px', color: '#ffd700',
      }).setOrigin(0.5).setDepth(20);
    }
  }

  private spawnWorldSprites(objects: MapObjectDef[]): void {
    for (const def of objects) {
      if (def.objectType === 'spawn') continue;
      const itemId = def.id === 'poster_golden' ? 'poster_rap' : def.id;
      if (def.objectType === 'collectible' && GameState.hasItem(itemId)) continue;

      let sprite: Phaser.GameObjects.Sprite;
      if (def.objectType === 'bench') {
        const s = this.add.sprite(def.x, def.y, 'bench', 0);
        s.anims.play('bench_idle');
        s.setDepth(5);
        sprite = s;
      } else if (def.objectType === 'npc') {
        const s = this.add.sprite(def.x, def.y, 'trener', 0);
        s.anims.play('trener_idle');
        s.setDepth(8);
        sprite = s;
      } else {
        const frame = PROPS_FRAME[itemId] ?? PROPS_FRAME[def.objectType] ?? 0;
        const s = this.add.sprite(def.x, def.y, 'props', frame);
        s.setDepth(4);
        if (def.objectType === 'portal') s.setScale(2);
        sprite = s;
      }
      this.worldObjects.push({ def, sprite });
    }
  }

  private openWeightMenu(): void {
    const items = GameState.getUnlockedWeights().map((w) => ({
      id: String(w),
      label: w === 140 ? '140 kg — BOSS' : `${w} kg`,
    }));
    items.push({ id: 'cancel', label: 'Anuluj' });
    GameState.setPlayerLocked(true);
    this.weightMenu.open(items, `Max: ${GameState.maxWeightUnlocked} kg`);
  }

  private startBench(weightKg: number): void {
    const benchObj = this.worldObjects.find((o) => o.def.objectType === 'bench');
    if (benchObj?.sprite instanceof Phaser.GameObjects.Sprite) {
      benchObj.sprite.anims.play('bench_press');
    }
    if (!this.benchMinigame.start(weightKg)) {
      benchObj?.sprite?.anims?.play('bench_idle');
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    dialogueManager.update(dt);
    this.dialogueUI.update();

    if (this.weightMenu.visible) {
      this.weightMenu.update(this.keys);
      return;
    }

    const benchActive = this.benchMinigame.isActive();
    const benchBossDialogue = benchActive && this.benchMinigame.isBossPause();

    if (benchActive && !benchBossDialogue) {
      if (isKeyDown(this.keys.ESC) || isKeyDown(this.keys.X)) {
        this.benchMinigame.cancel();
        return;
      }
      this.benchMinigame.update(dt, isMashHeld(this.keys));
      return;
    }

    if (dialogueManager.state.active) {
      if (isInteractDown(this.keys)) dialogueManager.advance();
      if (!benchActive) return;
    }

    if (benchActive) {
      this.benchMinigame.update(dt, isMashHeld(this.keys));
      return;
    }

    if (isKeyDown(this.keys.ESC)) {
      this.scene.launch('PauseOverlay');
      this.scene.pause();
      return;
    }

    if (isKeyDown(this.keys.H)) {
      GameState.currentRoom = 'hub';
      this.scene.start('CharacterHubScene');
      return;
    }

    if (isKeyDown(this.keys.BRACKET_LEFT)) {
      AudioManager.adjustVolume(-0.05);
      this.updateHud();
    }
    if (isKeyDown(this.keys.BRACKET_RIGHT)) {
      AudioManager.adjustVolume(0.05);
      this.updateHud();
    }
    if (isKeyDown(this.keys.M)) {
      AudioManager.toggleMute();
      this.updateHud();
    }

    const locked = GameState.playerLocked;
    this.playerCtrl.update(this.keys, locked);
    if (!locked) {
      GameState.playerPosition = { x: this.playerCtrl.sprite.x, y: this.playerCtrl.sprite.y };
      this.nearest = this.findNearest();
      if (isInteractDown(this.keys) && this.nearest) {
        this.handleInteract(this.nearest);
      }
    }

    this.updateHud();
  }

  private findNearest(): MapObjectDef | null {
    const px = this.playerCtrl.sprite.x;
    const py = this.playerCtrl.sprite.y;
    let best: MapObjectDef | null = null;
    let bestD = 9999;
    for (const { def } of this.worldObjects) {
      const itemId = def.id === 'poster_golden' ? 'poster_rap' : def.id;
      if (def.objectType === 'collectible' && GameState.hasItem(itemId)) continue;
      const range = def.objectType === 'bench' ? 50 : 36;
      const d = Phaser.Math.Distance.Between(px, py, def.x, def.y);
      if (d < range && d < bestD) { bestD = d; best = def; }
    }
    return best;
  }

  private handleInteract(def: MapObjectDef): void {
    const itemId = def.id === 'poster_golden' ? 'poster_rap' : def.id;
    switch (def.objectType) {
      case 'bench':
        this.openWeightMenu();
        break;
      case 'npc': {
        const trenerId = dialogueManager.pickTrenerDialogue();
        GameState.setPlayerLocked(true);
        dialogueManager.startTrener(trenerId, () => {
          if (!GameState.hasFlag('met_trainer')) GameState.setFlag('met_trainer');
          if (trenerId === 'krzysiek_quest_start') GameState.setFlag('quest_stairs');
          GameState.setPlayerLocked(false);
        });
        break;
      }
      case 'collectible':
        GameState.setPlayerLocked(true);
        dialogueManager.startItem(itemId, () => {
          GameState.addItem(itemId);
          AudioManager.playSfx('item_pickup');
          const wo = this.worldObjects.find((o) => o.def.id === def.id);
          wo?.sprite?.destroy();
          this.worldObjects = this.worldObjects.filter((o) => o.def.id !== def.id);
          GameState.setPlayerLocked(false);
        });
        break;
      case 'door':
        this.handleDoor();
        break;
      case 'radio':
        GameState.setPlayerLocked(true);
        dialogueManager.startItem('radio', () => {
          if (!GameState.hasItem('radio')) GameState.addItem('radio');
          AudioManager.toggleMute();
          GameState.setPlayerLocked(false);
        });
        break;
      case 'portal':
        GameState.currentRoom = 'hub';
        this.scene.start('CharacterHubScene');
        break;
    }
  }

  private handleDoor(): void {
    GameState.setPlayerLocked(true);
    if (GameState.hasFlag('stairs_cleared')) {
      GameState.setPlayerLocked(false);
      GameState.currentRoom = 'stairs';
      GameState.playerPosition = { x: 320, y: 290 };
      this.scene.start('StairsScene');
      return;
    }
    if (GameState.canEnterStairs()) {
      dialogueManager.start('Krzysiek', [
        'Masz trzy fanty? Schody są wolne.',
        'Na górze czeka nagroda — idź!',
      ], () => {
        GameState.setPlayerLocked(false);
        GameState.currentRoom = 'stairs';
        GameState.playerPosition = { x: 320, y: 290 };
        this.scene.start('StairsScene');
      });
      return;
    }
    if (GameState.hasFlag('quest_stairs')) {
      const need = 3 - GameState.countQuestCollectibles();
      dialogueManager.start('Drzwi', [
        'Schody do garażu Krzyśka. Zamknięte na kłódkę.',
        `Brakuje jeszcze ${need} fant(ów) z piwnicy.`,
        'Zbierz i wróć.',
      ], () => GameState.setPlayerLocked(false));
      return;
    }
    dialogueManager.startItem('drzwi', () => GameState.setPlayerLocked(false));
  }

  private updateHud(): void {
    const chalk = GameState.hasItem('chalk') ? ' +chalk' : '';
    const prompt = this.nearest ? ` | [Z] ${this.promptLabel(this.nearest)}` : '';
    const vol = ` | ${AudioManager.volumePercent}%`;
    const quest = GameState.hasFlag('quest_stairs') && !GameState.hasFlag('stairs_cleared')
      ? ` | quest ${GameState.countQuestCollectibles()}/3`
      : '';
    this.hud.setText(
      `LV${GameState.level} ${GameState.xp}/${GameState.getXpToNext()}XP | ${GameState.maxWeightUnlocked}kg${chalk}${quest}${prompt}${vol} | ${CONTROLS_HINT}`,
    );
  }

  private promptLabel(def: MapObjectDef): string {
    const labels: Record<string, string> = {
      bench: 'Ławka', npc: 'Krzysiek', portal: 'Pak Kujora', door: 'Schody', radio: 'Radio',
      proteina: 'Proteina', chalk: 'Chalk', gazeta: 'Gazeta', poster_rap: 'Plakat',
      poster_golden: 'Plakat', lustro: 'Lustro', beatpad: 'Beatpad', drzwi: 'Drzwi',
      przedtreningowka: 'Pre', kreatyna: 'Kreatyna', shaker: 'Shaker', mikrofon: 'Mikrofon',
    };
    return labels[def.id] ?? def.id;
  }
}
