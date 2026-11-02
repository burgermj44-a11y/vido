/*
 * Video 20: first-term revision (paper style, vertical), his talking-head clip.
 * The real room stays most of the time with paper stickers between the wall and
 * him (matte). At key moments the room is swapped for his B-roll / photos placed
 * right behind him (he becomes a white-bordered paper cut-out), MJ wipe on each
 * swap, captions on torn white paper strips with tape and yellow marker.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT, loadFonts } from "../fonts";
import {
  FPS,
  GOLD,
  GREEN,
  HAND,
  INK,
  MARKER,
  MJ_GOLD,
  PEN,
  RED,
  Sfx,
  Sheet,
  Tape,
  clamp,
  icon,
  jitter,
  loadHand,
  maskStyle,
  onTwos,
  ramp,
  sec,
  stickerFilter,
  tex,
} from "../yt2/kit";

loadFonts();
loadHand();

const W = 1080;
const H = 1920;
export const V20_FPS = FPS;
export const V20_FRAMES = 936 + 75;
const DUR = V20_FRAMES / FPS;
const CAP_LEAD = 0.1;
const SCENE_LEAD = 0.25;
const CUT_LEAD = 0.3;
const MATTE_N = 936;
const CLIP = 31.2;

type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 2.2, text: "باش تحضّر للفصل الأول", hl: ["الأول"] },
  { start: 2.2, end: 4.55, text: "الفصل الأول صعيب بزاف", hl: ["صعيب"] },
  { start: 4.55, end: 7.45, text: "عام جديد ودروس جديدة", hl: ["جديدة"] },
  { start: 7.45, end: 9.72, text: "وشفنا كيفاش تقراو", hl: ["تقراو"] },
  {
    start: 9.72,
    end: 12.85,
    text: "جبتلكم أفضل طريقة تريفيزيو بيها",
    hl: ["أفضل"],
  },
  { start: 12.85, end: 15.4, text: "باش تكمّل وتدّي معدل", hl: ["معدل"] },
  { start: 15.4, end: 17.5, text: "قبل ما نقولك الطريقة", hl: ["الطريقة"] },
  {
    start: 17.5,
    end: 19.37,
    text: "متنساش تبارتاجي الفيديو",
    hl: ["تبارتاجي"],
  },
  { start: 19.49, end: 21.65, text: "ونديو معاكم الأجر", hl: ["الأجر"] },
  { start: 21.65, end: 24.3, text: "الطريقة هاذي شوية طويلة", hl: ["طويلة"] },
  { start: 24.3, end: 26.55, text: "نشرحهالكم في فيديو وحدو", hl: ["فيديو"] },
  { start: 26.55, end: 28.7, text: "إذا حبيتو", hl: ["حبيتو"] },
  { start: 28.7, end: 31.1, text: "وإذا كان التفاعل كبير", hl: ["التفاعل"] },
];

/* background swaps: the room is replaced by his B-roll / photos, placed right behind him */
type Swap = {
  start: number;
  end: number;
  src: string;
  video?: boolean;
  tag: string;
  from?: number;
  pos?: string;
};
const SWAPS: Swap[] = [
  {
    start: 0.0,
    end: 4.55,
    src: "v20/chalkboard.jpg",
    pos: "8% 50%",
    tag: "📝 الفصل الأول",
  },
  {
    start: 9.72 - CUT_LEAD,
    end: 15.4 - CUT_LEAD,
    src: "v20/broll_write.mp4",
    video: true,
    tag: "✍️ أفضل طريقة للمراجعة",
  },
  {
    start: 21.65 - CUT_LEAD,
    end: 26.55 - CUT_LEAD,
    src: "v20/broll_notebook.mp4",
    video: true,
    tag: "📒 الطريقة كاملة",
  },
  { start: 28.7 - CUT_LEAD, end: CLIP, src: "v20/orange.jpg", tag: "💬 علّق" },
];
const swapAt = (t: number) => SWAPS.find((w) => t >= w.start && t < w.end);
// 0..1 how much the current frame is in a swap (fades in/out over 8 frames)
const swapAmount = (frame: number) => {
  const w = swapAt(frame / FPS);
  if (!w) return 0;
  return Math.min(
    ramp(frame, sec(w.start), sec(w.start) + 8),
    1 - ramp(frame, sec(w.end) - 8, sec(w.end)),
  );
};

/* speaker scenes: punch-in zoom + the graphics around him */
type Kind =
  | "exam"
  | "hard"
  | "newyear"
  | "how"
  | "best"
  | "grade"
  | "before"
  | "share"
  | "long"
  | "video"
  | "like"
  | "react";
type Sc = { start: number; end: number; kind: Kind; zoom: number };
const SCENES_RAW: Sc[] = [
  { start: 0, end: 2.2, kind: "exam", zoom: 1.0 },
  { start: 2.2, end: 4.55, kind: "hard", zoom: 1.12 },
  { start: 4.55, end: 7.45, kind: "newyear", zoom: 1.0 },
  { start: 7.45, end: 9.72, kind: "how", zoom: 1.16 },
  { start: 9.72, end: 12.85, kind: "best", zoom: 1.0 },
  { start: 12.85, end: 15.4, kind: "grade", zoom: 1.12 },
  { start: 15.4, end: 17.5, kind: "before", zoom: 1.0 },
  { start: 17.5, end: 21.65, kind: "share", zoom: 1.14 },
  { start: 21.65, end: 24.3, kind: "long", zoom: 1.0 },
  { start: 24.3, end: 26.55, kind: "video", zoom: 1.1 },
  { start: 26.55, end: 28.7, kind: "like", zoom: 1.2 },
  { start: 28.7, end: DUR, kind: "react", zoom: 1.0 },
];
const SCENES: Sc[] = SCENES_RAW.map((s) => ({
  ...s,
  start: Math.max(0, s.start - SCENE_LEAD),
}));

const sceneAt = (t: number) =>
  SCENES.filter((s) => s.start <= t).pop() ?? SCENES[0];

/* ---------- the room + his cut-out ---------- */
const useZoom = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const prev = SCENES[Math.max(0, SCENES.indexOf(s) - 1)];
  const k = spring({
    frame: frame - sec(s.start),
    fps: FPS,
    config: { damping: 18, stiffness: 120 },
  });
  const z = prev.zoom + (s.zoom - prev.zoom) * k;
  const drift = (frame - sec(s.start)) * 0.0006;
  return { scale: z + drift, origin: "50% 34%" };
};
const Room: React.FC<{ cutout?: boolean }> = ({ cutout }) => {
  const frame = useCurrentFrame();
  const { scale, origin } = useZoom();
  const sw = cutout ? swapAmount(frame) : 0;
  const o = 8 * sw;
  const matte = `url(${staticFile(`v20/matte/${String(Math.min(frame + 1, MATTE_N)).padStart(4, "0")}.jpg`)})`;
  return (
    <AbsoluteFill
      style={{
        filter:
          sw > 0.01
            ? `drop-shadow(${o}px 0 0 #fff) drop-shadow(-${o}px 0 0 #fff) drop-shadow(0 ${o}px 0 #fff) drop-shadow(0 -${o}px 0 #fff) drop-shadow(0 18px 24px rgba(40,25,10,${0.45 * sw}))`
            : "none",
      }}
    >
      <AbsoluteFill
        style={{ transform: `scale(${scale})`, transformOrigin: origin }}
      >
        <AbsoluteFill
          style={
            cutout
              ? ({
                  maskImage: matte,
                  WebkitMaskImage: matte,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                  maskMode: "luminance",
                  WebkitMaskSourceType: "luminance",
                } as React.CSSProperties)
              : {}
          }
        >
          <OffthreadVideo
            src={staticFile("v20/source.mp4")}
            muted
            style={{
              width: W,
              height: H,
              filter: "saturate(1.1) contrast(1.06)",
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* the swapped background behind him: paper-framed media with Ken Burns + grain */
const SwapBg: React.FC<{ w: Swap; dur: number }> = ({ w, dur }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 12, Easing.out(Easing.cubic));
  const out = ramp(frame, dur - 8, dur, Easing.in(Easing.cubic));
  const z = 1.12 + (frame / Math.max(1, dur)) * 0.12;
  const media = w.video ? (
    <OffthreadVideo
      src={staticFile(w.src)}
      startFrom={sec(w.from ?? 0)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Img
      src={staticFile(w.src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: w.pos ?? "50% 50%",
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{ opacity: 1 - out, clipPath: `inset(0 ${(1 - inP) * 100}% 0 0)` }}
    >
      <AbsoluteFill
        style={{
          transform: `scale(${z})`,
          filter: "saturate(1.15) contrast(1.05) brightness(0.92)",
        }}
      >
        {media}
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.35 }}>
        <Img
          src={tex("white")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(30,15,5,0.55) 100%)",
        }}
      />
      <Pop
        x={540}
        y={190}
        at={8}
        seed={w.tag.length}
        rot={-3}
        sound="paper_slide"
        vol={0.2}
      >
        <TornLabel
          text={w.tag}
          size={62}
          color={INK}
          seed={w.tag.length}
          tx="kraft"
        />
      </Pop>
    </AbsoluteFill>
  );
};

/* white flash on each new scene */
const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const d = frame - sec(s.start);
  return (
    <AbsoluteFill
      style={{
        background: "#fff",
        opacity: s.start > 0 ? interpolate(d, [0, 4], [0.35, 0], clamp) : 0,
        pointerEvents: "none",
      }}
    />
  );
};

/* ---------- small paper pieces ---------- */
const Pop: React.FC<{
  x: number;
  y: number;
  at?: number;
  rot?: number;
  seed?: number;
  sound?: string | null;
  vol?: number;
  children: React.ReactNode;
}> = ({
  x,
  y,
  at = 0,
  rot = 0,
  seed = 1,
  sound = "paper_fold",
  vol = 0.18,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: onTwos(frame - at),
    fps: FPS,
    config: { damping: 12, stiffness: 170 },
  });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            perspective: 1100,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              transformOrigin: "50% 100%",
              transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.8)}deg) translateY(${Math.sin(frame / 12 + seed) * 6}px)`,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
};
const Em: React.FC<{
  code: string;
  size: number;
  style?: React.CSSProperties;
}> = ({ code, size, style }) => (
  <Img
    src={icon(code)}
    style={{
      width: size,
      height: size,
      display: "block",
      filter: stickerFilter(Math.max(5, size / 30)),
      ...style,
    }}
  />
);
const Hand: React.FC<{
  size: number;
  color?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ size, color = INK, children, style }) => (
  <div
    dir="rtl"
    style={{
      fontFamily: HAND,
      fontWeight: 700,
      fontSize: size,
      color,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
const TornLabel: React.FC<{
  text: string;
  size?: number;
  color?: string;
  seed?: number;
  tx?: "white" | "kraft";
  tint?: string;
}> = ({ text, size = 66, color = INK, seed = 3, tx = "white", tint }) => {
  const w = 110 + text.length * size * 0.5;
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed} tint={tint}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Hand size={size} color={color}>
          {text}
        </Hand>
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};

/* graphics BEHIND him (around his head) - paper stickers */
const BackGraphics: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const box = (children: React.ReactNode) => (
    <AbsoluteFill
      style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.1})` }}
    >
      {children}
    </AbsoluteFill>
  );
  switch (kind) {
    case "exam":
      return box(
        <>
          <Pop x={210} y={420} at={6} seed={1} rot={-12}>
            <Em code="1f4dd" size={200} />
          </Pop>
          <Pop x={880} y={430} at={12} seed={2} rot={10}>
            <Em code="23f0" size={170} />
          </Pop>
        </>,
      );
    case "hard":
      return box(
        <>
          <Pop x={220} y={400} at={3} seed={1} rot={-8}>
            <Em code="1f630" size={210} />
          </Pop>
          <Pop x={860} y={400} at={8} seed={2} rot={8}>
            <Em code="1f9f1" size={200} />
          </Pop>
        </>,
      );
    case "newyear":
      return box(
        <Pop x={540} y={300} at={2} seed={3} rot={-2}>
          <Sheet w={640} h={330} seed={2}>
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Hand size={60} color={PEN}>
                عام جديد
              </Hand>
            </div>
            <div
              style={{
                position: "absolute",
                left: 50,
                right: 50,
                top: 130,
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {["1f4d8", "1f4d7", "1f4d5", "1f4d9"].map((c, i) => (
                <div
                  key={c}
                  style={{
                    transform: `translateY(${(1 - spring({ frame: frame - 8 - i * 4, fps: FPS, config: { damping: 10 } })) * 120}px)`,
                    opacity: frame >= 8 + i * 4 ? 1 : 0,
                  }}
                >
                  <Em code={c} size={110} />
                </div>
              ))}
            </div>
            <Tape x={320} y={4} />
          </Sheet>
        </Pop>,
      );
    case "how":
      return box(
        <>
          <Pop x={220} y={380} at={3} seed={1} rot={-8}>
            <Em code="1f914" size={210} />
          </Pop>
          <Pop x={860} y={380} at={8} seed={2} rot={8}>
            <Em code="1f4da" size={210} />
          </Pop>
        </>,
      );
    case "grade": {
      const n = interpolate(frame, [6, 30], [8, 16], {
        ...clamp,
        easing: Easing.out(Easing.cubic),
      });
      return box(
        <>
          {frame >= 6 && frame < 30 && frame % 3 === 0 && (
            <Sfx at={frame} name="tick" vol={0.08} />
          )}
          <Pop x={540} y={300} at={2} seed={3}>
            <Sheet w={560} h={330} tx="kraft" seed={2}>
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Hand size={56} color={INK}>
                  المعدل
                </Hand>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 100,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                  direction: "ltr",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 180,
                    lineHeight: 1,
                    color: n >= 15 ? GREEN : INK,
                  }}
                >
                  {n.toFixed(0)}
                </div>
                <div
                  style={{ fontFamily: FONT, fontSize: 70, color: "#8A7F6C" }}
                >
                  /20
                </div>
              </div>
              <Tape x={280} y={4} />
            </Sheet>
          </Pop>
          <Pop
            x={880}
            y={220}
            at={30}
            seed={4}
            rot={12}
            sound="sparkle"
            vol={0.2}
          >
            <Em code="1f4c8" size={150} />
          </Pop>
        </>,
      );
    }
    case "before":
      return box(
        <Pop x={540} y={300} at={2} seed={2}>
          <Em code="270b" size={240} />
        </Pop>,
      );
    case "share": {
      const tap = 18;
      const tapped = frame >= tap;
      return box(
        <>
          <Pop x={540} y={300} at={2} seed={2}>
            <div style={{ position: "relative", width: 230, height: 230 }}>
              {[0, 1, 2].map((k) => {
                const q = ((frame + k * 12) % 36) / 36;
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: `5px solid ${PEN}`,
                      transform: `scale(${1 + q * 0.9})`,
                      opacity: 1 - q,
                    }}
                  />
                );
              })}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "#C99A63",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 10px 14px rgba(0,0,0,0.3)",
                  transform: `scale(${tapped ? interpolate(spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 300 } }), [0, 0.4, 1], [1, 0.86, 1]) : 1})`,
                }}
              >
                <svg width="140" height="140" viewBox="0 0 24 24">
                  <path
                    d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z"
                    fill="white"
                    stroke={INK}
                    strokeWidth="0.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </Pop>
          {["1f468-200d-1f393", "1f469-200d-1f393", "1f9d1-200d-1f393"].map(
            (c, i) => {
              const q = ramp(frame, tap + 2 + i * 4, tap + 18 + i * 4);
              const tx = [180, 540, 900][i];
              const ty = [560, 620, 560][i];
              return (
                <React.Fragment key={c}>
                  {q > 0 && q < 1 && (
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      style={{
                        position: "absolute",
                        left: 540 + (tx - 540) * q - 32,
                        top:
                          300 +
                          (ty - 300) * q -
                          32 -
                          Math.sin(q * Math.PI) * 120,
                      }}
                    >
                      <path
                        d="M2 11.5 22 3 15.5 21 11.5 13.2Z"
                        fill="white"
                        stroke={INK}
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {q >= 1 && (
                    <Pop
                      x={tx}
                      y={ty}
                      at={tap + 18 + i * 4}
                      seed={i}
                      sound="pop"
                      vol={0.15}
                    >
                      <Em code={c} size={140} />
                    </Pop>
                  )}
                </React.Fragment>
              );
            },
          )}
          <Sfx at={tap} name="click" vol={0.3} />
        </>,
      );
    }
    case "video":
      return box(
        <Pop x={540} y={300} at={2} seed={3} rot={-2}>
          <div
            style={{
              position: "relative",
              width: 560,
              height: 315,
              background: "#111",
              borderRadius: 26,
              boxShadow: "0 16px 24px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("v20/chalkboard.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.75,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 120,
                height: 84,
                marginLeft: -60,
                marginTop: -42,
                background: "#FF0033",
                borderRadius: 22,
                display: "grid",
                placeItems: "center",
                transform: `scale(${1 + Math.sin(frame / 5) * 0.05})`,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "20px solid transparent",
                  borderBottom: "20px solid transparent",
                  borderLeft: `34px solid #fff`,
                  marginLeft: 8,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                right: 14,
                bottom: 10,
                padding: "4px 14px",
                background: "rgba(0,0,0,0.8)",
                color: "#fff",
                fontFamily: FONT,
                fontSize: 30,
                borderRadius: 8,
              }}
            >
              قريبا
            </div>
          </div>
          <Tape x={280} y={-6} w={150} />
        </Pop>,
      );
    case "like":
      return box(
        <>
          <Pop x={220} y={380} at={3} seed={1} rot={-10}>
            <Em code="1f44d" size={210} />
          </Pop>
          <Pop x={860} y={380} at={8} seed={2} rot={10}>
            <Em code="2764" size={190} />
          </Pop>
        </>,
      );
    default:
      return null;
  }
};

/* labels IN FRONT (text stays readable) */
const FRONT: Partial<
  Record<Kind, { text: string; color?: string; y?: number }>
> = {
  exam: { text: "الفصل الأول", color: PEN },
  hard: { text: "صعيب بزاف!", color: RED },
  newyear: { text: "دروس جديدة", color: PEN },
  best: { text: "أفضل طريقة للمراجعة", color: GREEN },
  grade: { text: "وتدّي معدل", color: GREEN },
  before: { text: "قبل ما نبداو...", color: PEN },
  share: { text: "بارتاجي مع صحابك", color: PEN },
  long: { text: "الطريقة طويلة شوية", color: RED },
  video: { text: "فيديو كامل وحدو", color: PEN },
  like: { text: "إذا حبيتو 👇", color: GREEN },
  react: { text: "علّقو وتفاعلو", color: PEN },
};
const FrontLabel: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const l = FRONT[kind];
  if (!l) return null;
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Pop
        x={540}
        y={l.y ?? 1150}
        at={8}
        seed={7}
        rot={-2}
        sound="paper_rustle"
        vol={0.2}
      >
        <TornLabel text={l.text} size={64} color={l.color} seed={kind.length} />
      </Pop>
    </AbsoluteFill>
  );
};

const MJWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const x = (lag: number) =>
    interpolate(frame - lag, [0, 8, 13, 21], [1300, 0, 0, -1400], {
      ...clamp,
      easing: ease,
    });
  const mj = ramp(frame, 6, 11);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={9} name="mj_hit" vol={0.2} />
      <div
        style={{
          position: "absolute",
          left: x(-2) - 100,
          top: -100,
          width: W + 300,
          height: H + 200,
          background: GOLD,
          ...maskStyle(1),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x(1) - 60,
          top: -100,
          width: W + 200,
          height: H + 200,
          background: "#151515",
          ...maskStyle(4),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 100,
            width: W,
            height: H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 260,
              lineHeight: 1,
              letterSpacing: interpolate(mj, [0, 1], [40, -4]),
              background: MJ_GOLD,
              WebkitBackgroundClip: "text",
              color: "transparent",
              opacity: mj,
            }}
          >
            MJ
          </div>
          <div
            style={{
              width: 260 * ramp(frame, 9, 14),
              height: 6,
              borderRadius: 3,
              background: GOLD,
              marginTop: 8,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- captions ---------- */
const Caption: React.FC<{ c: Cap; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({
    frame: onTwos(frame),
    fps: FPS,
    config: { damping: 14, stiffness: 200 },
  });
  const words = c.text.split(" ");
  const per = (dur * 0.92) / words.length;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1300,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          transform: `translateY(${(1 - p) * 50}px) rotate(${(idx % 2 ? 1.4 : -1.4) + jitter(frame, idx, 0.3)}deg) scale(${0.9 + p * 0.1})`,
          opacity: Math.min(1, p * 1.5),
          filter: "drop-shadow(0 10px 12px rgba(20,10,0,0.45))",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            ...maskStyle(idx),
          }}
        >
          <Img
            src={tex("white")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          dir="rtl"
          style={{
            position: "relative",
            padding: "12px 38px 20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 14px",
            maxWidth: 940,
          }}
        >
          {words.map((w, i) => {
            const st = Math.floor(i * per);
            const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
            const hl = c.hl?.includes(w);
            const mk = ramp(frame, st, st + 6);
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: hl ? 70 : 64,
                  lineHeight: 1.35,
                  color: active ? PEN : INK,
                  backgroundImage: hl
                    ? `linear-gradient(transparent 42%, ${MARKER} 42%, ${MARKER} 92%, transparent 92%)`
                    : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right",
                  backgroundSize: hl ? `${mk * 100}% 100%` : "auto",
                  padding: hl ? "0 8px" : 0,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <Tape x={70} y={4} w={110} rot={-14} />
      </div>
      <Sfx at={0} name="paper_rustle" vol={0.1} />
    </div>
  );
};

const CommentBox: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = "نعم! اشرحها 🔥".slice(
    0,
    Math.max(0, Math.floor((frame - 10) / 3)),
  );
  return (
    <Pop x={540} y={1120} at={4} seed={3} rot={-1} sound="paper_slide">
      <div
        dir="rtl"
        style={{
          width: 860,
          background: "#fff",
          borderRadius: 34,
          padding: "22px 30px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          boxShadow: "0 16px 26px rgba(0,0,0,0.35)",
        }}
      >
        <Em code="1f4ac" size={90} style={{ filter: "none" }} />
        <div style={{ flex: 1, fontFamily: FONT, fontSize: 60, color: INK }}>
          {typed}
          <span
            style={{ color: PEN, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}
          >
            |
          </span>
        </div>
        <div
          style={{
            padding: "10px 26px",
            borderRadius: 26,
            background: frame >= 52 ? GREEN : PEN,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 40,
          }}
        >
          {frame >= 52 ? "✓" : "نشر"}
        </div>
      </div>
      {frame >= 10 && frame < 50 && frame % 6 === 0 && (
        <Sfx at={frame} name="tick" vol={0.1} />
      )}
      <Sfx at={52} name="click" vol={0.3} />
    </Pop>
  );
};

export const V20: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sw = swapAmount(frame);
  const visibleDur = (s: Sc, i: number) => {
    const end = i < SCENES.length - 1 ? SCENES[i + 1].start : DUR;
    return sec(end - s.start);
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Room />
      {SWAPS.map((w, i) => (
        <Sequence
          key={i}
          from={sec(w.start)}
          durationInFrames={sec(w.end - w.start)}
          layout="none"
        >
          <SwapBg w={w} dur={sec(w.end - w.start)} />
        </Sequence>
      ))}
      {SCENES.map((s, i) => (
        <Sequence
          key={i}
          from={sec(s.start)}
          durationInFrames={visibleDur(s, i)}
          layout="none"
        >
          <BackGraphics kind={s.kind} dur={visibleDur(s, i)} />
        </Sequence>
      ))}
      <Room cutout />
      {SCENES.map((s, i) => (
        <Sequence
          key={i}
          from={sec(s.start)}
          durationInFrames={visibleDur(s, i)}
          layout="none"
        >
          <FrontLabel kind={s.kind} dur={visibleDur(s, i)} />
          <Sfx
            at={0}
            name={i % 2 ? "paper_slide" : "paper_flip"}
            vol={i ? 0.15 : 0}
          />
        </Sequence>
      ))}
      <Sequence
        from={sec(28.7)}
        durationInFrames={sec(CLIP - 28.7)}
        layout="none"
      >
        <CommentBox />
      </Sequence>
      <Flash />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
          opacity: 1 - sw * 0.5,
          pointerEvents: "none",
        }}
      />
      {SWAPS.filter((w) => w.start > 0).map((w, i) => (
        <Sequence
          key={i}
          from={sec(w.start) - 10}
          durationInFrames={24}
          layout="none"
        >
          <MJWipe />
        </Sequence>
      ))}
      {CAPS.map((c, i) => (
        <Sequence
          key={i}
          from={Math.max(0, sec(c.start - CAP_LEAD))}
          durationInFrames={sec(c.end - c.start)}
          layout="none"
        >
          <Caption c={c} idx={i} />
        </Sequence>
      ))}
      <Sequence from={sec(CLIP)} layout="none">
        <EndCard />
      </Sequence>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 12,
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(frame / V20_FRAMES) * 100}%`,
            background: GOLD,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 40,
          top: 40,
          fontFamily: FONT,
          fontSize: 58,
          letterSpacing: -2,
          background: MJ_GOLD,
          WebkitBackgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.5))",
          opacity: t < CLIP ? 1 : 0,
        }}
      >
        MJ
      </div>
      <Audio src={staticFile("v20/riser.wav")} volume={0.55} />
      <Audio src={staticFile("v20/voice.wav")} />
      <Audio
        src={staticFile("v8/music.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, sec(CLIP) - 5, sec(CLIP) + 5, V20_FRAMES - 15, V20_FRAMES],
            [0, 0.06, 0.06, 0.2, 0.2, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};

/* gold MJ end card with follow handle */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame, fps: FPS, config: { damping: 13 } });
  return (
    <AbsoluteFill
      style={{
        background: "#151515",
        alignItems: "center",
        justifyContent: "center",
        clipPath: `circle(${p * 150}% at 50% 50%)`,
      }}
    >
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.5 }}>
        <Img
          src={tex("kraft")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 300,
          lineHeight: 1,
          background: MJ_GOLD,
          WebkitBackgroundClip: "text",
          color: "transparent",
          transform: `scale(${0.8 + p * 0.2})`,
        }}
      >
        MJ
      </div>
      <div
        style={{
          width: 320 * ramp(frame, 6, 16),
          height: 7,
          background: GOLD,
          borderRadius: 4,
          marginTop: 10,
        }}
      />
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontSize: 60,
          color: "#fff",
          marginTop: 30,
          opacity: ramp(frame, 10, 20),
        }}
      >
        تابعني باش ما يفوتكش الفيديو
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 52,
          color: GOLD,
          opacity: ramp(frame, 14, 24),
        }}
      >
        @abdelwahab__mj
      </div>
      <Sfx at={0} name="mj_hit" vol={0.25} />
    </AbsoluteFill>
  );
};
