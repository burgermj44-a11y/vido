"""Smooth raw person mattes: 3-frame temporal average, soft threshold, 1.2 px blur."""
import sys, glob, os, numpy as np
from PIL import Image, ImageFilter
inp, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
files = sorted(glob.glob(os.path.join(inp, "*.jpg")))
load = lambda f: np.asarray(Image.open(f).convert("L")).astype(np.float32) / 255
for i, f in enumerate(files):
    stack = [load(files[j]) for j in (max(0, i - 1), i, min(len(files) - 1, i + 1))]
    m = stack[0] * 0.25 + stack[1] * 0.5 + stack[2] * 0.25
    m = np.clip((m - 0.35) / 0.3, 0, 1)
    Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)).save(os.path.join(out, os.path.basename(f)), quality=90)
