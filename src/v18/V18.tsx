/*
 * Video 18: MJ Burger giveaway ad (3 free burgers: comment, draw tomorrow, share).
 * Same orange + gold neon look as video 17. His food photos and the logo sit
 * between him and the street (matte), text and UI stay in front.
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
import { FPS, Sfx, clamp, icon, ramp, sec } from "../yt2/kit";

loadFonts();

const W = 1080;
const H = 1920;
const PURPLE = "#C2410C";
const VIOLET = "#FF7A1A";
const DEEP = "#2A1000";
const GOLD = "#FFC83D";
const GOLD2 = "#FFE7A3";
const INTRO = 0; // starts directly on his words
const CLIP = 23.55;
const MONTAGE = 6.4; // food montage after he finishes talking
const OUTRO = 5.5;
export const V18_FPS = FPS;
export const V18_FRAMES = Math.round((INTRO + CLIP + MONTAGE + OUTRO) * FPS);
const T = (s: number) => sec(INTRO + s); // clip time -> frame
const MATTE_N = 707;

/* ---------------- words (clip time) ---------------- */
type Cap = { start: number; end: number; text: string; hl?: string[] };
const MJ = "MJ\u00A0Burger";
const CAPS: Cap[] = [
  { start: 0.07, end: 2.99, text: `${MJ} راح يمدلكم`, hl: [MJ] },
  { start: 2.99, end: 3.97, text: "ثلاثة برغر 🍔", hl: ["ثلاثة"] },
  { start: 3.97, end: 6.11, text: "باطل! تقدر تديهم", hl: ["باطل!"] },
  { start: 6.18, end: 7.48, text: "للوالدة تاعك ولا ليك", hl: ["للوالدة"] },
  { start: 7.81, end: 10.6, text: "الشرط بسيط: خلي كومنتار", hl: ["كومنتار"] },
  { start: 10.67, end: 12.16, text: "تحت هاد الفيديو", hl: ["الفيديو"] },
  { start: 12.27, end: 14.39, text: "واللي يربح ياخذ 3 برغر", hl: ["يربح"] },
  { start: 14.53, end: 16.98, text: "السحب يكون غدوة", hl: ["غدوة"] },
  { start: 17.22, end: 19.19, text: "لازم تبارتاجي الفيديو", hl: ["تبارتاجي"] },
  { start: 19.3, end: 21.91, text: "مرحبا بيكم خوتي", hl: ["مرحبا"] },
  { start: 22.3, end: 23.4, text: `${MJ} 🍔`, hl: [MJ] },
];

type Kind =
  | "brand"
  | "three"
  | "free"
  | "mom"
  | "rule"
  | "comment"
  | "win"
  | "draw"
  | "share"
  | "welcome"
  | "bye";
const SCENES: { start: number; kind: Kind; zoom: number }[] = [
  { start: 0, kind: "brand", zoom: 1.0 },
  { start: 2.99, kind: "three", zoom: 1.14 },
  { start: 3.97, kind: "free", zoom: 1.0 },
  { start: 6.18, kind: "mom", zoom: 1.12 },
  { start: 7.81, kind: "rule", zoom: 1.0 },
  { start: 10.67, kind: "comment", zoom: 1.1 },
  { start: 12.27, kind: "win", zoom: 1.0 },
  { start: 14.53, kind: "draw", zoom: 1.14 },
  { start: 17.22, kind: "share", zoom: 1.0 },
  { start: 19.3, kind: "welcome", zoom: 1.08 },
  { start: 22.3, kind: "bye", zoom: 1.2 },
];
const LEAD = 0.25;
/* full-screen food cut-aways (voice continues) */
const CUTS: {
  start: number;
  end: number;
  src: string;
  label: string;
  from?: number;
}[] = [
  { start: 3.97, end: 6.11, src: "v18/broll1.mp4", label: "🎁 باطل!", from: 1 },
];
const IRIS_AT = [7.81, 19.3];
/* ---------------- the clip ---------------- */
const useZoom = (frame: number) => {
  const t = frame / FPS - INTRO;
  let i = 0;
  for (let k = 0; k < SCENES.length; k++)
    if (SCENES[k].start - LEAD <= t) i = k;
  const s = SCENES[i];
  const prev = SCENES[Math.max(0, i - 1)];
  const k = spring({
    frame: frame - T(s.start - LEAD),
    fps: FPS,
    config: { damping: 16, stiffness: 140 },
  });
  return prev.zoom + (s.zoom - prev.zoom) * k + (frame - T(s.start)) * 0.0005;
};
const Clip: React.FC<{ cutout?: boolean }> = ({ cutout }) => {
  const local = useCurrentFrame();
  const frame = local + sec(INTRO);
  const z = useZoom(frame);
  const idx = Math.min(MATTE_N, Math.max(1, local + 1));
  const matte = `url(${staticFile(`v18/matte/${String(idx).padStart(4, "0")}.jpg`)})`;
  const mask: React.CSSProperties = cutout
    ? ({
        maskImage: matte,
        WebkitMaskImage: matte,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskMode: "luminance",
      } as React.CSSProperties)
    : {};
  return (
    <AbsoluteFill
      style={{ transform: `scale(${z})`, transformOrigin: "50% 32%" }}
    >
      <AbsoluteFill style={mask}>
        <OffthreadVideo
          src={staticFile("v18/source.mp4")}
          muted
          style={{
            width: W,
            height: H,
            filter: "saturate(1.12) contrast(1.08) brightness(1.02)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- look: grade, light leak, bokeh ---------------- */
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const lx = 50 + Math.sin(frame / 40) * 40;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${PURPLE}33 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, ${DEEP}cc 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${lx}% 8%, rgba(255,200,90,0.18) 0%, rgba(255,160,60,0.0) 40%)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,25,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
const Bokeh: React.FC<{ n?: number; top?: number }> = ({ n = 16, top = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const s = 30 + ((i * 53) % 90);
        const x = ((i * 397) % W) + Math.sin(frame / (50 + i * 3) + i) * 40;
        const y =
          top +
          ((((i * 211) % 1100) - frame * (0.5 + (i % 3) * 0.3) + 4000) % 1100);
        const c = i % 3 ? GOLD : VIOLET;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c}cc 0%, ${c}00 70%)`,
              opacity: 0.35 + Math.sin(frame / 9 + i) * 0.15,
              filter: "blur(2px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- building blocks ---------------- */
const useIn = (d = 0, damping = 11) => {
  const frame = useCurrentFrame();
  return spring({
    frame: frame - d,
    fps: FPS,
    config: { damping, stiffness: 170 },
  });
};
const Glow3D: React.FC<{
  code: string;
  size: number;
  x: number;
  y: number;
  d?: number;
  ring?: boolean;
  spin?: boolean;
}> = ({ code, size, x, y, d = 0, ring = true, spin }) => {
  const frame = useCurrentFrame();
  const p = useIn(d, 9);
  const f = Math.sin((frame - d) / 12);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        transform: `scale(${p}) translateY(${f * 10}px) rotate(${spin ? (frame - d) * 1.2 : f * 4}deg)`,
      }}
    >
      {ring && (
        <>
          <div
            style={{
              position: "absolute",
              inset: -size * 0.28,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${GOLD}66 0%, ${VIOLET}33 40%, rgba(0,0,0,0) 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: -size * 0.12,
              borderRadius: "50%",
              border: `6px solid ${GOLD}`,
              boxShadow: `0 0 30px ${GOLD}, inset 0 0 30px ${GOLD}88`,
              opacity: 0.85,
              transform: `rotate(${frame * 2}deg)`,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
            }}
          />
        </>
      )}
      <Img
        src={icon(code)}
        style={{
          position: "relative",
          width: size,
          height: size,
          filter: `drop-shadow(0 18px 24px rgba(20,0,40,0.6)) drop-shadow(0 0 22px ${GOLD}aa)`,
        }}
      />
    </div>
  );
};
const NeonWord: React.FC<{
  text: string;
  y: number;
  size: number;
  d?: number;
  color?: string;
}> = ({ text, y, size, d = 0, color = GOLD }) => {
  const frame = useCurrentFrame();
  const p = useIn(d, 12);
  const flick =
    frame - d < 10 ? (Math.floor((frame - d) / 2) % 2 ? 0.4 : 1) : 1;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1,
        color: "#fff",
        opacity: Math.min(1, p) * flick,
        transform: `scale(${0.7 + p * 0.3})`,
        textShadow: `0 0 12px ${color}, 0 0 34px ${color}, 0 0 70px ${VIOLET}`,
        WebkitTextStroke: `3px ${color}`,
      }}
    >
      {text}
    </div>
  );
};
const Glass: React.FC<{
  x: number;
  y: number;
  w: number;
  d?: number;
  children: React.ReactNode;
  rot?: number;
}> = ({ x, y, w, d = 0, children, rot = 0 }) => {
  const p = useIn(d, 13);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y,
        width: w,
        transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + p * 0.15}) rotate(${rot}deg)`,
        opacity: Math.min(1, p * 1.5),
        background:
          "linear-gradient(135deg, rgba(150,52,8,0.85), rgba(42,16,0,0.82))",
        border: `3px solid ${GOLD}aa`,
        borderRadius: 36,
        boxShadow: `0 20px 40px rgba(20,0,40,0.45), 0 0 40px ${VIOLET}55`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        padding: 26,
      }}
    >
      {children}
    </div>
  );
};
const Burst: React.FC<{ x: number; y: number; d: number; n?: number }> = ({
  x,
  y,
  d,
  n = 22,
}) => {
  const frame = useCurrentFrame();
  const t = frame - d;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const v = 14 + (i % 4) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * v * t,
              top: y + Math.sin(a) * v * t + t * t * 0.5,
              width: 14,
              height: 14,
              borderRadius: i % 2 ? "50%" : 3,
              background: i % 3 ? GOLD : VIOLET,
              opacity: 1 - t / 30,
              boxShadow: `0 0 12px ${GOLD}`,
            }}
          />
        );
      })}
    </>
  );
};

/* ---------------- graphics BEHIND him ---------------- */
// a framed photo that pops in behind him
const PhotoCard: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  d?: number;
  rot?: number;
}> = ({ src, x, y, w, h, d = 0, rot = 0 }) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: frame - d,
    fps: FPS,
    config: { damping: 11, stiffness: 150 },
  });
  if (frame < d) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `scale(${p}) rotate(${rot + (1 - p) * -20 + Math.sin((frame - d) / 18) * 1.5}deg) translateY(${Math.sin((frame - d) / 14) * 8}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -26,
          borderRadius: 40,
          background: `radial-gradient(circle, ${GOLD}66 0%, ${VIOLET}22 55%, rgba(0,0,0,0) 72%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 26,
          border: `6px solid ${GOLD}`,
          boxShadow: `0 20px 34px rgba(20,0,0,0.55), 0 0 34px ${GOLD}aa`,
          overflow: "hidden",
          background: DEEP,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${1.08 + (frame - d) * 0.0015})`,
          }}
        />
      </div>
      <Sfx at={d} name="whoosh_in" vol={0.18} />
    </div>
  );
};
const Behind: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const wrap = (c: React.ReactNode) => (
    <AbsoluteFill
      style={{ opacity: 1 - out, transform: `scale(${1 + out * 0.15})` }}
    >
      {c}
    </AbsoluteFill>
  );
  switch (kind) {
    case "brand":
      return wrap(
        <>
          <div style={{ position: "absolute", left: W / 2, top: 330 }}>
            <Rays p={ramp(frame, 4, 18)} size={820} />
          </div>
          <Img
            src={staticFile("v18/logo.png")}
            style={{
              position: "absolute",
              left: W / 2 - 200,
              top: 110,
              width: 400,
              filter: `drop-shadow(0 0 40px ${GOLD})`,
              transform: `scale(${spring({ frame: frame - 2, fps: FPS, config: { damping: 9 } })})`,
            }}
          />
          <PhotoCard
            src="v18/photo2.jpg"
            x={190}
            y={560}
            w={280}
            h={370}
            d={14}
            rot={-9}
          />
          <PhotoCard
            src="v18/photo4.jpg"
            x={890}
            y={560}
            w={280}
            h={370}
            d={22}
            rot={9}
          />
        </>,
      );
    case "three":
      return wrap(
        <>
          <PhotoCard
            src="v18/photo4.jpg"
            x={190}
            y={430}
            w={300}
            h={390}
            d={0}
            rot={-8}
          />
          <PhotoCard
            src="v18/photo1.jpg"
            x={540}
            y={250}
            w={360}
            h={250}
            d={9}
            rot={0}
          />
          <PhotoCard
            src="v18/photo5.jpg"
            x={890}
            y={430}
            w={300}
            h={390}
            d={18}
            rot={8}
          />
        </>,
      );
    case "mom":
      return wrap(
        <>
          <Glow3D code="1f469" size={200} x={200} y={340} d={2} />
          <Glow3D code="2764" size={150} x={250} y={560} d={10} ring={false} />
          <PhotoCard
            src="v18/photo3.jpg"
            x={870}
            y={420}
            w={320}
            h={420}
            d={6}
            rot={7}
          />
        </>,
      );
    case "rule":
      return wrap(<Glow3D code="261d" size={230} x={860} y={330} d={2} />);
    case "comment":
      return wrap(
        <>
          <Glow3D code="1f4ac" size={210} x={210} y={330} d={2} />
          <PhotoCard
            src="v18/photo2.jpg"
            x={880}
            y={430}
            w={300}
            h={400}
            d={8}
            rot={7}
          />
        </>,
      );
    case "win":
      return wrap(
        <>
          <div style={{ position: "absolute", left: W / 2, top: 330 }}>
            <Rays p={ramp(frame, 2, 14)} size={900} />
          </div>
          <PhotoCard
            src="v18/photo1.jpg"
            x={540}
            y={300}
            w={560}
            h={380}
            d={0}
          />
          <Glow3D code="1f3c6" size={170} x={170} y={620} d={10} />
          <Glow3D code="1f381" size={170} x={910} y={620} d={16} />
          <Burst x={540} y={300} d={6} />
        </>,
      );
    case "draw":
      return wrap(
        <>
          <Glow3D code="1f381" size={220} x={210} y={340} d={2} spin />
          <Glow3D code="1f4c5" size={200} x={870} y={330} d={8} />
        </>,
      );
    case "share":
      return wrap(
        <>
          <Glow3D code="1f4e4" size={210} x={210} y={330} d={2} />
          <Glow3D code="1f465" size={210} x={870} y={330} d={8} />
        </>,
      );
    case "welcome":
      return wrap(
        <>
          <Img
            src={staticFile("v18/logo.png")}
            style={{
              position: "absolute",
              left: W / 2 - 170,
              top: 120,
              width: 340,
              filter: `drop-shadow(0 0 30px ${GOLD})`,
              transform: `scale(${spring({ frame: frame - 4, fps: FPS, config: { damping: 10 } })})`,
            }}
          />
          <PhotoCard
            src="v18/photo5.jpg"
            x={180}
            y={600}
            w={270}
            h={350}
            d={10}
            rot={-8}
          />
          <PhotoCard
            src="v18/photo3.jpg"
            x={900}
            y={600}
            w={270}
            h={350}
            d={16}
            rot={8}
          />
        </>,
      );
    case "bye":
      return wrap(
        <>
          <Glow3D code="1f389" size={220} x={220} y={330} d={2} />
          <Glow3D code="1f354" size={220} x={860} y={330} d={6} />
          <Burst x={220} y={330} d={4} />
        </>,
      );
    default:
      return null;
  }
};

/* ---------------- UI IN FRONT of him ---------------- */
const Front: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const wrap = (c: React.ReactNode) => (
    <AbsoluteFill style={{ opacity: 1 - out }}>{c}</AbsoluteFill>
  );
  switch (kind) {
    case "three":
      return wrap(<NeonWord text="×3 🍔" y={1120} size={150} d={6} />);
    case "mom":
      return wrap(<NeonWord text="للوالدة 🧡" y={1180} size={110} d={6} />);
    case "rule":
      return wrap(
        <Glass x={W / 2} y={1060} w={860} d={6} rot={-2}>
          <div
            dir="rtl"
            style={{ fontFamily: FONT, color: "#fff", textAlign: "center" }}
          >
            <div style={{ fontSize: 46, color: GOLD2 }}>الشرط بسيط</div>
            <div style={{ fontSize: 80, lineHeight: 1.2 }}>خلي كومنتار 💬</div>
          </div>
        </Glass>,
      );
    case "comment": {
      const typed = "🍔🍔🍔 نحب MJ Burger".slice(
        0,
        Math.max(0, Math.floor((frame - 10) / 1.6)),
      );
      const heart = spring({
        frame: frame - 34,
        fps: FPS,
        config: { damping: 8, stiffness: 200 },
      });
      return wrap(
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 1060,
            transform: `translateY(${(1 - spring({ frame: frame - 2, fps: FPS, config: { damping: 13, stiffness: 170 } })) * 200}px)`,
          }}
        >
          <div
            dir="rtl"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "rgba(255,255,255,0.96)",
              borderRadius: 34,
              padding: "22px 26px",
              boxShadow: `0 16px 30px rgba(0,0,0,0.45), 0 0 30px ${GOLD}88`,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${VIOLET}, ${GOLD})`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, fontFamily: FONT, color: DEEP }}>
              <div style={{ fontSize: 30, color: "#777" }}>أنت</div>
              <div style={{ fontSize: 48, minHeight: 60 }}>
                {typed}
                <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>
              </div>
            </div>
            <div
              style={{
                fontSize: 60,
                transform: `scale(${frame > 34 ? 0.8 + heart * 0.4 : 0.8})`,
                filter: frame > 34 ? "none" : "grayscale(1)",
              }}
            >
              ❤️
            </div>
          </div>
          <Sfx at={10} name="tick" vol={0.15} />
          <Sfx at={34} name="pop" vol={0.25} />
        </div>,
      );
    }
    case "win":
      return wrap(<NeonWord text="يربح 3 برغر 🏆" y={1120} size={110} d={6} />);
    case "draw":
      return wrap(
        <Glass x={W / 2} y={1060} w={760} d={6} rot={2}>
          <div
            dir="rtl"
            style={{ fontFamily: FONT, color: "#fff", textAlign: "center" }}
          >
            <div style={{ fontSize: 46, color: GOLD2 }}>السحب 🎁</div>
            <div
              style={{
                fontSize: 96,
                lineHeight: 1.15,
                textShadow: `0 0 20px ${GOLD}`,
              }}
            >
              غدوة!
            </div>
          </div>
        </Glass>,
      );
    case "share": {
      const tap = 22;
      const press = spring({
        frame: frame - tap,
        fps: FPS,
        config: { damping: 9, stiffness: 300 },
      });
      const tapped = frame >= tap;
      return wrap(
        <>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 110,
              top: 1060,
              width: 220,
              height: 220,
            }}
          >
            {[0, 1, 2].map((k) => {
              const t = ((frame + k * 12) % 36) / 36;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `5px solid ${GOLD}`,
                    transform: `scale(${1 + t * 0.9})`,
                    opacity: 1 - t,
                  }}
                />
              );
            })}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${VIOLET}, ${PURPLE})`,
                border: `6px solid ${GOLD}`,
                display: "grid",
                placeItems: "center",
                transform: `scale(${tapped ? interpolate(press, [0, 0.4, 1], [1, 0.85, 1]) : 1})`,
                boxShadow: `0 0 40px ${GOLD}aa`,
              }}
            >
              <svg width="120" height="120" viewBox="0 0 24 24">
                <path
                  d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z"
                  fill="white"
                />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                right: -70,
                bottom: -90,
                fontSize: 110,
                transform: `translate(${(1 - spring({ frame: frame - (tap - 12), fps: FPS, config: { damping: 15 } })) * 200}px, ${(1 - spring({ frame: frame - (tap - 12), fps: FPS, config: { damping: 15 } })) * 200}px)`,
                opacity: frame < tap + 20 ? 1 : 0,
              }}
            >
              👆
            </div>
          </div>
          {tapped && <Burst x={W / 2} y={1170} d={tap} />}
          <Sfx at={tap} name="click" vol={0.3} />
          <Sfx at={tap + 2} name="ding" vol={0.22} />
        </>,
      );
    }
    case "welcome":
      return wrap(<NeonWord text="مرحبا بيكم 🧡" y={1180} size={110} d={8} />);
    default:
      return null;
  }
};

/* ---------------- food cut-away (full screen, voice continues) ---------------- */
const FoodCut: React.FC<{
  src: string;
  label: string;
  dur: number;
  from?: number;
}> = ({ src, label, dur, from = 0 }) => {
  const frame = useCurrentFrame();
  const inP = spring({
    frame,
    fps: FPS,
    config: { damping: 14, stiffness: 150 },
  });
  const out = ramp(frame, dur - 8, dur, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill
      style={{
        clipPath: `circle(${Math.min(1, inP) * (1 - out) * 150}% at 50% 50%)`,
      }}
    >
      <AbsoluteFill style={{ transform: `scale(${1.08 + frame * 0.0012})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={sec(from)}
          muted
          style={{
            width: W,
            height: H,
            objectFit: "cover",
            filter: "saturate(1.25) contrast(1.08) brightness(1.04)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${DEEP}88 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, ${DEEP}cc 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, ${PURPLE}66 100%)`,
          mixBlendMode: "multiply",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 240,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          dir="rtl"
          style={{
            padding: "18px 50px 26px",
            borderRadius: 50,
            background: `linear-gradient(135deg, ${PURPLE}, ${VIOLET})`,
            border: `5px solid ${GOLD}`,
            fontFamily: FONT,
            fontSize: 80,
            color: "#fff",
            boxShadow: `0 0 40px ${GOLD}aa`,
            transform: `scale(${spring({ frame: frame - 6, fps: FPS, config: { damping: 9 } })}) rotate(-3deg)`,
          }}
        >
          {label}
        </div>
      </div>
      <Img
        src={staticFile("v18/logo.png")}
        style={{
          position: "absolute",
          right: 40,
          bottom: 330,
          width: 200,
          filter: `drop-shadow(0 0 20px ${GOLD})`,
          transform: `rotate(${Math.sin(frame / 10) * 4}deg)`,
        }}
      />
      <Sfx at={0} name="swipe" vol={0.35} />
      <Sfx at={6} name="pop" vol={0.2} />
    </AbsoluteFill>
  );
};

/* ---------------- fast food montage after the talk ---------------- */
const MONTAGE_SHOTS = [
  { kind: "p", src: "v18/photo1.jpg", label: "🍔 برغر" },
  { kind: "v", src: "v18/broll1.mp4", from: 3, label: "🔥 بنين" },
  { kind: "p", src: "v18/photo4.jpg", label: "😋 مشبّع" },
  { kind: "p", src: "v18/photo3.jpg", label: "🥖 صندويتش" },
  { kind: "p", src: "v18/photo5.jpg", label: "🍳 بالبيض" },
  { kind: "p", src: "v18/photo2.jpg", label: "🎁 3 باطل" },
] as const;
const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const per = Math.round(sec(MONTAGE) / MONTAGE_SHOTS.length);
  const i = Math.min(MONTAGE_SHOTS.length - 1, Math.floor(frame / per));
  const local = frame - i * per;
  const sh = MONTAGE_SHOTS[i];
  const punch = 1.12 + local * 0.004 + (local < 4 ? (4 - local) * 0.03 : 0);
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      <AbsoluteFill
        style={{ transform: `scale(${punch}) rotate(${i % 2 ? 1 : -1}deg)` }}
      >
        {sh.kind === "v" ? (
          <OffthreadVideo
            src={staticFile(sh.src)}
            startFrom={sec(sh.from)}
            muted
            style={{
              width: W,
              height: H,
              objectFit: "cover",
              filter: "saturate(1.3) contrast(1.1)",
            }}
          />
        ) : (
          <Img
            src={staticFile(sh.src)}
            style={{
              width: W,
              height: H,
              objectFit: "cover",
              filter: "saturate(1.3) contrast(1.1)",
            }}
          />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, ${DEEP}cc 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: interpolate(local, [0, 3], [0.5, 0], clamp),
        }}
      />
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
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 130,
            color: "#fff",
            textShadow: `0 0 20px ${GOLD}, 0 0 50px ${VIOLET}`,
            WebkitTextStroke: `3px ${GOLD}`,
            transform: `scale(${spring({ frame: local, fps: FPS, config: { damping: 8, stiffness: 220 } })})`,
          }}
        >
          {sh.label}
        </div>
      </div>
      <Img
        src={staticFile("v18/logo.png")}
        style={{
          position: "absolute",
          left: W / 2 - 110,
          top: 120,
          width: 220,
          filter: `drop-shadow(0 0 24px ${GOLD})`,
        }}
      />
      {MONTAGE_SHOTS.map((_, k) => (
        <Sfx
          key={k}
          at={k * per}
          name={k % 2 ? "whoosh_out" : "whoosh_in"}
          vol={0.3}
        />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- kinetic captions ---------------- */
const Caption: React.FC<{ c: Cap }> = ({ c }) => {
  const frame = useCurrentFrame();
  const words = c.text.split(" ");
  const dur = sec(c.end - c.start);
  const per = (dur * 0.9) / words.length;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: 1560,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 18px",
      }}
    >
      {words.map((w, i) => {
        const st = Math.floor(i * per);
        const p = spring({
          frame: frame - st + 2,
          fps: FPS,
          config: { damping: 10, stiffness: 260 },
        });
        const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
        const hl = c.hl?.includes(w);
        return (
          <span
            key={i}
            style={{
              position: "relative",
              fontFamily: FONT,
              fontSize: hl ? 92 : 78,
              lineHeight: 1.25,
              color: hl ? GOLD : "#fff",
              opacity: frame >= st - 2 ? 1 : 0,
              transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + p * 0.4 + (active ? 0.06 : 0)})`,
              filter: `blur(${(1 - Math.min(1, p)) * 6}px)`,
              textShadow: `0 6px 0 ${DEEP}, 0 0 18px ${hl ? GOLD : VIOLET}aa`,
              WebkitTextStroke: `2px ${DEEP}`,
              padding: active ? "0 14px" : "0 2px",
              borderRadius: 18,
              background: active
                ? `linear-gradient(135deg, ${PURPLE}ee, ${VIOLET}ee)`
                : "transparent",
              boxShadow: active ? `0 0 26px ${VIOLET}` : "none",
            }}
          >
            {w}
          </span>
        );
      })}
      <Sfx at={0} name="pop2" vol={0.08} />
    </div>
  );
};

/* ---------------- logo intro, iris transitions, watermark, outro ---------------- */
const Rays: React.FC<{ p: number; size: number }> = ({ p, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="-50 -50 100 100"
    style={{
      position: "absolute",
      left: -size / 2,
      top: -size / 2,
      overflow: "visible",
    }}
  >
    {[-80, -45, -10, 25, 60].map((a, i) => {
      const k = Math.max(0, Math.min(1, p * 5 - i * 0.6));
      const r1 = 30;
      const r2 = 30 + 14 * k;
      const rad = ((a - 90 + 10) * Math.PI) / 180;
      return (
        <line
          key={i}
          x1={Math.cos(rad) * r1}
          y1={Math.sin(rad) * r1}
          x2={Math.cos(rad) * r2}
          y2={Math.sin(rad) * r2}
          stroke={GOLD}
          strokeWidth="5"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${GOLD})` }}
        />
      );
    })}
  </svg>
);
const Iris: React.FC = () => {
  const frame = useCurrentFrame();
  const close = ramp(frame, 0, 9, Easing.in(Easing.cubic));
  const open = ramp(frame, 13, 24, Easing.out(Easing.cubic));
  const r = close * (1 - open) * 120;
  const lp = spring({
    frame: frame - 6,
    fps: FPS,
    config: { damping: 10, stiffness: 200 },
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, ${VIOLET}, ${PURPLE} 45%, ${DEEP})`,
          clipPath: `circle(${r}% at 50% 45%)`,
        }}
      >
        <div style={{ position: "absolute", left: W / 2, top: 860 }}>
          <Rays p={ramp(frame, 6, 16)} size={760} />
        </div>
        <Img
          src={staticFile("v18/logo.png")}
          style={{
            position: "absolute",
            left: W / 2 - 200,
            top: 640,
            width: 400,
            transform: `scale(${lp}) rotate(${(1 - lp) * -60}deg)`,
            filter: `drop-shadow(0 0 40px ${GOLD})`,
          }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: W / 2 - 700,
          top: 864 - 700,
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          border: `14px solid ${GOLD}`,
          boxShadow: `0 0 50px ${GOLD}`,
          transform: `scale(${r / 100 + 0.02})`,
          opacity: r > 1 && r < 115 ? 1 : 0,
        }}
      />
      <Sfx at={0} name="whoosh_in" vol={0.4} />
      <Sfx at={9} name="boom" vol={0.3} />
      <Sfx at={10} name="sparkle" vol={0.25} />
      <Sfx at={13} name="whoosh_out" vol={0.35} />
    </AbsoluteFill>
  );
};
const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = interpolate(
    frame,
    [sec(INTRO), sec(INTRO) + 10, sec(INTRO + CLIP) - 4, sec(INTRO + CLIP)],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        left: W / 2 - 60,
        top: 40,
        width: 120,
        height: 120,
        opacity: vis,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -14,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}55, rgba(0,0,0,0) 70%)`,
          transform: `scale(${1 + Math.sin(frame / 10) * 0.08})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          boxShadow: `0 0 24px ${VIOLET}`,
          border: `4px solid ${GOLD}`,
        }}
      />
      <Img
        src={staticFile("v18/logo.png")}
        style={{ position: "absolute", left: 18, top: 14, width: 84 }}
      />
    </div>
  );
};
const PHONE = "0542547119";
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({
    frame,
    fps: FPS,
    config: { damping: 12, stiffness: 120 },
  });
  const ring = frame > 24 && frame < 60 ? Math.sin(frame * 1.8) * 14 : 0;
  const pin = spring({
    frame: frame - 34,
    fps: FPS,
    config: { damping: 7, stiffness: 160 },
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 30%, ${VIOLET} 0%, ${PURPLE} 38%, ${DEEP} 85%)`,
        clipPath: `circle(${Math.min(1, p) * 150}% at 50% 45%)`,
      }}
    >
      <Bokeh n={22} top={200} />
      <div style={{ position: "absolute", left: W / 2, top: 470 }}>
        <Rays p={ramp(frame, 6, 26)} size={760} />
      </div>
      <Img
        src={staticFile("v18/logo.png")}
        style={{
          position: "absolute",
          left: W / 2 - 210,
          top: 170,
          width: 420,
          transform: `scale(${p})`,
          filter: `drop-shadow(0 0 40px ${GOLD})`,
        }}
      />
      {/* phone */}
      <Glass x={W / 2} y={760} w={900} d={14}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
          }}
        >
          <Img
            src={icon("1f4de")}
            style={{ width: 110, height: 110, transform: `rotate(${ring}deg)` }}
          />
          <div
            style={{
              fontFamily: FONT,
              fontSize: 104,
              color: "#fff",
              letterSpacing: 4,
              direction: "ltr",
              textShadow: `0 0 20px ${GOLD}`,
            }}
          >
            {PHONE.slice(0, Math.max(0, Math.floor((frame - 16) / 1.5)))}
          </div>
        </div>
      </Glass>
      {/* location */}
      <Glass x={W / 2} y={1040} w={940} d={30}>
        <div
          dir="rtl"
          style={{ display: "flex", alignItems: "center", gap: 22 }}
        >
          <Img
            src={icon("1f4cd")}
            style={{
              width: 110,
              height: 110,
              transform: `translateY(${(1 - pin) * -80}px) scale(${0.6 + pin * 0.4})`,
            }}
          />
          <div style={{ fontFamily: FONT, color: "#fff" }}>
            <div style={{ fontSize: 40, color: GOLD2 }}>الموقع</div>
            <div style={{ fontSize: 50, lineHeight: 1.25 }}>
              عند أكاديمية الفكر الرائد
            </div>
            <div style={{ fontSize: 46, lineHeight: 1.25 }}>DNC – البقعة</div>
          </div>
        </div>
      </Glass>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1440,
          display: "flex",
          justifyContent: "center",
          opacity: ramp(frame, 46, 56),
        }}
      >
        <div
          style={{
            padding: "16px 46px 22px",
            borderRadius: 50,
            background: GOLD,
            fontFamily: FONT,
            fontSize: 56,
            color: DEEP,
            boxShadow: `0 0 30px ${GOLD}`,
            transform: `scale(${1 + Math.sin(frame / 6) * 0.03})`,
          }}
        >
          مرحبا بيكم 🍔 @mj_burger_02
        </div>
      </div>
      <Sfx at={0} name="whoosh_in" vol={0.35} />
      <Sfx at={16} name="click" vol={0.25} />
      <Sfx at={24} name="ring" vol={0.2} />
      <Sfx at={34} name="pop" vol={0.25} />
      <Sfx at={46} name="ding" vol={0.25} />
    </AbsoluteFill>
  );
};

export const V18: React.FC = () => {
  const frame = useCurrentFrame();
  const flashAt = SCENES.slice(1).map((s) => T(s.start - LEAD));
  const flash = Math.max(
    0,
    ...flashAt.map((f) =>
      frame >= f ? interpolate(frame - f, [0, 5], [0.35, 0], clamp) : 0,
    ),
  );
  const MONT_AT = sec(INTRO + CLIP);
  const OUT_AT = MONT_AT + sec(MONTAGE);
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      <Sequence
        from={sec(INTRO)}
        durationInFrames={sec(CLIP) + 2}
        layout="none"
      >
        <Clip />
      </Sequence>
      <Bokeh n={12} top={0} />
      {SCENES.map((s, i) => {
        const end = i < SCENES.length - 1 ? SCENES[i + 1].start : CLIP;
        const from = T(s.start - LEAD);
        const dur = T(end - LEAD) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Behind kind={s.kind} dur={dur} />
          </Sequence>
        );
      })}
      <Sequence
        from={sec(INTRO)}
        durationInFrames={sec(CLIP) + 2}
        layout="none"
      >
        <Clip cutout />
      </Sequence>
      <Grade />
      {SCENES.map((s, i) => {
        const end = i < SCENES.length - 1 ? SCENES[i + 1].start : CLIP;
        const from = T(s.start - LEAD);
        const dur = T(end - LEAD) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Front kind={s.kind} dur={dur} />
            <Sfx
              at={0}
              name={i % 2 ? "whoosh_out" : "swipe"}
              vol={i ? 0.25 : 0}
            />
            <Sfx at={4} name="pop" vol={0.14} />
          </Sequence>
        );
      })}
      {CUTS.map((c, i) => {
        const from = T(c.start - 0.3);
        const dur = T(c.end - 0.3) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <FoodCut src={c.src} label={c.label} dur={dur} from={c.from} />
          </Sequence>
        );
      })}
      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, pointerEvents: "none" }}
      />
      {CAPS.map((c, i) => (
        <Sequence
          key={i}
          from={T(c.start - 0.1)}
          durationInFrames={sec(c.end - c.start) + 2}
          layout="none"
        >
          <Caption c={c} />
        </Sequence>
      ))}
      <Watermark />
      {IRIS_AT.map((t, i) => (
        <Sequence key={i} from={T(t) - 11} durationInFrames={26} layout="none">
          <Iris />
        </Sequence>
      ))}
      <Sequence
        from={MONT_AT}
        durationInFrames={sec(MONTAGE) + 4}
        layout="none"
      >
        <Montage />
      </Sequence>
      <Sequence from={OUT_AT} layout="none">
        <Outro />
      </Sequence>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 10,
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(frame / V18_FRAMES) * 100}%`,
            background: `linear-gradient(90deg, ${VIOLET}, ${GOLD})`,
          }}
        />
      </div>
      <Sfx at={MONT_AT} name="boom" vol={0.3} />
      <Sequence from={sec(INTRO)} layout="none">
        <Audio src={staticFile("v18/voice.wav")} />
      </Sequence>
      <Audio
        src={staticFile("v8/music.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, MONT_AT - 5, MONT_AT + 5, V18_FRAMES - 30, V18_FRAMES],
            [0, 0.07, 0.07, 0.22, 0.22, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
