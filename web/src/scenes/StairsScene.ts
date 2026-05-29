import Phaser from 'phaser';
import { AudioManager } from '../core/AudioManager';
import { bindKeyboard, GAME_WIDTH, isInteractDown, isKeyDown, type Keys } from '../core/config';
import { CONTROLS_HINT } from '../core/Controls';
import { GameState } from '../core/GameState';
import { dialogueManager } from '../core/DialogueManager';
import { getSpawnPoint, loadTiledMap, type MapObjectDef } from '../core/MapHelper';
import { PlayerController } from '../core/PlayerController';
import { DialogueUI, HudBar } from '../ui/DialogueUI';

interface WorldObject {
  def: MapObjectDef;
  sprite?: Phaser.GameObjects.Sprite;
}

export class StairsScene extends Phaser.Scene {
  private keys!: Keys;
  private playerCtrl!: PlayerController;
  private wallsLayer!: Phaser.Tilemaps.TilemapLayer;
  private worldObjects: WorldObject[] = [];
  private dialogueUI!: DialogueUI;
  private hud!: HudBar;
  private nearest: MapObjectDef | null = null;

  constructor() {
    super('StairsScene');
  }

  create(): void {
    GameState.currentRoom = 'stairs';
    GameState.setPlayerLocked(false);
    dialogueManager.reset();
    this.keys = bindKeyboard(this);
    AudioManager.playBgm('bgm_hub');

    const { wallsLayer, objects } = loadTiledMap(this, 'stairs', 'piwnica_tileset');
    this.wallsLayer = wallsLayer;
    this.spawnWorldSprites(objects);

    const spawn = getSpawnPoint(objects);
    const pos = GameState.playerPosition.y < 200 ? GameState.playerPosition : spawn;
    this.playerCtrl = new PlayerController(this, pos.x, pos.y);
    this.physics.add.collider(this.playerCtrl.sprite, this.wallsLayer);

    this.dialogueUI = new DialogueUI(this);
    this.hud = new HudBar(this);

    this.add.text(GAME_WIDTH / 2, 28, '◆ SCHODY — GARAŻ KRZYŚKA ◆', {
      fontFamily: 'monospace', fontSize: '10px', color: '#ff6644',
    }).setOrigin(0.5).setDepth(20);

    if (!GameState.hasFlag('stairs_cleared')) {
      this.time.delayedCall(400, () => {
        GameState.setPlayerLocked(true);
        dialogueManager.start('Krzysiek', [
          'Wszedłeś! Tu jest mój garaż-schowek.',
          'Za fanty masz +150 XP i mój szacunek.',
          'Wracaj na ławkę — 140 kg samo się nie podniesie.',
        ], () => {
          GameState.setFlag('stairs_cleared');
          GameState.grantXp(150);
          GameState.setPlayerLocked(false);
        });
      });
    }

    this.updateHud();
  }

  private spawnWorldSprites(objects: MapObjectDef[]): void {
    for (const def of objects) {
      if (def.objectType === 'spawn') continue;
      let sprite: Phaser.GameObjects.Sprite;
      if (def.objectType === 'npc') {
        const s = this.add.sprite(def.x, def.y, 'trener', 0);
        s.anims.play('trener_idle');
        s.setDepth(8);
        sprite = s;
      } else {
        const s = this.add.sprite(def.x, def.y, 'props', 6);
        s.setDepth(4);
        sprite = s;
      }
      this.worldObjects.push({ def, sprite });
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    dialogueManager.update(dt);
    this.dialogueUI.update();

    if (dialogueManager.state.active) {
      if (isInteractDown(this.keys)) dialogueManager.advance();
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
      const d = Phaser.Math.Distance.Between(px, py, def.x, def.y);
      if (d < 40 && d < bestD) { bestD = d; best = def; }
    }
    return best;
  }

  private handleInteract(def: MapObjectDef): void {
    switch (def.objectType) {
      case 'door':
        GameState.currentRoom = 'basement';
        GameState.playerPosition = { x: 320, y: 95 };
        this.scene.start('BasementScene');
        break;
      case 'npc':
        GameState.setPlayerLocked(true);
        dialogueManager.start('Krzysiek', GameState.hasFlag('stairs_cleared')
          ? ['Tu trzymam sprzęt na deload.', 'Piwnica czeka. Wal w ławkę.']
          : ['Najpierw daj mi te fanty…', 'Czekaj, już jesteś tu?'], () => {
            GameState.setPlayerLocked(false);
          });
        break;
    }
  }

  private updateHud(): void {
    const prompt = this.nearest
      ? ` | [Z] ${this.nearest.objectType === 'door' ? 'Piwnica' : 'Krzysiek'}`
      : '';
    this.hud.setText(`SCHODY | LV${GameState.level}${prompt} | ${CONTROLS_HINT}`);
  }
}
