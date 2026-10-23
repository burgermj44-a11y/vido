"""Energetic motivational background music (cinematic pop, 100 BPM, A minor):
punchy kick + clap, open hats, sub bass, wide pad chords and a bright pluck
arpeggio, with a lighter "verse" bar every 8 bars so it never gets tiring under
the voice. Usage: python3 make_hype_music.py <out_wav> <seconds>"""
import sys
import wave

import numpy as np

out, dur = sys.argv[1], float(sys.argv[2])
SR = 44100
rng = np.random.default_rng(7)
n = int(dur * SR)
mix = np.zeros((n, 2), np.float32)
bpm = 100
beat = 60 / bpm
bar = beat * 4

# Am - F - C - G (epic minor loop)
chords = [
    [110.00, 220.00, 261.63, 329.63],
    [87.31, 174.61, 220.00, 261.63],
    [130.81, 196.00, 261.63, 329.63],
    [98.00, 196.00, 246.94, 293.66],
]


def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    mix[i : i + len(sig), 0] += sig * (1 - max(0, pan))
    mix[i : i + len(sig), 1] += sig * (1 + min(0, pan))


def t(d):
    return np.arange(int(d * SR)) / SR


def kick():
    x = t(0.35)
    f = 50 + 110 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9) * 0.9


def clap():
    x = t(0.25)
    nz = rng.standard_normal(len(x))
    e = np.exp(-x * 22) + 0.6 * np.exp(-np.maximum(0, x - 0.012) * 30) * (x > 0.012)
    hp = np.diff(nz, prepend=0)
    return hp * e * 0.28


def hat(open_=False):
    x = t(0.18 if open_ else 0.05)
    nz = np.diff(rng.standard_normal(len(x)), prepend=0)
    return nz * np.exp(-x * (18 if open_ else 70)) * 0.10


def pad(freqs, d):
    x = t(d)
    s = np.zeros_like(x)
    for f in freqs[1:]:
        for det in (-0.004, 0.0, 0.004):
            ph = 2 * np.pi * f * (1 + det) * x
            s += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.5  # saw
    s /= 9
    # simple low-pass by moving average
    k = 24
    s = np.convolve(s, np.ones(k) / k, mode="same")
    env = np.minimum(1, x / 0.4) * np.minimum(1, (d - x) / 0.3)
    return s * env * 0.22


def sub(f, d):
    x = t(d)
    return np.sin(2 * np.pi * f * x) * np.minimum(1, x / 0.01) * np.exp(-x * 1.2) * 0.35


def pluck(f, d=0.3):
    x = t(d)
    s = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * 2 * x) * 0.3
    s = np.convolve(s, np.ones(6) / 6, mode="same")
    return s * np.exp(-x * 12) * 0.10


bars = int(dur / bar) + 1
for b in range(bars):
    t0 = b * bar
    ch = chords[b % 4]
    light = b % 8 == 7  # breathing bar
    intro = b < 2
    add(pad(ch, bar + 0.3), t0, 0.0)
    if not intro:
        add(sub(ch[0] / 2 if ch[0] > 100 else ch[0], bar), t0)
    for q in range(4):
        tb = t0 + q * beat
        if not light:
            if not intro or q in (0, 2):
                add(kick(), tb)
            if not intro and q in (1, 3):
                add(clap(), tb, 0.1)
        for e8 in range(2):
            th = tb + e8 * beat / 2
            if not intro:
                add(hat(open_=(e8 == 1 and q == 3)), th, -0.3)
    # arpeggio (16ths) on top
    if not intro:
        arp = [ch[1] * 2, ch[2] * 2, ch[3] * 2, ch[2] * 2]
        for s16 in range(16):
            add(pluck(arp[s16 % 4]), t0 + s16 * beat / 4, 0.35 if s16 % 2 else -0.35, 0.6 if light else 1.0)

# fade in/out, normalise
fade = int(1.5 * SR)
mix[:fade] *= np.linspace(0, 1, fade)[:, None]
mix[-fade * 2 :] *= np.linspace(1, 0, fade * 2)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
w = wave.open(out, "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes())
w.close()
print("wrote", out, dur)
