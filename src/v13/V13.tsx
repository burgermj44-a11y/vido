/*
 * Video 13: academy contest ad ("خطّي سرّ تميّزي"). New look, NOT paper:
 * brand purple + gold from the academy logo, neon glow, glass cards, bokeh,
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
const PURPLE = "#5B1E9E";
const VIOLET = "#8A4FE0";
const DEEP = "#1A0833";
const GOLD = "#F4C44E";
const GOLD2 = "#FFE08A";
const INTRO = 2.0; // logo reveal before the clip
const CLIP = 23.3;
const OUTRO = 2.2;
export const V13_FPS = FPS;
export const V13_FRAMES = Math.round((INTRO + CLIP + OUTRO) * FPS);
const T = (s: number) => sec(INTRO + s); // clip time -> frame
const MATTE_N = 699;

/* ---------------- words (clip time) ---------------- */
type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 2.9, text: "روح معايا نربّحك كرطابل", hl: ["كرطابل"] },
  { start: 2.9, end: 5.85, text: "مع المجمّع التعليمي الفكر الرائد", hl: ["الفكر", "الرائد"] },
  { start: 6.05, end: 8.3, text: "ستربح معنا محفظة", hl: ["محفظة"] },
  { start: 8.3, end: 10.45, text: "كومونتي تحت الفيديو بصورة", hl: ["كومونتي", "بصورة"] },
  { start: 10.55, end: 13.3, text: "في مسابقة خطّي سرّ تميّزي", hl: ["خطّي", "سرّ", "تميّزي"] },
  { start: 13.3, end: 16.2, text: "الجائزة تكون للمتحصّل على", hl: ["الجائزة"] },
  { start: 16.2, end: 17.6, text: "أكبر عدد من الإعجابات", hl: ["الإعجابات"] },
  { start: 17.6, end: 18.5, text: "بلا ما ننساو" },
  { start: 18.5, end: 20.5, text: "لجنة التحكيم الموقّرة", hl: ["التحكيم"] },
  { start: 20.65, end: 21.7, text: "اللي تحدّد الفائز", hl: ["الفائز"] },
  { start: 21.9, end: 22.75, text: "ولا الفائزة", hl: ["الفائزة"] },
  { start: 22.85, end: 23.3, text: "شكرا!", hl: ["شكرا!"] },
];

type Kind = "win" | "academy" | "bag" | "comment" | "contest" | "prize" | "likes" | "jury" | "winner" | "thanks";
const SCENES: { start: number; kind: Kind; zoom: number }[] = [
  { start: 0, kind: "win", zoom: 1.0 },
  { start: 2.9, kind: "academy", zoom: 1.12 },
  { start: 6.05, kind: "bag", zoom: 1.0 },
  { start: 8.3, kind: "comment", zoom: 1.16 },
  { start: 10.55, kind: "contest", zoom: 1.0 },
  { start: 13.3, kind: "prize", zoom: 1.14 },
  { start: 16.2, kind: "likes", zoom: 1.04 },
  { start: 18.5, kind: "jury", zoom: 1.18 },
  { start: 20.65, kind: "winner", zoom: 1.06 },
  { start: 22.85, kind: "thanks", zoom: 1.2 },
];
const LEAD = 0.25;
const IRIS_AT = [2.9, 10.55, 18.5]; // logo transitions on the big turns

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
  const matte = `url(${staticFile(`v13/matte/${String(idx).padStart(4, "0")}.jpg`)})`;
  const mask: React.CSSProperties = cutout ? { maskImage: matte, WebkitMaskImage: matte, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskMode: "luminance" } as React.CSSProperties : {};
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: "50% 32%" }}>
      <AbsoluteFill style={mask}>
        <OffthreadVideo src={staticFile("v13/source.mp4")} muted style={{ width: W, height: H, filter: "saturate(1.12) contrast(1.08) brightness(1.02)" }} />
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
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + p * 0.15}) rotate(${rot}deg)`, opacity: Math.min(1, p * 1.5), background: "linear-gradient(135deg, rgba(60,20,110,0.82), rgba(26,8,51,0.78))", border: `3px solid ${GOLD}aa`, borderRadius: 36, boxShadow: `0 20px 40px rgba(20,0,40,0.45), 0 0 40px ${VIOLET}55`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", padding: 26 }}>
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
  const p = useIn(4, 10);
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const wrap = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 + out * 0.15})` }}>{c}</AbsoluteFill>;
  switch (kind) {
    case "win":
      return wrap(
        <>
          <NeonWord text="اربح" y={170} size={250} d={4} />
          <Glow3D code="1f392" size={260} x={820} y={560} d={10} />
        </>,
      );
    case "academy": {
      return wrap(
        <>
          <div style={{ position: "absolute", left: W / 2 - 360, top: 90, width: 720, height: 720, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}55 0%, ${VIOLET}44 40%, rgba(0,0,0,0) 70%)`, transform: `scale(${p})` }} />
          <Img src={staticFile("v13/logo.png")} style={{ position: "absolute", left: W / 2 - 230, top: 150, width: 460, transform: `scale(${p}) rotate(${(1 - p) * -30}deg) translateY(${Math.sin(frame / 12) * 8}px)`, filter: `drop-shadow(0 0 30px ${GOLD}aa) drop-shadow(0 20px 30px rgba(0,0,0,0.5))` }} />
        </>,
      );
    }
    case "bag":
      return wrap(
        <>
          <Glow3D code="1f392" size={340} x={W / 2} y={380} d={2} />
          <Glow3D code="1f381" size={150} x={190} y={300} d={10} ring={false} />
          <Glow3D code="2728" size={130} x={900} y={250} d={14} ring={false} spin />
          <Burst x={W / 2} y={380} d={8} />
        </>,
      );
    case "comment":
      return wrap(
        <>
          <Glow3D code="1f4ac" size={240} x={230} y={360} d={2} />
          <Glow3D code="1f4f7" size={210} x={860} y={420} d={8} />
        </>,
      );
    case "contest":
      return wrap(
        <>
          <Glow3D code="270d" size={220} x={850} y={300} d={12} />
          <svg width="900" height="200" viewBox="0 0 90 20" style={{ position: "absolute", left: 90, top: 560 }}>
            <path d="M2 14 C 12 2, 20 18, 30 8 S 48 16, 58 6 S 78 16, 88 6" stroke={GOLD} strokeWidth="1.6" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(frame, 6, 40)} style={{ filter: `drop-shadow(0 0 6px ${GOLD})` }} />
          </svg>
        </>,
      );
    case "prize":
      return wrap(
        <>
          <Glow3D code="1f381" size={260} x={830} y={330} d={2} />
          <Glow3D code="2728" size={130} x={220} y={280} d={10} ring={false} spin />
          <Burst x={830} y={330} d={10} />
        </>,
      );
    case "likes":
      return wrap(
        <>
          {Array.from({ length: 14 }, (_, i) => {
            const t = (frame + i * 7) % 60;
            return <Img key={i} src={icon(i % 3 ? "2764" : "1f44d")} style={{ position: "absolute", left: 80 + ((i * 137) % 920), top: 900 - t * 12, width: 80 + (i % 3) * 20, height: 80 + (i % 3) * 20, opacity: Math.sin((t / 60) * Math.PI), filter: `drop-shadow(0 0 12px ${i % 3 ? "#ff3b6b" : GOLD})` }} />;
          })}
        </>,
      );
    case "jury":
      return wrap(
        <>
          {["1f469-200d-2696-fe0f", "1f9d1-200d-2696-fe0f", "1f468-200d-2696-fe0f"].map((c, i) => (
            <Glow3D key={i} code={c} size={200} x={W / 2 + (i - 1) * 340} y={220 + Math.abs(i - 1) * 90} d={2 + i * 5} />
          ))}
        </>,
      );
    case "winner":
      return wrap(
        <>
          <Glow3D code="1f3c6" size={280} x={820} y={340} d={2} />
          <Glow3D code="1f451" size={150} x={240} y={300} d={10} ring={false} />
          <Burst x={820} y={340} d={6} n={30} />
        </>,
      );
    case "thanks":
      return wrap(<Glow3D code="1f49c" size={240} x={820} y={340} d={2} />);
  }
};

/* ---------------- UI IN FRONT of him ---------------- */
const Front: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const p = useIn(2, 12);
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const wrap = (c: React.ReactNode) => <AbsoluteFill style={{ opacity: 1 - out }}>{c}</AbsoluteFill>;
  switch (kind) {
    case "academy":
      return wrap(<NeonWord text="الفكر الرائد" y={1060} size={110} d={10} />);
    case "comment": {
      const typed = "هاهو خطّي ✍️".slice(0, Math.max(0, Math.floor((frame - 10) / 2)));
      return wrap(
        <Glass x={W / 2} y={980} w={860} d={4}>
          <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: `linear-gradient(135deg, ${VIOLET}, ${GOLD})` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontSize: 46, color: "#fff" }}>
                {typed}
                <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: GOLD }}>|</span>
              </div>
              <div style={{ marginTop: 10, width: 260, height: 150, borderRadius: 18, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: frame - 34, fps: FPS, config: { damping: 10 } })})` }}>
                <svg width="200" height="90" viewBox="0 0 100 45">
                  <path d="M5 30 C 15 5, 25 40, 35 20 S 55 35, 65 15 S 85 30, 95 12" stroke={PURPLE} strokeWidth="3" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(frame, 36, 56)} />
                </svg>
              </div>
            </div>
          </div>
        </Glass>,
      );
    }
    case "contest": {
      return wrap(
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ padding: "26px 60px 34px", borderRadius: 40, background: `linear-gradient(135deg, ${PURPLE}, ${VIOLET})`, border: `5px solid ${GOLD}`, boxShadow: `0 0 50px ${GOLD}88, 0 20px 40px rgba(0,0,0,0.5)`, transform: `scale(${p}) rotate(${(1 - p) * -8 - 2}deg)`, textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 40, color: GOLD2, letterSpacing: 2 }}>مسابقة</div>
            <div style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1.15, color: "#fff", textShadow: `0 0 20px ${GOLD}` }}>خطّي سرّ تميّزي</div>
          </div>
        </div>,
      );
    }
    case "likes": {
      const n = Math.round(interpolate(frame, [4, 36], [0, 999], { ...clamp, easing: Easing.out(Easing.cubic) }));
      return wrap(
        <Glass x={W / 2} y={1000} w={600} d={2}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            <Img src={icon("2764")} style={{ width: 110, height: 110, transform: `scale(${1 + Math.sin(frame / 3) * 0.08})` }} />
            <div style={{ fontFamily: FONT, fontSize: 120, color: "#fff", textShadow: `0 0 20px ${GOLD}` }}>{n === 999 ? "+999" : n}</div>
          </div>
        </Glass>,
      );
    }
    case "jury":
      return wrap(<NeonWord text="لجنة التحكيم" y={1060} size={110} d={8} />);
    case "winner":
      return wrap(<NeonWord text="🏆 الفائز" y={1060} size={120} d={4} color={GOLD} />);
    default:
      return null;
  }
};

/* ---------------- kinetic captions ---------------- */
const Caption: React.FC<{ c: Cap }> = ({ c }) => {
  const frame = useCurrentFrame();
  const words = c.text.split(" ");
  const dur = sec(c.end - c.start);
  const per = (dur * 0.9) / words.length;
  return (
    <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 1400, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 18px" }}>
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
      <Img src={staticFile("v13/logo.png")} style={{ position: "absolute", left: W / 2 - 260, top: 520, width: 520, transform: `scale(${p}) rotate(${(1 - p) * 40}deg)`, filter: `drop-shadow(0 0 ${30 + rays * 40}px ${GOLD}) drop-shadow(0 20px 30px rgba(0,0,0,0.5))` }} />
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
        <Img src={staticFile("v13/logo.png")} style={{ position: "absolute", left: W / 2 - 200, top: 640, width: 400, transform: `scale(${lp}) rotate(${(1 - lp) * -60}deg)`, filter: `drop-shadow(0 0 40px ${GOLD})` }} />
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
      <Img src={staticFile("v13/logo.png")} style={{ position: "absolute", left: 18, top: 14, width: 84 }} />
    </div>
  );
};
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${VIOLET} 0%, ${PURPLE} 38%, ${DEEP} 85%)`, clipPath: `circle(${Math.min(1, p) * 150}% at 50% 45%)` }}>
      <Bokeh n={22} top={200} />
      <div style={{ position: "absolute", left: W / 2, top: 700 }}>
        <Rays p={ramp(frame, 6, 26)} size={820} />
      </div>
      <Img src={staticFile("v13/logo.png")} style={{ position: "absolute", left: W / 2 - 230, top: 420, width: 460, transform: `scale(${p})`, filter: `drop-shadow(0 0 40px ${GOLD})` }} />
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1120, textAlign: "center", fontFamily: FONT, fontSize: 92, color: "#fff", opacity: ramp(frame, 10, 20), textShadow: `0 0 24px ${GOLD}` }}>
        الفكر الرائد للتميّز
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1260, display: "flex", justifyContent: "center", opacity: ramp(frame, 16, 26) }}>
        <div style={{ padding: "16px 46px 22px", borderRadius: 50, background: GOLD, fontFamily: FONT, fontSize: 56, color: DEEP, boxShadow: `0 0 30px ${GOLD}` }}>شارك في المسابقة ✍️</div>
      </div>
      <Sfx at={0} name="whoosh_in" vol={0.35} />
      <Sfx at={8} name="ding" vol={0.25} />
    </AbsoluteFill>
  );
};

export const V13: React.FC = () => {
  const frame = useCurrentFrame();
  const flashAt = SCENES.slice(1).map((s) => T(s.start - LEAD));
  const flash = Math.max(0, ...flashAt.map((f) => (frame >= f ? interpolate(frame - f, [0, 5], [0.35, 0], clamp) : 0)));
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
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
      {CAPS.map((c, i) => (
        <Sequence key={i} from={T(c.start - 0.1)} durationInFrames={sec(c.end - c.start) + 2} layout="none">
          <Caption c={c} />
        </Sequence>
      ))}
      <Watermark />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(0,0,0,0.3)" }}>
        <div style={{ height: "100%", width: `${(frame / V13_FRAMES) * 100}%`, background: `linear-gradient(90deg, ${VIOLET}, ${GOLD})` }} />
      </div>
      {IRIS_AT.map((t, i) => (
        <Sequence key={i} from={T(t) - 11} durationInFrames={26} layout="none">
          <Iris />
        </Sequence>
      ))}
      <Sequence durationInFrames={sec(INTRO) + 6} layout="none">
        <LogoIntro />
      </Sequence>
      <Sequence from={sec(INTRO + CLIP) - 4} layout="none">
        <Outro />
      </Sequence>
      <Sfx at={0} name="riser" vol={0.55} />
      <Sfx at={sec(INTRO) - 2} name="boom" vol={0.3} />
      <Sequence from={sec(INTRO)} layout="none">
        <Audio src={staticFile("v13/voice.wav")} />
      </Sequence>
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 20, V13_FRAMES - 30, V13_FRAMES], [0, 0.07, 0.07, 0], clamp)} />
    </AbsoluteFill>
  );
};
