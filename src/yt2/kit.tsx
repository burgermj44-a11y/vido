/* Paper kit shared by the YouTube explainers (16:9). Assets live in public/<dir>/. */
import React from "react";
import { Audio, Easing, Img, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DIR = "yt2";

export const HAND = '"ArefRuqaa", "CairoBlack", serif';
let handLoaded = false;
export const loadHand = () => {
  if (handLoaded || typeof window === "undefined") return;
  handLoaded = true;
  const h = delayRender("Loading Aref Ruqaa");
  Promise.all(
    [
      ["aref-ruqaa-arabic-700-normal.woff2", "U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F"],
      ["aref-ruqaa-latin-700-normal.woff2", "U+0000-00FF"],
    ].map(([file, range]) =>
      new FontFace("ArefRuqaa", `url(${staticFile(`${DIR}/${file}`)}) format("woff2")`, { unicodeRange: range, weight: "700" })
        .load()
        .then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};

export const INK = "#1F1F24";
export const PEN = "#2B59C3";
export const RED = "#D7322F";
export const TOMATO = "#E8402F";
export const GREEN = "#2E9E5B";
export const LEAF = "#3E9B3A";
export const GOLD = "#FFC93C";
export const MARKER = "#FFE14D";
export const MJ_GOLD = "linear-gradient(180deg, #FFE68A 0%, #FFC93C 45%, #E09A00 100%)";

export const sec = (s: number) => Math.round(s * FPS);
export const icon = (c: string) => staticFile(`${DIR}/img/${c}.svg`);
export const sfx = (n: string) => staticFile(`${DIR}/sfx/${n}.wav`);
export const tex = (n: "white" | "kraft" | "notebook") => staticFile(`${DIR}/paper_${n}.jpg`);
export const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};
export const onTwos = (f: number) => f - (f % 2);
export const jitter = (f: number, seed: number, a = 1) => (rand(seed + Math.floor(f / 4)) - 0.5) * 2 * a;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (f: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

const tornMask = (seed: number, amp = 9) => {
  const pts: string[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 1000},${amp + (rand(seed + i) - 0.5) * amp * 1.6}`);
  for (let i = 0; i <= 10; i++) pts.push(`${1000 - amp * 0.4 - rand(seed + 50 + i) * amp * 0.8},${(i / 10) * 200}`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 1000},${200 - amp - (rand(seed + 100 + i) - 0.5) * amp * 1.6}`);
  for (let i = 10; i >= 0; i--) pts.push(`${amp * 0.4 + rand(seed + 150 + i) * amp * 0.8},${(i / 10) * 200}`);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 200' preserveAspectRatio='none'><polygon points='${pts.join(" ")}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};
const MASKS = [1, 2, 3, 4, 5, 6].map((s) => tornMask(s * 13));
export const maskStyle = (i: number): React.CSSProperties => ({
  maskImage: MASKS[Math.abs(i) % MASKS.length],
  WebkitMaskImage: MASKS[Math.abs(i) % MASKS.length],
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});

export const Sfx: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 0.25 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={sfx(name)} volume={vol} />
  </Sequence>
);

export const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 130, rot = -8 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 18,
      width: w,
      height: 36,
      background: "rgba(255,243,190,0.8)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      transform: `rotate(${rot}deg)`,
      ...maskStyle(2),
    }}
  />
);

export const Sheet: React.FC<{ w: number; h: number; tx?: "white" | "kraft"; seed?: number; children?: React.ReactNode; tint?: string; style?: React.CSSProperties }> = ({
  w,
  h,
  tx = "white",
  seed = 0,
  children,
  tint,
  style,
}) => (
  <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 12px 14px rgba(60,40,20,0.28))", ...style }}>
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: tint, ...maskStyle(seed) }}>
      <Img src={tex(tx)} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: tint ? "multiply" : "normal" }} />
    </div>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

/* paper element that unfolds in (hinged at the bottom) */
export const Unfold: React.FC<{ x: number; y: number; delay?: number; rot?: number; seed?: number; children: React.ReactNode; sound?: string | null; vol?: number }> = ({
  x,
  y,
  delay = 0,
  rot = 0,
  seed = 1,
  children,
  sound = "paper_fold",
  vol = 0.2,
}) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - delay), fps: FPS, config: { damping: 13, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={delay} name={sound} vol={vol} />}
      {frame >= delay && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1000, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${rot + jitter(frame, seed, 0.7)}deg)` }}>{children}</div>
        </div>
      )}
    </>
  );
};

export const stickerFilter = (o: number) =>
  `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff) drop-shadow(0 8px 8px rgba(60,40,20,0.35))`;

export const Sticker: React.FC<{ code: string; x: number; y: number; size: number; delay?: number; rot?: number; seed?: number; sound?: string | null }> = ({
  code,
  x,
  y,
  size,
  delay = 0,
  rot = 0,
  seed = 1,
  sound,
}) => (
  <Unfold x={x} y={y} delay={delay} rot={rot} seed={seed} sound={sound}>
    <Img src={icon(code)} style={{ width: size, height: size, filter: stickerFilter(Math.max(4, size / 34)) }} />
  </Unfold>
);

export const Hand: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 64, color = INK, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.25, ...style }}>
    {children}
  </div>
);

export const Bold: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 64, color = INK, style }) => (
  <div dir="rtl" style={{ fontFamily: FONT, fontSize: size, color, lineHeight: 1.3, ...style }}>
    {children}
  </div>
);

export const Label: React.FC<{ text: string; x: number; y: number; delay?: number; size?: number; tx?: "white" | "kraft"; color?: string; seed?: number; rot?: number }> = ({
  text,
  x,
  y,
  delay = 0,
  size = 60,
  tx = "white",
  color = INK,
  seed = 3,
  rot = -1.2,
}) => {
  const w = Math.min(1300, 120 + text.length * size * 0.46);
  return (
    <Unfold x={x} y={y} delay={delay} rot={rot} seed={seed} sound="paper_rustle">
      <Sheet w={w} h={size * 1.8} tx={tx} seed={seed}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Hand size={size} color={color}>
            {text}
          </Hand>
        </div>
        <Tape x={w / 2} y={4} />
      </Sheet>
    </Unfold>
  );
};

export const Stamp: React.FC<{ text: string; x: number; y: number; delay: number; color?: string; rot?: number; size?: number }> = ({
  text,
  x,
  y,
  delay,
  color = RED,
  rot = -10,
  size = 80,
}) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: FPS, config: { damping: 8, stiffness: 260 } });
  return (
    <>
      <Sfx at={delay} name="mj_hit" vol={0.18} />
      {frame >= delay && (
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [2, 1])}) rotate(${rot}deg)`,
            opacity: Math.min(1, p * 2),
            fontFamily: HAND,
            fontWeight: 700,
            fontSize: size,
            color,
            border: `8px solid ${color}`,
            borderRadius: 18,
            padding: "0 30px 6px",
            background: "rgba(255,255,255,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

/* card with an icon and a handwritten title */
export const Card: React.FC<{ x: number; y: number; delay: number; title: string; sub?: string; code?: string; seed: number; w?: number; h?: number; color?: string; tx?: "white" | "kraft" }> = ({
  x,
  y,
  delay,
  title,
  sub,
  code,
  seed,
  w = 420,
  h = 400,
  color = INK,
  tx = "white",
}) => (
  <Unfold x={x} y={y} delay={delay} rot={seed % 2 ? 2 : -2} seed={seed}>
    <Sheet w={w} h={h} seed={seed} tx={tx}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 20 }}>
        {code && <Img src={icon(code)} style={{ width: h * 0.38, height: h * 0.38 }} />}
        <Hand size={Math.min(64, (w - 40) / Math.max(4, title.length * 0.5))} color={color} style={{ textAlign: "center" }}>
          {title}
        </Hand>
        {sub && (
          <Hand size={36} color="#666" style={{ textAlign: "center" }}>
            {sub}
          </Hand>
        )}
      </div>
      <Tape x={w / 2} y={8} />
    </Sheet>
  </Unfold>
);

export const NumberBadge: React.FC<{ n: number | string; x: number; y: number; delay: number; size?: number; seed?: number }> = ({ n, x, y, delay, size = 220, seed = 1 }) => (
  <Unfold x={x} y={y} delay={delay} rot={seed % 2 ? -4 : 4} seed={seed}>
    <Sheet w={size} h={size} tx="kraft" seed={seed}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Hand size={size * 0.62}>{n}</Hand>
      </div>
      <Tape x={size / 2} y={6} w={size * 0.5} />
    </Sheet>
  </Unfold>
);

/* hand-drawn check / cross that draws itself */
export const DrawMark: React.FC<{ kind: "check" | "cross"; x: number; y: number; size: number; at: number; color?: string }> = ({ kind, x, y, size, at, color }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, at + 10);
  if (p <= 0) return null;
  const c = color ?? (kind === "check" ? GREEN : RED);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible" }}>
      {kind === "check" ? (
        <path d="M12 55 L40 82 L90 16" fill="none" stroke={c} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
      ) : (
        <path d="M15 15 L85 85 M85 15 L15 85" fill="none" stroke={c} strokeWidth="13" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
      )}
    </svg>
  );
};
