/*
 * Video 19: MJ Burger new product ad, the Fajitas (voice-over only, no speaker).
 * Same orange + gold neon look as videos 17-18: logo intro, the wrap being folded
 * and grilled (his clips), hero photos with 3D tilt, cut-open reveal with
 * ingredient chips, kinetic captions, location + phone, logo outro.
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
const VOICE = 29.0;
const OUTRO = 4.5;
export const V19_FPS = FPS;
export const V19_FRAMES = Math.round((VOICE + OUTRO) * FPS);
const LEAD = 0.25;

/* ---------------- words ---------------- */
type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.3, end: 2.1, text: "شفتو هاد الفاهيتاس؟", hl: ["الفاهيتاس؟"] },
  { start: 2.4, end: 4.2, text: "بالنسبة ليا ماشي حاجة عادية", hl: ["عادية"] },
  { start: 4.45, end: 6.2, text: "نزّلنالكم في المينيو", hl: ["المينيو"] },
  { start: 6.2, end: 8.0, text: "الفاهيتاس، بنينة بزاف", hl: ["الفاهيتاس،"] },
  { start: 8.2, end: 9.75, text: "والبوريتو", hl: ["والبوريتو"] },
  { start: 9.95, end: 12.45, text: "قوي، شباب بزاف", hl: ["قوي،"] },
  { start: 12.6, end: 15.4, text: "المهم خوتي، مرحبا بيكم", hl: ["مرحبا"] },
  {
    start: 15.55,
    end: 18.4,
    text: "راحنا عند أكاديمية الفكر الرائد",
    hl: ["أكاديمية"],
  },
  {
    start: 18.7,
    end: 21.2,
    text: "وهاذا هو التيليفون خوتي",
    hl: ["التيليفون"],
  },
  { start: 21.5, end: 24.6, text: "مرحبا بيكم، كاين كلش", hl: ["كلش"] },
  { start: 24.95, end: 28.7, text: "وزدناكم الفاهيتاس!", hl: ["الفاهيتاس!"] },
];

type Kind =
  | "hook"
  | "special"
  | "menu"
  | "fold"
  | "grill"
  | "reveal"
  | "place"
  | "phone"
  | "all"
  | "final";
const SCENES: { start: number; kind: Kind }[] = [
  { start: 0, kind: "hook" },
  { start: 2.27, kind: "special" },
  { start: 4.33, kind: "menu" },
  { start: 8.1, kind: "fold" },
  { start: 9.83, kind: "grill" },
  { start: 12.52, kind: "reveal" },
  { start: 15.5, kind: "place" },
  { start: 18.55, kind: "phone" },
  { start: 21.35, kind: "all" },
  { start: 24.8, kind: "final" },
];

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
        src={staticFile("v19/logo.png")}
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

/* ---------------- product shots ---------------- */
const Photo: React.FC<{
  src: string;
  zoom?: [number, number];
  pan?: [number, number];
  dur: number;
  blur?: number;
}> = ({ src, zoom = [1.05, 1.2], pan = [0, 0], dur, blur = 0 }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / Math.max(1, dur));
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: W,
          height: H,
          objectFit: "cover",
          transform: `scale(${z}) translate(${pan[0] * t}px, ${pan[1] * t}px)`,
          filter: `saturate(1.25) contrast(1.08) brightness(1.03) blur(${blur}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
const Vid: React.FC<{
  src: string;
  from?: number;
  rate?: number;
  zoom?: number;
}> = ({ src, from = 0, rate = 1, zoom = 1.0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom + frame * 0.0015})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={sec(from)}
          playbackRate={rate}
          muted
          style={{
            width: W,
            height: H,
            objectFit: "cover",
            filter: "saturate(1.3) contrast(1.1) brightness(1.04)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// 3D floating product card
const Hero: React.FC<{
  src: string;
  w: number;
  h: number;
  y: number;
  d?: number;
}> = ({ src, w, h, y, d = 0 }) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: frame - d,
    fps: FPS,
    config: { damping: 12, stiffness: 120 },
  });
  const ry = Math.sin((frame - d) / 30) * 10;
  const rx = Math.cos((frame - d) / 36) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: W / 2 - w / 2,
        top: y,
        width: w,
        height: h,
        perspective: 1600,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -60,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}55 0%, ${VIOLET}22 50%, rgba(0,0,0,0) 70%)`,
          transform: `scale(${p})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateY(${ry + (1 - p) * 70}deg) rotateX(${rx}deg) scale(${0.6 + p * 0.4})`,
          opacity: Math.min(1, p * 1.5),
          borderRadius: 36,
          overflow: "hidden",
          border: `6px solid ${GOLD}`,
          boxShadow: `0 40px 60px rgba(0,0,0,0.6), 0 0 50px ${GOLD}88`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.25) contrast(1.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${110 + ry * 3}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 65%)`,
          }}
        />
      </div>
    </div>
  );
};
const Chip: React.FC<{
  code: string;
  text: string;
  x: number;
  y: number;
  d: number;
}> = ({ code, text, x, y, d }) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: frame - d,
    fps: FPS,
    config: { damping: 9, stiffness: 180 },
  });
  if (frame < d) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${p}) translateY(${Math.sin((frame - d) / 12) * 8}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 30px 16px 20px",
        borderRadius: 60,
        background:
          "linear-gradient(135deg, rgba(150,52,8,0.92), rgba(42,16,0,0.9))",
        border: `4px solid ${GOLD}`,
        boxShadow: `0 14px 26px rgba(0,0,0,0.5), 0 0 26px ${GOLD}88`,
      }}
    >
      <Img src={icon(code)} style={{ width: 80, height: 80 }} />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 60,
          color: "#fff",
          textShadow: `0 0 12px ${GOLD}`,
        }}
      >
        {text}
      </div>
      <Sfx at={d} name="pop" vol={0.22} />
    </div>
  );
};
const Fire: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 26 }, (_, i) => {
        const x = (i * 83) % W;
        const life = ((frame * (2 + (i % 4)) + i * 37) % 160) / 160;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 7 + i) * 20,
              top: H - life * 900,
              width: 16 + (i % 3) * 8,
              height: 16 + (i % 3) * 8,
              borderRadius: "50%",
              background: i % 2 ? GOLD : VIOLET,
              opacity: (1 - life) * 0.9,
              boxShadow: `0 0 20px ${VIOLET}`,
              filter: "blur(1px)",
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${VIOLET}66 0%, rgba(0,0,0,0) 35%)`,
          mixBlendMode: "screen",
          opacity: 0.8 + Math.sin(frame / 3) * 0.2,
        }}
      />
    </AbsoluteFill>
  );
};
const Pill: React.FC<{ text: string; y: number; d?: number; rot?: number }> = ({
  text,
  y,
  d = 6,
  rot = -3,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
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
          fontSize: 76,
          color: "#fff",
          boxShadow: `0 0 40px ${GOLD}aa`,
          transform: `scale(${spring({ frame: frame - d, fps: FPS, config: { damping: 9 } })}) rotate(${rot}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};
const NameReveal: React.FC<{ d?: number; y?: number; size?: number }> = ({
  d = 0,
  y = 1180,
  size = 210,
}) => {
  const frame = useCurrentFrame();
  const letters = "FAJITAS".split("");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {letters.map((l, i) => {
        const p = spring({
          frame: frame - d - i * 2,
          fps: FPS,
          config: { damping: 9, stiffness: 220 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontSize: size,
              lineHeight: 1,
              color: "transparent",
              background:
                "linear-gradient(180deg, #FFF3C4 0%, #FFC83D 45%, #E08A00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextStroke: `4px ${DEEP}`,
              filter: `drop-shadow(0 10px 0 ${DEEP}) drop-shadow(0 0 30px ${GOLD})`,
              transform: `translateY(${(1 - p) * -260}px) scale(${0.4 + p * 0.6}) rotate(${(1 - p) * (i % 2 ? 30 : -30)}deg)`,
              opacity: Math.min(1, p * 2),
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};
const Stamp: React.FC<{ text: string; x: number; y: number; d: number }> = ({
  text,
  x,
  y,
  d,
}) => {
  const frame = useCurrentFrame();
  const p = spring({
    frame: frame - d,
    fps: FPS,
    config: { damping: 8, stiffness: 260 },
  });
  if (frame < d) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(-14deg) scale(${2.4 - p * 1.4})`,
        opacity: Math.min(1, p * 2),
        padding: "8px 34px 14px",
        border: `8px solid ${GOLD}`,
        borderRadius: 22,
        fontFamily: FONT,
        fontSize: 92,
        color: GOLD,
        background: "rgba(42,16,0,0.75)",
        boxShadow: `0 0 30px ${GOLD}`,
      }}
    >
      {text}
      <Sfx at={d} name="boom" vol={0.3} />
    </div>
  );
};

const Scene: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const inP = spring({
    frame,
    fps: FPS,
    config: { damping: 15, stiffness: 160 },
  });
  const out = ramp(frame, dur - 5, dur + 3, Easing.in(Easing.cubic));
  const enter = (c: React.ReactNode) => (
    <AbsoluteFill
      style={{
        clipPath: `circle(${Math.min(1, inP) * 150}% at 50% 45%)`,
        opacity: 1 - out * 0.3,
      }}
    >
      {c}
    </AbsoluteFill>
  );
  switch (kind) {
    case "hook":
      return (
        <AbsoluteFill>
          <Photo src="v19/photo4.jpg" dur={dur} zoom={[1.0, 1.25]} />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, ${DEEP}cc 100%)`,
            }}
          />
          <Img
            src={staticFile("v19/logo.png")}
            style={{
              position: "absolute",
              left: W / 2 - 140,
              top: 110,
              width: 280,
              filter: `drop-shadow(0 0 30px ${GOLD})`,
              transform: `scale(${spring({ frame: frame - 4, fps: FPS, config: { damping: 9 } })})`,
            }}
          />
          <Glow3D code="1f440" size={170} x={180} y={560} d={10} />
        </AbsoluteFill>
      );
    case "special":
      return enter(
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 40%, ${VIOLET} 0%, ${PURPLE} 40%, ${DEEP} 85%)`,
            }}
          />
          <Bokeh n={18} top={0} />
          <Hero src="v19/photo1.jpg" w={760} h={1000} y={260} d={2} />
          <Glow3D code="1f525" size={170} x={170} y={300} d={10} ring={false} />
          <Glow3D code="1f929" size={160} x={910} y={1150} d={16} />
          <NeonWord text="ماشي عادي 🔥" y={1300} size={120} d={12} />
        </>,
      );
    case "menu":
      return enter(
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 35%, ${VIOLET} 0%, ${PURPLE} 40%, ${DEEP} 85%)`,
            }}
          />
          <Bokeh n={20} top={0} />
          <div style={{ position: "absolute", left: W / 2, top: 470 }}>
            <Rays p={ramp(frame, 2, 16)} size={900} />
          </div>
          <Img
            src={staticFile("v19/logo.png")}
            style={{
              position: "absolute",
              left: W / 2 - 220,
              top: 200,
              width: 440,
              filter: `drop-shadow(0 0 40px ${GOLD})`,
              transform: `scale(${spring({ frame: frame - 2, fps: FPS, config: { damping: 10 } })})`,
            }}
          />
          <Pill text="جديد في المينيو ✨" y={780} d={10} />
          <NameReveal d={sec(1.8)} y={1000} />
          <div
            dir="rtl"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1240,
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 90,
              color: "#fff",
              textShadow: `0 0 20px ${GOLD}`,
              opacity: ramp(frame, sec(2.4), sec(2.8)),
            }}
          >
            فاهيتاس 🔥
          </div>
          <Stamp text="NEW" x={880} y={720} d={sec(2.6)} />
          <Burst x={W / 2} y={1100} d={sec(2.0)} />
        </>,
      );
    case "fold":
      return enter(
        <>
          <Vid src="v19/fold.mp4" from={1} rate={1.5} zoom={1.05} />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${DEEP}88 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, ${DEEP}cc 100%)`,
            }}
          />
          <Pill text="🧀 بالفرماج" y={240} />
        </>,
      );
    case "grill":
      return enter(
        <>
          <Vid src="v19/grill.mp4" from={0} rate={1} zoom={1.1} />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, ${DEEP}88 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, ${DEEP}cc 100%)`,
            }}
          />
          <Fire />
          <Pill text="🔥 مشوي على الشواية" y={240} rot={3} />
        </>,
      );
    case "reveal":
      return enter(
        <>
          <Photo
            src="v19/photo2.jpg"
            dur={dur}
            zoom={[1.0, 1.3]}
            pan={[0, 120]}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 35%, ${DEEP}dd 100%)`,
            }}
          />
          <Chip code="1f969" text="لحم" x={260} y={360} d={8} />
          <Chip code="1f9c0" text="فرماج" x={800} y={560} d={18} />
          <Chip code="1f35f" text="فريت" x={280} y={780} d={28} />
          <Chip code="1f525" text="صوص" x={790} y={1000} d={38} />
        </>,
      );
    case "place":
      return enter(
        <>
          <Photo src="v19/photo3.jpg" dur={dur} blur={10} zoom={[1.2, 1.3]} />
          <AbsoluteFill style={{ background: `${DEEP}aa` }} />
          <Bokeh n={16} top={0} />
          <Glass x={W / 2} y={620} w={940} d={6}>
            <div
              dir="rtl"
              style={{ display: "flex", alignItems: "center", gap: 22 }}
            >
              <Img
                src={icon("1f4cd")}
                style={{
                  width: 130,
                  height: 130,
                  transform: `translateY(${(1 - spring({ frame: frame - 14, fps: FPS, config: { damping: 7, stiffness: 160 } })) * -90}px)`,
                }}
              />
              <div style={{ fontFamily: FONT, color: "#fff" }}>
                <div style={{ fontSize: 44, color: GOLD2 }}>الموقع</div>
                <div style={{ fontSize: 58, lineHeight: 1.25 }}>
                  عند أكاديمية الفكر الرائد
                </div>
                <div style={{ fontSize: 50, lineHeight: 1.25 }}>
                  DNC – البقعة
                </div>
              </div>
            </div>
          </Glass>
          <Sfx at={14} name="pop" vol={0.25} />
        </>,
      );
    case "phone": {
      const ring = frame > 10 && frame < 50 ? Math.sin(frame * 1.8) * 14 : 0;
      return enter(
        <>
          <Photo src="v19/photo1.jpg" dur={dur} blur={10} zoom={[1.2, 1.3]} />
          <AbsoluteFill style={{ background: `${DEEP}aa` }} />
          <Bokeh n={16} top={0} />
          <Glass x={W / 2} y={640} w={940} d={4}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Img
                src={icon("1f4de")}
                style={{
                  width: 140,
                  height: 140,
                  transform: `rotate(${ring}deg)`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 120,
                  color: "#fff",
                  letterSpacing: 4,
                  direction: "ltr",
                  textShadow: `0 0 20px ${GOLD}`,
                }}
              >
                {PHONE.slice(0, Math.max(0, Math.floor((frame - 8) / 1.5)))}
              </div>
            </div>
          </Glass>
          <Sfx at={8} name="click" vol={0.25} />
          <Sfx at={12} name="ring" vol={0.2} />
        </>,
      );
    }
    case "all": {
      const shots = [
        "v19/photo4.jpg",
        "v19/photo2.jpg",
        "v19/photo1.jpg",
        "v19/photo3.jpg",
      ];
      const per = Math.round(dur / shots.length);
      const i = Math.min(shots.length - 1, Math.floor(frame / per));
      const local = frame - i * per;
      return (
        <AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: `scale(${1.12 + local * 0.004 + (local < 4 ? (4 - local) * 0.03 : 0)}) rotate(${i % 2 ? 1 : -1}deg)`,
            }}
          >
            <Img
              src={staticFile(shots[i])}
              style={{
                width: W,
                height: H,
                objectFit: "cover",
                filter: "saturate(1.3) contrast(1.1)",
              }}
            />
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
          <Img
            src={staticFile("v19/logo.png")}
            style={{
              position: "absolute",
              left: W / 2 - 110,
              top: 110,
              width: 220,
              filter: `drop-shadow(0 0 24px ${GOLD})`,
            }}
          />
          {shots.map((_, k) => (
            <Sfx
              key={k}
              at={k * per}
              name={k % 2 ? "whoosh_out" : "whoosh_in"}
              vol={0.28}
            />
          ))}
        </AbsoluteFill>
      );
    }
    case "final":
      return enter(
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 40%, ${VIOLET} 0%, ${PURPLE} 40%, ${DEEP} 85%)`,
            }}
          />
          <Bokeh n={22} top={0} />
          <div style={{ position: "absolute", left: W / 2, top: 760 }}>
            <Rays p={ramp(frame, 2, 16)} size={1000} />
          </div>
          <Hero src="v19/photo3.jpg" w={700} h={900} y={220} d={2} />
          <NameReveal d={14} y={1150} size={190} />
          <Pill text="😋 جربوه اليوم!" y={1380} d={30} rot={2} />
        </>,
      );
    default:
      return null;
  }
};

export const V19: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = Math.max(
    0,
    ...SCENES.slice(1)
      .map((s) => sec(s.start - LEAD))
      .map((f) =>
        frame >= f ? interpolate(frame - f, [0, 5], [0.35, 0], clamp) : 0,
      ),
  );
  const OUT_AT = sec(VOICE);
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      {SCENES.map((s, i) => {
        const end = i < SCENES.length - 1 ? SCENES[i + 1].start : VOICE;
        const from = sec(Math.max(0, s.start - LEAD));
        const dur = sec(end - LEAD) - from;
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={dur + 8}
            layout="none"
          >
            <Scene kind={s.kind} dur={dur} />
            {i > 0 && (
              <Sfx at={0} name={i % 2 ? "whoosh_in" : "swipe"} vol={0.3} />
            )}
          </Sequence>
        );
      })}
      <Grade />
      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, pointerEvents: "none" }}
      />
      {CAPS.map((c, i) => (
        <Sequence
          key={i}
          from={sec(c.start - 0.1)}
          durationInFrames={sec(c.end - c.start) + 2}
          layout="none"
        >
          <Caption c={c} />
        </Sequence>
      ))}
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
            width: `${(frame / V19_FRAMES) * 100}%`,
            background: `linear-gradient(90deg, ${VIOLET}, ${GOLD})`,
          }}
        />
      </div>
      <Audio src={staticFile("v19/voice.wav")} />
      <Audio src={staticFile("v19/riser.wav")} volume={0.45} />
      <Audio
        src={staticFile("v8/music.wav")}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, OUT_AT - 5, OUT_AT + 5, V19_FRAMES - 30, V19_FRAMES],
            [0.12, 0.08, 0.08, 0.22, 0.22, 0],
            clamp,
          )
        }
      />
    </AbsoluteFill>
  );
};
