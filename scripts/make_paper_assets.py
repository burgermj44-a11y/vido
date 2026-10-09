"""Paper-style assets: textures (notebook, white card, kraft) and paper sounds
(page flip, tear, crumple, slide, fold, rustle).
Usage: python3 make_paper_assets.py <out_dir>"""
import os
import sys
import wave

import numpy as np
from PIL import Image, ImageFilter

out = sys.argv[1]
os.makedirs(os.path.join(out, "sfx"), exist_ok=True)
rng = np.random.default_rng(5)


# ---------------------------------------------------------------- textures
def grain(h, w, strength):
    n = rng.standard_normal((h // 2, w // 2)).astype(np.float32)
    img = Image.fromarray(((n * 0.5 + 0.5).clip(0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    fine = np.asarray(img.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255 - 0.5
    coarse = np.asarray(img.resize((w // 16, h // 16)).resize((w, h), Image.BICUBIC)).astype(np.float32) / 255 - 0.5
    return fine * strength + coarse * strength * 1.8


def fibers(h, w, count, color):
    layer = np.zeros((h, w), np.float32)
    for _ in range(count):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        ang = rng.uniform(0, np.pi)
        ln = rng.uniform(8, 40)
        for t in np.linspace(0, 1, int(ln)):
            xi = int(x + np.cos(ang) * ln * t + np.sin(t * 6) * 1.5)
            yi = int(y + np.sin(ang) * ln * t)
            if 0 <= xi < w and 0 <= yi < h:
                layer[yi, xi] = 1
    layer = np.asarray(Image.fromarray((layer * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))).astype(np.float32) / 255
    return layer[..., None] * (np.array(color, np.float32)[None, None] - 128) / 255 * 0.35


def save(arr, name, q=90):
    Image.fromarray((arr.clip(0, 1) * 255).astype(np.uint8)).save(os.path.join(out, name), quality=q)


W, H = 1080, 1920
# notebook page: cream, blue lines, red margin, soft vignette
base = np.ones((H, W, 3), np.float32) * np.array([247, 241, 227], np.float32) / 255
base += grain(H, W, 0.05)[..., None]
base += fibers(H, W, 900, (120, 100, 80))
for y in range(150, H, 72):
    base[y : y + 3, :, :] = base[y : y + 3, :, :] * 0.6 + np.array([140, 180, 225]) / 255 * 0.4
base[:, 120:124, :] = base[:, 120:124, :] * 0.5 + np.array([230, 110, 110]) / 255 * 0.5
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.18 * (((xx - W / 2) / (W / 1.3)) ** 2 + ((yy - H / 2) / (H / 1.3)) ** 2)
save(base * vig[..., None], "paper_notebook.jpg")

# plain white card paper (tile for strips / cards)
w2, h2 = 1024, 512
card = np.ones((h2, w2, 3), np.float32) * np.array([252, 250, 244], np.float32) / 255
card += grain(h2, w2, 0.035)[..., None]
card += fibers(h2, w2, 250, (110, 100, 90))
save(card, "paper_white.jpg")

# kraft paper
kraft = np.ones((h2, w2, 3), np.float32) * np.array([201, 160, 112], np.float32) / 255
kraft += grain(h2, w2, 0.07)[..., None]
kraft += fibers(h2, w2, 600, (90, 60, 30))
save(kraft, "paper_kraft.jpg")

# ---------------------------------------------------------------- sounds
SR = 44100


def wsave(name, x, peak=0.85):
    x = x / (np.abs(x).max() + 1e-9) * peak
    x = np.concatenate([x, np.zeros(int(0.02 * SR))])
    w = wave.open(os.path.join(out, "sfx", name + ".wav"), "wb")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
    w.close()


def band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-((np.log(f + 1) - np.log((lo * hi) ** 0.5)) ** 2) / (2 * (np.log(hi / lo) / 2.2) ** 2))
    return np.fft.irfft(X, len(x))


def crackles(dur, rate, lo, hi, decay=900):
    n = int(dur * SR)
    x = np.zeros(n)
    count = int(dur * rate)
    for _ in range(count):
        i = rng.integers(0, max(1, n - 400))
        ln = rng.integers(60, 400)
        x[i : i + ln] += rng.standard_normal(ln) * np.exp(-np.arange(ln) / rng.uniform(decay * 0.05, decay * 0.25)) * rng.uniform(0.3, 1)
    return band(x, lo, hi)


t = lambda d: np.arange(int(d * SR)) / SR

# page flip: a swoosh of air plus a crisp flap
d = 0.42
tt = t(d)
swoosh = band(rng.standard_normal(len(tt)), 500, 5000) * np.sin(np.pi * tt / d) ** 2
flap = crackles(d, 60, 1500, 8000) * np.exp(-((tt - 0.28) ** 2) / 0.002)
wsave("paper_flip", swoosh * 0.6 + flap)

# tear: dense, rising-intensity crackle
d = 0.55
tt = t(d)
tear = crackles(d, 900, 1200, 7000) * (0.4 + 0.6 * tt / d) * (1 - np.exp(-(d - tt) * 30))
wsave("paper_tear", tear)

# crumple: random bursts of crackle
d = 0.7
tt = t(d)
env = np.zeros_like(tt)
for c in rng.uniform(0, d, 9):
    env += np.exp(-((tt - c) ** 2) / 0.0012)
wsave("paper_crumple", crackles(d, 1400, 800, 6000) * np.minimum(env, 1.2))

# slide: soft low swoosh of paper on paper
d = 0.32
tt = t(d)
wsave("paper_slide", band(rng.standard_normal(len(tt)), 300, 2500) * np.sin(np.pi * tt / d) ** 1.5, peak=0.7)

# fold / unfold: two quick crisp clicks
d = 0.22
tt = t(d)
fold = crackles(d, 120, 2000, 9000) * (np.exp(-((tt - 0.03) ** 2) / 0.0004) + 0.8 * np.exp(-((tt - 0.12) ** 2) / 0.0004))
wsave("paper_fold", fold)

# tiny rustle for caption strips
d = 0.18
tt = t(d)
wsave("paper_rustle", crackles(d, 300, 1500, 7000) * np.sin(np.pi * tt / d), peak=0.6)
print("ok")
