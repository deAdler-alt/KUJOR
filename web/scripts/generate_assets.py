#!/usr/bin/env python3
"""Generate pixel-art assets for Paker Kujor — expanded graphics."""
from __future__ import annotations

import json
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "public", "assets")
MAPS = os.path.join(ASSETS, "maps")
TILESETS = os.path.join(ASSETS, "tilesets")
SPRITES = os.path.join(ASSETS, "sprites")

TILE = 16
MAP_W, MAP_H = 40, 22


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def make_tileset() -> tuple[dict[int, str], list[dict], int, int]:
    cols = 8
    tiles = [
        ("floor", "#1e1c24", "#252330"),
        ("floor_var", "#1a1820", "#22202a"),
        ("wall", "#2a2838", "#1e1c28"),
        ("wall_top", "#32304a", "#262438"),
        ("shelf", "#332820", "#281e18"),
        ("studio_carpet", "#2a1838", "#ff44aa"),
        ("floor_hub", "#141c28", "#1a2438"),
        ("hub_wall", "#1e2840", "#141c30"),
        ("neon_floor", "#1a1428", "#00ffcc"),
        ("graffiti", "#3a2848", "#ff6644"),
        ("rubber_mat", "#282018", "#4a4030"),
        ("cable", "#141418", "#444466"),
        ("pillar", "#2a2838", "#3a3848"),
        ("mat", "#4a3020", "#6b4423"),
        ("light_spot", "#222228", "#ffffaa"),
        ("crack", "#1e1c24", "#2a2030"),
    ]
    w, h = cols * TILE, ((len(tiles) + cols - 1) // cols) * TILE
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    collides = {2, 3, 4, 7, 12}
    tile_props: list[dict] = []

    for i, (name, base, accent) in enumerate(tiles):
        tx, ty = (i % cols) * TILE, (i // cols) * TILE
        base_c, accent_c = hex_rgb(base), hex_rgb(accent)
        for py in range(TILE):
            for px in range(TILE):
                c = base_c
                if px == 0 or py == 0:
                    c = tuple(min(255, x + 12) for x in base_c)
                if px == TILE - 1 or py == TILE - 1:
                    c = tuple(max(0, x - 15) for x in base_c)
                if name == "studio_carpet" and (px + py) % 3 == 0:
                    c = accent_c if (px * py) % 5 else tuple(x // 2 for x in accent_c)
                if name == "neon_floor" and py == TILE - 2:
                    c = accent_c
                if name == "graffiti" and px > 2 and py > 2:
                    c = accent_c if (px * 7 + py * 3) % 5 == 0 else base_c
                if name == "cable" and (px + py) % 4 == 0:
                    c = accent_c
                if name == "floor_var" and (px * 3 + py) % 7 == 0:
                    c = hex_rgb(accent)
                if name == "light_spot" and 4 <= px <= 11 and 4 <= py <= 11:
                    c = accent_c
                img.putpixel((tx + px, ty + py), c + (255,))
        if i in collides:
            tile_props.append({"id": i, "properties": [{"name": "collides", "type": "bool", "value": True}]})

    os.makedirs(TILESETS, exist_ok=True)
    img.save(os.path.join(TILESETS, "piwnica_tileset.png"))
    print(f"  tileset: {w}x{h} ({len(tiles)} tiles)")
    return {i: tiles[i][0] for i in range(len(tiles))}, tile_props, cols, len(tiles)


def frame_player(direction: int, frame: int) -> Image.Image:
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    skin, hair, shirt, pants, shoe, outline = "#e8b88a", "#2a1a0a", "#3a9ad9", "#1a2848", "#111122", "#0a0a12"
    bob = frame % 2
    leg_off = 1 if bob and frame > 0 else 0
    draw.ellipse([8, 28, 24, 31], fill=hex_rgb("#000000") + (60,))
    lx, rx = 11 - leg_off, 19 + leg_off
    draw.rectangle([lx, 22, lx + 4, 28], fill=hex_rgb(pants))
    draw.rectangle([rx, 22, rx + 4, 28], fill=hex_rgb(pants))
    draw.rectangle([lx, 27, lx + 5, 29], fill=hex_rgb(shoe))
    draw.rectangle([rx - 1, 27, rx + 4, 29], fill=hex_rgb(shoe))
    draw.rectangle([10, 14, 21, 22], fill=hex_rgb(shirt))
    draw.line([(10, 14), (21, 14)], fill=hex_rgb(outline))
    arm_y = 15 + (1 if bob else 0)
    if direction in (1, 2):
        draw.rectangle([8, arm_y, 10, 20], fill=hex_rgb(shirt))
        draw.rectangle([21, arm_y, 23, 20], fill=hex_rgb(shirt))
    else:
        draw.rectangle([9, arm_y, 11, 19], fill=hex_rgb(shirt))
        draw.rectangle([20, arm_y, 22, 19], fill=hex_rgb(shirt))
    draw.rectangle([6, arm_y + 2, 12, arm_y + 8], fill=hex_rgb("#1e6090"))
    draw.rectangle([19, arm_y + 2, 25, arm_y + 8], fill=hex_rgb("#1e6090"))
    hy = 6 if direction != 3 else 8
    draw.ellipse([10, hy, 21, hy + 11], fill=hex_rgb(skin))
    draw.ellipse([10, hy, 21, hy + 5], fill=hex_rgb(hair))
    if direction != 3:
        if direction in (1, 2):
            ex = 12 if direction == 1 else 17
            draw.rectangle([ex, hy + 6, ex + 2, hy + 8], fill=hex_rgb(outline))
        else:
            draw.rectangle([12, hy + 6, 14, hy + 8], fill=hex_rgb(outline))
            draw.rectangle([17, hy + 6, 19, hy + 8], fill=hex_rgb(outline))
    return img


def make_player_sheet() -> None:
    sheet = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    for row in range(4):
        for col in range(4):
            sheet.paste(frame_player(row, col), (col * 32, row * 32))
    sheet.save(os.path.join(SPRITES, "player.png"))


def frame_trener(frame: int) -> Image.Image:
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    skin, hair, shirt, pants = "#c89860", "#d4a017", "#c0392b", "#2c2c2c"
    draw.ellipse([8, 27, 24, 30], fill=(0, 0, 0, 50))
    draw.rectangle([10, 22, 14, 28], fill=hex_rgb(pants))
    draw.rectangle([17, 22, 21, 28], fill=hex_rgb(pants))
    draw.rectangle([9, 13, 22, 22], fill=hex_rgb(shirt))
    if frame % 2:
        draw.rectangle([7, 14, 9, 20], fill=hex_rgb(shirt))
        draw.rectangle([22, 14, 24, 20], fill=hex_rgb(shirt))
    hy = 5
    draw.ellipse([9, hy, 22, hy + 12], fill=hex_rgb(skin))
    draw.ellipse([9, hy, 22, hy + 6], fill=hex_rgb(hair))
    draw.rectangle([12, hy + 6, 14, hy + 8], fill=(10, 10, 18))
    draw.rectangle([17, hy + 6, 19, hy + 8], fill=(10, 10, 18))
    draw.rectangle([20, 16, 22, 17], fill=(200, 200, 200))
    return img


def make_trener_sheet() -> None:
    sheet = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    for i in range(2):
        sheet.paste(frame_trener(i), (i * 32, 0))
    sheet.save(os.path.join(SPRITES, "trener.png"))


def frame_bench(frame: int) -> Image.Image:
    img = Image.new("RGBA", (48, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    wood, bar, plate = "#6b4423", "#888888", "#ffd700"
    draw.rectangle([4, 18, 44, 24], fill=hex_rgb(wood))
    draw.rectangle([4, 16, 44, 18], fill=hex_rgb("#5a3820"))
    bar_y = 8 - frame * 2
    draw.rectangle([6, bar_y, 42, bar_y + 3], fill=hex_rgb(bar))
    draw.rectangle([2, bar_y - 2, 8, bar_y + 6], fill=hex_rgb(plate))
    draw.rectangle([40, bar_y - 2, 46, bar_y + 6], fill=hex_rgb(plate))
    return img


def make_bench_sheet() -> None:
    sheet = Image.new("RGBA", (192, 32), (0, 0, 0, 0))
    for i in range(4):
        sheet.paste(frame_bench(i), (i * 48, 0))
    sheet.save(os.path.join(SPRITES, "bench.png"))


def make_props_sheet() -> None:
    props = [
        ("proteina", "#e63956", "#ff6690", "jar"),
        ("chalk", "#f0f0e8", "#cccccc", "box"),
        ("gazeta", "#d9cc99", "#ffffff", "paper"),
        ("poster", "#ffd700", "#ff8800", "poster"),
        ("lustro", "#99bbcc", "#ddeeff", "mirror"),
        ("radio", "#555566", "#888899", "radio"),
        ("door", "#5a3820", "#3a2410", "door"),
        ("portal", "#6644ff", "#aa88ff", "portal"),
        ("terminal", "#003322", "#00ffaa", "term"),
        ("beatpad", "#222233", "#ff44aa", "pad"),
        ("preworkout", "#ff2200", "#ff8800", "pre"),
        ("kreatyna", "#44aaff", "#88ddff", "creatine"),
        ("shaker", "#cccccc", "#888888", "shaker"),
        ("mikrofon", "#333344", "#ccccdd", "mic"),
    ]
    sheet = Image.new("RGBA", (16 * len(props), 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    for i, (_, c1, c2, kind) in enumerate(props):
        ox = i * 16
        draw.rectangle([ox + 1, 1, ox + 14, 14], fill=hex_rgb(c1), outline=hex_rgb(c2))
        if kind == "portal":
            draw.ellipse([ox + 4, 4, ox + 12, 12], outline=hex_rgb(c2))
        elif kind == "pad":
            for r in range(3):
                for c in range(3):
                    draw.rectangle([ox + 4 + c * 3, 4 + r * 3, ox + 6 + c * 3, 6 + r * 3], fill=hex_rgb(c2))
        elif kind == "pre":
            draw.text((ox + 3, 4), "PRE", fill=hex_rgb("#ffffff"))
        elif kind == "shaker":
            draw.rectangle([ox + 6, 2, ox + 10, 12], fill=hex_rgb(c2))
        elif kind == "mic":
            draw.ellipse([ox + 6, 3, ox + 10, 8], fill=hex_rgb(c2))
            draw.rectangle([ox + 7, 8, ox + 9, 13], fill=hex_rgb(c2))
    sheet.save(os.path.join(SPRITES, "props.png"))
    print(f"  props: {len(props)} items")


def make_decor_sheet() -> None:
    """32x32 ambient decor sprites."""
    decors = {
        "speaker": lambda d, ox: (
            d.rectangle([ox + 4, 8, ox + 12, 28], fill=hex_rgb("#222228"), outline=hex_rgb("#444455")),
            d.ellipse([ox + 5, 18, ox + 11, 24], fill=hex_rgb("#333344")),
            d.rectangle([ox + 6, 10, ox + 10, 14], fill=hex_rgb("#555566")),
        ),
        "neon": lambda d, ox: (
            d.rectangle([ox + 2, 10, ox + 30, 22], fill=hex_rgb("#1a0018"), outline=hex_rgb("#ff44aa")),
            d.text((ox + 4, 12), "KUJOR", fill=hex_rgb("#ff44aa")),
        ),
        "rack": lambda d, ox: (
            d.rectangle([ox + 4, 6, ox + 28, 28], fill=hex_rgb("#333333")),
            *[d.rectangle([ox + 6 + i * 6, 10, ox + 10 + i * 6, 14], fill=hex_rgb("#888888")) for i in range(4)],
        ),
        "cables": lambda d, ox: (
            d.arc([ox + 2, 14, ox + 20, 28], 0, 180, fill=hex_rgb("#666688")),
            d.arc([ox + 10, 10, ox + 28, 26], 180, 360, fill=hex_rgb("#888899")),
        ),
        "light": lambda d, ox: (
            d.polygon([(ox + 16, 4), (ox + 8, 14), (ox + 24, 14)], fill=hex_rgb("#888877")),
            d.rectangle([ox + 10, 14, ox + 22, 18], fill=hex_rgb("#ffffaa")),
            d.polygon([(ox + 16, 18), (ox + 6, 30), (ox + 26, 30)], fill=hex_rgb("#ffffcc") + (80,)),
        ),
    }
    names = list(decors.keys())
    sheet = Image.new("RGBA", (32 * len(names), 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    for i, name in enumerate(names):
        decors[name](draw, i * 32)
    sheet.save(os.path.join(SPRITES, "decor.png"))
    print(f"  decor: {len(names)} sprites")


def gid(i: int) -> int:
    return i + 1


def build_basement_map() -> None:
    F, FV, W, WT, S, CARPET, _, _, NEON, GRAFF, RUBBER, CABLE, P, _, LIGHT, _CR = range(16)

    floor, decor, walls = [], [], []
    for y in range(MAP_H):
        for x in range(MAP_W):
            edge = y < 2 or y >= MAP_H - 2 or x < 1 or x >= MAP_W - 2
            shelf = x >= 31 and y < 7
            studio = 1 <= x <= 9 and 1 <= y <= 6
            pillar = 12 <= x <= 13 and 6 <= y <= 8
            rubber = 17 <= x <= 26 and 10 <= y <= 14

            if edge:
                floor.append(gid(W))
                decor.append(gid(GRAFF) if x % 5 == 0 and y > 2 else 0)
                walls.append(gid(WT if y < 2 else W))
            elif shelf:
                floor.append(gid(F))
                decor.append(gid(S))
                walls.append(gid(S))
            elif studio:
                floor.append(gid(CARPET))
                decor.append(gid(NEON) if (x, y) == (5, 2) else 0)
                walls.append(0)
            elif pillar:
                floor.append(gid(F))
                decor.append(0)
                walls.append(gid(P))
            elif rubber:
                floor.append(gid(RUBBER))
                decor.append(gid(CABLE) if (x + y) % 3 == 0 else 0)
                walls.append(0)
            else:
                floor.append(gid(FV if (x + y) % 5 == 0 else F))
                decor.append(gid(LIGHT) if (x, y) in ((20, 4), (25, 4)) else 0)
                walls.append(0)

    objects = [
        {"id": "drzwi", "type": "door", "x": 320, "y": 48},
        {"id": "bench", "type": "bench", "x": 320, "y": 200},
        {"id": "trener", "type": "npc", "x": 100, "y": 140},
        {"id": "proteina", "type": "collectible", "x": 560, "y": 60},
        {"id": "chalk", "type": "collectible", "x": 580, "y": 80},
        {"id": "gazeta", "type": "collectible", "x": 540, "y": 90},
        {"id": "przedtreningowka", "type": "collectible", "x": 520, "y": 70},
        {"id": "kreatyna", "type": "collectible", "x": 600, "y": 90},
        {"id": "shaker", "type": "collectible", "x": 565, "y": 100},
        {"id": "poster_rap", "type": "collectible", "x": 72, "y": 56},
        {"id": "beatpad", "type": "collectible", "x": 200, "y": 56},
        {"id": "mikrofon", "type": "collectible", "x": 240, "y": 56},
        {"id": "lustro", "type": "collectible", "x": 160, "y": 56},
        {"id": "radio", "type": "radio", "x": 500, "y": 300},
        {"id": "portal", "type": "portal", "x": 580, "y": 300},
        {"id": "spawn", "type": "spawn", "x": 320, "y": 300},
    ]
    write_map("basement", floor, decor, walls, objects)


def build_stairs_map() -> None:
    """Wąski korytarz schodów — drugi pokój."""
    F, FV, W, WT, S, CARPET, _, _, NEON, _, RUBBER, _, P, _, LIGHT, _CR = range(16)

    floor, decor, walls = [], [], []
    for y in range(MAP_H):
        for x in range(MAP_W):
            edge = y < 2 or y >= MAP_H - 2 or x < 1 or x >= MAP_W - 2
            stair_col = 17 <= x <= 22
            if edge:
                floor.append(gid(W))
                decor.append(0)
                walls.append(gid(WT if y < 2 else W))
            elif stair_col:
                floor.append(gid(RUBBER if y % 2 == 0 else FV))
                decor.append(gid(LIGHT) if y in (4, 10, 16) else 0)
                walls.append(0)
            else:
                floor.append(gid(F))
                decor.append(0)
                walls.append(gid(S) if x < 5 or x > 34 else 0)

    objects = [
        {"id": "stairs_down", "type": "door", "x": 320, "y": 310},
        {"id": "trener", "type": "npc", "x": 320, "y": 88},
        {"id": "spawn", "type": "spawn", "x": 320, "y": 290},
    ]
    write_map("stairs", floor, decor, walls, objects)


def build_hub_map() -> None:
    floor, decor, walls = [], [], []
    FH, _, HW = 6, 7, 7
    for y in range(MAP_H):
        for x in range(MAP_W):
            edge = y < 2 or y >= MAP_H - 2 or x < 1 or x >= MAP_W - 2
            if edge:
                floor.append(gid(FH))
                decor.append(0)
                walls.append(gid(HW))
            else:
                floor.append(gid(FH))
                decor.append(gid(8) if (x + y) % 6 == 0 else 0)
                walls.append(0)
    objects = [
        {"id": "terminal", "type": "terminal", "x": 520, "y": 180},
        {"id": "portal", "type": "portal", "x": 120, "y": 300},
        {"id": "spawn", "type": "spawn", "x": 320, "y": 280},
    ]
    write_map("hub", floor, decor, walls, objects)


def write_map(name: str, floor: list, decor: list, walls: list, objects: list) -> None:
    _, tile_props, cols, tilecount = make_tileset_ref()
    rows = (tilecount + cols - 1) // cols
    obj_layer = []
    for o in objects:
        obj_layer.append({
            "gid": 0, "height": 16, "id": len(obj_layer) + 1, "name": o["id"],
            "rotation": 0, "type": o["type"], "visible": True, "width": 16,
            "x": o["x"] - 8, "y": o["y"] - 8,
            "properties": [
                {"name": "id", "type": "string", "value": o["id"]},
                {"name": "objectType", "type": "string", "value": o["type"]},
            ],
        })
    map_data = {
        "compressionlevel": -1, "height": MAP_H, "width": MAP_W, "infinite": False,
        "layers": [
            {"data": floor, "height": MAP_H, "id": 1, "name": "Floor", "opacity": 1,
             "type": "tilelayer", "visible": True, "width": MAP_W, "x": 0, "y": 0},
            {"data": decor, "height": MAP_H, "id": 2, "name": "Decor", "opacity": 1,
             "type": "tilelayer", "visible": True, "width": MAP_W, "x": 0, "y": 0},
            {"data": walls, "height": MAP_H, "id": 3, "name": "Walls", "opacity": 1,
             "type": "tilelayer", "visible": True, "width": MAP_W, "x": 0, "y": 0},
            {"draworder": "topdown", "id": 4, "name": "Objects", "objects": obj_layer,
             "opacity": 1, "type": "objectgroup", "visible": True, "x": 0, "y": 0},
        ],
        "nextlayerid": 5, "nextobjectid": len(obj_layer) + 1,
        "orientation": "orthogonal", "renderorder": "right-down",
        "tiledversion": "1.10.2", "tileheight": TILE, "tilewidth": TILE,
        "type": "map", "version": "1.10",
        "tilesets": [{
            "columns": cols, "firstgid": 1,
            "image": "../tilesets/piwnica_tileset.png",
            "imageheight": rows * TILE, "imagewidth": cols * TILE,
            "margin": 0, "name": "piwnica_tileset", "spacing": 0,
            "tilecount": tilecount, "tileheight": TILE, "tilewidth": TILE,
            "tiles": tile_props,
        }],
    }
    os.makedirs(MAPS, exist_ok=True)
    with open(os.path.join(MAPS, f"{name}.json"), "w") as f:
        json.dump(map_data, f, indent=2)
    print(f"  map: {name}.json")


_tileset_cache = None


def make_tileset_ref():
    global _tileset_cache
    if _tileset_cache is None:
        _tileset_cache = make_tileset()
    return _tileset_cache


def main() -> None:
    os.makedirs(SPRITES, exist_ok=True)
    print("Generating assets...")
    make_tileset_ref()
    make_player_sheet()
    make_trener_sheet()
    make_bench_sheet()
    make_props_sheet()
    make_decor_sheet()
    build_basement_map()
    build_hub_map()
    build_stairs_map()
    print("Done.")


if __name__ == "__main__":
    main()
