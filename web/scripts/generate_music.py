#!/usr/bin/env python3
"""Procedural glitchcore / retro BGM for Paker Kujor (CC0 — własna generacja)."""
from __future__ import annotations

import math
import os
import random
import struct
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "audio")
RATE = 44100


def write_wav(path: str, samples: list[float]) -> None:
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = b"".join(
            struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in samples
        )
        w.writeframes(frames)


def sq(t: float, freq: float) -> float:
    return 1.0 if math.sin(2 * math.pi * freq * t) > 0 else -1.0


def tri(t: float, freq: float) -> float:
    p = (t * freq) % 1.0
    return 4 * abs(p - 0.5) - 1


def env(t: float, atk: float, rel: float, dur: float) -> float:
    if t < atk:
        return t / atk
    if t > dur - rel:
        return max(0, (dur - t) / rel)
    return 1.0


def bitcrush(x: float, bits: int = 4) -> float:
    step = 2 / (2**bits)
    return step * round(x / step)


def generate_loop(name: str, bars: int, style: str) -> None:
    random.seed(hash(name) & 0xFFFF)
    bpm = 128 if style == "glitch" else 110
    beat = 60 / bpm
    bar = beat * 4
    dur = bar * bars
    n = int(RATE * dur)
    out = [0.0] * n

    # notes (minor pentatonic + chromatic glitch)
    scale = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13]

    for i in range(n):
        t = i / RATE
        bar_i = int(t / bar)
        beat_i = int((t % bar) / beat)

        # 808 kick
        kick = 0.0
        if beat_i in (0, 2) or (style == "glitch" and bar_i % 2 == 1 and beat_i == 3):
            kt = t % beat
            kick = math.sin(2 * math.pi * (55 + 40 * math.exp(-kt * 12)) * kt) * math.exp(-kt * 8) * 0.55

        # snare / clap
        sn = 0.0
        if beat_i in (1, 3):
            kt = (t % beat)
            if kt < 0.08:
                sn = (random.random() * 2 - 1) * math.exp(-kt * 40) * 0.25

        # hi-hat
        hh = 0.0
        if int(t / (beat / 2)) % 1 == 0:
            ht = t % (beat / 2)
            if ht < 0.03:
                hh = (random.random() * 2 - 1) * 0.08

        # bass
        bass_n = scale[bar_i % len(scale)] / 2
        bass = sq(t, bass_n) * 0.12 * (0.6 + 0.4 * math.sin(t * 2))

        # lead melody (sparse)
        lead = 0.0
        if beat_i == 0 and bar_i % 2 == 0:
            fn = scale[(bar_i + beat_i) % len(scale)] * 2
            ld = t % bar
            lead = tri(t, fn) * env(ld, 0.02, 0.15, bar * 0.5) * 0.09

        # glitch stutter
        glitch = 0.0
        if style == "glitch" and random.random() < 0.002:
            glitch = sq(t * 7.3, scale[random.randint(0, len(scale) - 1)]) * 0.15

        s = kick + sn + hh + bass + lead + glitch

        # bitcrush every 2 bars briefly
        if style == "glitch" and (bar_i % 4) == 3 and (t % bar) > bar * 0.75:
            s = bitcrush(s, 3)

        # soft clip
        out[i] = math.tanh(s * 1.4)

    write_wav(os.path.join(OUT, f"{name}.wav"), out)
    print(f"  music: {name}.wav ({dur:.1f}s)")


def sfx(name: str, freqs: list[float], dur: float = 0.12, vol: float = 0.3) -> None:
    n = int(RATE * dur * len(freqs))
    out = []
    for fi, f in enumerate(freqs):
        for i in range(int(RATE * dur)):
            t = i / RATE
            out.append(vol * math.sin(2 * math.pi * f * t) * math.exp(-t * 8))
    write_wav(os.path.join(OUT, f"{name}.wav"), out)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    print("Generating glitchcore / retro audio...")
    generate_loop("bgm_basement", bars=8, style="glitch")
    generate_loop("bgm_hub", bars=6, style="retro")
    generate_loop("bgm_minigame", bars=4, style="glitch")
    generate_loop("bgm_boss", bars=4, style="glitch")
    sfx("press", [180, 220], 0.04, 0.25)
    sfx("success", [523, 659, 784, 988], 0.1, 0.22)
    sfx("fail", [200, 150, 100], 0.15, 0.25)
    sfx("levelup", [440, 554, 659, 880], 0.12, 0.2)
    sfx("item_pickup", [880, 1100], 0.08, 0.2)

    credits = """# Audio — Paker Kujor

All tracks procedurally generated for this project (CC0 / public domain).
Style: glitchcore / retro chiptune hybrid.
Regenerate: `python3 scripts/generate_music.py`
"""
    with open(os.path.join(OUT, "CREDITS.md"), "w") as f:
        f.write(credits)
    print("Done.")


if __name__ == "__main__":
    main()
