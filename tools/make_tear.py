# Synthesises paper-tear sound effects (fibre crackle + sharp micro-clicks).
import numpy as np, wave
SR = 44100
def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.8
    with wave.open(f"public/sfx/{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, k): return np.convolve(x, np.ones(k) / k, mode="same")
def bp(x, lo, hi): return lp(x, lo) - lp(x, hi)

def tear(seed, dur, density0, grit):
    rng = np.random.default_rng(seed)
    n = int(SR * dur); t = np.linspace(0, dur, n, endpoint=False)
    noise = rng.normal(0, 1, n)
    body = bp(noise, 3, 40)                               # 1-7 kHz fibrous hiss
    # irregular crackle gate: bursts of micro-fractures
    dens = density0 * (0.35 + 0.65 * np.sin(np.pi * t / dur) ** 0.7)
    gate = (rng.random(n) < dens * 0.02).astype(float)
    gate = lp(gate, 90) * 40
    gate = np.clip(gate, 0, 1)
    clicks = np.zeros(n)
    idx = np.where(rng.random(n) < dens * 0.0012)[0]
    clicks[idx] = rng.choice([-1, 1], len(idx)) * rng.uniform(0.3, 1, len(idx))
    clicks = bp(clicks, 2, 14) * grit
    env = np.minimum(1, t / 0.03) * np.exp(-((t - dur * 0.45) / (dur * 0.38)) ** 2 * 1.2)
    x = (body * (0.25 + 0.75 * gate) + clicks * 6) * env
    x[:int(SR * 0.002)] *= np.linspace(0, 1, int(SR * 0.002))
    x[-int(SR * 0.05):] *= np.linspace(1, 0, int(SR * 0.05))
    return x

save("tear1", tear(1, 0.55, 1.0, 1.0))
save("tear2", tear(2, 0.38, 0.8, 1.2))
# soft paper flap for stickers (replaces the synthetic pop)
rng = np.random.default_rng(5); n = int(SR * 0.16); t = np.linspace(0, .16, n, endpoint=False)
flap = bp(rng.normal(0, 1, n), 4, 60) * np.exp(-t * 28) * np.minimum(1, t / 0.004)
save("flap", flap)
print("ok")
