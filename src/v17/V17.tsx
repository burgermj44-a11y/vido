/*
 * Video 17: MJ Burger restaurant ad (food B-roll, phone + location). New look, NOT paper:
 * orange + gold neon look (from the MJ Burger logo), glass cards, bokeh,
 * light leaks, kinetic word-by-word captions, logo iris transitions.
 * Graphics sit between the speaker and the street (matte), text stays in front.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
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
const INTRO = 2.0; // logo reveal before the clip
const CLIP = 28.3;
const MONTAGE = 6.4; // food montage after he finishes talking
const OUTRO = 5.5;
export const V17_FPS = FPS;
export const V17_FRAMES = Math.round((INTRO + CLIP + MONTAGE + OUTRO) * FPS);
const T = (s: number) => sec(INTRO + s); // clip time -> frame
const MATTE_N = 849;

/* ---------------- words (clip time) ---------------- */
type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 1.5, text: "خوتي، بقيت نخمّم", hl: ["نخمّم"] },
  { start: 1.75, end: 2.8, text: "واش هو السر؟", hl: ["السر؟"] },
  { start: 3.05, end: 6.35, text: "صندويتش، طاكوس، ولا برغر؟", hl: ["صندويتش،", "طاكوس،", "برغر؟"] },
  { start: 6.55, end: 7.8, text: "كيفاش نرضّي الناس؟", hl: ["نرضّي"] },
  { start: 8.3, end: 11.45, text: "نعطيهم أفضل صندويتش ولا طاكوس", hl: ["أفضل"] },
  { start: 12.9, end: 16.3, text: "على حساب ذوق الناس", hl: ["ذوق"] },
  { start: 16.6, end: 19.3, text: "واش تحبو مني؟", hl: ["تحبو"] },
  { start: 19.55, end: 23.0, text: "مرحبا بيكم، نستناوكم", hl: ["مرحبا"] },
  { start: 23.0, end: 26.55, text: "كل واحد يجي ياكل ويشبع", hl: ["ياكل"] },
  { start: 26.75, end: 27.6, text: "مرحبا!", hl: ["مرحبا!"] },
];

type Kind = "think" | "secret" | "choice" | "please" | "best" | "taste" | "ask" | "welcome" | "eat" | "bye";
const SCENES: { start: number; kind: Kind; zoom: number }[] = [
  { start: 0, kind: "think", zoom: 1.0 },
  { start: 1.75, kind: "secret", zoom: 1.12 },
  { start: 3.05, kind: "choice", zoom: 1.0 },
  { start: 6.55, kind: "please", zoom: 1.14 },
  { start: 8.3, kind: "best", zoom: 1.0 },
  { start: 12.9, kind: "taste", zoom: 1.08 },
  { start: 16.6, kind: "ask", zoom: 1.16 },
  { start: 19.55, kind: "welcome", zoom: 1.0 },
  { start: 23.0, kind: "eat", zoom: 1.1 },
  { start: 26.75, kind: "bye", zoom: 1.2 },
];
const LEAD = 0.25;
/* full-screen food cut-aways (voice continues) */
const CUTS: { start: number; end: number; src: string; label: string; from?: number }[] = [
  { start: 3.05, end: 6.35, src: "v17/broll3.mp4", label: "🍔 برغر MJ", from: 1 },
  { start: 8.3, end: 11.45, src: "v17/broll2.mp4", label: "🌯 أفضل طاكوس", from: 0 },
  { start: 23.0, end: 26.55, src: "v17/broll4.mp4", label: "😋 ياكل ويشبع", from: 2 },
];
const IRIS_AT = [3.05, 19.55];
/* ---------------- the clip ---------------- */
const useZoom = (frame: number) => {
  const t = frame / FPS - INTRO;
  let i = 0;
  for (let k = 0; k < SCENES.length; k++) if (SCENES[k].start - LEAD <= t) i = k;
  const s = SCENES[i];
  const prev = SCENES[Math.max(0, i - 1)];
  const k = spring({ frame: frame - T(s.start - LEAD), fps: FPS, config: { damping: 16, stiffness: 140 } });
  return prev.zoom + (s.zoom - prev.zoom) * k + (frame - T(s.start)) * 0.0005;
};
const Clip: React.FC<{ cutout?: boolean }> = ({ cutout }) => {
  const local = useCurrentFrame();
  const frame = local + sec(INTRO);
  const z = useZoom(frame);
  const idx = Math.min(MATTE_N, Math.max(1, local + 1));
  const matte = `url(${staticFile(`v17/matte/${String(idx).padStart(4, "0")}.jpg`)})`;
  const mask: React.CSSProperties = cutout ? { maskImage: matte, WebkitMaskImage: matte, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskMode: "luminance" } as React.CSSProperties : {};
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 32%" }}>
      <AbsoluteFill style={mask}>
        <OffthreadVideo src={staticFile("v17/source.mp4")} muted style={{ width: W, height: H, filter: "saturate(1.12) contrast(1.08) brightness(1.02)" }} />
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
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PURPLE}33 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, ${DEEP}cc 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% 8%, rgba(255,200,90,0.18) 0%, rgba(255,160,60,0.0) 40%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,0,25,0.55) 100%)" }} />
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
        const y = top + ((((i * 211) % 1100) - frame * (0.5 + (i % 3) * 0.3) + 4000) % 1100);
        const c = i % 3 ? GOLD : VIOLET;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: `radial-gradient(circle, ${c}cc 0%, ${c}00 70%)`, opacity: 0.35 + Math.sin(frame / 9 + i) * 0.15, filter: "blur(2px)" }} />;
      })}
    </AbsoluteFill>
  );
};

/* ---------------- building blocks ---------------- */
const useIn = (d = 0, damping = 11) => {
  const frame = useCurrentFrame();
  return spring({ frame: frame - d, fps: FPS, config: { damping, stiffness: 170 } });
};
const Glow3D: React.FC<{ code: string; size: number; x: number; y: number; d?: number; ring?: boolean; spin?: boolean }> = ({ code, size, x, y, d = 0, ring = true, spin }) => {
  const frame = useCurrentFrame();
  const p = useIn(d, 9);
  const f = Math.sin((frame - d) / 12);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${p}) translateY(${f * 10}px) rotate(${spin ? (frame - d) * 1.2 : f * 4}deg)` }}>
      {ring && (
        <>
          <div style={{ position: "absolute", inset: -size * 0.28, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}66 0%, ${VIOLET}33 40%, rgba(0,0,0,0) 70%)` }} />
          <div style={{ position: "absolute", inset: -size * 0.12, borderRadius: "50%", border: `6px solid ${GOLD}`, boxShadow: `0 0 30px ${GOLD}, inset 0 0 30px ${GOLD}88`, opacity: 0.85, transform: `rotate(${frame * 2}deg)`, borderTopColor: "transparent", borderBottomColor: "transparent" }} />
        </>
      )}
      <Img src={icon(code)} style={{ position: "relative", width: size, height: size, filter: `drop-shadow(0 18px 24px rgba(20,0,40,0.6)) drop-shadow(0 0 22px ${GOLD}aa)` }} />
    </div>
  );
};
const NeonWord: React.FC<{ text: string; y: number; size: number; d?: number; color?: string }> = ({ text, y, size, d = 0, color = GOLD }) => {
  const frame = useCurrentFrame();
  const p = useIn(d, 12);
  const flick = frame - d < 10 ? (Math.floor((frame - d) / 2) % 2 ? 0.4 : 1) : 1;
  return (
    <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: FONT, fontSize: size, lineHeight: 1, color: "#fff", opacity: Math.min(1, p) * flick, transform: `scale(${0.7 + p * 0.3})`, textShadow: `0 0 12px ${color}, 0 0 34px ${color}, 0 0 70px ${VIOLET}`, WebkitTextStroke: `3px ${color}` }}>
      {text}
    </div>
  );
};
const Glass: React.FC<{ x: number; y: number; w: number; d?: number; children: React.ReactNode; rot?: number }> = ({ x, y, w, d = 0, children, rot = 0 }) => {
  const p = useIn(d, 13);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + p * 0.15}) rotate(${rot}deg)`, opacity: Math.min(1, p * 1.5), background: "linear-gradient(135deg, rgba(150,52,8,0.85), rgba(42,16,0,0.82))", border: `3px solid ${GOLD}aa`, borderRadius: 36, boxShadow: `0 20px 40px rgba(20,0,40,0.45), 0 0 40px ${VIOLET}55`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", padding: 26 }}>
      {children}
    </div>
  );
};
const Burst: React.FC<{ x: number; y: number; d: number; n?: number }> = ({ x, y, d, n = 22 }) => {
  const frame = useCurrentFrame();
  const t = frame - d;
  if (t < 0 || t > 30) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        const v = 14 + (i % 4) * 5;
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * v * t, top: y + Math.sin(a) * v * t + t * t * 0.5, width: 14, height: 14, borderRadius: i % 2 ? "50%" : 3, background: i % 3 ? GOLD : VIOLET, opacity: 1 - t / 30, boxShadow: `0 0 12px ${GOLD}` }} />;
      })}
    </>
  );
};

/* ---------------- graphics BEHIND him ---------------- */
const Behind: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const wrap = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 + out * 0.15})` }}>{c}</AbsoluteFill>;
  switch (kind) {
    case "think":
      return wrap(
        <>
          <Glow3D code="1f914" size={220} x={220} y={330} d={2} />
          <Glow3D code="1f354" size={200} x={860} y={300} d={8} />
        </>,
      );
    case "secret":
      return wrap(<Glow3D code="1f511" size={240} x={850} y={320} d={2} spin />);
    case "please":
      return wrap(
        <>
          <Glow3D code="1f60b" size={220} x={220} y={330} d={2} />
          <Glow3D code="2764" size={180} x={860} y={300} d={8} />
        </>,
      );
    case "taste":
      return wrap(
        <>
          <Glow3D code="1f924" size={220} x={220} y={330} d={2} />
          <Glow3D code="1f525" size={200} x={860} y={320} d={8} ring={false} />
        </>,
      );
    case "ask":
      return wrap(<Glow3D code="2753" size={240} x={850} y={320} d={2} />);
    case "welcome":
      return wrap(
        <>
          <Glow3D code="1f44b" size={220} x={220} y={340} d={2} />
          <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: 700, top: 180, width: 300, filter: `drop-shadow(0 0 30px ${GOLD})`, transform: `scale(${spring({ frame: frame - 6, fps: FPS, config: { damping: 10 } })})` }} />
        </>,
      );
    case "bye":
      return wrap(
        <>
          <Glow3D code="1f389" size={220} x={220} y={330} d={2} />
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
  const wrap = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: 1 - out }}>{c}</AbsoluteFill>;
  switch (kind) {
    case "secret":
      return wrap(<NeonWord text="السر؟ 🤫" y={330} size={130} d={4} />);
    case "please":
      return wrap(<NeonWord text="نرضّي الناس" y={330} size={110} d={4} />);
    case "taste": {
      const photos = ["v17/photo1.jpg", "v17/photo2.jpg", "v17/photo3.jpg"];
      return wrap(
        <>
          {photos.map((ph, i) => {
            const d = 4 + i * 10;
            const p = spring({ frame: frame - d, fps: FPS, config: { damping: 12, stiffness: 140 } });
            return (
              <div key={i} style={{ position: "absolute", left: 120 + i * 270, top: 150 + (i % 2) * 70, width: 300, transform: `translateY(${(1 - p) * 700}px) rotate(${(i - 1) * 8}deg) scale(${0.6 + p * 0.4})`, opacity: frame >= d ? 1 : 0, background: "#fff", padding: 10, borderRadius: 14, boxShadow: `0 16px 26px rgba(0,0,0,0.5), 0 0 30px ${VIOLET}88` }}>
                <Img src={staticFile(ph)} style={{ width: "100%", height: 340, objectFit: "cover", borderRadius: 8, display: "block" }} />
                <Sfx at={d} name="whoosh_in" vol={0.2} />
              </div>
            );
          })}
        </>,
      );
    }
    case "ask":
      return wrap(<NeonWord text="واش تحبو؟" y={330} size={120} d={4} />);
    case "welcome":
      return wrap(<NeonWord text="مرحبا بيكم 🧡" y={560} size={110} d={8} />);
    default:
      return null;
  }
};

/* ---------------- food cut-away (full screen, voice continues) ---------------- */
const FoodCut: React.FC<{ src: string; label: string; dur: number; from?: number }> = ({ src, label, dur, from = 0 }) => {
  const frame = useCurrentFrame();
  const inP = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 150 } });
  const out = ramp(frame, dur - 8, dur, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ clipPath: `circle(${Math.min(1, inP) * (1 - out) * 150}% at 50% 50%)` }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 + frame * 0.0012})` }}>
        <OffthreadVideo src={staticFile(src)} startFrom={sec(from)} muted style={{ width: W, height: H, objectFit: "cover", filter: "saturate(1.25) contrast(1.08) brightness(1.04)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${DEEP}88 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, ${DEEP}cc 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, ${PURPLE}66 100%)`, mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 240, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ padding: "18px 50px 26px", borderRadius: 50, background: `linear-gradient(135deg, ${PURPLE}, ${VIOLET})`, border: `5px solid ${GOLD}`, fontFamily: FONT, fontSize: 80, color: "#fff", boxShadow: `0 0 40px ${GOLD}aa`, transform: `scale(${spring({ frame: frame - 6, fps: FPS, config: { damping: 9 } })}) rotate(-3deg)` }}>{label}</div>
      </div>
      <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", right: 40, bottom: 330, width: 200, filter: `drop-shadow(0 0 20px ${GOLD})`, transform: `rotate(${Math.sin(frame / 10) * 4}deg)` }} />
      <Sfx at={0} name="swipe" vol={0.35} />
      <Sfx at={6} name="pop" vol={0.2} />
    </AbsoluteFill>
  );
};

/* ---------------- fast food montage after the talk ---------------- */
const MONTAGE_SHOTS = [
  { kind: "v", src: "v17/broll3.mp4", from: 8, label: "🍔 برغر" },
  { kind: "p", src: "v17/photo1.jpg", label: "🥖 صندويتش" },
  { kind: "v", src: "v17/broll2.mp4", from: 6, label: "🌯 طاكوس" },
  { kind: "p", src: "v17/photo3.jpg", label: "🍟 فريت" },
  { kind: "v", src: "v17/broll4.mp4", from: 6, label: "🔥 مشوي" },
  { kind: "p", src: "v17/photo2.jpg", label: "😋 بنين" },
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
      <AbsoluteFill style={{ transform: `scale(${punch}) rotate(${i % 2 ? 1 : -1}deg)` }}>
        {sh.kind === "v" ? (
          <OffthreadVideo src={staticFile(sh.src)} startFrom={sec(sh.from)} muted style={{ width: W, height: H, objectFit: "cover", filter: "saturate(1.3) contrast(1.1)" }} />
        ) : (
          <Img src={staticFile(sh.src)} style={{ width: W, height: H, objectFit: "cover", filter: "saturate(1.3) contrast(1.1)" }} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, ${DEEP}cc 100%)` }} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(local, [0, 3], [0.5, 0], clamp) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 130, color: "#fff", textShadow: `0 0 20px ${GOLD}, 0 0 50px ${VIOLET}`, WebkitTextStroke: `3px ${GOLD}`, transform: `scale(${spring({ frame: local, fps: FPS, config: { damping: 8, stiffness: 220 } })})` }}>{sh.label}</div>
      </div>
      <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: W / 2 - 110, top: 120, width: 220, filter: `drop-shadow(0 0 24px ${GOLD})` }} />
      {MONTAGE_SHOTS.map((_, k) => (
        <Sfx key={k} at={k * per} name={k % 2 ? "whoosh_out" : "whoosh_in"} vol={0.3} />
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
    <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 1560, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
      {words.map((w, i) => {
        const st = Math.floor(i * per);
        const p = spring({ frame: frame - st + 2, fps: FPS, config: { damping: 10, stiffness: 260 } });
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
              background: active ? `linear-gradient(135deg, ${PURPLE}ee, ${VIOLET}ee)` : "transparent",
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
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ position: "absolute", left: -size / 2, top: -size / 2, overflow: "visible" }}>
    {[-80, -45, -10, 25, 60].map((a, i) => {
      const k = Math.max(0, Math.min(1, p * 5 - i * 0.6));
      const r1 = 30;
      const r2 = 30 + 14 * k;
      const rad = ((a - 90 + 10) * Math.PI) / 180;
      return <line key={i} x1={Math.cos(rad) * r1} y1={Math.sin(rad) * r1} x2={Math.cos(rad) * r2} y2={Math.sin(rad) * r2} stroke={GOLD} strokeWidth="5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${GOLD})` }} />;
    })}
  </svg>
);
const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - 4, fps: FPS, config: { damping: 12, stiffness: 120 } });
  const rays = ramp(frame, 14, 40);
  const out = ramp(frame, sec(INTRO) - 6, sec(INTRO) + 4, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${VIOLET} 0%, ${PURPLE} 35%, ${DEEP} 80%)`, clipPath: `circle(${(1 - out) * 150}% at 50% 45%)` }}>
      <Bokeh n={20} top={300} />
      <div style={{ position: "absolute", left: W / 2, top: 820 }}>
        <Rays p={rays} size={900} />
      </div>
      <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: W / 2 - 260, top: 520, width: 520, transform: `scale(${p}) rotate(${(1 - p) * 40}deg)`, filter: `drop-shadow(0 0 ${30 + rays * 40}px ${GOLD}) drop-shadow(0 20px 30px rgba(0,0,0,0.5))` }} />
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [sec(INTRO) - 6, sec(INTRO) - 3, sec(INTRO) + 2], [0, 0.8, 0], clamp) }} />
    </AbsoluteFill>
  );
};
const Iris: React.FC = () => {
  const frame = useCurrentFrame();
  const close = ramp(frame, 0, 9, Easing.in(Easing.cubic));
  const open = ramp(frame, 13, 24, Easing.out(Easing.cubic));
  const r = close * (1 - open) * 120;
  const lp = spring({ frame: frame - 6, fps: FPS, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${VIOLET}, ${PURPLE} 45%, ${DEEP})`, clipPath: `circle(${r}% at 50% 45%)` }}>
        <div style={{ position: "absolute", left: W / 2, top: 860 }}>
          <Rays p={ramp(frame, 6, 16)} size={760} />
        </div>
        <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: W / 2 - 200, top: 640, width: 400, transform: `scale(${lp}) rotate(${(1 - lp) * -60}deg)`, filter: `drop-shadow(0 0 40px ${GOLD})` }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: W / 2 - 700, top: 864 - 700, width: 1400, height: 1400, borderRadius: "50%", border: `14px solid ${GOLD}`, boxShadow: `0 0 50px ${GOLD}`, transform: `scale(${r / 100 + 0.02})`, opacity: r > 1 && r < 115 ? 1 : 0 }} />
      <Sfx at={0} name="whoosh_in" vol={0.4} />
      <Sfx at={9} name="boom" vol={0.3} />
      <Sfx at={10} name="sparkle" vol={0.25} />
      <Sfx at={13} name="whoosh_out" vol={0.35} />
    </AbsoluteFill>
  );
};
const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const vis = interpolate(frame, [sec(INTRO), sec(INTRO) + 10, sec(INTRO + CLIP) - 4, sec(INTRO + CLIP)], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: W / 2 - 60, top: 40, width: 120, height: 120, opacity: vis }}>
      <div style={{ position: "absolute", inset: -14, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}55, rgba(0,0,0,0) 70%)`, transform: `scale(${1 + Math.sin(frame / 10) * 0.08})` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(255,255,255,0.92)", boxShadow: `0 0 24px ${VIOLET}`, border: `4px solid ${GOLD}` }} />
      <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: 18, top: 14, width: 84 }} />
    </div>
  );
};
const PHONE = "0542547119";
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 120 } });
  const ring = frame > 24 && frame < 60 ? Math.sin(frame * 1.8) * 14 : 0;
  const pin = spring({ frame: frame - 34, fps: FPS, config: { damping: 7, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${VIOLET} 0%, ${PURPLE} 38%, ${DEEP} 85%)`, clipPath: `circle(${Math.min(1, p) * 150}% at 50% 45%)` }}>
      <Bokeh n={22} top={200} />
      <div style={{ position: "absolute", left: W / 2, top: 470 }}>
        <Rays p={ramp(frame, 6, 26)} size={760} />
      </div>
      <Img src={staticFile("v17/logo.png")} style={{ position: "absolute", left: W / 2 - 210, top: 170, width: 420, transform: `scale(${p})`, filter: `drop-shadow(0 0 40px ${GOLD})` }} />
      {/* phone */}
      <Glass x={W / 2} y={760} w={900} d={14}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
          <Img src={icon("1f4de")} style={{ width: 110, height: 110, transform: `rotate(${ring}deg)` }} />
          <div style={{ fontFamily: FONT, fontSize: 104, color: "#fff", letterSpacing: 4, direction: "ltr", textShadow: `0 0 20px ${GOLD}` }}>{PHONE.slice(0, Math.max(0, Math.floor((frame - 16) / 1.5)))}</div>
        </div>
      </Glass>
      {/* location */}
      <Glass x={W / 2} y={1040} w={940} d={30}>
        <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Img src={icon("1f4cd")} style={{ width: 110, height: 110, transform: `translateY(${(1 - pin) * -80}px) scale(${0.6 + pin * 0.4})` }} />
          <div style={{ fontFamily: FONT, color: "#fff" }}>
            <div style={{ fontSize: 40, color: GOLD2 }}>الموقع</div>
            <div style={{ fontSize: 50, lineHeight: 1.25 }}>عند أكاديمية الفكر الرائد</div>
            <div style={{ fontSize: 46, lineHeight: 1.25 }}>DNC – البقعة</div>
          </div>
        </div>
      </Glass>
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1440, display: "flex", justifyContent: "center", opacity: ramp(frame, 46, 56) }}>
        <div style={{ padding: "16px 46px 22px", borderRadius: 50, background: GOLD, fontFamily: FONT, fontSize: 56, color: DEEP, boxShadow: `0 0 30px ${GOLD}`, transform: `scale(${1 + Math.sin(frame / 6) * 0.03})` }}>مرحبا بيكم 🍔 @mj_burger_02</div>
      </div>
      <Sfx at={0} name="whoosh_in" vol={0.35} />
      <Sfx at={16} name="click" vol={0.25} />
      <Sfx at={24} name="ring" vol={0.2} />
      <Sfx at={34} name="pop" vol={0.25} />
      <Sfx at={46} name="ding" vol={0.25} />
    </AbsoluteFill>
  );
};

export const V17: React.FC = () => {
  const frame = useCurrentFrame();
  const flashAt = SCENES.slice(1).map((s) => T(s.start - LEAD));
  const flash = Math.max(0, ...flashAt.map((f) => (frame >= f ? interpolate(frame - f, [0, 5], [0.35, 0], clamp) : 0)));
  const MONT_AT = sec(INTRO + CLIP);
  const OUT_AT = MONT_AT + sec(MONTAGE);
  return (
    <AbsoluteFill style={{ background: DEEP }}>
      <Sequence from={sec(INTRO)} durationInFrames={sec(CLIP) + 2} layout="none">
        <Clip />
      </Sequence>
      {frame >= sec(INTRO) - 2 && <Bokeh n={12} top={0} />}
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
      <Sequence from={sec(INTRO)} durationInFrames={sec(CLIP) + 2} layout="none">
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
            <Sfx at={0} name={i % 2 ? "whoosh_out" : "swipe"} vol={i ? 0.25 : 0} />
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
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      {CAPS.map((c, i) => (
        <Sequence key={i} from={T(c.start - 0.1)} durationInFrames={sec(c.end - c.start) + 2} layout="none">
          <Caption c={c} />
        </Sequence>
      ))}
      <Watermark />
      {IRIS_AT.map((t, i) => (
        <Sequence key={i} from={T(t) - 11} durationInFrames={26} layout="none">
          <Iris />
        </Sequence>
      ))}
      <Sequence from={MONT_AT} durationInFrames={sec(MONTAGE) + 4} layout="none">
        <Montage />
      </Sequence>
      <Sequence from={OUT_AT} layout="none">
        <Outro />
      </Sequence>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(0,0,0,0.3)" }}>
        <div style={{ height: "100%", width: `${(frame / V17_FRAMES) * 100}%`, background: `linear-gradient(90deg, ${VIOLET}, ${GOLD})` }} />
      </div>
      <Sequence durationInFrames={sec(INTRO) + 6} layout="none">
        <LogoIntro />
      </Sequence>
      <Sfx at={0} name="riser" vol={0.55} />
      <Sfx at={sec(INTRO) - 2} name="boom" vol={0.3} />
      <Sfx at={MONT_AT} name="boom" vol={0.3} />
      <Sequence from={sec(INTRO)} layout="none">
        <Audio src={staticFile("v17/voice.wav")} />
      </Sequence>
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 20, MONT_AT - 5, MONT_AT + 5, V17_FRAMES - 30, V17_FRAMES], [0, 0.07, 0.07, 0.22, 0.22, 0], clamp)} />
    </AbsoluteFill>
  );
};
