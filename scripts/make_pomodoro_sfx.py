"""Extra sounds for the Pomodoro video: clock tick, kitchen-timer wind-up,
timer bell ring, soft click, sparkle. Usage: python3 make_pomodoro_sfx.py <out_dir>"""
import os
import sys
import wave

import numpy as np

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
SR = 44100
rng = np.random.default_rng(7)


def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    w = wave.open(os.path.join(out, name + ".wav"), "wb")
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
    w.close()


def t(sec):
    return np.arange(int(sec * SR)) / SR


# tick: short woody click
tt = t(0.06)
tick = (np.sin(2 * np.pi * 2400 * tt) * 0.6 + rng.standard_normal(len(tt)) * 0.4) * np.exp(-tt * 140)
save("tick", tick)

# tick-tock loop (1 s): tick + lower tock
loop = np.zeros(int(SR * 1.0))
loop[: len(tick)] += tick
tock = (np.sin(2 * np.pi * 1700 * tt) * 0.6 + rng.standard_normal(len(tt)) * 0.3) * np.exp(-tt * 150) * 0.8
loop[int(0.5 * SR) : int(0.5 * SR) + len(tock)] += tock
save("ticktock", loop)

# wind-up: fast ratchet clicks over 0.7 s
wind = np.zeros(int(0.75 * SR))
for k in range(18):
    i = int(k * 0.04 * SR)
    c = (rng.standard_normal(len(tt)) * 0.7 + np.sin(2 * np.pi * 3200 * tt) * 0.3) * np.exp(-tt * 260)
    wind[i : i + len(c)] += c * (0.6 + 0.4 * rng.random())
save("windup", wind)

# bell ring: metallic partials with fast tremolo clapper, 1.6 s
tb = t(1.6)
bell = sum(a * np.sin(2 * np.pi * f * tb) for f, a in [(2100, 1), (2630, 0.6), (3570, 0.4), (5230, 0.2)])
clap = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 24 * tb))
env = np.minimum(1, tb / 0.005) * np.where(tb < 1.0, 1, np.exp(-(tb - 1.0) * 8))
save("ring", bell * clap * env)

# soft click (button)
tc = t(0.05)
save("click", (np.sin(2 * np.pi * 1200 * tc) + rng.standard_normal(len(tc)) * 0.3) * np.exp(-tc * 120))

# sparkle: rising bright pings
sp = np.zeros(int(0.9 * SR))
for k, f in enumerate([1800, 2400, 3000, 3600, 4300]):
    tp = t(0.4)
    p = np.sin(2 * np.pi * f * tp) * np.exp(-tp * 12)
    i = int(k * 0.08 * SR)
    sp[i : i + len(p)] += p * 0.5
save("sparkle", sp)
print("ok")
