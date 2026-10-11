# Generates the paper texture and sound effects used by the composition.
import numpy as np, wave, os
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
os.makedirs("public/sfx", exist_ok=True)

# --- paper texture (cream, fibres + grain) ---
W, H = 1080, 1920
base = np.zeros((H, W), np.float32)
for s, a in ((256, .5), (64, .3), (16, .2)):
    n = rng.random((H // s + 2, W // s + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    base += np.asarray(im, np.float32) / 255 * a
grain = rng.normal(0, .05, (H, W)).astype(np.float32)
v = base + grain
v = (v - v.min()) / (v.max() - v.min())
col = np.array([244, 236, 218], np.float32)
img = col[None, None, :] * (0.90 + 0.10 * v[..., None])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save("public/paper.png")

# --- sfx ---
SR = 44100
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    with wave.open(f"public/sfx/{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")
def noise(d): return rng.normal(0, 1, int(SR * d))
t = lambda d: np.linspace(0, d, int(SR * d), endpoint=False)

# paper whoosh: noise swept with moving band, bell envelope
d = .55; n = noise(d); tt = t(d)
x = lp(n, 6) - lp(n, 60)
x *= np.sin(np.pi * tt / d) ** 2
save("whoosh", x)
# paper rip: crackly bursts
d = .5; n = noise(d); tt = t(d)
burst = (rng.random(len(tt)) > .55) * n
x = (burst - lp(burst, 20)) * np.exp(-tt * 3) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * tt) ** 2)
save("rip", x)
# pop / sticker slap
d = .22; tt = t(d)
x = np.sin(2 * np.pi * (180 - 400 * tt) * tt) * np.exp(-tt * 22) + .3 * (lp(noise(d), 4)) * np.exp(-tt * 60)
save("pop", x)
# paper tick (cut)
d = .12; tt = t(d)
x = (noise(d) - lp(noise(d), 8)) * np.exp(-tt * 55)
save("tick", x)
# ding for share / follow
d = .9; tt = t(d)
x = (np.sin(2 * np.pi * 1318 * tt) + .5 * np.sin(2 * np.pi * 1976 * tt)) * np.exp(-tt * 5)
save("ding", x)
# low impact thud under stamps
d = .35; tt = t(d)
x = np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 12)
save("thud", x)
print("ok")
