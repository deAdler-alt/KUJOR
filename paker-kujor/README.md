# Paker Kujor

Undertale × Golden Gym — pixel RPG w piwnicy-siłowni. Główna mechanika: benchpress (20–140 kg) przez spam `Z`.

## Wymagania

- [Godot 4.3+](https://godotengine.org/download)

## Uruchomienie

1. Zainstaluj Godot 4.
2. Otwórz folder `paker-kujor` w Godot (Import & Edit).
3. Naciśnij **F5** (Play).

## Sterowanie

| Klawisz | Akcja |
|---------|--------|
| WASD / strzałki | Ruch |
| Z / Enter / Space | Interakcja / mash w minigrze |
| Esc | Pauza |
| F5 | Szybki zapis |

## Rozgrywka

- Eksploruj piwnicę, rozmawiaj z **Trenerem**, zbieraj przedmioty (lore + chalk daje +10% siły).
- Podejdź do **ławki** → wybierz wagę → mash `Z`, żeby utrzymać pasek postępu.
- Od **80 kg** jest limit czasu. **140 kg** to boss z dwiema fazami.
- Zapis automatyczny po każdej udanej wadze + ręczny (F5 / menu pauzy).

## Struktura

- `scenes/` — sceny gry
- `scripts/` — logika GDScript
- `data/` — wagi (`weights.tres`) i dialogi JSON (PL)
- `assets/audio/` — placeholder WAV (chiptune)

## Eksport

W Godot: **Project → Export** → dodaj preset Desktop (Windows/macOS/Linux).
