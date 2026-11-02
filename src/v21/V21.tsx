/*
 * Video 21: "read this surah before you revise" (paper style, vertical).
 * Same look as video 20: the room stays with paper stickers behind him, his
 * study B-roll / photos as full-screen cut-aways (he is hidden, voice goes on),
 * Instagram follow card, and a calm ending on the page of Surah Yasin with the
 * recitation (no music, no effects under the Quran).
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
  HAND,
  INK,
  MARKER,
  MJ_GOLD,
  PEN,
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
export const V21_FPS = FPS;
const QURAN = 8.2;
export const V21_FRAMES = 687 + Math.round(QURAN * 30) + 10;
const DUR = V21_FRAMES / FPS;
const CAP_LEAD = 0.1;
const SCENE_LEAD = 0.25;
const CUT_LEAD = 0.3;
const MATTE_N = 687;
const CLIP = 22.9;

type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 2.2, text: "الدنيا مع الفروض", hl: ["الفروض"] },
  { start: 2.2, end: 4.4, text: "والقراية كملت عليك", hl: ["والقراية"] },
  { start: 4.55, end: 6.0, text: "في البيريود الجاية", hl: ["الجاية"] },
  { start: 6.1, end: 7.9, text: "راح تقرا، بصح ما تقلقش", hl: ["تقلقش"] },
  {
    start: 7.95,
    end: 10.6,
    text: "قبل ما تبدا تريفيزي الفرض",
    hl: ["تريفيزي"],
  },
  { start: 10.95, end: 12.4, text: "لازم تقرا هاد السورة", hl: ["السورة"] },
  { start: 12.4, end: 14.5, text: "هاد السورة تفتحلك", hl: ["تفتحلك"] },
  { start: 14.6, end: 15.6, text: "تفتحلك مخك", hl: ["مخك"] },
  {
    start: 15.65,
    end: 18.4,
    text: "قبل ما نقولك السورة، ما تنساش تبارتاجي",
    hl: ["تبارتاجي"],
  },
  { start: 18.5, end: 19.9, text: "وتديو معاكم الأجر", hl: ["الأجر"] },
  { start: 20.0, end: 21.0, text: "أبوني للكونت تاعي", hl: ["أبوني"] },
  { start: 21.1, end: 22.2, text: "راح يفيدك في حياتك", hl: ["حياتك"] },
  { start: 22.25, end: 22.9, text: "والسورة هي...", hl: ["السورة"] },
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
  stickers?: string[];
};
const SWAPS: Swap[] = [
  {
    start: 2.2 - CUT_LEAD,
    end: 6.0 - CUT_LEAD,
    src: "v20/broll_notebook.mp4",
    video: true,
    stickers: ["1f4da", "1f629"],
    tag: "📚 الفروض والقراية",
  },
  {
    start: 7.95 - CUT_LEAD,
    end: 10.75 - CUT_LEAD,
    src: "v20/broll_write.mp4",
    video: true,
    stickers: ["270d", "1f4dd"],
    tag: "✍️ قبل ما تريفيزي",
  },
  {
    start: 12.4 - CUT_LEAD,
    end: 14.6 - CUT_LEAD,
    src: "v20/chalkboard.jpg",
    pos: "8% 50%",
    stickers: ["1f9e0", "1f4a1"],
    tag: "🧠 تفتحلك مخك",
  },
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
  | "stress"
  | "calm"
  | "surah"
  | "mind"
  | "share"
  | "follow"
  | "reveal";
type Sc = { start: number; end: number; kind: Kind; zoom: number };
const SCENES_RAW: Sc[] = [
  { start: 0, end: 2.2, kind: "stress", zoom: 1.0 },
  { start: 6.0, end: 7.95, kind: "calm", zoom: 1.12 },
  { start: 10.75, end: 12.4, kind: "surah", zoom: 1.18 },
  { start: 14.6, end: 15.65, kind: "mind", zoom: 1.0 },
  { start: 15.65, end: 20.0, kind: "share", zoom: 1.12 },
  { start: 20.0, end: 22.2, kind: "follow", zoom: 1.0 },
  { start: 22.2, end: DUR, kind: "reveal", zoom: 1.2 },
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
  const matte = `url(${staticFile(`v21/matte/${String(Math.min(frame + 1, MATTE_N)).padStart(4, "0")}.jpg`)})`;
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
            src={staticFile("v21/source.mp4")}
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
// full-screen cut-away: he is hidden, his voice continues over his B-roll / photos
const SwapBg: React.FC<{ w: Swap; dur: number }> = ({ w, dur }) => {
  const frame = useCurrentFrame();
  const z = 1.08 + (frame / Math.max(1, dur)) * 0.14;
  const px = Math.sin(frame / 40) * 14;
  // jagged paper-tear reveal from the right
  const rev = ramp(frame, 0, 12, Easing.out(Easing.cubic));
  const edge = Array.from(
    { length: 17 },
    (_, k) => `${(1 - rev) * 112 - 6 + (k % 2 ? 3 : -3)}% ${(k / 16) * 100}%`,
  );
  const clip = `polygon(${edge.join(", ")}, 110% 100%, 110% 0%)`;
  // page rips apart at the end
  const p = ramp(frame, dur - 9, dur, Easing.in(Easing.cubic));
  const jag = Array.from(
    { length: 13 },
    (_, k) => `${(k / 12) * 100}% ${50 + (k % 2 ? 2.2 : -2.2)}%`,
  );
  const top = `polygon(0% 0%, 100% 0%, ${[...jag].reverse().join(", ")})`;
  const bottom = `polygon(${jag.join(", ")}, 100% 100%, 0% 100%)`;
  const sweep = ((frame * 1.6) % 260) - 80;
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
  const scene = (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${z}) translateX(${px}px)`,
          filter: "saturate(1.18) contrast(1.06)",
        }}
      >
        {media}
      </AbsoluteFill>
      {/* paper grain + warm light sweep */}
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.28 }}>
        <Img
          src={tex("white")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, rgba(255,255,255,0) ${sweep}%, rgba(255,236,190,0.28) ${sweep + 12}%, rgba(255,255,255,0) ${sweep + 24}%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(30,15,5,0.5) 100%)",
        }}
      />
      {/* torn paper edges top and bottom */}
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: -30,
          height: 110,
          overflow: "hidden",
          ...maskStyle(w.tag.length),
        }}
      >
        <Img
          src={tex("white")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          bottom: -30,
          height: 110,
          overflow: "hidden",
          transform: "rotate(180deg)",
          ...maskStyle(w.tag.length + 3),
        }}
      >
        <Img
          src={tex("white")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <Pop
        x={540}
        y={230}
        at={8}
        seed={w.tag.length}
        rot={-3}
        sound="paper_slide"
        vol={0.2}
      >
        <TornLabel
          text={w.tag}
          size={64}
          color={INK}
          seed={w.tag.length}
          tx="kraft"
        />
      </Pop>
      {(w.stickers ?? []).map((c, k) => (
        <Pop
          key={c}
          x={k ? 870 : 200}
          y={k ? 1020 : 470}
          at={14 + k * 8}
          seed={k + 3}
          rot={k ? 10 : -10}
          sound="pop"
          vol={0.15}
        >
          <Em code={c} size={170} />
        </Pop>
      ))}
    </AbsoluteFill>
  );
  if (p <= 0)
    return <AbsoluteFill style={{ clipPath: clip }}>{scene}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <Sfx at={dur - 9} name="paper_tear" vol={0.3} />
      <AbsoluteFill
        style={{
          clipPath: top,
          transform: `translate(${-p * 140}px, ${-p * 1100}px) rotate(${-p * 9}deg)`,
        }}
      >
        {scene}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: bottom,
          transform: `translate(${p * 140}px, ${p * 1100}px) rotate(${p * 9}deg)`,
        }}
      >
        {scene}
      </AbsoluteFill>
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
    case "stress":
      return box(
        <>
          <Pop x={210} y={420} at={4} seed={1} rot={-12}>
            <Em code="1f4dd" size={200} />
          </Pop>
          <Pop x={870} y={420} at={10} seed={2} rot={10}>
            <Em code="1f630" size={190} />
          </Pop>
        </>,
      );
    case "calm":
      return box(
        <>
          <Pop x={220} y={400} at={3} seed={1} rot={-8}>
            <Em code="1f60c" size={210} />
          </Pop>
          <Pop x={860} y={400} at={8} seed={2} rot={8}>
            <Em code="1f44c" size={190} />
          </Pop>
        </>,
      );
    case "surah":
      return box(
        <>
          <Pop x={540} y={290} at={2} seed={3}>
            <Em code="1f4d6" size={250} />
          </Pop>
          <Pop x={230} y={430} at={10} seed={1} rot={-10}>
            <Em code="2728" size={120} />
          </Pop>
          <Pop x={860} y={430} at={13} seed={2} rot={10}>
            <Em code="1f932" size={150} />
          </Pop>
        </>,
      );
    case "mind":
      return box(
        <>
          <Pop x={230} y={400} at={2} seed={1} rot={-8}>
            <Em code="1f9e0" size={200} />
          </Pop>
          <Pop x={860} y={400} at={6} seed={2} rot={8}>
            <Em code="1f4a1" size={190} />
          </Pop>
        </>,
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
    case "follow": {
      const tap = 22;
      const tapped = frame >= tap;
      const press = spring({
        frame: frame - tap,
        fps: FPS,
        config: { damping: 9, stiffness: 300 },
      });
      const hand = spring({
        frame: frame - (tap - 10),
        fps: FPS,
        config: { damping: 15, stiffness: 180 },
      });
      return box(
        <Pop x={540} y={330} at={2} seed={2} rot={-2} sound="paper_slide">
          <div
            style={{
              position: "relative",
              width: 640,
              background: "#fff",
              borderRadius: 30,
              padding: 14,
              boxShadow: "0 18px 28px rgba(0,0,0,0.4)",
            }}
          >
            <Img
              src={staticFile("profile_shot.png")}
              style={{ width: "100%", display: "block", borderRadius: 18 }}
            />
            <div
              style={{
                marginTop: 10,
                height: 74,
                borderRadius: 16,
                background: tapped ? "#EFEFEF" : "#0095F6",
                color: tapped ? INK : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Roboto, Arial, sans-serif",
                fontWeight: 700,
                fontSize: 38,
                transform: `scale(${tapped ? interpolate(press, [0, 0.4, 1], [1, 0.88, 1]) : 1})`,
              }}
            >
              {tapped ? "Following ✓" : "Follow"}
            </div>
            <div
              style={{
                position: "absolute",
                right: 60,
                bottom: -80,
                fontSize: 110,
                transform: `translate(${(1 - hand) * 260}px, ${(1 - hand) * 260}px)`,
                opacity: frame < tap + 18 ? 1 : 0,
              }}
            >
              👆
            </div>
            {tapped &&
              Array.from({ length: 7 }, (_, k) => {
                const q = ramp(frame, tap + k * 2, tap + 26 + k * 2);
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 40,
                      fontSize: 50,
                      opacity: q > 0 && q < 1 ? 1 - q : 0,
                      transform: `translate(${(k - 3) * 70 * q}px, ${-q * 300}px)`,
                    }}
                  >
                    ❤️
                  </div>
                );
              })}
            <Tape x={320} y={-6} w={150} />
          </div>
          <Sfx at={tap} name="click" vol={0.3} />
          <Sfx at={tap + 2} name="ding" vol={0.25} />
        </Pop>,
      );
    }
    case "reveal":
      return box(
        <Pop x={540} y={300} at={2} seed={3}>
          <Em code="1f4d6" size={240} />
        </Pop>,
      );
    default:
      return null;
  }
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

export const V21: React.FC = () => {
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
          <Sfx
            at={0}
            name={i % 2 ? "paper_slide" : "paper_flip"}
            vol={i ? 0.15 : 0}
          />
        </Sequence>
      ))}
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
        <QuranEnd />
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
            width: `${(frame / V21_FRAMES) * 100}%`,
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
      <Audio src={staticFile("v21/riser.wav")} volume={0.55} />
      <Audio src={staticFile("v21/voice.wav")} />
      <Audio
        src={staticFile("v8/music.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, sec(CLIP) - 20, sec(CLIP)],
            [0, 0.06, 0.06, 0],
            clamp,
          )
        }
      />
      <Sequence from={sec(CLIP) + 12} layout="none">
        <Audio src={staticFile("v21/quran.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* calm ending: the page of Surah Yasin with the recitation (no music, no effects) */
const QuranEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 18, Easing.inOut(Easing.cubic));
  const z = 1.0 + frame * 0.00025;
  const end = V21_FRAMES - sec(CLIP);
  const out = ramp(frame, end - 14, end, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill
      style={{
        background: "#0E1A14",
        opacity: inP * (1 - out) + (1 - inP) * 0,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 42%, #1F3A2C 0%, #0E1A14 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 300,
          display: "flex",
          justifyContent: "center",
          opacity: ramp(frame, 8, 26),
        }}
      >
        <div
          style={{
            fontFamily: HAND,
            fontSize: 96,
            color: "#E9D9A6",
            textShadow: "0 0 24px rgba(233,217,166,0.35)",
          }}
        >
          سورة يس
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 520,
          transform: `scale(${z})`,
          transformOrigin: "50% 40%",
          opacity: ramp(frame, 4, 24),
        }}
      >
        <div
          style={{
            padding: 16,
            background: "linear-gradient(135deg, #C8A24A, #F1DA8E, #B08530)",
            borderRadius: 18,
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          }}
        >
          <Img
            src={staticFile("v21/yasin.jpg")}
            style={{ width: "100%", display: "block", borderRadius: 8 }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 260,
          display: "flex",
          justifyContent: "center",
          opacity: ramp(frame, 30, 50),
        }}
      >
        <div
          style={{
            width: 360 * ramp(frame, 30, 60),
            height: 3,
            background: "#C8A24A",
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
