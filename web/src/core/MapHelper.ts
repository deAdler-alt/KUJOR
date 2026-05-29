import Phaser from 'phaser';
import { MAP_OFFSET_Y } from './AssetKeys';

export interface MapObjectDef {
  id: string;
  objectType: string;
  x: number;
  y: number;
}

export interface LoadedMap {
  map: Phaser.Tilemaps.Tilemap;
  floorLayer: Phaser.Tilemaps.TilemapLayer | null;
  decorLayer: Phaser.Tilemaps.TilemapLayer | null;
  wallsLayer: Phaser.Tilemaps.TilemapLayer;
  objects: MapObjectDef[];
}

export function loadTiledMap(
  scene: Phaser.Scene,
  mapKey: string,
  tilesetTextureKey: string,
  tilesetName = 'piwnica_tileset',
): LoadedMap {
  const map = scene.make.tilemap({ key: mapKey });
  const tileset = map.addTilesetImage(tilesetName, tilesetTextureKey);
  if (!tileset) {
    throw new Error(`Tileset ${tilesetName} not found in map ${mapKey}`);
  }

  const floorLayer = map.createLayer('Floor', tileset, 0, MAP_OFFSET_Y);
  const decorLayer = map.createLayer('Decor', tileset, 0, MAP_OFFSET_Y);
  const wallsLayer = map.createLayer('Walls', tileset, 0, MAP_OFFSET_Y);

  if (!wallsLayer) {
    throw new Error(`Walls layer missing in ${mapKey}`);
  }

  floorLayer?.setDepth(0);
  decorLayer?.setDepth(1);
  wallsLayer.setDepth(2);

  wallsLayer.setCollisionByProperty({ collides: true });

  const objects: MapObjectDef[] = [];
  const objLayer = map.getObjectLayer('Objects');
  if (objLayer) {
    for (const obj of objLayer.objects) {
      const idProp = obj.properties?.find((p: { name: string; value?: unknown }) => p.name === 'id');
      const typeProp = obj.properties?.find((p: { name: string; value?: unknown }) => p.name === 'objectType');
      const id = (idProp?.value as string) ?? obj.name ?? '';
      const objectType = (typeProp?.value as string) ?? obj.type ?? '';
      objects.push({
        id,
        objectType,
        x: (obj.x ?? 0) + (obj.width ?? 16) / 2,
        y: (obj.y ?? 0) + (obj.height ?? 16) / 2 + MAP_OFFSET_Y,
      });
    }
  }

  return { map, floorLayer, decorLayer, wallsLayer, objects };
}

export function getSpawnPoint(objects: MapObjectDef[]): { x: number; y: number } {
  const spawn = objects.find((o) => o.objectType === 'spawn');
  return spawn ? { x: spawn.x, y: spawn.y } : { x: 320, y: 300 };
}
