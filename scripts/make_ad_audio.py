"""Extra sounds for ad-style videos: referee whistle, stadium crowd, and a
light background beat. Usage: python3 make_ad_audio.py <out_dir> <beat_seconds>"""
import numpy as np, wave, sys, os
SR = 44100
out, beat_len = sys.argv[1], float(sys.argv[2])
rng = np.random.default_rng(7)

def save(name, x, peak=0.9, stereo=False):
    x = x / (np.abs(x).max() + 1e-9) * peak
    w = wave.open(os.path.join(out, name + ".wav"), "wb")
    w.setnchannels(2 if stereo else 1); w.setsampwidth(2); w.setframerate(SR)
    data = np.stack([x, x], 1) if stereo else x
    w.writeframes((data * 32767).astype(np.int16).tobytes()); w.close()

def t(d): return np.arange(int(d * SR)) / SR

def lowpass(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x))

def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-((np.log(f + 1) - np.log((lo * hi) ** 0.5)) ** 2) / (2 * (np.log(hi / lo) / 2.5) ** 2))
    return np.fft.irfft(X, len(x))

# referee whistle: two short trills
tt = t(0.9)
f = 2900 + 120 * np.sin(2 * np.pi * 28 * tt)
env = np.zeros_like(tt)
for s, e in [(0.0, 0.22), (0.32, 0.85)]:
    m = (tt >= s) & (tt < e); env[m] = np.minimum(1, np.minimum((tt[m] - s) * 60, (e - tt[m]) * 30))
save("whistle", np.sin(2 * np.pi * np.cumsum(f) / SR) * env + 0.08 * rng.standard_normal(len(tt)) * env)

# stadium crowd swell
tt = t(2.6)
noise = rng.standard_normal(len(tt))
crowd = bandpass(noise, 300, 2500) + 0.5 * bandpass(rng.standard_normal(len(tt)), 600, 4000)
crowd *= 1 + 0.25 * np.sin(2 * np.pi * 3.3 * tt)
env = np.minimum(1, tt / 0.35) * np.exp(-np.maximum(0, tt - 1.4) * 2.2)
save("crowd", crowd * env)

# cash register "ka-ching" for the end card
tt = t(0.9)
ch = sum(a * np.sin(2 * np.pi * fr * tt) * np.exp(-tt * k) for fr, a, k in [(2637, 1, 6), (3520, 0.7, 7), (5274, 0.4, 9)])
click = np.zeros_like(tt); click[: int(0.03 * SR)] = rng.standard_normal(int(0.03 * SR)) * np.exp(-np.arange(int(0.03 * SR)) / 200)
d = int(0.08 * SR)
save("kaching", click + np.concatenate([np.zeros(d), ch[:-d]]))

# background beat: 100 BPM, kick / clap / hats / bass in A minor
bpm = 100; spb = 60 / bpm; n = int(beat_len * SR)
mix = np.zeros(n)
def place(sig, at):
    i = int(at * SR)
    if i >= n: return
    j = min(n, i + len(sig)); mix[i:j] += sig[: j - i]
kt = t(0.35); kick = np.sin(2 * np.pi * np.cumsum(np.linspace(120, 42, len(kt))) / SR) * np.exp(-kt * 9)
ct = t(0.2); clap = bandpass(rng.standard_normal(len(ct)), 900, 3500) * np.exp(-ct * 22)
ht = t(0.05); hat = bandpass(rng.standard_normal(len(ht)), 6000, 12000) * np.exp(-ht * 90)
bass_notes = [55.0, 55.0, 43.65, 49.0]  # A1 A1 F1 G1
beats = int(beat_len / spb) + 1
for b in range(beats):
    at = b * spb
    if b % 4 in (0, 2) or (b % 8 == 3): place(kick, at)
    if b % 4 in (1, 3): place(clap * 0.5, at)
    place(hat * 0.25, at + spb / 2); place(hat * 0.15, at)
    if b % 2 == 0:
        bt = t(spb * 1.8); fr = bass_notes[(b // 4) % 4]
        bass = (np.sin(2 * np.pi * fr * bt) + 0.3 * np.sin(4 * np.pi * fr * bt)) * np.exp(-bt * 1.5)
        place(lowpass(bass, 400) * 0.6, at)
# gentle chord pad
pt = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * fr * pt) for fr in (220.0, 261.63, 329.63)) * 0.04
mix += pad * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * pt))
fade = np.ones(n); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl); fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
save("beat", mix * fade, peak=0.8, stereo=True)
