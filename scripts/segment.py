import sys, numpy as np, onnxruntime as ort
from PIL import Image
model, size, inp, out = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
name = sess.get_inputs()[0].name
def mask(img):
    im = img.convert("RGB").resize((size, size), Image.BILINEAR)
    a = np.asarray(im).astype(np.float32) / 255.0
    if "isnet" in model:
        a = (a - 0.5) / 1.0
    else:
        a = (a - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    a = a.transpose(2, 0, 1)[None].astype(np.float32)
    p = sess.run(None, {name: a})[0][0, 0]
    p = (p - p.min()) / (p.max() - p.min() + 1e-8)
    return Image.fromarray((p * 255).astype(np.uint8)).resize(img.size, Image.BILINEAR)
import glob, os
files = sorted(glob.glob(os.path.join(inp, "*.png"))) if os.path.isdir(inp) else [inp]
os.makedirs(out, exist_ok=True)
for f in files:
    img = Image.open(f)
    m = mask(img).resize((540, 960), Image.BILINEAR)
    m.save(os.path.join(out, os.path.basename(f).replace(".png", ".jpg")), quality=90)
