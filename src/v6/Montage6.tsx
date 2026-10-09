/*
 * Video 6: paper / cut-out style.
 * - notebook paper background, the speaker as a white-bordered cut-out
 * - stickers are paper cut-outs that unfold open and fold closed (on twos)
 * - each caption line sits on a torn paper strip, text plain and dark
 * - full-screen paper sheets sweep across at section changes
 */
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption } from "../script";
import { FONT, loadFonts } from "../fonts";
import { CAPTIONS5, Scene5 } from "../v5/script5";
import { HomeScene, SchoolScene, StageScene } from "./Dioramas";
import { DIORAMAS, FPS6, SCENES6, SFX6, WIPES6, WIPE_FRAMES } from "./script6";

loadFonts();

/* handwritten font for labels */
const HAND = '"ArefRuqaa", "CairoBlack", serif';
let handLoaded = false;
const loadHand = () => {
  if (handLoaded || typeof window === "undefined") return;
  handLoaded = true;
  const h = delayRender("Loading Aref Ruqaa");
  Promise.all(
    [
      ["aref-ruqaa-arabic-700-normal.woff2", "U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF, U+200C-200F"],
      ["aref-ruqaa-latin-700-normal.woff2", "U+0000-00FF"],
    ].map(([file, range]) =>
      new FontFace("ArefRuqaa", `url(${staticFile(`v6/${file}`)}) format("woff2")`, { unicodeRange: range, weight: "700" })
        .load()
        .then((ff) => document.fonts.add(ff)),
    ),
  )
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
};
loadHand();

const INK = "#1F1F24";
const PEN = "#2B59C3";
const RED_PEN = "#D7322F";
const MARKER = "#FFE14D";
const SFX_GAIN = 0.22;
// paper sounds are soft by nature, so they get a little more level
const PAPER_GAIN = 0.32;

const sec = (s: number) => Math.round(s * FPS6);
const icon = (code: string) => staticFile(`v6/img/${code}.svg`);
const pad4 = (n: number) => String(n).padStart(4, "0");

/* deterministic random */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};

/* torn-edge masks (stretched to any size) */
const tornMask = (seed: number, amp = 9) => {
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) pts.push(`${(i / steps) * 1000},${amp + (rand(seed + i) - 0.5) * amp * 1.6}`);
  for (let i = 0; i <= 10; i++) pts.push(`${1000 - amp * 0.4 - rand(seed + 50 + i) * amp * 0.8},${(i / 10) * 200}`);
  for (let i = steps; i >= 0; i--) pts.push(`${(i / steps) * 1000},${200 - amp - (rand(seed + 100 + i) - 0.5) * amp * 1.6}`);
  for (let i = 10; i >= 0; i--) pts.push(`${amp * 0.4 + rand(seed + 150 + i) * amp * 0.8},${(i / 10) * 200}`);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 200' preserveAspectRatio='none'><polygon points='${pts.join(" ")}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};
const MASKS = [1, 2, 3, 4, 5, 6].map((s) => tornMask(s * 13));

/* stop-motion helpers: animate on twos, small jitter every 4 frames */
const onTwos = (frame: number) => frame - (frame % 2);
const jitter = (frame: number, seed: number, amount = 1.2) => (rand(seed + Math.floor(frame / 4)) - 0.5) * 2 * amount;

/* ---------------- depth layers ---------------- */
type Layer = "back" | "front";
const LayerCtx = createContext<Layer>("back");
const useLayer = () => useContext(LayerCtx);

/* ---------------- dioramas: when is the room replaced by paper ---------------- */
const useDiorama = () => {
  const frame = useCurrentFrame();
  let v = 0;
  for (const d of DIORAMAS) {
    const a = sec(d.start);
    const b = sec(d.end);
    v = Math.max(v, interpolate(frame, [a, a + 8, b - 8, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return v;
};

/* ---------------- zoom shared by the real background and the cut-out ---------------- */
const useZoom = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = SCENES6.findIndex((s) => t >= s.start && t < s.end);
  if (idx < 0) idx = SCENES6.length - 1;
  const scene = SCENES6[idx];
  const prev = idx > 0 ? SCENES6[idx - 1].zoom : scene.zoom;
  const local = frame - sec(scene.start);
  const snap = spring({ frame: local, fps, config: { damping: 18, stiffness: 220 } });
  const drift = interpolate(local, [0, sec(scene.end - scene.start)], [0, 0.035], { extrapolateRight: "clamp" });
  return interpolate(snap, [0, 1], [prev, scene.zoom]) + drift;
};

const videoStyle = (zoom: number): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: `scale(${zoom})`,
  transformOrigin: "50% 38%",
  filter: "saturate(1.1) contrast(1.05)",
});

/* the real room stays as the background */
const RealBackground: React.FC = () => {
  const zoom = useZoom();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("v5/source.mp4")} muted style={videoStyle(zoom)} />
    </AbsoluteFill>
  );
};

const Dioramas: React.FC = () => (
  <>
    {DIORAMAS.map((d) => {
      const dur = sec(d.end - d.start);
      const C = d.kind === "school" ? SchoolScene : d.kind === "home" ? HomeScene : StageScene;
      return (
        <Sequence key={d.kind} from={sec(d.start)} durationInFrames={dur} layout="none">
          <C dur={dur} />
        </Sequence>
      );
    })}
  </>
);

/* speaker on top of the graphics; in diorama moments he becomes a paper cut-out */
const SpeakerCutout: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = useZoom();
  const dio = useDiorama();
  const matte = `url(${staticFile(`v5/matte/${pad4(Math.min(frame, 956))}.jpg`)})`;
  const o = 7 * dio;
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        filter:
          dio > 0.01
            ? `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff) drop-shadow(0 18px 22px rgba(40,25,10,${0.4 * dio}))`
            : "none",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "50% 38%",
          maskImage: matte,
          WebkitMaskImage: matte,
          maskMode: "luminance",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        <OffthreadVideo src={staticFile("v5/source.mp4")} muted style={{ ...videoStyle(1), transform: "none" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* soft vignette over the real room (not over the paper scenes) */
const Shade: React.FC = () => {
  const dio = useDiorama();
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - dio,
        background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
      }}
    />
  );
};

/* ---------------- paper building blocks ---------------- */

const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 120, rot = -8 }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - 18,
      width: w,
      height: 36,
      background: "rgba(255,243,190,0.78)",
      boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
      transform: `rotate(${rot}deg)`,
      maskImage: MASKS[2],
      WebkitMaskImage: MASKS[2],
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
    }}
  />
);

/* a torn sheet of paper of any size */
const Sheet: React.FC<{
  w: number;
  h: number;
  tex?: "white" | "kraft";
  seed?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ w, h, tex = "white", seed = 0, children, style }) => (
  <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 10px 12px rgba(60,40,20,0.3))", ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        maskImage: MASKS[seed % MASKS.length],
        WebkitMaskImage: MASKS[seed % MASKS.length],
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        overflow: "hidden",
      }}
    >
      <Img src={staticFile(`v6/paper_${tex}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

/* unfold-in / stop-motion wrapper */
const usePaperIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: onTwos(frame - delay), fps, config: { damping: 13, stiffness: 170 } });
};

/* emoji as a paper cut-out sticker: unfolds like a paper flap */
const PaperSticker: React.FC<{ code: string; x: number; y: number; size: number; delay?: number; rot?: number; seed?: number }> = ({
  code,
  x,
  y,
  size,
  delay = 0,
  rot = 0,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const p = usePaperIn(delay);
  if (useLayer() !== "back" || frame < delay) return null;
  const o = Math.max(4, size / 36);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, perspective: 900 }}>
      <Img
        src={icon(code)}
        style={{
          width: "100%",
          height: "100%",
          transformOrigin: "50% 100%",
          transform: `rotateX(${(1 - p) * 92}deg) rotate(${rot + jitter(frame, seed)}deg)`,
          filter: `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff) drop-shadow(0 8px 8px rgba(60,40,20,0.35))`,
        }}
      />
    </div>
  );
};

/* handwritten label on a torn strip with tape */
const PaperLabel: React.FC<{ text: string; y?: number; delay?: number; tex?: "white" | "kraft"; color?: string; size?: number; seed?: number }> = ({
  text,
  y = 40,
  delay = 0,
  tex = "white",
  color = INK,
  size = 80,
  seed = 3,
}) => {
  const frame = useCurrentFrame();
  const p = usePaperIn(delay);
  if (useLayer() !== "front" || frame < delay) return null;
  const w = Math.min(960, 120 + text.length * size * 0.44);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", perspective: 900 }}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - p) * -95}deg) rotate(${-1.5 + jitter(frame, seed, 0.8)}deg)` }}>
        <Sheet w={w} h={size * 1.75} tex={tex} seed={seed}>
          <div
            dir="rtl"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: HAND,
              fontWeight: 700,
              fontSize: size,
              color,
              paddingBottom: 6,
            }}
          >
            {text}
          </div>
          <Tape x={w / 2} y={4} w={130} rot={-4} />
        </Sheet>
      </div>
    </div>
  );
};

/* ---------------- captions on torn paper strips ---------------- */
const PaperCaption: React.FC<{ cap: Caption; idx: number }> = ({ cap, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = cap.text.split(" ");
  const total = sec(cap.end - cap.start);
  const per = (total * 0.85) / words.length;
  const inP = spring({ frame: onTwos(frame), fps, config: { damping: 14, stiffness: 200 } });
  const out = interpolate(frame, [total - 4, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = (idx % 2 ? 1.4 : -1.4) + jitter(frame, idx * 7, 0.4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 1360, left: 50, right: 50, display: "flex", justifyContent: "center", perspective: 1000 }}>
        <div
          style={{
            position: "relative",
            transformOrigin: "50% 0%",
            transform: `rotateX(${(1 - inP) * -90 + (1 - out) * 90}deg) rotate(${rot}deg)`,
            filter: "drop-shadow(0 10px 12px rgba(40,30,20,0.35))",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              maskImage: MASKS[idx % MASKS.length],
              WebkitMaskImage: MASKS[idx % MASKS.length],
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              overflow: "hidden",
            }}
          >
            <Img src={staticFile("v6/paper_white.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div
            dir="rtl"
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 18px",
              padding: "14px 46px 22px",
              maxWidth: 900,
            }}
          >
            {words.map((w, i) => {
              const start = Math.floor(i * per);
              const active = words.length > 1 && frame >= start && frame < Math.floor((i + 1) * per) + 2;
              const isHl = cap.hl?.includes(w);
              const marker = interpolate(frame - start, [0, 6], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontSize: words.length === 1 ? 92 : 60,
                    lineHeight: 1.35,
                    color: active ? PEN : INK,
                    backgroundImage: isHl ? `linear-gradient(transparent 40%, ${MARKER} 40%, ${MARKER} 92%, transparent 92%)` : "none",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right",
                    backgroundSize: isHl ? `${frame >= start ? marker : 0}% 100%` : "auto",
                    padding: isHl ? "0 6px" : 0,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
          <Tape x={70} y={8} w={90} rot={-20} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- full-screen paper sheet transition ---------------- */
const PaperWipe: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const t = onTwos(frame) / WIPE_FRAMES;
  const x = interpolate(t, [0, 1], [1150, -1700]);
  const rot = interpolate(t, [0, 1], [8, -6]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: -200, transform: `rotate(${rot}deg)` }}>
        <Sheet w={1600} h={2400} tex={seed % 2 ? "kraft" : "white"} seed={seed}>
          {seed % 2 === 0 &&
            Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 120 + i * 76, height: 3, background: "rgba(120,160,215,0.45)" }} />
            ))}
        </Sheet>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- scenes ---------------- */

const Dad: React.FC = () => (
  <>
    <PaperSticker code="1f468-200d-1f466" x={540} y={300} size={300} delay={2} seed={1} />
    <PaperSticker code="1f4ac" x={860} y={200} size={150} delay={8} rot={10} seed={2} />
    <PaperLabel text="كلام باباك" delay={6} />
  </>
);

const Easy: React.FC = () => (
  <>
    <PaperSticker code="1f4c8" x={540} y={300} size={290} delay={2} seed={3} />
    <PaperSticker code="1f60e" x={880} y={470} size={150} delay={8} rot={10} seed={4} />
    <PaperLabel text="المعدل عادي" delay={5} tex="kraft" />
  </>
);

const Secret: React.FC = () => (
  <>
    <PaperSticker code="1f92b" x={540} y={300} size={290} delay={2} seed={5} />
    <PaperSticker code="1f512" x={190} y={470} size={140} delay={10} rot={-10} seed={6} />
    <PaperLabel text="حتى واحد ما يقولهالك" delay={6} color={RED_PEN} />
  </>
);

const Gift: React.FC = () => (
  <>
    <PaperSticker code="1f381" x={540} y={300} size={290} delay={2} seed={7} />
    <PaperSticker code="2728" x={200} y={220} size={120} delay={10} rot={-10} seed={8} />
    <PaperSticker code="2728" x={880} y={220} size={120} delay={14} rot={10} seed={9} />
    <PaperLabel text="نعطيهالك أنا" delay={6} tex="kraft" />
  </>
);

/* share: a paper button, paper planes fly to friends */
const PaperShare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = usePaperIn(1);
  const layer = useLayer();
  const friends = [
    { code: "1f468-200d-1f393", x: 150, y: 260 },
    { code: "1f469-200d-1f393", x: 930, y: 260 },
    { code: "1f929", x: 160, y: 520 },
    { code: "1f465", x: 920, y: 520 },
  ];
  const cx = 540;
  const cy = 290;
  return (
    <>
      {layer === "back" && (
        <>
          <div style={{ position: "absolute", left: cx - 150, top: cy - 150, perspective: 900 }}>
            <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${jitter(frame, 31)}deg)` }}>
              <Sheet w={300} h={300} tex="kraft" seed={4} style={{ borderRadius: 999 }}>
                <svg width="300" height="300" viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
                  <path
                    d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z"
                    fill="white"
                    stroke={INK}
                    strokeWidth="0.6"
                    strokeLinejoin="round"
                  />
                </svg>
                <Tape x={150} y={10} w={110} rot={6} />
              </Sheet>
            </div>
          </div>
          {friends.map((fr, i) => {
            const launch = 14 + i * 3;
            const t = spring({ frame: onTwos(frame - launch), fps, config: { damping: 200 }, durationInFrames: 14 });
            const arrived = frame >= launch + 14;
            const px = interpolate(t, [0, 1], [cx, fr.x]);
            const py = interpolate(t, [0, 1], [cy, fr.y]) - Math.sin(t * Math.PI) * 90;
            const ang = (Math.atan2(fr.y - cy, fr.x - cx) * 180) / Math.PI + 45;
            return (
              <React.Fragment key={i}>
                {frame >= launch && !arrived && (
                  <svg width="100" height="100" viewBox="0 0 24 24" style={{ position: "absolute", left: px - 50, top: py - 50, transform: `rotate(${ang}deg)`, filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.3))" }}>
                    <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
                    <path d="M11.5 13.2 22 3" stroke={INK} strokeWidth="0.8" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
      {friends.map((fr, i) => (
        <PaperSticker key={i} code={fr.code} x={fr.x} y={fr.y} size={150} delay={28 + i * 3} seed={40 + i} />
      ))}
      <PaperLabel text="بارطاجي مع صحابك" delay={5} />
    </>
  );
};

const Life: React.FC = () => (
  <>
    <PaperSticker code="1f31f" x={540} y={300} size={280} delay={2} seed={11} />
    <PaperLabel text="تفيدك في حياتك" delay={5} tex="kraft" />
  </>
);

/* number cut from kraft paper, taped on */
const PaperNumber: React.FC<{ n: number; delay?: number }> = ({ n, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = usePaperIn(delay);
  if (useLayer() !== "back") return null;
  return (
    <div style={{ position: "absolute", left: 540 - 160, top: 130, perspective: 900 }}>
      <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${-4 + jitter(frame, n * 5)}deg)` }}>
        <Sheet w={320} h={320} tex="kraft" seed={n}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HAND, fontWeight: 700, fontSize: 250, color: INK, lineHeight: 1 }}>
            {n}
          </div>
          <Tape x={160} y={8} w={140} rot={-6} />
        </Sheet>
      </div>
    </div>
  );
};

const Point1: React.FC = () => (
  <>
    <PaperNumber n={1} />
    <PaperSticker code="1f3eb" x={180} y={480} size={150} delay={6} rot={-10} seed={12} />
    <PaperSticker code="1f468-200d-1f3eb" x={900} y={480} size={150} delay={10} rot={10} seed={13} />
    <PaperLabel text="من المسيد" delay={4} />
  </>
);

const Point2: React.FC = () => (
  <>
    <PaperNumber n={2} delay={1} />
    <PaperSticker code="1f3e0" x={180} y={480} size={150} delay={6} rot={-10} seed={14} />
    <PaperSticker code="1f4da" x={900} y={480} size={150} delay={10} rot={10} seed={15} />
    <PaperLabel text="المسيد وحدو ما يكفيش" delay={8} color={RED_PEN} />
  </>
);

const Point3: React.FC = () => (
  <>
    <PaperNumber n={3} delay={1} />
    <PaperSticker code="1f3eb" x={180} y={480} size={140} delay={6} rot={-10} seed={16} />
    <PaperSticker code="1f3e0" x={900} y={480} size={140} delay={10} rot={10} seed={17} />
    <PaperLabel text="حتى هاذو ما يكفيوش" delay={8} color={RED_PEN} />
  </>
);

/* index cards: private lessons vs free YouTube lessons */
const IndexCard: React.FC<{ x: number; delay: number; title: string; rot: number; children: React.ReactNode }> = ({ x, delay, title, rot, children }) => {
  const frame = useCurrentFrame();
  const p = usePaperIn(delay);
  if (frame < delay) return null;
  return (
    <div style={{ position: "absolute", left: x - 170, top: 130, perspective: 900 }}>
      <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${rot + jitter(frame, x)}deg)` }}>
        <Sheet w={340} h={310} seed={Math.round(x / 100)}>
          <div style={{ position: "absolute", left: 20, right: 20, top: 70, height: 3, background: "rgba(215,50,47,0.5)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 20 }}>
            {children}
            <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: 58, color: INK }}>
              {title}
            </div>
          </div>
          <Tape x={170} y={6} w={120} rot={rot} />
        </Sheet>
      </div>
    </div>
  );
};

const Lessons: React.FC = () => {
  const layer = useLayer();
  const youAt = Math.round((25.6 - 24.0) * FPS6);
  return (
    <>
      {layer === "back" && (
        <>
          <IndexCard x={300} delay={3} title="الكور" rot={-5}>
            <Img src={icon("1f468-200d-1f3eb")} style={{ width: 140, height: 140 }} />
          </IndexCard>
          <IndexCard x={780} delay={youAt} title="يوتيوب" rot={5}>
            <svg width="160" height="120" viewBox="0 0 160 120">
              <rect x="6" y="10" width="148" height="100" rx="30" fill="#E53935" stroke={INK} strokeWidth="4" />
              <path d="M66 38 L66 82 L104 60 Z" fill="white" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </IndexCard>
        </>
      )}
      <Sequence from={youAt} layout="none">
        <PaperLabel text="حصص مجانية" y={480} delay={4} size={62} tex="kraft" />
      </Sequence>
    </>
  );
};

/* exercise sheets fanning out */
const Exercises: React.FC = () => {
  const frame = useCurrentFrame();
  const layer = useLayer();
  return (
    <>
      {layer === "back" &&
        [0, 1, 2].map((i) => {
          const p = spring({ frame: onTwos(frame - 4 - i * 4), fps: FPS6, config: { damping: 12, stiffness: 200 } });
          return (
            <div key={i} style={{ position: "absolute", left: 540 - 130 + (i - 1) * 160, top: 120 + Math.abs(i - 1) * 30, perspective: 900 }}>
              <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${(i - 1) * 11 + jitter(frame, 60 + i)}deg)` }}>
                <Sheet w={260} h={330} seed={i + 2}>
                  <div dir="rtl" style={{ position: "absolute", top: 24, right: 26, fontFamily: HAND, fontWeight: 700, fontSize: 40, color: PEN }}>
                    سيري {i + 1}
                  </div>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <div key={k} style={{ position: "absolute", right: 26, top: 100 + k * 40, height: 4, borderRadius: 2, background: k === 0 ? PEN : "rgba(31,31,36,0.35)", width: `${70 - k * 7}%` }} />
                  ))}
                </Sheet>
              </div>
            </div>
          );
        })}
      <PaperSticker code="270d" x={890} y={490} size={140} delay={12} rot={10} seed={20} />
      <PaperLabel text="السيريات" delay={2} />
    </>
  );
};

/* exam sheet: 17/20 written in red, then circled */
const Seventeen: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePaperIn(0);
  const n = Math.round(interpolate(frame, [0, 18], [0, 17], { extrapolateRight: "clamp" }));
  const circle = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const layer = useLayer();
  return (
    <>
      {layer === "back" && (
        <div style={{ position: "absolute", left: 540 - 260, top: 90, perspective: 1000 }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${-4 + jitter(frame, 77)}deg)` }}>
            <Sheet w={520} h={380} seed={5}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: 30, right: 30, top: 70 + i * 52, height: 2, background: "rgba(120,160,215,0.5)" }} />
              ))}
              <div dir="rtl" style={{ position: "absolute", top: 18, right: 34, fontFamily: HAND, fontWeight: 700, fontSize: 46, color: INK }}>
                المعدل
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: HAND, fontWeight: 700, fontSize: 200, color: RED_PEN, lineHeight: 1.2 }}>
                {n}/20
              </div>
              <svg width="520" height="380" viewBox="0 0 520 380" style={{ position: "absolute", inset: 0 }}>
                <ellipse
                  cx="262"
                  cy="210"
                  rx="215"
                  ry="120"
                  fill="none"
                  stroke={RED_PEN}
                  strokeWidth="7"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - circle}
                  transform="rotate(-6 262 210)"
                />
              </svg>
              <Tape x={70} y={10} w={120} rot={-24} />
              <Tape x={450} y={10} w={120} rot={22} />
            </Sheet>
          </div>
        </div>
      )}
      <PaperSticker code="1f3c6" x={170} y={500} size={150} delay={22} rot={-10} seed={21} />
      <PaperSticker code="1f389" x={910} y={500} size={150} delay={24} rot={10} seed={22} />
    </>
  );
};

const SCENE_COMPONENTS: Record<Scene5["kind"], React.FC> = {
  dad: Dad,
  easy: Easy,
  secret: Secret,
  gift: Gift,
  share: PaperShare,
  life: Life,
  point1: Point1,
  point2: Point2,
  point3: Point3,
  lessons: Lessons,
  series: Exercises,
  seventeen: Seventeen,
};

/* scenes fold closed at their end (paper folding up) */
const SceneFold: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(onTwos(frame), [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ perspective: 1400 }}>
      <AbsoluteFill style={{ transformOrigin: "50% 8%", transform: `rotateX(${o * 88}deg)`, opacity: 1 - o * 0.6 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{ layer: Layer }> = ({ layer }) => (
  <LayerCtx.Provider value={layer}>
    {SCENES6.map((s) => {
      const C = SCENE_COMPONENTS[s.kind];
      const from = s.gfxStart ?? s.start;
      const dur = sec(s.end - from);
      return (
        <Sequence key={s.kind} from={sec(from)} durationInFrames={dur} layout="none">
          <SceneFold dur={dur}>
            <C />
          </SceneFold>
        </Sequence>
      );
    })}
  </LayerCtx.Provider>
);

/* pencil-line progress */
const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 14, left: 30, right: 30, height: 8 }}>
      <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: PEN, borderRadius: 4, opacity: 0.85 }} />
    </div>
  );
};

const sfxSrc = (file: string) => (file.startsWith("v5/") || file.startsWith("v6/") ? `${file.replace("v6/", "v6/sfx/")}.wav` : `sfx/${file}.wav`);

export const Montage6: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#EFE8D8" }}>
    <RealBackground />
    <Dioramas />
    <SceneLayer layer="back" />
    <SpeakerCutout />
    <Shade />
    <SceneLayer layer="front" />
    {CAPTIONS5.map((c, i) => (
      <Sequence key={i} from={sec(c.start)} durationInFrames={Math.max(1, sec(c.end - c.start))} layout="none">
        <PaperCaption cap={c} idx={i} />
      </Sequence>
    ))}
    {WIPES6.map((t, i) => (
      <Sequence key={`w${i}`} from={sec(t) - WIPE_FRAMES / 2} durationInFrames={WIPE_FRAMES} layout="none">
        <PaperWipe seed={i} />
      </Sequence>
    ))}
    <Audio src={staticFile("v5/voice.wav")} />
    {SFX6.map((s, i) => (
      <Sequence key={`sfx-${i}`} from={Math.max(0, sec(s.at))} layout="none">
        <Audio src={staticFile(sfxSrc(s.file))} volume={s.volume * (s.file.startsWith("v6/") ? PAPER_GAIN : SFX_GAIN)} />
      </Sequence>
    ))}
    <Progress />
  </AbsoluteFill>
);
