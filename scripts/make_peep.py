"""Peephole (door fisheye) scenes for the MJ Burger match-night carousel.

Anonymous back-lit figures (no faces, no names) in white jerseys with a number
and an "MJ" crest hold the real MJ burger up to the door peephole.
Output: public/peep/scene_N.png (1100x1100, circular view, already warped).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

FONT = sys.argv[1]
OUT = "public/peep"
N = 1400  # scene canvas before the fisheye warp
rng = np.random.default_rng(7)


def grad(top, bottom):
    t = np.linspace(0, 1, N)[:, None, None]
    a = np.array(top)[None, None] * (1 - t) + np.array(bottom)[None, None] * t
    return Image.fromarray(np.repeat(a, N, 1).astype(np.uint8))


def glow(img, xy, r, color, strength):
    g = Image.new("RGB", (N, N), 0)
    d = ImageDraw.Draw(g)
    d.ellipse((xy[0] - r, xy[1] - r, xy[0] + r, xy[1] + r), fill=color)
    g = g.filter(ImageFilter.GaussianBlur(r * 0.6))
    return ImageChops.add(img, Image.eval(g, lambda v: int(v * strength)))


def background(lamp_x):
    bg = grad((14, 16, 30), (30, 20, 12))
    d = ImageDraw.Draw(bg)
    # porch wall planks + door frame edges
    for x in range(0, N, 140):
        d.line((x, 0, x, N), fill=(22, 20, 26), width=4)
    d.rectangle((0, 0, 120, N), fill=(40, 24, 14))
    d.rectangle((N - 120, 0, N, N), fill=(40, 24, 14))
    # lamp
    d.rounded_rectangle((lamp_x - 40, 90, lamp_x + 40, 190), 14, fill=(255, 214, 140))
    bg = glow(bg, (lamp_x, 140), 260, (255, 170, 70), 0.9)
    bg = glow(bg, (lamp_x, 140), 80, (255, 230, 170), 1.0)
    # far street lights (bokeh)
    for _ in range(9):
        x, y = rng.integers(150, N - 150), rng.integers(260, 620)
        bg = glow(bg, (x, y), int(rng.integers(10, 26)), (255, 190, 110), 0.5)
    return bg


def head(d, cx, cy, kind):
    dark = (10, 9, 12)
    if kind == "hood":
        d.ellipse((cx - 175, cy - 190, cx + 175, cy + 200), fill=(28, 28, 34))
    d.ellipse((cx - 125, cy - 150, cx + 125, cy + 150), fill=dark)
    d.ellipse((cx - 150, cy - 30, cx - 100, cy + 50), fill=dark)
    d.ellipse((cx + 100, cy - 30, cx + 150, cy + 50), fill=dark)
    if kind == "cap":
        d.chord((cx - 135, cy - 175, cx + 135, cy + 40), 180, 360, fill=(18, 18, 24))
        d.ellipse((cx - 170, cy - 40, cx + 90, cy + 10), fill=(18, 18, 24))
    if kind == "beanie":
        d.chord((cx - 132, cy - 190, cx + 132, cy + 30), 180, 360, fill=(200, 200, 205))
        d.rectangle((cx - 132, cy - 60, cx + 132, cy - 20), fill=(212, 175, 55))
    if kind == "coach":
        d.ellipse((cx - 128, cy - 158, cx + 128, cy - 20), fill=(60, 60, 64))


def figure(img, num, kind, lamp_x, burger_side=0):
    cx, cy = N // 2, 470
    fig = Image.new("RGBA", (N, N), 0)
    d = ImageDraw.Draw(fig)
    if kind == "coach":
        body = (36, 36, 44)
        d.polygon([(cx - 520, N), (cx - 470, 760), (cx - 260, 640), (cx + 260, 640), (cx + 470, 760), (cx + 520, N)], fill=body)
        d.polygon([(cx - 120, 640), (cx, 900), (cx + 120, 640)], fill=(235, 235, 235))
        d.polygon([(cx - 70, 640), (cx, 860), (cx + 70, 640)], fill=(20, 20, 26))
        d.polygon([(cx - 260, 640), (cx - 90, 640), (cx - 30, 1000), (cx - 200, 820)], fill=(26, 26, 32))
        d.polygon([(cx + 260, 640), (cx + 90, 640), (cx + 30, 1000), (cx + 200, 820)], fill=(26, 26, 32))
    else:
        white = (232, 232, 236)
        d.polygon([(cx - 540, N), (cx - 500, 760), (cx - 280, 640), (cx + 280, 640), (cx + 500, 760), (cx + 540, N)], fill=white)
        # gold trims and V collar
        d.polygon([(cx - 120, 636), (cx, 760), (cx + 120, 636), (cx + 90, 636), (cx, 720), (cx - 90, 636)], fill=(205, 165, 50))
        d.line((cx - 500, 760, cx - 540, N), fill=(205, 165, 50), width=18)
        d.line((cx + 500, 760, cx + 540, N), fill=(205, 165, 50), width=18)
        f = ImageFont.truetype(FONT, 260)
        d.text((cx + (-150 if burger_side > 0 else 150), 1000), str(num), font=f, fill=(24, 22, 40), anchor="mm")
        f2 = ImageFont.truetype(FONT, 70)
        nx = cx + (-150 if burger_side > 0 else 150)
        d.ellipse((nx - 60, 700, nx + 60, 820), outline=(205, 165, 50), width=8)
        d.text((nx, 758), "MJ", font=f2, fill=(205, 165, 50), anchor="mm")
    d.rectangle((cx - 70, cy + 100, cx + 70, 660), fill=(10, 9, 12))
    head(d, cx, cy, kind)
    # shading: lit from the lamp side, darker towards the bottom
    a = np.asarray(fig).astype(np.float32)
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    light = 0.45 + 0.55 * np.clip(1 - np.hypot(xx - lamp_x, yy - 140) / 1500, 0, 1)
    a[..., :3] *= light[..., None]
    fig = Image.fromarray(a.astype(np.uint8))
    # warm rim light around the silhouette
    al = fig.split()[3]
    rim = ImageChops.subtract(al, al.filter(ImageFilter.MinFilter(9))).filter(ImageFilter.GaussianBlur(4))
    rimc = Image.new("RGBA", (N, N), (255, 170, 80, 0))
    rimc.putalpha(Image.eval(rim, lambda v: int(v * 0.8)))
    img.paste(fig, (0, 0), fig)
    img.alpha_composite(rimc) if img.mode == "RGBA" else img.paste(rimc, (0, 0), rimc)


def hands_and_burger(img, burger, scale, dx, rot, hands="sleeve"):
    b = Image.open(f"{OUT}/{burger}.png")
    w = int(N * scale)
    b = b.resize((w, int(b.height * w / b.width)), Image.LANCZOS).rotate(rot, expand=True, resample=Image.BICUBIC)
    x = N // 2 - b.width // 2 + dx
    y = N - b.height - 150
    d = ImageDraw.Draw(img)
    skin = (92, 60, 42)
    if hands:
        # open palm under the bun, wrist going down out of frame
        px, py = x + b.width // 2, y + int(b.height * 0.92)
        d.polygon([(px - 110, py), (px + 110, py), (px + 150, N), (px - 150, N)], fill=(220, 220, 226) if hands == "sleeve" else (30, 30, 36))
        d.ellipse((px - int(b.width * 0.42), py - 60, px + int(b.width * 0.42), py + 70), fill=skin)
    else:
        d.ellipse((x - 40, y + int(b.height * 0.8), x + b.width + 40, y + b.height + 60), fill=(26, 20, 18))
        d.ellipse((x - 10, y + int(b.height * 0.82), x + b.width + 10, y + b.height + 30), fill=(150, 40, 20))
    sh = Image.new("RGBA", b.size, (0, 0, 0, 0))
    sh.putalpha(b.split()[3].filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * 0.6)))
    img.paste(sh, (x + 20, y + 40), sh)
    img.paste(b, (x, y), b)
    if hands:
        # thumb over the front of the bottom bun
        tx = x + int(b.width * (0.18 if dx < 0 else 0.82))
        d.rounded_rectangle((tx - 34, y + int(b.height * 0.6), tx + 34, y + int(b.height * 0.95)), 30, fill=skin)


def fisheye(img, k=0.42):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    n = 1100
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    dx, dy = (xx - n / 2) / (n / 2), (yy - n / 2) / (n / 2)
    r = np.hypot(dx, dy)
    f = 1 + k * r * r
    sx = N / 2 + dx / f * (N / 2) * 1.32
    sy = N / 2 + dy / f * (N / 2) * 1.32
    out = np.zeros((n, n, 3), np.float32)
    for c, shift in enumerate((1.006, 1.0, 0.994)):  # slight chromatic aberration
        X = np.clip(N / 2 + (sx - N / 2) * shift, 0, N - 1).astype(int)
        Y = np.clip(N / 2 + (sy - N / 2) * shift, 0, N - 1).astype(int)
        out[..., c] = a[Y, X, c]
    vig = np.clip(1.12 - r ** 2.4, 0, 1) ** 0.8
    out *= vig[..., None]
    out += rng.normal(0, 7, out.shape)
    alpha = np.clip((1.0 - r) * 60, 0, 1) * 255
    res = np.dstack([np.clip(out, 0, 255), alpha]).astype(np.uint8)
    return Image.fromarray(res, "RGBA")


SLIDES = [
    (1, "10", "cap", "burger_chk", 0.36, -300, -8, 300),
    (2, "5", "plain", "burger_egg", 0.34, 300, 6, 1100),
    (3, "8", "hood", "burger_chk", 0.36, -300, 8, 320),
    (4, "15", "beanie", "burger_egg", 0.34, 300, -6, 1080),
    (5, "22", "plain", "burger_chk", 0.36, -300, -4, 700),
    (6, "", "coach", "burger_both", 0.5, 0, 0, 420),
]
for idx, num, kind, burger, sc, dx, rot, lamp in SLIDES:
    img = background(lamp).convert("RGBA")
    figure(img, num, kind, lamp, dx)
    hands_and_burger(img, burger, sc, dx, rot, "coat" if kind == "coach" else "sleeve")
    fisheye(img).save(f"{OUT}/scene_{idx}.png")
    print("scene", idx)

# cover: just the burgers lit by the porch lamp
img = background(700).convert("RGBA")
hands_and_burger(img, "burger_both", 0.8, 0, 0, None)
fisheye(img).save(f"{OUT}/scene_0.png")

# logo cut-out from the dark leather background
lg = Image.open(f"{OUT}/logo_full.png").convert("RGB").crop((215, 70, 810, 740))
a = np.asarray(lg).astype(np.float32) / 255
v = a.max(2)
alpha = np.clip((v - 0.33) / 0.2, 0, 1)
lg.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1)))
lg.save(f"{OUT}/logo.png")
print("done")
