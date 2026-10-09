/*
 * YouTube video 1 (16:9): "how to review the right way" – active recall +
 * spaced repetition. Paper style, MSA narration (piper TTS), subtitles on
 * torn strips, MJ transitions between sections, calm study music.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, loadFonts } from "../fonts";
import { LINES, YT1_DURATION } from "./timing";

loadFonts();

export const YT1_FPS = 30;
export const YT1_FRAMES = Math.round(YT1_DURATION * YT1_FPS);

/* ---------------- fonts / palette ---------------- */
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
      new FontFace("ArefRuqaa", `url(${staticFile(`yt1/${file}`)}) format("woff2")`, { unicodeRange: range, weight: "700" })
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
const RED = "#D7322F";
const GREEN = "#2E9E5B";
const GOLD = "#FFC93C";
const MARKER = "#FFE14D";
const W = 1920;
const H = 1080;

const sec = (s: number) => Math.round(s * YT1_FPS);
const icon = (c: string) => staticFile(`yt1/img/${c}.svg`);
const sfx = (n: string) => staticFile(`yt1/sfx/${n}.wav`);
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};
const onTwos = (f: number) => f - (f % 2);
const jitter = (f: number, seed: number, a = 1) => (rand(seed + Math.floor(f / 4)) - 0.5) * 2 * a;

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
const maskStyle = (i: number): React.CSSProperties => ({
  maskImage: MASKS[i % MASKS.length],
  WebkitMaskImage: MASKS[i % MASKS.length],
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
});

/* ---------------- paper kit ---------------- */
const Sfx: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 0.25 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={sfx(name)} volume={vol} />
  </Sequence>
);

const Tape: React.FC<{ x: number; y: number; w?: number; rot?: number }> = ({ x, y, w = 130, rot = -8 }) => (
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

const Sheet: React.FC<{ w: number; h: number; tex?: "white" | "kraft"; seed?: number; children?: React.ReactNode; tint?: string }> = ({
  w,
  h,
  tex = "white",
  seed = 0,
  children,
  tint,
}) => (
  <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 12px 14px rgba(60,40,20,0.28))" }}>
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: tint, ...maskStyle(seed) }}>
      <Img
        src={staticFile(`yt1/paper_${tex}.jpg`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: tint ? "multiply" : "normal" }}
      />
    </div>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

/* paper element that unfolds in (hinged at the bottom) */
const Unfold: React.FC<{ x: number; y: number; delay?: number; rot?: number; seed?: number; children: React.ReactNode; sound?: string | null }> = ({
  x,
  y,
  delay = 0,
  rot = 0,
  seed = 1,
  children,
  sound = "paper_fold",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: onTwos(frame - delay), fps, config: { damping: 13, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={delay} name={sound} vol={0.22} />}
      {frame >= delay && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1000, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 92}deg) rotate(${rot + jitter(frame, seed, 0.8)}deg)` }}>{children}</div>
        </div>
      )}
    </>
  );
};

const Sticker: React.FC<{ code: string; x: number; y: number; size: number; delay?: number; rot?: number; seed?: number }> = ({
  code,
  x,
  y,
  size,
  delay = 0,
  rot = 0,
  seed = 1,
}) => {
  const o = Math.max(4, size / 34);
  return (
    <Unfold x={x} y={y} delay={delay} rot={rot} seed={seed}>
      <Img
        src={icon(code)}
        style={{
          width: size,
          height: size,
          filter: `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff) drop-shadow(0 8px 8px rgba(60,40,20,0.35))`,
        }}
      />
    </Unfold>
  );
};

const Hand: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 64, color = INK, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.25, ...style }}>
    {children}
  </div>
);

const Label: React.FC<{ text: string; x?: number; y: number; delay?: number; size?: number; tex?: "white" | "kraft"; color?: string; seed?: number }> = ({
  text,
  x = W / 2,
  y,
  delay = 0,
  size = 64,
  tex = "white",
  color = INK,
  seed = 3,
}) => {
  const w = Math.min(1500, 140 + text.length * size * 0.46);
  return (
    <Unfold x={x} y={y} delay={delay} rot={-1.2} seed={seed} sound="paper_rustle">
      <Sheet w={w} h={size * 1.8} tex={tex} seed={seed}>
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

const Stamp: React.FC<{ text: string; x: number; y: number; delay: number; color?: string; rot?: number; size?: number }> = ({
  text,
  x,
  y,
  delay,
  color = RED,
  rot = -10,
  size = 84,
}) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: YT1_FPS, config: { damping: 8, stiffness: 260 } });
  return (
    <>
      <Sfx at={delay} name="mj_hit" vol={0.2} />
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
            background: "rgba(255,255,255,0.75)",
            whiteSpace: "nowrap",
            mixBlendMode: "multiply",
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

const Illustration: React.FC<{ name: string; x: number; y: number; w: number; h: number; delay?: number; rot?: number; seed?: number }> = ({
  name,
  x,
  y,
  w,
  h,
  delay = 0,
  rot = -2,
  seed = 2,
}) => (
  <Unfold x={x} y={y} delay={delay} rot={rot} seed={seed} sound="paper_slide">
    <Sheet w={w} h={h} seed={seed}>
      <Img src={staticFile(`yt1/ill/${name}.svg`)} style={{ position: "absolute", left: 40, right: 40, top: 40, width: w - 80, height: h - 80, objectFit: "contain" }} />
      <Tape x={70} y={14} w={130} rot={-26} />
      <Tape x={w - 70} y={14} w={130} rot={24} />
    </Sheet>
  </Unfold>
);

/* ---------------- timing helpers ---------------- */
const L = (i: number) => LINES[i];
// frame (relative to a scene that starts at `from` seconds) when the line i reaches a fraction of its length
const at = (from: number, i: number, frac = 0) => sec(L(i).start + (L(i).end - L(i).start) * frac - from);

/* ---------------- scenes ---------------- */
type SceneProps = { from: number };

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - 2), fps: YT1_FPS, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill>
      <Sfx at={0} name="riser" vol={0.35} />
      <div style={{ position: "absolute", left: W / 2, top: 470, perspective: 1200, transform: "translate(-50%, -50%)" }}>
        <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 90}deg) rotate(-1.5deg)` }}>
          <Sheet w={1300} h={420} seed={4}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Hand size={96}>كيف تراجع دروسك؟</Hand>
              <div
                dir="rtl"
                style={{
                  fontFamily: FONT,
                  fontSize: 46,
                  color: INK,
                  backgroundImage: `linear-gradient(transparent 40%, ${MARKER} 40%, ${MARKER} 92%, transparent 92%)`,
                  padding: "0 12px",
                }}
              >
                الاسترجاع الفعّال + التكرار المتباعد
              </div>
            </div>
            <Tape x={110} y={16} rot={-24} />
            <Tape x={1190} y={16} rot={22} />
          </Sheet>
        </div>
      </div>
      <Sticker code="1f9e0" x={420} y={760} size={170} delay={10} rot={-10} seed={3} />
      <Sticker code="1f4c5" x={1500} y={760} size={170} delay={16} rot={10} seed={4} />
    </AbsoluteFill>
  );
};

const Hook1: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Illustration name="exam-prep" x={1180} y={470} w={760} h={600} rot={2} />
    <Sticker code="23f0" x={560} y={330} size={210} delay={8} rot={-10} seed={5} />
    <Sticker code="1f629" x={620} y={650} size={230} delay={at(from, 0, 0.55)} rot={8} seed={6} />
    <Stamp text="النسيان" x={560} y={860} delay={at(from, 0, 0.7)} />
  </AbsoluteFill>
);

const ChoiceCard: React.FC<{ x: number; delay: number; title: string; code: string; seed: number }> = ({ x, delay, title, code, seed }) => (
  <Unfold x={x} y={470} delay={delay} rot={seed % 2 ? 2 : -2} seed={seed}>
    <Sheet w={560} h={460} seed={seed}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Img src={icon(code)} style={{ width: 170, height: 170 }} />
        <Hand size={66}>{title}</Hand>
      </div>
      <Tape x={280} y={8} />
    </Sheet>
  </Unfold>
);

const Hook2: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <ChoiceCard x={1300} delay={2} title="ذكاؤك" code="1f9e0" seed={1} />
    <Stamp text="ليست هنا" x={1300} y={790} delay={at(from, 1, 0.3)} />
    <ChoiceCard x={620} delay={at(from, 1, 0.5)} title="طريقة مراجعتك" code="1f4d6" seed={2} />
    <Stamp text="المشكلة هنا" x={620} y={790} delay={at(from, 1, 0.75)} color={GREEN} rot={8} />
  </AbsoluteFill>
);

const NumberBadge: React.FC<{ n: number; x: number; y: number; delay: number; size?: number }> = ({ n, x, y, delay, size = 300 }) => (
  <Unfold x={x} y={y} delay={delay} rot={n % 2 ? -4 : 4} seed={n}>
    <Sheet w={size} h={size} tex="kraft" seed={n}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Hand size={size * 0.72}>{n}</Hand>
      </div>
      <Tape x={size / 2} y={6} />
    </Sheet>
  </Unfold>
);

const Hook3: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <NumberBadge n={1} x={1180} y={440} delay={at(from, 2, 0.3)} />
    <NumberBadge n={2} x={740} y={440} delay={at(from, 2, 0.38)} />
    <Sticker code="1f52c" x={1560} y={420} size={190} delay={at(from, 2, 0.45)} rot={10} seed={7} />
    <Label text="طريقتان أثبتهما العلم" y={790} delay={at(from, 2, 0.5)} size={60} />
  </AbsoluteFill>
);

/* a page of text lines; highlighter strokes sweep across */
const TextPage: React.FC<{ highlight?: number; start: number }> = ({ highlight = 0, start }) => {
  const frame = useCurrentFrame();
  return (
    <Sheet w={640} h={760} seed={5}>
      <div style={{ position: "absolute", top: 50, right: 50 }}>
        <Hand size={46}>الدرس 3</Hand>
      </div>
      {Array.from({ length: 11 }, (_, k) => {
        const hl = highlight && k % 2 === 0 ? interpolate(frame, [start + k * 5, start + k * 5 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        const w = 80 - (k % 3) * 12;
        return (
          <div key={k} style={{ position: "absolute", right: 50, top: 150 + k * 52, width: `${w}%`, height: 30 }}>
            <div style={{ position: "absolute", right: 0, top: 0, height: 30, width: `${hl * 100}%`, background: [MARKER, "#9BE7A0", "#FFB3C7"][k % 3], opacity: 0.85 }} />
            <div style={{ position: "absolute", right: 0, top: 11, height: 8, width: "100%", borderRadius: 4, background: "rgba(31,31,36,0.45)" }} />
          </div>
        );
      })}
    </Sheet>
  );
};

const Reread: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Illustration name="book-reading" x={1300} y={470} w={700} h={600} rot={2} />
    <Unfold x={600} y={490} delay={6} rot={-2} seed={5}>
      <TextPage highlight={1} start={at(from, 3, 0.55)} />
    </Unfold>
    <Sticker code="1f58a" x={860} y={250} size={150} delay={at(from, 3, 0.55)} rot={20} seed={8} />
  </AbsoluteFill>
);

const Illusion: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Unfold x={800} y={490} delay={0} rot={-2} seed={5} sound={null}>
      <TextPage highlight={1} start={-100} />
    </Unfold>
    <Stamp text="شعور خادع" x={800} y={480} delay={at(from, 4, 0.55)} size={96} />
    <Sticker code="1f648" x={1340} y={430} size={230} delay={at(from, 4, 0.2)} rot={8} seed={9} />
    <Sticker code="2705" x={1300} y={760} size={130} delay={at(from, 4, 0.25)} rot={-8} seed={10} />
  </AbsoluteFill>
);

const Compare: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Unfold x={1340} y={470} delay={at(from, 5, 0.1)} rot={2} seed={1}>
      <Sheet w={600} h={520} seed={1}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Img src={icon("1f440")} style={{ width: 160, height: 160 }} />
          <Hand size={72}>التعرّف</Hand>
          <Hand size={40} color="#666">
            وأنت تقرأ: سهل
          </Hand>
        </div>
        <Tape x={300} y={8} />
      </Sheet>
    </Unfold>
    <Unfold x={580} y={470} delay={at(from, 5, 0.55)} rot={-2} seed={2}>
      <Sheet w={600} h={520} seed={2}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Img src={icon("1f9e0")} style={{ width: 160, height: 160 }} />
          <Hand size={72} color={PEN}>
            التذكّر
          </Hand>
          <Hand size={40} color="#666">
            أمام ورقة الامتحان
          </Hand>
        </div>
        <Tape x={300} y={8} />
      </Sheet>
    </Unfold>
    <Stamp text="≠" x={960} y={470} delay={at(from, 5, 0.45)} color={INK} rot={0} size={110} />
  </AbsoluteFill>
);

const SectionTitle: React.FC<{ n?: number; title: string; code: string }> = ({ n, title, code }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [14, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      {n !== undefined && <NumberBadge n={n} x={1460} y={460} delay={2} size={320} />}
      <Unfold x={n !== undefined ? 820 : W / 2} y={440} delay={8} rot={-1} seed={4} sound="paper_slide">
        <div style={{ textAlign: "center" }}>
          {n !== undefined && (
            <Hand size={54} color="#555">
              الطريقة {n === 1 ? "الأولى" : "الثانية"}
            </Hand>
          )}
          <Hand size={124}>{title}</Hand>
          <div style={{ margin: "6px auto 0", width: 760 * line, height: 22, background: MARKER, borderRadius: 11, opacity: 0.9 }} />
        </div>
      </Unfold>
      <Sticker code={code} x={n !== undefined ? 820 : W / 2} y={790} size={190} delay={16} seed={11} />
    </AbsoluteFill>
  );
};

const MemoryToPaper: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at(from, 7, 0.35), at(from, 7, 0.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const write = interpolate(frame, [at(from, 7, 0.55), at(from, 7, 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Sticker code="1f9e0" x={1440} y={460} size={300} delay={4} seed={12} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M1250 460 C1100 360 900 360 820 440"
          fill="none"
          stroke={PEN}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="22 18"
          pathLength={1}
          style={{ strokeDasharray: `${draw} 1`, strokeDashoffset: 0 }}
        />
        {draw > 0.95 && <polygon points="820,440 852,410 862,454" fill={PEN} />}
      </svg>
      <Unfold x={560} y={500} delay={at(from, 7, 0.4)} rot={-2} seed={6}>
        <Sheet w={500} h={620} seed={6}>
          <div style={{ position: "absolute", top: 40, right: 40 }}>
            <Hand size={42} color={PEN}>
              ما أتذكره:
            </Hand>
          </div>
          {Array.from({ length: 8 }, (_, k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                right: 40,
                top: 130 + k * 56,
                height: 8,
                borderRadius: 4,
                background: PEN,
                opacity: 0.75,
                width: `${Math.max(0, Math.min(1, write * 8 - k)) * (78 - (k % 3) * 10)}%`,
              }}
            />
          ))}
        </Sheet>
      </Unfold>
      <Sticker code="270d" x={820} y={760} size={150} delay={at(from, 7, 0.55)} rot={10} seed={13} />
    </AbsoluteFill>
  );
};

const StepCard: React.FC<{ n: number; text: string; code: string; y: number; delay: number; active: boolean }> = ({ n, text, code, y, delay, active }) => (
  <Unfold x={W / 2} y={y} delay={delay} rot={n % 2 ? -0.8 : 0.8} seed={n + 2}>
    <div style={{ transform: `scale(${active ? 1.04 : 0.96})`, opacity: active ? 1 : 0.75 }}>
      <Sheet w={1300} h={170} seed={n + 2}>
        <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 36, padding: "0 50px" }}>
          <div style={{ width: 110, height: 110, borderRadius: 999, background: active ? GOLD : "#E9E2D0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Hand size={76}>{n}</Hand>
          </div>
          <Hand size={58}>{text}</Hand>
          <Img src={icon(code)} style={{ width: 110, height: 110, marginRight: "auto" }} />
        </div>
      </Sheet>
    </div>
  </Unfold>
);

const Steps: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = from + frame / YT1_FPS;
  const active = t < L(9).start ? 1 : t < L(10).start ? 2 : 3;
  const check = interpolate(frame, [at(from, 10, 0.6), at(from, 10, 0.75)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <StepCard n={1} text="اقرأ الدرس مرة واحدة بتركيز" code="1f4d6" y={250} delay={at(from, 8, 0.1)} active={active === 1} />
      <StepCard n={2} text="أغلق الكراس واكتب ما تتذكره" code="270d" y={470} delay={at(from, 9, 0.1)} active={active === 2} />
      <StepCard n={3} text="قارن وصحح بلون مختلف" code="1f58a" y={690} delay={at(from, 10, 0.1)} active={active === 3} />
      {check > 0 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d="M360 700 L400 740 L480 640" fill="none" stroke={RED} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - check} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

const Flashcard: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const start = at(from, 11, 0.45);
  const cycle = 46;
  const local = Math.max(0, frame - start);
  const k = Math.floor(local / cycle);
  const ph = local % cycle;
  const flipT = interpolate(ph, [26, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const angle = frame < start ? 0 : (k + flipT) * 180;
  const showBack = Math.floor((angle + 90) / 180) % 2 === 1;
  return (
    <AbsoluteFill>
      {frame >= start && Array.from({ length: 6 }, (_, i) => <Sfx key={i} at={start + i * cycle + 28} name="paper_flip" vol={0.18} />)}
      <Unfold x={W / 2 + 120} y={470} delay={4} seed={7}>
        <div style={{ perspective: 1600 }}>
          <div style={{ transform: `rotateY(${angle}deg)` }}>
            <div style={{ transform: showBack ? "rotateY(180deg)" : "none" }}>
              <Sheet w={820} h={480} seed={showBack ? 3 : 7} tint={showBack ? "#E9F7EE" : undefined}>
                <div style={{ position: "absolute", left: 30, right: 30, top: 90, height: 4, background: "rgba(215,50,47,0.45)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  {showBack ? (
                    <>
                      <Hand size={50} color="#555">
                        الظهر
                      </Hand>
                      <Hand size={110} color={GREEN}>
                        الجواب ✓
                      </Hand>
                    </>
                  ) : (
                    <>
                      <Hand size={50} color="#555">
                        الوجه
                      </Hand>
                      <Hand size={110} color={PEN}>
                        سؤال ؟
                      </Hand>
                    </>
                  )}
                </div>
              </Sheet>
            </div>
          </div>
        </div>
      </Unfold>
      <Sticker code="1f4c7" x={360} y={470} size={220} delay={at(from, 11, 0.4)} rot={-10} seed={14} />
    </AbsoluteFill>
  );
};

const Strength: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [at(from, 12, 0.2), at(from, 12, 0.95)], [0.15, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Sticker code="1f9e0" x={1440} y={460} size={300} delay={4} seed={15} />
      <Unfold x={720} y={470} delay={6} seed={8}>
        <Sheet w={880} h={380} seed={8}>
          <div style={{ position: "absolute", top: 50, right: 60 }}>
            <Hand size={60}>قوة المعلومة في ذاكرتك</Hand>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 200, height: 80, borderRadius: 40, border: `6px solid ${INK}` }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 34, background: `linear-gradient(90deg, ${GREEN}, #7CD69B)` }} />
          </div>
        </Sheet>
      </Unfold>
      {[0.3, 0.55, 0.8].map((f, i) => (
        <Sticker key={i} code="1f4aa" x={420 + i * 300} y={760} size={120} delay={at(from, 12, f)} rot={i * 8 - 8} seed={20 + i} />
      ))}
    </AbsoluteFill>
  );
};

/* forgetting curve: without reviews (red) vs with spaced reviews (green) */
const Curve: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const red = interpolate(frame, [at(from, 14, 0.15), at(from, 14, 0.85)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const green = interpolate(frame, [at(from, 15, 0.1), at(from, 15, 0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x0 = 140;
  const x1 = 1180;
  const y0 = 150;
  const y1 = 520;
  const X = (d: number) => x0 + Math.sqrt(d / 30) * (x1 - x0);
  const Y = (r: number) => y1 - r * (y1 - y0);
  const redPts = Array.from({ length: 61 }, (_, i) => {
    const d = i / 2;
    return `${X(d).toFixed(1)},${Y(0.2 + 0.8 * Math.exp(-d / 1.2)).toFixed(1)}`;
  }).join(" ");
  const reviews = [0, 1, 3, 7, 14, 30];
  const greenPts: string[] = [];
  for (let r = 0; r < reviews.length - 1; r++) {
    const a = reviews[r];
    const b = reviews[r + 1];
    const tau = 1.2 * Math.pow(2.6, r);
    for (let s = 0; s <= 12; s++) {
      const d = a + ((b - a) * s) / 12;
      greenPts.push(`${X(d).toFixed(1)},${Y(0.25 + 0.75 * Math.exp(-(d - a) / tau)).toFixed(1)}`);
    }
  }
  const labels: [number, string][] = [
    [0, "اليوم"],
    [1, "يوم"],
    [3, "3 أيام"],
    [7, "أسبوع"],
    [14, "أسبوعان"],
    [30, "شهر"],
  ];
  return (
    <AbsoluteFill>
      <Unfold x={W / 2} y={480} delay={2} seed={9}>
        <Sheet w={1320} h={700} seed={9}>
          <div style={{ position: "absolute", top: 26, right: 50 }}>
            <Hand size={52}>كم تتذكر من الدرس؟</Hand>
          </div>
          <svg width={1320} height={700} viewBox="0 0 1320 700" style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(0 60)">
              <path d={`M${x0} ${y0 - 20} V${y1} H${x1 + 30}`} stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
              {labels.map(([d, t]) => (
                <g key={d}>
                  <line x1={X(d)} x2={X(d)} y1={y1} y2={y1 + 14} stroke={INK} strokeWidth="4" />
                  <text x={X(d)} y={y1 + 52} textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="30" fill={INK}>
                    {t}
                  </text>
                </g>
              ))}
              <polyline points={redPts} fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - red} />
              {green > 0 && (
                <polyline points={greenPts.join(" ")} fill="none" stroke={GREEN} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - green} />
              )}
            </g>
          </svg>
          <div dir="rtl" style={{ position: "absolute", right: 80, top: 300, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <Hand size={36} color={RED} style={{ opacity: red > 0 ? 1 : 0 }}>
              ● بدون مراجعة
            </Hand>
            <Hand size={36} color={GREEN} style={{ opacity: green > 0 ? 1 : 0 }}>
              ● مع مراجعة متباعدة
            </Hand>
          </div>
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

const Timeline: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const text = L(16).text;
  const marks = ["بعد يوم", "ثلاثة أيام", "بعد أسبوع،", "أسبوعين", "بعد شهر"];
  const times = marks.map((m) => at(from, 16, Math.max(0.05, text.indexOf(m) / text.length)));
  const nodes = ["يوم", "3 أيام", "أسبوع", "أسبوعان", "شهر"];
  const line = interpolate(frame, [times[0], times[4] + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={1680} y1={500} x2={1680 - 1440 * line} y2={500} stroke={INK} strokeWidth="8" strokeLinecap="round" strokeDasharray="4 18" />
      </svg>
      {nodes.map((n, i) => (
        <Unfold key={i} x={1640 - i * 330} y={500} delay={times[i]} rot={i % 2 ? 3 : -3} seed={i + 1}>
          <Sheet w={250} h={250} tex={i === 4 ? "kraft" : "white"} seed={i + 1}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Img src={icon("1f4c5")} style={{ width: 90, height: 90 }} />
              <Hand size={52}>{n}</Hand>
            </div>
            <Tape x={125} y={6} w={100} />
          </Sheet>
        </Unfold>
      ))}
      <Label text="راجع في هذه المواعيد" y={820} delay={times[0]} size={56} tex="kraft" />
    </AbsoluteFill>
  );
};

const PlanBar: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [at(from, 18, 0.1), at(from, 18, 0.45)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const b = interpolate(frame, [at(from, 18, 0.5), at(from, 18, 0.9)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Unfold x={W / 2} y={460} delay={2} seed={10}>
        <Sheet w={1400} h={560} seed={10}>
          <div style={{ position: "absolute", top: 40, right: 60 }}>
            <Hand size={64}>خطة اليوم</Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 200, height: 150, display: "flex", gap: 0 }}>
            <div style={{ width: `${60 * a}%`, background: PEN, borderRadius: "18px 0 0 18px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Hand size={50} color="#fff" style={{ whiteSpace: "nowrap" }}>
                درس اليوم
              </Hand>
            </div>
            <div style={{ width: `${40 * b}%`, background: GOLD, borderRadius: "0 18px 18px 0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Hand size={44} style={{ whiteSpace: "nowrap" }}>
                مراجعة حسب الجدول
              </Hand>
            </div>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 390, display: "flex", justifyContent: "space-between" }}>
            {["درس الأمس", "قبل 3 أيام", "قبل أسبوع", "قبل أسبوعين"].map((t, i) => (
              <Hand key={i} size={38} color="#555" style={{ opacity: b > (i + 1) / 5 ? 1 : 0 }}>
                ✓ {t}
              </Hand>
            ))}
          </div>
        </Sheet>
      </Unfold>
      <Sticker code="1f553" x={300} y={820} size={150} delay={8} rot={-10} seed={30} />
    </AbsoluteFill>
  );
};

const TestYourself: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <ChoiceCard x={1300} delay={2} title="قراءة فقط" code="1f4d6" seed={3} />
    <Stamp text="لا تكتفِ بها" x={1300} y={790} delay={at(from, 19, 0.35)} />
    <ChoiceCard x={620} delay={at(from, 19, 0.6)} title="اختبر نفسك" code="1f9e0" seed={4} />
    <Stamp text="هكذا ✓" x={620} y={790} delay={at(from, 19, 0.8)} color={GREEN} rot={8} />
  </AbsoluteFill>
);

const Checklist: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const items = ["اختبر نفسك بدل إعادة القراءة", "وزّع مراجعاتك على فترات متباعدة", "صحّح أخطاءك دائمًا"];
  return (
    <AbsoluteFill>
      <Unfold x={W / 2} y={490} delay={2} seed={11}>
        <Sheet w={1300} h={720} seed={11}>
          <div style={{ position: "absolute", top: 40, right: 70 }}>
            <Hand size={76}>الخلاصة</Hand>
          </div>
          {items.map((t, i) => {
            const appear = at(from, 21 + i, 0.05);
            const check = interpolate(frame, [appear + 18, appear + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const y = 210 + i * 160;
            return (
              <React.Fragment key={i}>
                {frame >= appear && (
                  <div dir="rtl" style={{ position: "absolute", right: 70, top: y, display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, (frame - appear) / 6) }}>
                    <div style={{ width: 90, height: 90, border: `6px solid ${INK}`, borderRadius: 12, position: "relative" }}>
                      <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute", left: -6, top: -10 }}>
                        <path d="M14 48 L38 72 L84 14" fill="none" stroke={GREEN} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - check} />
                      </svg>
                    </div>
                    <Hand size={60}>{t}</Hand>
                  </div>
                )}
                <Sfx at={appear + 18} name="paper_rustle" vol={0.25} />
              </React.Fragment>
            );
          })}
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

const TwoWeeks: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const s0 = at(from, 24, 0.15);
  return (
    <AbsoluteFill>
      <Unfold x={820} y={480} delay={2} seed={12}>
        <Sheet w={1000} h={620} seed={12}>
          <div style={{ position: "absolute", top: 30, right: 60 }}>
            <Hand size={60}>تحدّي 14 يومًا</Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 150, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 18 }}>
            {Array.from({ length: 14 }, (_, i) => {
              const done = frame > s0 + i * 4;
              return (
                <div key={i} style={{ height: 160, border: `5px solid ${INK}`, borderRadius: 14, position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: 8 }}>
                  <Hand size={32}>{i + 1}</Hand>
                  {done && (
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                      <path d="M15 15 L85 85 M85 15 L15 85" stroke={RED} strokeWidth="9" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </Sheet>
      </Unfold>
      <Sticker code="1f4c8" x={1500} y={420} size={240} delay={at(from, 24, 0.6)} rot={8} seed={31} />
      <Sticker code="1f525" x={1520} y={760} size={160} delay={at(from, 24, 0.75)} rot={-6} seed={32} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const clickAt = at(from, 25, 0.78);
  const clicked = frame >= clickAt;
  const hand = interpolate(frame, [clickAt - 12, clickAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Sfx at={clickAt} name="mj_hit" vol={0.2} />
      <Sticker code="1f465" x={1500} y={330} size={220} delay={at(from, 25, 0.25)} rot={8} seed={33} />
      <Label text="شارك الفيديو مع أصدقائك" x={1440} y={640} delay={at(from, 25, 0.3)} size={50} tex="kraft" />
      <Unfold x={720} y={460} delay={at(from, 25, 0.55)} rot={-1.5} seed={6}>
        <div style={{ width: 900, background: "#0F1116", borderRadius: 36, padding: 26, boxShadow: "0 24px 50px rgba(0,0,0,0.4)" }}>
          <Img src={staticFile("yt1/profile_shot.png")} style={{ width: "100%", display: "block", borderRadius: 16 }} />
          <div
            style={{
              marginTop: 16,
              height: 80,
              borderRadius: 18,
              background: clicked ? "#363636" : "#0095F6",
              color: "white",
              fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {clicked ? "Following ✓" : "Follow"}
          </div>
        </div>
      </Unfold>
      <Img
        src={icon("1f446")}
        style={{
          position: "absolute",
          left: interpolate(hand, [0, 1], [1100, 760]),
          top: interpolate(hand, [0, 1], [1100, 760]),
          width: 150,
          height: 150,
          transform: `rotate(-20deg) scale(${clicked ? interpolate(frame - clickAt, [0, 4, 8], [1, 0.85, 1], { extrapolateRight: "clamp" }) : 1})`,
          opacity: frame > clickAt - 14 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- end card ---------------- */
const MJ_GOLD = "linear-gradient(180deg, #FFE68A 0%, #FFC93C 45%, #E09A00 100%)";
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#141414" }}>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.5 }}>
        <Img src={staticFile("yt1/paper_kraft.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 300,
            lineHeight: 1,
            letterSpacing: interpolate(p, [0, 1], [50, -4]),
            background: MJ_GOLD,
            WebkitBackgroundClip: "text",
            color: "transparent",
            opacity: p,
            filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))",
          }}
        >
          MJ
        </div>
        <div style={{ width: 340 * p, height: 6, background: GOLD, borderRadius: 3 }} />
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 52, color: "#fff", marginTop: 20, opacity: p }}>
          تابعني لمزيد من طرق الدراسة
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, color: GOLD, opacity: p }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- MJ transition (landscape) ---------------- */
const MJWipe: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [2000, 0, 0, -2150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const tilt = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [5, 0, 0, -4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mj = interpolate(frame, [7, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const line = interpolate(frame, [10, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={10} name="mj_hit" vol={0.24} />
      <div style={{ position: "absolute", left: sheetX(-2) - 160, top: -200, transform: `rotate(${tilt(-2)}deg)` }}>
        <div style={{ position: "relative", width: 2300, height: 1500, filter: "drop-shadow(-18px 0 30px rgba(0,0,0,0.35))" }}>
          <div style={{ position: "absolute", inset: 0, background: GOLD, overflow: "hidden", ...maskStyle(seed) }}>
            <Img src={staticFile("yt1/paper_white.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.9 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: sheetX(1) - 80, top: -200, transform: `rotate(${tilt(1)}deg)` }}>
        <div style={{ position: "relative", width: 2200, height: 1500, filter: "drop-shadow(-24px 0 40px rgba(0,0,0,0.5))" }}>
          <div style={{ position: "absolute", inset: 0, background: "#151515", overflow: "hidden", ...maskStyle(seed + 3) }}>
            <Img src={staticFile("yt1/paper_kraft.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.5 }} />
          </div>
          <div style={{ position: "absolute", left: 80, top: 200, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 300,
                lineHeight: 1,
                letterSpacing: interpolate(mj, [0, 1], [50, -4]),
                background: MJ_GOLD,
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))",
                opacity: mj,
                transform: `scale(${interpolate(mj, [0, 1], [1.1, 1])})`,
              }}
            >
              MJ
            </div>
            <div style={{ width: 300 * line, height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- subtitles on torn strips ---------------- */
const KEYS = new Set([
  "الامتحان", "ذكائك", "طريقة", "طريقتين", "العلم", "خادع", "تذكرها", "الفعّال", "ذاكرتك", "بتركيز", "أغلق", "وصحح", "بطاقات",
  "المتباعد", "ببطء", "يوم", "أسبوع", "أسبوعين", "شهر", "خطة", "اختبر", "متباعدة", "أخطاءك", "شارك", "وتابعني", "الكراس",
]);
const clean = (w: string) => w.replace(/[،.؟:!]/g, "");

type Chunk = { text: string; start: number; end: number; last: boolean };
const chunks: Chunk[] = LINES.flatMap((l) => {
  const words = l.text.split(" ");
  const groups: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 6 || (/[،.؟:]$/.test(w) && cur.length >= 3)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  const total = l.text.length;
  let acc = 0;
  return groups.map((g, gi) => {
    const t = g.join(" ");
    const s = l.start + ((l.end - l.start) * acc) / total;
    acc += t.length + 1;
    const e = l.start + ((l.end - l.start) * Math.min(acc, total)) / total;
    return { text: t, start: s, end: e, last: gi === groups.length - 1 };
  });
});

const Subtitle: React.FC<{ c: Chunk; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const inP = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const out = c.last ? interpolate(frame, [dur - 3, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 922, display: "flex", justifyContent: "center", opacity: Math.min(inP, out) }}>
      <div style={{ position: "relative", transform: `rotate(${idx % 2 ? 0.6 : -0.6}deg) translateY(${(1 - inP) * 10}px)`, filter: "drop-shadow(0 8px 10px rgba(40,30,20,0.3))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={staticFile("yt1/paper_white.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "10px 46px 16px", display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500 }}>
          {c.text.split(" ").map((w, i) => (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontSize: 50,
                lineHeight: 1.35,
                color: INK,
                backgroundImage: KEYS.has(clean(w)) ? `linear-gradient(transparent 42%, ${MARKER} 42%, ${MARKER} 92%, transparent 92%)` : "none",
                padding: KEYS.has(clean(w)) ? "0 4px" : 0,
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------- section header chip ---------------- */
const SECTION_NAMES: Record<string, string> = {
  hook: "المقدمة",
  problem: "المشكلة",
  recall: "الطريقة 1: الاسترجاع الفعّال",
  spaced: "الطريقة 2: التكرار المتباعد",
  plan: "الخطة اليومية",
  recap: "الخلاصة",
  cta: "جرّبها الآن",
};

const Header: React.FC<{ section: string }> = ({ section }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - 4), fps: YT1_FPS, config: { damping: 14, stiffness: 160 } });
  const name = SECTION_NAMES[section];
  const w = 120 + name.length * 26;
  return (
    <div style={{ position: "absolute", right: 60, top: 40, perspective: 800 }}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - p) * -90}deg) rotate(1deg)` }}>
        <Sheet w={w} h={86} tex="kraft" seed={5}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hand size={44}>{name}</Hand>
          </div>
        </Sheet>
      </div>
    </div>
  );
};

/* ---------------- timeline of scenes ---------------- */
type SceneDef = { first: number; C: React.FC<SceneProps> };
const SCENES: SceneDef[] = [
  { first: 0, C: Hook1 },
  { first: 1, C: Hook2 },
  { first: 2, C: Hook3 },
  { first: 3, C: Reread },
  { first: 4, C: Illusion },
  { first: 5, C: Compare },
  { first: 6, C: () => <SectionTitle n={1} title="الاسترجاع الفعّال" code="1f9e0" /> },
  { first: 7, C: MemoryToPaper },
  { first: 8, C: Steps },
  { first: 11, C: Flashcard },
  { first: 12, C: Strength },
  { first: 13, C: () => <SectionTitle n={2} title="التكرار المتباعد" code="1f4c5" /> },
  { first: 14, C: Curve },
  { first: 16, C: Timeline },
  { first: 17, C: () => <SectionTitle title="الخطة اليومية" code="1f3af" /> },
  { first: 18, C: PlanBar },
  { first: 19, C: TestYourself },
  { first: 20, C: Checklist },
  { first: 24, C: TwoWeeks },
  { first: 25, C: Outro },
];

// section boundaries (midpoint of the pause between sections) → MJ wipe there
const BOUNDARIES: number[] = [LINES[0].start - 0.15];
for (let i = 1; i < LINES.length; i++) {
  if (LINES[i].section !== LINES[i - 1].section) BOUNDARIES.push((LINES[i - 1].end + LINES[i].start) / 2);
}
const END_AT = LINES[LINES.length - 1].end + 0.4;

const sceneFrom = (first: number) => {
  const l = LINES[first];
  const isSectionStart = first === 0 || LINES[first - 1].section !== l.section;
  if (isSectionStart) return BOUNDARIES.find((b) => b > (first ? LINES[first - 1].end : 0) && b <= l.start) ?? l.start - 0.2;
  return Math.max(LINES[first - 1].end + 0.05, l.start - 0.25);
};

const SceneFold: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(onTwos(frame), [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ perspective: 2000 }}>
      <AbsoluteFill style={{ transformOrigin: "50% 15%", transform: `rotateX(${o * 80}deg)`, opacity: 1 - o * 0.7 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Img src={staticFile("yt1/paper_notebook.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.04 + Math.sin(frame / 120) * 0.01})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,20,0.28) 100%)" }} />
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(0,0,0,0.12)" }}>
      <div style={{ height: "100%", width: `${(frame / YT1_FRAMES) * 100}%`, background: GOLD }} />
      {BOUNDARIES.slice(1).map((b, i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 4, left: `${(b / YT1_DURATION) * 100}%`, background: INK, opacity: 0.4 }} />
      ))}
    </div>
  );
};

const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 50, top: 36, fontFamily: FONT, fontSize: 54, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>
    MJ
  </div>
);

export const YT1: React.FC = () => {
  const introEnd = sec(BOUNDARIES[0]);
  return (
    <AbsoluteFill style={{ background: "#EFE8D8" }}>
      <Background />
      <Sequence durationInFrames={introEnd + 12} layout="none">
        <Intro />
      </Sequence>
      {SCENES.map((s, k) => {
        const from = sceneFrom(s.first);
        const to = k + 1 < SCENES.length ? sceneFrom(SCENES[k + 1].first) : END_AT;
        const dur = sec(to) - sec(from);
        return (
          <Sequence key={k} from={sec(from)} durationInFrames={dur} layout="none">
            <SceneFold dur={dur}>
              <s.C from={from} />
            </SceneFold>
            <Sfx at={0} name="paper_slide" vol={0.12} />
          </Sequence>
        );
      })}
      {/* section header */}
      {BOUNDARIES.map((b, i) => {
        const next = BOUNDARIES[i + 1] ?? END_AT;
        const section = LINES.find((l) => l.start > b)?.section ?? "cta";
        return (
          <Sequence key={`h${i}`} from={sec(b)} durationInFrames={sec(next) - sec(b)} layout="none">
            <Header section={section} />
          </Sequence>
        );
      })}
      {chunks.map((c, i) => (
        <Sequence key={`c${i}`} from={sec(c.start)} durationInFrames={Math.max(2, sec(c.end) - sec(c.start))} layout="none">
          <Subtitle c={c} idx={i} />
        </Sequence>
      ))}
      <Watermark />
      <Sequence from={sec(END_AT)} layout="none">
        <EndCard />
      </Sequence>
      {BOUNDARIES.map((b, i) => (
        <Sequence key={`w${i}`} from={sec(b) - 12} durationInFrames={24} layout="none">
          <MJWipe seed={i} />
        </Sequence>
      ))}
      <Audio src={staticFile("yt1/narration.wav")} />
      <Audio
        src={staticFile("yt1/music.wav")}
        volume={(f) =>
          interpolate(f, [0, sec(LINES[0].start), sec(LINES[0].start) + 15, sec(END_AT) - 10, sec(END_AT), YT1_FRAMES - 20, YT1_FRAMES], [0.3, 0.3, 0.09, 0.09, 0.3, 0.3, 0], {
            extrapolateRight: "clamp",
          })
        }
      />
      <Progress />
    </AbsoluteFill>
  );
};
