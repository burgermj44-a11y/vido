/*
 * Video 9 (vertical short, no face): his voice only, every sentence gets its own
 * paper motion-graphics scene on an animated kraft background.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { DrawMark, FPS, GOLD, GREEN, HAND, INK, MARKER, MJ_GOLD, PEN, RED, Sfx, Sheet, Stamp, Tape, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";

loadFonts();
loadHand();

const W = 1080;
const H = 1920;
const VOICE_END = 21.8;
export const V9_FPS = FPS;
export const V9_FRAMES = Math.round((VOICE_END + 0.9) * FPS);
const SCENE_LEAD = 0.25;
const CAP_LEAD = 0.1;

type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 1.79, text: "هل تدرس لساعات طويلة", hl: ["لساعات"] },
  { start: 1.79, end: 3.77, text: "ثم تنسى كل شيء في الامتحان؟", hl: ["تنسى"] },
  { start: 3.77, end: 5.1, text: "المشكلة ليست فيك", hl: ["ليست"] },
  { start: 5.1, end: 6.8, text: "بل في طريقة دراستك", hl: ["طريقة"] },
  { start: 6.8, end: 8.4, text: "هناك طريقة تجعلك تفهم", hl: ["تفهم"] },
  { start: 8.4, end: 10.09, text: "أي درس في دقائق", hl: ["دقائق"] },
  { start: 10.09, end: 11.5, text: "وأخرى تجعلك تتذكره", hl: ["تتذكره"] },
  { start: 11.5, end: 12.93, text: "حتى بعد شهر", hl: ["شهر"] },
  { start: 12.93, end: 13.77, text: "شارك هذا المقطع", hl: ["شارك"] },
  { start: 13.77, end: 14.75, text: "مع أصدقائك", hl: ["أصدقائك"] },
  { start: 14.75, end: 16.19, text: "خمس طرق للدراسة", hl: ["خمس"] },
  { start: 16.19, end: 18.67, text: "توصلك إلى معدل 17", hl: ["17"] },
  { start: 18.67, end: 20.78, text: "هذا هو الفيديو كاملًا على اليوتيوب", hl: ["اليوتيوب"] },
  { start: 20.78, end: 22.6, text: "شاهده الآن", hl: ["الآن"] },
];

/* scene start times (on the voice) */
const S = { study: 0, notYou: 3.77, method: 5.1, fast: 6.8, month: 10.09, share: 12.93, five: 14.75, avg: 16.19, yt: 18.67, end: VOICE_END + 0.9 };

/* ---------- shared bits ---------- */
const Backdrop: React.FC<{ dark?: number }> = ({ dark = 0 }) => {
  const frame = useCurrentFrame();
  const lx = 50 + Math.sin(frame / 60) * 20;
  const ly = 38 + Math.cos(frame / 75) * 10;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#B98B5A" }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 + Math.sin(frame / 50) * 0.015}) translate(${Math.sin(frame / 90) * 14}px, ${Math.cos(frame / 110) * 10}px)`, filter: "blur(3px) saturate(1.1)" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% ${ly}%, rgba(255,226,170,0.55) 0%, rgba(255,210,150,0.15) 35%, rgba(0,0,0,0) 65%)` }} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = ((i * 211) % W) + Math.sin(frame / (30 + i * 2) + i) * 20;
        const y = (((i * 337) % H) - frame * (0.6 + (i % 4) * 0.25) + 4000) % (H + 60) - 30;
        const s = 6 + (i % 5) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.7, borderRadius: 2, background: i % 3 ? "rgba(255,240,215,0.5)" : "rgba(90,55,25,0.3)", transform: `rotate(${frame * (i % 2 ? 1 : -0.7) + i * 30}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: `rgba(25,15,40,${dark})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(50,25,8,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/* pops up hinged at the bottom, on twos */
const Pop: React.FC<{ x: number; y: number; at: number; rot?: number; seed?: number; sound?: string | null; vol?: number; children: React.ReactNode }> = ({ x, y, at, rot = 0, seed = 1, sound = "paper_fold", vol = 0.2, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - at), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.8)}deg)` }}>{children}</div>
        </div>
      )}
    </>
  );
};
const Em: React.FC<{ code: string; size: number; style?: React.CSSProperties }> = ({ code, size, style }) => (
  <Img src={icon(code)} style={{ width: size, height: size, display: "block", filter: stickerFilter(Math.max(5, size / 32)), ...style }} />
);
const Hand: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = INK, children, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);
const TornLabel: React.FC<{ text: string; size?: number; color?: string; seed?: number; tx?: "white" | "kraft" }> = ({ text, size = 70, color = INK, seed = 3, tx = "white" }) => {
  const w = 120 + text.length * size * 0.5;
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Hand size={size} color={color}>
          {text}
        </Hand>
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};

/* scene wrapper: slides up in, falls away at the end */
const Scene: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const inP = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 160 } });
  const outP = interpolate(frame, [dur - 6, dur + 2], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - inP) * 260 - outP * 260}px) rotate(${(1 - inP) * 3 - outP * 3}deg) scale(${0.94 + inP * 0.06})`, opacity: Math.min(1, inP * 1.5) * (1 - outP) }}>
      <Sfx at={0} name="paper_slide" vol={0.22} />
      {children}
    </AbsoluteFill>
  );
};

/* ---------- 1. studying for hours, then forgetting in the exam ---------- */
const StudyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const exam = sec(1.79 + SCENE_LEAD);
  const spin = frame * 22;
  const hours = Math.min(5, 1 + Math.floor(frame / 9));
  const lamp = 0.75 + Math.sin(frame / 3) * 0.05;
  const examP = spring({ frame: onTwos(frame - exam), fps: FPS, config: { damping: 13, stiffness: 150 } });
  return (
    <AbsoluteFill>
      {/* night window */}
      <Pop x={790} y={330} at={2} rot={4} seed={2} sound={null}>
        <Sheet w={300} h={300} tint="#2A3358" tx="kraft" seed={5}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 10, background: "#E9D9B8" }} />
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 10, background: "#E9D9B8" }} />
          <Em code="1f319" size={110} style={{ position: "absolute", left: 160, top: 30, filter: "drop-shadow(0 0 18px rgba(255,230,140,0.8))" }} />
          <Tape x={150} y={2} w={110} rot={5} />
        </Sheet>
      </Pop>
      {/* clock with racing hands */}
      <Pop x={280} y={360} at={0} rot={-5} seed={3}>
        <Sheet w={320} h={320} seed={1} style={{ borderRadius: 999 }}>
          <svg width="320" height="320" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
            <circle cx="50" cy="50" r="40" fill="#FFF8EA" stroke={INK} strokeWidth="3" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={50 + 33 * Math.sin((i * Math.PI) / 6)} y1={50 - 33 * Math.cos((i * Math.PI) / 6)} x2={50 + 37 * Math.sin((i * Math.PI) / 6)} y2={50 - 37 * Math.cos((i * Math.PI) / 6)} stroke={INK} strokeWidth="2" />
            ))}
            <line x1="50" y1="50" x2="50" y2="26" stroke={INK} strokeWidth="4" strokeLinecap="round" transform={`rotate(${spin / 12} 50 50)`} />
            <line x1="50" y1="50" x2="50" y2="18" stroke={RED} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${spin} 50 50)`} />
            <circle cx="50" cy="50" r="3.5" fill={INK} />
          </svg>
        </Sheet>
      </Pop>
      <Pop x={280} y={590} at={6} seed={4} sound="pop2" vol={0.12}>
        <TornLabel text={`${hours} ساعات`} size={64} color={RED} seed={4} />
      </Pop>
      {/* desk + student + lamp light */}
      <div style={{ position: "absolute", left: -60, top: 450, width: 1200, height: 1000, background: `radial-gradient(closest-side at 50% 45%, rgba(255,226,140,${lamp}) 0%, rgba(255,210,120,0.0) 60%)`, opacity: ramp(frame, 4, 14) }} />
      <Pop x={540} y={900} at={3} seed={5} sound={null}>
        <Em code="1f9d2" size={330} style={{ transform: `rotate(${Math.sin(frame / 5) * 3}deg)` }} />
      </Pop>
      <Pop x={540} y={1170} at={1} seed={6}>
        <Sheet w={900} h={150} tx="kraft" tint="#9A6A3E" seed={2}>
          <Tape x={120} y={4} rot={-6} />
          <Tape x={780} y={4} rot={6} />
        </Sheet>
      </Pop>
      <Pop x={420} y={1060} at={7} seed={7} rot={-6}>
        <Em code="1f4d6" size={190} />
      </Pop>
      <Pop x={780} y={1030} at={10} seed={8} rot={5}>
        <Em code="1f4da" size={200} />
      </Pop>
      {/* the exam: blank sheet slams in, question marks, dizzy face */}
      {frame >= exam && (
        <AbsoluteFill style={{ background: `rgba(20,10,0,${0.35 * examP})` }}>
          <Sfx at={exam} name="paper_flip" vol={0.25} />
          <div style={{ position: "absolute", left: 540, top: 820, transform: `translate(-50%, -50%) translateY(${(1 - examP) * 1200}px) rotate(${-4 + (1 - examP) * 20}deg)` }}>
            <Sheet w={760} h={900} seed={3}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", justifyContent: "center" }}>
                <Hand size={84} color={INK}>
                  الامتحان
                </Hand>
              </div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ position: "absolute", left: 80, right: 80, top: 230 + i * 120, display: "flex", alignItems: "center", gap: 20, flexDirection: "row-reverse" }}>
                  <Hand size={52} color={PEN}>
                    {i + 1}.
                  </Hand>
                  <div style={{ flex: 1, borderBottom: "4px dashed #B9B0A0", height: 40 }} />
                </div>
              ))}
              <Tape x={380} y={4} w={160} />
            </Sheet>
          </div>
          {[0, 1, 2].map((i) => {
            const d = frame - exam - 8 - i * 4;
            if (d < 0) return null;
            const s = spring({ frame: onTwos(d), fps: FPS, config: { damping: 8 } });
            return <Em key={i} code="2753" size={150} style={{ position: "absolute", left: [140, 800, 470][i], top: [520, 600, 1200][i], transform: `scale(${s}) rotate(${[-15, 12, -5][i] + jitter(frame, i, 4)}deg)` }} />;
          })}
          {frame >= exam + 10 && <Sfx at={exam + 10} name="pop2" vol={0.15} />}
          <Em code="1f635" size={200} style={{ position: "absolute", left: 760, top: 1130, transform: `scale(${spring({ frame: onTwos(frame - exam - 14), fps: FPS, config: { damping: 9 } })}) rotate(${Math.sin(frame / 3) * 8}deg)` }} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 2. "the problem is not you" ---------- */
const NotYouScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Pop x={540} y={820} at={0} seed={2}>
        <Em code="1f9d1-200d-1f393" size={460} style={{ transform: `translateY(${Math.sin(frame / 6) * 8}px)` }} />
      </Pop>
      <svg width="700" height="700" viewBox="0 0 100 100" style={{ position: "absolute", left: 190, top: 470, overflow: "visible" }}>
        <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(frame, 8, 20)} transform="rotate(-80 50 50)" />
      </svg>
      <Pop x={540} y={330} at={6} seed={3} rot={-3} sound="paper_rustle">
        <TornLabel text="ليست فيك" size={90} color={GREEN} seed={1} />
      </Pop>
      <DrawMark kind="check" x={860} y={320} size={130} at={14} />
      <Sfx at={14} name="pop" vol={0.18} />
    </AbsoluteFill>
  );
};

/* ---------- 3. "it's your study method" ---------- */
const MethodScene: React.FC = () => {
  const frame = useCurrentFrame();
  const items = ["قراءة فقط", "حفظ بلا فهم", "سهر ليلة الامتحان"];
  return (
    <AbsoluteFill>
      <Pop x={540} y={800} at={0} seed={4} rot={2}>
        <Sheet w={820} h={760} seed={4}>
          <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Hand size={86} color={PEN}>
              طريقة دراستك
            </Hand>
          </div>
          {items.map((t, i) => (
            <div key={i} style={{ position: "absolute", right: 90, top: 240 + i * 150 }}>
              <Hand size={66}>• {t}</Hand>
            </div>
          ))}
          <Tape x={410} y={4} w={170} />
        </Sheet>
      </Pop>
      {items.map((_, i) => (
        <React.Fragment key={i}>
          <svg width="640" height="60" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: "absolute", left: 230, top: 692 + i * 150 }}>
            <path d="M2 6 Q 50 2 98 5" stroke={RED} strokeWidth="2.2" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(frame, 10 + i * 6, 16 + i * 6)} />
          </svg>
          <Sfx at={10 + i * 6} name="tick" vol={0.15} />
        </React.Fragment>
      ))}
      <Stamp text="خطأ" x={800} y={1180} delay={30} rot={-14} size={110} />
    </AbsoluteFill>
  );
};

/* ---------- 4. "understand any lesson in minutes" ---------- */
const FastScene: React.FC = () => {
  const frame = useCurrentFrame();
  const lit = ramp(frame, 18, 26);
  const sweep = Math.min(1, frame / 80);
  const mins = Math.min(5, Math.floor(sweep * 5.99));
  return (
    <AbsoluteFill>
      {/* glow rays when the bulb lights */}
      <div style={{ position: "absolute", left: 540 - 600, top: 560 - 600, width: 1200, height: 1200, borderRadius: "50%", opacity: lit * 0.9, transform: `rotate(${frame * 0.6}deg)`, background: "repeating-conic-gradient(rgba(255,230,140,0.45) 0deg 8deg, rgba(0,0,0,0) 8deg 20deg)", WebkitMaskImage: "radial-gradient(circle, #000 10%, transparent 62%)" }} />
      <Pop x={540} y={480} at={4} seed={2} sound={null}>
        <Em code="1f4a1" size={300} style={{ filter: `${stickerFilter(9)} grayscale(${1 - lit}) drop-shadow(0 0 ${40 * lit}px rgba(255,220,90,${lit}))`, transform: `scale(${1 + lit * 0.08 * Math.sin(frame / 3)})` }} />
      </Pop>
      <Sfx at={18} name="sparkle" vol={0.22} />
      <Pop x={540} y={860} at={0} seed={3}>
        <Em code="1f9e0" size={340} />
      </Pop>
      {/* stopwatch */}
      <Pop x={540} y={1240} at={8} seed={4} rot={-3}>
        <Sheet w={520} h={250} seed={5}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <svg width="150" height="150" viewBox="0 0 100 100">
              <circle cx="50" cy="54" r="38" fill="#FFF8EA" stroke={INK} strokeWidth="5" />
              <rect x="42" y="4" width="16" height="10" rx="3" fill={INK} />
              <path d={`M50 54 L50 16 A38 38 0 ${sweep > 0.5 ? 1 : 0} 1 ${50 + 38 * Math.sin(sweep * 2 * Math.PI)} ${54 - 38 * Math.cos(sweep * 2 * Math.PI)} Z`} fill={GOLD} opacity="0.85" />
              <line x1="50" y1="54" x2={50 + 32 * Math.sin(frame * 0.5)} y2={54 - 32 * Math.cos(frame * 0.5)} stroke={RED} strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: FONT, fontSize: 96, color: INK }}>{`0${mins}:00`}</div>
          </div>
          <Tape x={260} y={4} />
        </Sheet>
      </Pop>
      {frame >= 8 && frame < 80 && frame % 10 === 0 && <Sfx at={frame} name="tick" vol={0.08} />}
    </AbsoluteFill>
  );
};

/* ---------- 5. "remember it even a month later": calendar pages tear off ---------- */
const MonthScene: React.FC = () => {
  const frame = useCurrentFrame();
  const flipStart = 6;
  const per = 1.4;
  const day = Math.min(30, 1 + Math.floor(Math.max(0, frame - flipStart) / per));
  const done = day >= 30;
  return (
    <AbsoluteFill>
      {/* little student studying, bobbing */}
      <Pop x={250} y={1210} at={2} seed={1}>
        <div style={{ position: "relative", width: 300, height: 300 }}>
          <Em code="1f9d2" size={220} style={{ position: "absolute", left: 40, top: 0, transform: `rotate(${Math.sin(frame / 4) * 4}deg)` }} />
          <Em code="1f4d6" size={150} style={{ position: "absolute", left: 75, top: 170 }} />
        </div>
      </Pop>
      {/* tear-off calendar */}
      <Pop x={600} y={690} at={0} seed={3} rot={2}>
        <div style={{ position: "relative", width: 620, height: 700 }}>
          <Sheet w={620} h={700} seed={2}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: RED, ...maskStyle(4) }} />
            <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Hand size={84} color="#fff">
                اليوم
              </Hand>
            </div>
            <div style={{ position: "absolute", top: 170, left: 0, right: 0, bottom: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 330, color: done ? GREEN : INK, transform: `scale(${done ? 1 + 0.08 * spring({ frame: frame - (flipStart + 29 * per), fps: FPS, config: { damping: 7 } }) : 1})` }}>
              {day}
            </div>
          </Sheet>
          {/* the page that just tore off flies away */}
          {!done && frame > flipStart && (
            <div style={{ position: "absolute", left: 0, top: 150, width: 620, height: 520, transformOrigin: "50% 0%", transform: `translate(${((frame - flipStart) % per) * 140}px, ${((frame - flipStart) % per) * -80}px) rotate(${((frame - flipStart) % per) * 25}deg)`, opacity: 0.85 }}>
              <div style={{ position: "absolute", inset: 0, background: "#FFF8EA", ...maskStyle(5) }} />
            </div>
          )}
        </div>
      </Pop>
      {frame >= flipStart && frame < flipStart + 30 * per && frame % 4 === 0 && <Sfx at={frame} name="paper_flip" vol={0.06} />}
      {done && (
        <>
          <Pop x={820} y={1230} at={flipStart + Math.ceil(29 * per) + 2} seed={4} sound="pop">
            <div style={{ position: "relative" }}>
              <Em code="1f9e0" size={230} />
              <Em code="2705" size={110} style={{ position: "absolute", right: -30, top: -30 }} />
            </div>
          </Pop>
          <Pop x={540} y={250} at={flipStart + Math.ceil(29 * per) + 6} seed={5} rot={-2} sound="paper_rustle">
            <TornLabel text="ما زلت تتذكر" size={80} color={GREEN} seed={2} />
          </Pop>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 6. share: phone + share sheet, paper planes to friends ---------- */
const ShareScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 9;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const cx = 540;
  const cy = 820;
  const friends = [
    { code: "1f468-200d-1f393", x: 170, y: 380 },
    { code: "1f469-200d-1f393", x: 540, y: 250 },
    { code: "1f9d1-200d-1f393", x: 910, y: 380 },
    { code: "1f466", x: 150, y: 1260 },
    { code: "1f467", x: 930, y: 1260 },
  ];
  const shared = friends.filter((_, i) => frame >= tap + 4 + i * 3 + 14).length;
  return (
    <AbsoluteFill>
      {/* rays */}
      <div style={{ position: "absolute", left: cx - 700, top: cy - 700, width: 1400, height: 1400, borderRadius: "50%", transform: `rotate(${frame * 0.8}deg)`, background: "repeating-conic-gradient(rgba(255,236,190,0.35) 0deg 9deg, rgba(0,0,0,0) 9deg 18deg)", WebkitMaskImage: "radial-gradient(circle, #000 12%, transparent 60%)", opacity: ramp(frame, tap, tap + 8) }} />
      {/* pulse rings */}
      {frame > tap &&
        [0, 1, 2].map((k) => {
          const r = ((frame - tap + k * 8) % 24) / 24;
          return <div key={k} style={{ position: "absolute", left: cx - 150 - r * 160, top: cy - 150 - r * 160, width: 300 + r * 320, height: 300 + r * 320, borderRadius: "50%", border: `8px solid ${GOLD}`, opacity: (1 - r) * 0.8 }} />;
        })}
      {/* big paper share button */}
      <Pop x={cx} y={cy} at={0} seed={2} sound="paper_fold">
        <div style={{ transform: `scale(${frame > tap ? interpolate(press, [0, 0.4, 1], [1, 0.84, 1]) : 1})` }}>
          <Sheet w={300} h={300} tx="white" tint={PEN} seed={3} style={{ borderRadius: 999 }}>
            <svg width="300" height="300" viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
              <path d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z" fill="white" stroke={INK} strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
            <Tape x={150} y={8} w={120} rot={5} />
          </Sheet>
        </div>
      </Pop>
      {/* tapping hand */}
      {frame < tap + 14 && (
        <Em code="1f446" size={190} style={{ position: "absolute", left: interpolate(frame, [0, tap - 2], [900, cx - 30], { ...clamp, easing: Easing.out(Easing.cubic) }), top: interpolate(frame, [0, tap - 2], [1500, cy + 70], { ...clamp, easing: Easing.out(Easing.cubic) }), transform: `rotate(-15deg) scale(${interpolate(frame - tap, [-2, 0, 3], [1, 0.82, 1], clamp)})` }} />
      )}
      <Sfx at={tap} name="click" vol={0.4} />
      {friends.map((fr, i) => {
        const launch = tap + 4 + i * 3;
        const t = spring({ frame: onTwos(frame - launch), fps: FPS, config: { damping: 200 }, durationInFrames: 14 });
        const arrived = frame >= launch + 14;
        const px = interpolate(t, [0, 1], [cx, fr.x]);
        const py = interpolate(t, [0, 1], [cy, fr.y]) - Math.sin(t * Math.PI) * 140;
        const ang = (Math.atan2(fr.y - cy, fr.x - cx) * 180) / Math.PI + 45;
        const pop = spring({ frame: frame - (launch + 14), fps: FPS, config: { damping: 9 } });
        return (
          <React.Fragment key={i}>
            {frame >= launch && !arrived && (
              <svg width="110" height="110" viewBox="0 0 24 24" style={{ position: "absolute", left: px - 55, top: py - 55, transform: `rotate(${ang}deg)`, filter: "drop-shadow(0 8px 8px rgba(0,0,0,0.3))" }}>
                <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M22 3 11.5 13.2" stroke={INK} strokeWidth="0.6" />
              </svg>
            )}
            {arrived && (
              <div style={{ position: "absolute", left: fr.x - 95, top: fr.y - 95, width: 190, height: 190, transform: `scale(${pop}) rotate(${jitter(frame, i, 3)}deg)` }}>
                <Em code={fr.code} size={190} />
                <div style={{ position: "absolute", right: -6, bottom: -6, width: 70, height: 70, borderRadius: 35, background: GREEN, border: "6px solid #fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 900 }}>✓</div>
                {[0, 1].map((k) => {
                  const d = frame - launch - 16 - k * 3;
                  if (d < 0 || d > 20) return null;
                  return <Img key={k} src={icon("2764")} style={{ position: "absolute", left: 60 + k * 50, top: -d * 6, width: 50, height: 50, opacity: 1 - d / 20 }} />;
                })}
              </div>
            )}
            <Sfx at={launch} name="paper_slide" vol={0.12} />
            <Sfx at={launch + 14} name="pop" vol={0.12} />
          </React.Fragment>
        );
      })}
      {/* counter */}
      {shared > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-3deg) scale(${spring({ frame: frame - (tap + 18), fps: FPS, config: { damping: 9 } })})` }}>
            <Sheet w={420} h={120} tx="kraft" tint={GOLD} seed={6}>
              <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 60, color: INK }}>
                +{shared} مشاركة
              </div>
            </Sheet>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ---------- 7. five methods: five cards fan out ---------- */
const FiveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const codes = ["1f9e0", "1f501", "1f500", "1f4c6", "1f5fa"];
  return (
    <AbsoluteFill>
      <Pop x={540} y={330} at={0} seed={1} sound="paper_rustle">
        <TornLabel text="5 طرق للدراسة" size={92} seed={3} />
      </Pop>
      {codes.map((c, i) => {
        const d = 4 + i * 3;
        const p = spring({ frame: onTwos(frame - d), fps: FPS, config: { damping: 12, stiffness: 160 } });
        const ang = (i - 2) * 19;
        return (
          <div key={i} style={{ position: "absolute", left: 540 - 140, top: 1300 - 420, width: 280, height: 420, transformOrigin: "50% 160%", transform: `rotate(${ang * p}deg) translateY(${(1 - p) * 600}px)`, opacity: frame >= d ? 1 : 0 }}>
            <Sheet w={280} h={420} seed={i} tx={i % 2 ? "kraft" : "white"}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ fontFamily: FONT, fontSize: 130, color: i === 4 ? RED : INK, lineHeight: 1 }}>{i + 1}</div>
                <Img src={icon(c)} style={{ width: 120, height: 120 }} />
              </div>
              <Tape x={140} y={4} w={100} rot={(i - 2) * 5} />
            </Sheet>
            <Sfx at={d} name="paper_flip" vol={0.12} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 8. average 17: report card, number rolls up, confetti ---------- */
const AvgScene: React.FC = () => {
  const frame = useCurrentFrame();
  const roll = interpolate(frame, [8, 34], [9, 17], { ...clamp, easing: Easing.out(Easing.cubic) });
  const n = Math.round(roll);
  const hit = 36;
  return (
    <AbsoluteFill>
      <Pop x={540} y={860} at={0} seed={2} rot={-2}>
        <Sheet w={820} h={900} seed={2}>
          <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Hand size={80} color={PEN}>
              كشف النقاط
            </Hand>
          </div>
          <div style={{ position: "absolute", top: 200, left: 90, right: 90, borderTop: "4px solid #D8CDB8" }} />
          <div style={{ position: "absolute", top: 240, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Hand size={74}>المعدل</Hand>
          </div>
          <div style={{ position: "absolute", top: 340, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontFamily: FONT, fontSize: 330, lineHeight: 1, color: n >= 17 ? GREEN : INK, transform: `scale(${frame >= hit ? 1 + 0.12 * spring({ frame: frame - hit, fps: FPS, config: { damping: 6 } }) * Math.max(0, 1 - (frame - hit) / 20) : 1})` }}>{n}</div>
            <div style={{ fontFamily: FONT, fontSize: 100, color: "#8A7F6C" }}>/20</div>
          </div>
          <Tape x={410} y={4} w={180} />
        </Sheet>
      </Pop>
      {frame >= 8 && frame < 34 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.1} />}
      <Stamp text="ممتاز" x={760} y={1230} delay={hit} color={GREEN} rot={-12} size={100} />
      <Sfx at={hit} name="sparkle" vol={0.25} />
      {frame >= hit &&
        Array.from({ length: 34 }, (_, i) => {
          const d = frame - hit;
          const a = (i / 34) * Math.PI * 2 + i;
          const v = 18 + (i % 5) * 5;
          const x = 540 + Math.cos(a) * v * d;
          const y = 760 + Math.sin(a) * v * d + d * d * 0.9;
          const cols = [GOLD, RED, PEN, GREEN, "#fff"];
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 22, height: 14, background: cols[i % 5], transform: `rotate(${d * 20 + i * 40}deg)`, opacity: Math.max(0, 1 - d / 40) }} />;
        })}
      <Pop x={200} y={1300} at={hit + 4} seed={5} rot={-10} sound="pop">
        <Em code="1f976" size={230} />
      </Pop>
      <Pop x={870} y={360} at={hit + 8} seed={6} rot={10} sound={null}>
        <Em code="1f3c6" size={190} />
      </Pop>
    </AbsoluteFill>
  );
};

/* ---------- 9. the full video on YouTube ---------- */
const YtScene: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 44;
  const played = frame >= tap;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const sub = 70;
  return (
    <AbsoluteFill>
      <Pop x={540} y={300} at={2} seed={1} rot={-2} sound="paper_rustle">
        <TornLabel text="الفيديو كاملًا" size={92} seed={2} />
      </Pop>
      <Pop x={540} y={820} at={0} seed={2} rot={1}>
        <div style={{ width: 960, background: "#0F0F0F", borderRadius: 34, padding: 18, border: "10px solid #fff", boxShadow: "0 22px 36px rgba(0,0,0,0.45)", position: "relative" }}>
          <div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
            <Img src={staticFile("v9/thumb.png")} style={{ width: "100%", display: "block", transform: `scale(${1 + frame * 0.0006})` }} />
            {!played && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 200, height: 140, borderRadius: 40, background: "#FF0033", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + Math.sin(frame / 4) * 0.05})`, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}>
                  <div style={{ width: 0, height: 0, borderTop: "34px solid transparent", borderBottom: "34px solid transparent", borderLeft: "56px solid #fff", marginLeft: 12 }} />
                </div>
              </div>
            )}
            {played && <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${0.5 * (1 - press)})` }} />}
          </div>
          <div style={{ marginTop: 14, height: 10, borderRadius: 5, background: "#444" }}>
            <div style={{ height: "100%", width: `${played ? Math.min(100, (frame - tap) * 1.2) : 0}%`, background: "#FF0033", borderRadius: 5 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18, direction: "ltr" }}>
            <Img src={staticFile("promo/avatar.png")} style={{ width: 90, height: 90, borderRadius: 45 }} />
            <div style={{ flex: 1, fontFamily: "Roboto, Arial, sans-serif", color: "#fff", fontSize: 34, fontWeight: 700 }}>abdelwahab mj</div>
            <div style={{ padding: "14px 30px", borderRadius: 40, background: frame >= sub ? "#333" : "#fff", color: frame >= sub ? "#fff" : "#0F0F0F", fontFamily: "Roboto, Arial, sans-serif", fontWeight: 800, fontSize: 32, transform: `scale(${frame >= sub ? interpolate(spring({ frame: frame - sub, fps: FPS, config: { damping: 9, stiffness: 320 } }), [0, 0.4, 1], [1, 0.88, 1]) : 1})` }}>
              {frame >= sub ? "Subscribed 🔔" : "Subscribe"}
            </div>
          </div>
          <Tape x={90} y={-4} w={150} rot={-22} />
          <Tape x={870} y={-4} w={150} rot={20} />
        </div>
      </Pop>
      {/* hand taps play, then subscribe */}
      {frame > 30 && frame < sub + 12 && (
        <Em
          code="1f446"
          size={170}
          style={{
            position: "absolute",
            left: frame < tap + 10 ? interpolate(frame, [30, tap - 2], [900, 480], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(frame, [tap + 10, sub - 2], [480, 820], { ...clamp, easing: Easing.inOut(Easing.cubic) }),
            top: frame < tap + 10 ? interpolate(frame, [30, tap - 2], [1500, 700], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(frame, [tap + 10, sub - 2], [700, 1120], { ...clamp, easing: Easing.inOut(Easing.cubic) }),
            transform: `rotate(-15deg) scale(${interpolate(frame - tap, [-2, 0, 3], [1, 0.82, 1], clamp) * interpolate(frame - sub, [-2, 0, 3], [1, 0.82, 1], clamp)})`,
          }}
        />
      )}
      <Sfx at={tap} name="click" vol={0.4} />
      <Sfx at={sub} name="click" vol={0.35} />
      <Sfx at={sub + 2} name="ring" vol={0.12} />
      {/* bouncing arrow "watch now" */}
      <Pop x={540} y={1330} at={56} seed={4} sound="pop2" vol={0.15}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${Math.sin(frame / 4) * 14}px)` }}>
          <Sheet w={480} h={140} tint={RED} seed={5}>
            <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 70, color: "#fff" }}>
              شاهده الآن
            </div>
          </Sheet>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};

/* ---------- captions: torn strip, karaoke, yellow marker ---------- */
const Caption: React.FC<{ c: Cap; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const words = c.text.split(" ");
  const per = (dur * 0.92) / words.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `translateY(${(1 - p) * 60}px) rotate(${(idx % 2 ? 1.5 : -1.5) + jitter(frame, idx, 0.3)}deg) scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 1.5), filter: "drop-shadow(0 10px 12px rgba(40,22,8,0.45))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "14px 40px 22px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 16px", maxWidth: 940 }}>
          {words.map((w, i) => {
            const st = Math.floor(i * per);
            const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
            const hl = c.hl?.includes(w.replace(/[،.؟]/g, ""));
            const mk = ramp(frame, st, st + 6);
            return (
              <span key={i} style={{ fontFamily: FONT, fontSize: hl ? 76 : 68, lineHeight: 1.35, color: active ? PEN : INK, backgroundImage: hl ? `linear-gradient(transparent 42%, ${MARKER} 42%, ${MARKER} 92%, transparent 92%)` : "none", backgroundRepeat: "no-repeat", backgroundPosition: "right", backgroundSize: hl ? `${mk * 100}% 100%` : "auto", padding: hl ? "0 8px" : 0 }}>
                {w}
              </span>
            );
          })}
        </div>
        <Tape x={70} y={4} w={110} rot={-14} />
      </div>
      <Sfx at={0} name="tick" vol={0.1} />
    </div>
  );
};

/* ---------- MJ wipe (vertical) ---------- */
const MJWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const y = (lag: number) => interpolate(frame - lag, [0, 8, 14, 22], [2200, 0, 0, -2300], { ...clamp, easing: ease });
  const mj = ramp(frame, 6, 11);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={9} name="mj_hit" vol={0.2} />
      <div style={{ position: "absolute", left: -150, top: y(-2) - 150, width: W + 300, height: H + 300, background: GOLD, ...maskStyle(1) }} />
      <div style={{ position: "absolute", left: -150, top: y(1) - 100, width: W + 300, height: H + 200, background: "#151515", ...maskStyle(4) }}>
        <div style={{ position: "absolute", left: 150, top: 100, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 280, lineHeight: 1, letterSpacing: interpolate(mj, [0, 1], [40, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: mj }}>MJ</div>
          <div style={{ width: 280 * ramp(frame, 9, 14), height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const V9: React.FC = () => {
  const frame = useCurrentFrame();
  const scenes: [number, number, React.FC][] = [
    [S.study, S.notYou, StudyScene],
    [S.notYou, S.method, NotYouScene],
    [S.method, S.fast, MethodScene],
    [S.fast, S.month, FastScene],
    [S.month, S.share, MonthScene],
    [S.share, S.five, ShareScene],
    [S.five, S.avg, FiveScene],
    [S.avg, S.yt, AvgScene],
    [S.yt, S.end, YtScene],
  ];
  const night = interpolate(frame, [0, 8, sec(S.notYou - SCENE_LEAD) - 4, sec(S.notYou - SCENE_LEAD) + 4], [0, 0.35, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      <Backdrop dark={night} />
      {scenes.map(([a, b, C], i) => {
        const from = Math.max(0, sec(a - SCENE_LEAD));
        const dur = sec(b - SCENE_LEAD) - from + (i === scenes.length - 1 ? 0 : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <Scene dur={i === scenes.length - 1 ? dur + 20 : dur}>
              <C />
            </Scene>
          </Sequence>
        );
      })}
      {CAPS.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.start - CAP_LEAD))} durationInFrames={sec(c.end - c.start)} layout="none">
          <Caption c={c} idx={i} />
        </Sequence>
      ))}
      <Sequence from={sec(S.yt - SCENE_LEAD) - 11} durationInFrames={24} layout="none">
        <MJWipe />
      </Sequence>
      {/* progress bar + watermark */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ height: "100%", width: `${(frame / V9_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 40, fontFamily: FONT, fontSize: 60, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.4))" }}>MJ</div>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("v9/voice.wav")} />
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 10, V9_FRAMES - 20, V9_FRAMES], [0, 0.08, 0.08, 0], clamp)} />
    </AbsoluteFill>
  );
};
