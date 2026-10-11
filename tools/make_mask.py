# Builds a per-frame person matte (grayscale PNG) so stickers can sit behind the speaker.
import sys, os, cv2, numpy as np, onnxruntime as ort
model, video, outdir = sys.argv[1:4]
limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10**9
os.makedirs(outdir, exist_ok=True)
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
inp = sess.get_inputs()[0].name
cap = cv2.VideoCapture(video)
mean = np.array([0.485, 0.456, 0.406], np.float32); std = np.array([0.229, 0.224, 0.225], np.float32)
prev = None; i = 0
while i < limit:
    ok, fr = cap.read()
    if not ok: break
    rgb = cv2.cvtColor(cv2.resize(fr, (320, 320), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB).astype(np.float32)
    rgb = rgb / max(rgb.max(), 1e-6)
    x = ((rgb - mean) / std).transpose(2, 0, 1)[None].astype(np.float32)
    d = sess.run(None, [{inp: x}][0])[0][0, 0]
    d = (d - d.min()) / max(d.max() - d.min(), 1e-6)
    m = cv2.resize(d, (360, 640), interpolation=cv2.INTER_CUBIC)
    m = np.clip((m - 0.35) / 0.3, 0, 1); m = m * m * (3 - 2 * m)  # smoothstep edge
    if prev is not None: m = 0.7 * m + 0.3 * prev
    prev = m
    cv2.imwrite(f"{outdir}/{i:04d}.png", (m * 255).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
    i += 1
    if i % 100 == 0: print(i, flush=True)
print("frames", i)
