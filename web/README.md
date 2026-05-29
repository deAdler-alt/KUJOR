# Paker Kujor — Web Edition

Gra przeglądarkowa (Phaser 3 + TypeScript + Vite). Deploy na **Vercel** jednym kliknięciem.

## Uruchomienie lokalnie

```bash
cd web
npm install
npm run dev
```

## Deploy na Vercel

1. Push repozytorium na GitHub
2. Import projektu w [vercel.com](https://vercel.com) — wybierz folder **`web`**
3. Vercel wykryje Vite; build: `npm run build`, output: `dist`
4. Gotowy link do oddania na zaliczenie

Alternatywnie CLI:

```bash
cd web
npm i -g vercel
vercel --prod
```

## Sterowanie (klawiatura TKL — bez F-keys)

| Klawisz | Akcja |
|---------|--------|
| WASD / strzałki | Ruch |
| Z / Space / Enter | Interakcja / mash |
| H | Hub statystyk |
| P | Zapis ręczny |
| Esc | Pauza |
| (auto) | Zapis po każdej udanej wadze |

## Assety i mapy Tiled

```bash
npm run assets   # regeneruj spritesheety + mapy JSON
```

- Mapy: `public/assets/maps/basement.json`, `hub.json`
- Spritesheety: `public/assets/sprites/` (gracz 32×32, trener, ławka, props)
- Tileset: `public/assets/tilesets/piwnica_tileset.png`

Edycja map w [Tiled Map Editor](https://www.mapeditor.org/) — eksport JSON, warstwy: `Floor`, `Decor`, `Walls`, `Objects`.

## Roadmap zespołu (co dalej)

- [x] Spritesheety postaci + animacje chodu
- [x] Tilemap Tiled JSON (piwnica + hub)
- [ ] Polish art w Aseprite (zamiana wygenerowanych sprite'ów)
- [ ] Więcej pokoi (korytarz, szatnia, Golden Gym surface)
- [ ] System questów i achievementów w hubie
- [ ] Muzyka OGG + mix na Howler.js
- [ ] Leaderboard (Supabase / Vercel KV) — opcjonalnie online

## Struktura

```
web/
  src/
    core/       — GameState, dialogi, config
    scenes/     — Title, Basement, Hub, Pause
    ui/         — Minigra, dialog box
    data/       — wagi, JSON dialogów PL
```

Stara wersja Godot zostaje w `paker-kujor/` jako prototyp referencyjny.
