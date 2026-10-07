"""Opening "riser" for the start of a video: a rising noise sweep plus a
pitch-rising tone that builds tension and ends on a soft impact.
Usage: python3 make_riser.py <out_dir> [seconds]"""
import numpy as np, wave, sys, os

SR = 44100
out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
rng = np.random.default_rng(11)
n = int(dur * SR)
t = np.arange(n) / SR
prog = t / dur


def bandsweep(noise, f0, f1, q=0.45):
    hop, win = 256, 1024
    y = np.zeros(len(noise) + win)
    W = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    for i in range(0, len(noise) - win, hop):
        f = f0 * (f1 / f0) ** (i / max(1, len(noise) - win))
        X = np.fft.rfft(noise[i : i + win] * W)
        H = np.exp(-((np.log(freqs + 1) - np.log(f)) ** 2) / (2 * q**2))
        y[i : i + win] += np.fft.irfft(X * H) * W
    return y[: len(noise)]


# rising filtered noise (the "whoosh up")
noise = bandsweep(rng.standard_normal(n), 250, 7000) * (prog**2.2)
# two detuned saw-ish tones gliding up an octave and a half
f = 110 * 2 ** (prog * 1.6)
ph = 2 * np.pi * np.cumsum(f) / SR
tone = sum(np.sin(k * ph * (1 + 0.004 * j)) / k for k in (1, 2, 3, 4) for j in (-1, 1))
tone *= prog**1.6 * 0.35
# tremolo that speeds up for tension
trem = 0.75 + 0.25 * np.sin(2 * np.pi * np.cumsum(4 + 22 * prog) / SR)
riser = (noise / (np.abs(noise).max() + 1e-9) + tone / (np.abs(tone).max() + 1e-9) * 0.6) * trem

# soft impact at the top
it = np.arange(int(0.9 * SR)) / SR
impact = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 38, len(it))) / SR) * np.exp(-it * 5)
impact += bandsweep(rng.standard_normal(len(it)), 3000, 400) * np.exp(-it * 7) * 0.5
x = np.concatenate([riser, impact * 0.9])
# tiny fade-in
x[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
x = x / (np.abs(x).max() + 1e-9) * 0.9

w = wave.open(os.path.join(out, "riser.wav"), "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((np.stack([x, x], 1) * 32767).astype(np.int16).tobytes())
w.close()
print("riser", len(x) / SR, "s")
