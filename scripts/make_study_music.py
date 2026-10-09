"""Calm background music for study explainers: warm pad chords, a soft
plucked arpeggio and a very light brushed beat (lo-fi feel, 80 BPM).
Usage: python3 make_study_music.py <out_wav> <seconds>"""
import sys
import wave

import numpy as np

out, dur = sys.argv[1], float(sys.argv[2])
SR = 44100
rng = np.random.default_rng(3)
n = int(dur * SR)
mix = np.zeros((n, 2), np.float32)
bpm = 80
beat = 60 / bpm
bar = beat * 4

# Am7 - Fmaj7 - Cmaj7 - G6 (A minor / C major, calm)
chords = [
    [220.00, 261.63, 329.63, 392.00],
    [174.61, 220.00, 261.63, 329.63],
    [130.81, 196.00, 246.94, 329.63],
    [196.00, 246.94, 293.66, 329.63],
]


def add(sig, at, pan=0.0):
    i = int(at * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    s = sig[: j - i]
    mix[i:j, 0] += s * (1 - max(0, pan))
    mix[i:j, 1] += s * (1 + min(0, pan))


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


bars = int(dur / bar) + 1
for b in range(bars):
    ch = chords[b % 4]
    t0 = b * bar
    # pad: detuned soft sines with slow attack
    tt = np.arange(int(bar * 1.15 * SR)) / SR
    env = np.minimum(1, tt / 0.8) * np.exp(-np.maximum(0, tt - bar) * 6)
    pad = sum(np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * f * 1.003 * tt) for f in ch) * env * 0.05
    add(pad, t0)
    # plucked arpeggio (eighth notes), one octave up
    for k in range(8):
        f = ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] * 2
        pt = np.arange(int(0.9 * SR)) / SR
        pl = (np.sin(2 * np.pi * f * pt) + 0.3 * np.sin(4 * np.pi * f * pt)) * np.exp(-pt * 5.5) * 0.07
        add(lowpass(pl, 3500), t0 + k * beat / 2, pan=0.25 if k % 2 else -0.25)
    # bass on beat 1 and 3
    for k in (0, 2):
        bt = np.arange(int(beat * 1.8 * SR)) / SR
        bs = np.sin(2 * np.pi * ch[0] / 2 * bt) * np.exp(-bt * 2.2) * 0.12
        add(bs, t0 + k * beat)
    # light brushed beat
    for k in range(4):
        kt = np.arange(int(0.25 * SR)) / SR
        if k in (0, 2):
            kick = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 45, len(kt))) / SR) * np.exp(-kt * 14) * 0.18
            add(kick, t0 + k * beat)
        else:
            sn = lowpass(rng.standard_normal(len(kt)), 5000) * np.exp(-kt * 18) * 0.05
            add(sn, t0 + k * beat)
        hh = rng.standard_normal(int(0.04 * SR)) * np.exp(-np.arange(int(0.04 * SR)) / 300) * 0.02
        add(hh, t0 + k * beat + beat / 2, pan=0.3)

fade = np.ones(n, np.float32)
fl = int(3 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
fade[: int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
mix *= fade[:, None]
mix /= np.abs(mix).max() + 1e-9
mix *= 0.85
w = wave.open(out, "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes())
w.close()
print("music", dur, "s")
