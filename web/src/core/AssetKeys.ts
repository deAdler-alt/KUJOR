export const ASSETS = {
  maps: {
    basement: 'assets/maps/basement.json',
    hub: 'assets/maps/hub.json',
  },
  tilesets: {
    piwnica: 'assets/tilesets/piwnica_tileset.png',
  },
  sprites: {
    player: 'assets/sprites/player.png',
    trener: 'assets/sprites/trener.png',
    bench: 'assets/sprites/bench.png',
    props: 'assets/sprites/props.png',
    decor: 'assets/sprites/decor.png',
  },
} as const;

export const PROPS_FRAME: Record<string, number> = {
  proteina: 0,
  chalk: 1,
  gazeta: 2,
  poster_rap: 3,
  poster_golden: 3,
  lustro: 4,
  radio: 5,
  drzwi: 6,
  portal: 7,
  terminal: 8,
  beatpad: 9,
  przedtreningowka: 10,
  kreatyna: 11,
  shaker: 12,
  mikrofon: 13,
};

/** 32x32 decor sheet frames */
export const DECOR_FRAME = {
  speaker: 0,
  neon: 1,
  rack: 2,
  cables: 3,
  light: 4,
} as const;

export const MAP_OFFSET_Y = 4;
