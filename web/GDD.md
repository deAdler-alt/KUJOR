# Paker Kujor — Product Roadmap (zespół game-dev)

## Wizja produktu

**Pitch:** Undertale spotyka Golden Gym — narracyjna piwnica-siłownia z minigrą benchpress, humorem PL i hubem statystyk jak w grach LEGO.

**Platforma docelowa:** Web (Vercel) — link do zaliczenia, zero instalacji u oceniającego.

---

## Fazy produkcji

### ✅ Faza 0 — Prototyp (DONE)
- [x] Mechanika mash 20→140 kg + boss 2 fazy
- [x] Dialogi PL, przedmioty, zapis localStorage
- [x] Port web Phaser 3 + Vite + deploy Vercel

### ✅ Faza 1 — Vertical Slice (w toku)
- [x] Spritesheety 32×32: gracz (4 kierunki × 4 klatki), trener, ławka, props
- [x] Tilemap Tiled JSON: piwnica + hub (`public/assets/maps/`)
- [x] Generator assetów: `npm run assets`
- [ ] Tilemap edycja w Tiled Map Editor (ręczny polish)
- [ ] Muzyka OGG + SFX via Howler
- [ ] Tutorial overlay, mobile touch

**Sterowanie TKL:** bez F1–F12. Zapis = `P`, hub = `H`, pauza = `Esc`.

### 📦 Faza 2 — Content Alpha (6–10 tyg.)
- Nowe pokoje: korytarz, szatnia, powierzchnia Golden Gym
- 5–10 NPC z quest chainami
- System achievementów w hubie (tablica trofeów)
- Więcej minigier: deadlift QTE, cardio rhythm (opcjonalnie)
- Cutscenki dialogowe z portretami postaci

### 🚀 Faza 3 — Beta / Hit polish (10+ tyg.)
- Pełna ścieżka fabularna (3 akty)
- Boss rush mode, New Game+
- Leaderboard online (Supabase)
- Eksport Steam itch.io (opcjonalnie — ten sam kod web)

---

## Stack techniczny (web)

```
Phaser 3 + TypeScript + Vite → Vercel static
localStorage save → później Supabase sync
Tiled → tilemap JSON
Aseprite → spritesheets
```

Godot (`paker-kujor/`) = archiwum prototypu, nie rozwijamy dalej.

---

## Role w zespole (propozycja)

| Rola | Odpowiedzialność |
|------|------------------|
| **Design / Narrative** | Dialogi, questy, humor, pacing wag |
| **Gameplay** | Balans minigry, boss fazy, progression |
| **Art** | Pixel art, tileset piwnica + Golden Gym |
| **Tech** | Phaser scenes, save, deploy, performance |
| **Audio** | Chiptune + SFX siłowni |

---

## Metryki sukcesu (zaliczenie + dalej)

1. Link Vercel działa na telefonie i desktopie
2. 15–30 min gameplay loop (20 kg → 140 kg + eksploracja)
3. Hub statystyk pokazuje progres wizualnie
4. Minimum 3 „wow momenty”: boss 140 kg, golden ending, hub level-up
