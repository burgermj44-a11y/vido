/*
 * Video 10: the story of his friend Mohamed (paper style, vertical).
 * The real room stays; graphics sit between the wall and him (matte), captions
 * on torn strips, three full-screen paper cut-aways with the MJ wipe.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { DrawMark, FPS, GOLD, GREEN, HAND, INK, MARKER, MJ_GOLD, PEN, RED, Sfx, Sheet, Stamp, Tape, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";

loadFonts();
loadHand();

const W = 1080;
const H = 1920;
export const V10_FPS = FPS;
export const V10_FRAMES = 1423;
const DUR = V10_FRAMES / FPS;
const CAP_LEAD = 0.1;
const SCENE_LEAD = 0.25;
const CUT_LEAD = 0.3;
const MATTE_N = 1423;

type Cap = { start: number; end: number; text: string; hl?: string[] };
const CAPS: Cap[] = [
  { start: 0.0, end: 3.02, text: "هاد الإنسان هو أكبر تحفيز ليك", hl: ["تحفيز"] },
  { start: 3.17, end: 5.9, text: "باش تتعب وتقرا", hl: ["تقرا"] },
  { start: 8.97, end: 10.4, text: "هاد الإنسان صاحبي", hl: ["صاحبي"] },
  { start: 10.4, end: 11.9, text: "واسمو محمد", hl: ["محمد"] },
  { start: 11.9, end: 14.69, text: "في الفصل الأول والثاني", hl: ["الأول"] },
  { start: 14.95, end: 16.7, text: "كان لازمو 16", hl: ["16"] },
  { start: 16.7, end: 18.49, text: "باش ينجح", hl: ["ينجح"] },
  { start: 18.66, end: 21.82, text: "كان تعبان والمورال طايح", hl: ["تعبان"] },
  { start: 21.94, end: 24.04, text: "قالي: تقدر تعاوني؟", hl: ["تعاوني؟"] },
  { start: 24.16, end: 25.79, text: "باش ننجح في قرايتي", hl: ["ننجح"] },
  { start: 25.92, end: 28.88, text: "وقرر يبدّل طريقتو", hl: ["يبدّل"] },
  { start: 29.1, end: 30.7, text: "دار البروغرام تاعي", hl: ["البروغرام"] },
  { start: 30.94, end: 33.35, text: "وبدا يقرا بذكاء ماشي بالجهد", hl: ["بذكاء"] },
  { start: 33.62, end: 36.97, text: "وبدا يقرا بالخطة", hl: ["بالخطة"] },
  { start: 37.1, end: 39.78, text: "اكتبولي «خطة» ونشرحهالكم", hl: ["«خطة»"] },
  { start: 39.95, end: 42.3, text: "حرفيا في الفصل الثالث جاب 15", hl: ["15"] },
  { start: 42.3, end: 44.47, text: "وفوّت الباك!", hl: ["الباك!"] },
  { start: 44.67, end: 47.2, text: "ربي يوفقو إن شاء الله خوتي", hl: ["يوفقو"] },
];

/* full-screen cut-aways (speaker hidden) */
const CUTS = [
  { kind: "friend", start: 8.97 - CUT_LEAD, end: 11.9 - CUT_LEAD },
  { kind: "chat", start: 21.94 - CUT_LEAD, end: 25.85 - CUT_LEAD },
  { kind: "result", start: 39.95 - CUT_LEAD, end: 44.6 - CUT_LEAD },
] as const;

/* speaker scenes: punch-in zoom + the graphics above his head */
type Kind = "motiv" | "effort" | "grades" | "sixteen" | "tired" | "change" | "program" | "smart" | "plan" | "comment" | "pray";
type Sc = { start: number; end: number; kind: Kind; zoom: number };
const SCENES_RAW: Sc[] = [
  { start: 0, end: 3.1, kind: "motiv", zoom: 1.0 },
  { start: 3.1, end: 8.97, kind: "effort", zoom: 1.14 },
  { start: 11.9, end: 14.9, kind: "grades", zoom: 1.0 },
  { start: 14.9, end: 18.6, kind: "sixteen", zoom: 1.22 },
  { start: 18.6, end: 21.94, kind: "tired", zoom: 1.08 },
  { start: 25.85, end: 29.05, kind: "change", zoom: 1.0 },
  { start: 29.05, end: 30.9, kind: "program", zoom: 1.14 },
  { start: 30.9, end: 33.5, kind: "smart", zoom: 1.0 },
  { start: 33.5, end: 37.05, kind: "plan", zoom: 1.2 },
  { start: 37.05, end: 39.95, kind: "comment", zoom: 1.0 },
  { start: 44.6, end: DUR, kind: "pray", zoom: 1.12 },
];
const SCENES: Sc[] = SCENES_RAW.map((s) => ({ ...s, start: Math.max(0, s.start - SCENE_LEAD) }));

const sceneAt = (t: number) => SCENES.filter((s) => s.start <= t).pop() ?? SCENES[0];
const inCut = (t: number) => CUTS.some((c) => t >= c.start + 0.3 && t < c.end);

/* ---------- the room + his cut-out ---------- */
const useZoom = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sceneAt(t);
  const prev = SCENES[Math.max(0, SCENES.indexOf(s) - 1)];
  const k = spring({ frame: frame - sec(s.start), fps: FPS, config: { damping: 18, stiffness: 120 } });
  const z = prev.zoom + (s.zoom - prev.zoom) * k;
  const drift = (frame - sec(s.start)) * 0.0006;
  return { scale: z + drift, origin: "50% 34%" };
};
const Room: React.FC<{ cutout?: boolean }> = ({ cutout }) => {
  const frame = useCurrentFrame();
  const { scale, origin } = useZoom();
  const matte = `url(${staticFile(`v10/matte/${String(Math.min(frame + 1, MATTE_N)).padStart(4, "0")}.jpg`)})`;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
      <AbsoluteFill
        style={
          cutout
            ? { maskImage: matte, WebkitMaskImage: matte, maskSize: "100% 100%", WebkitMaskSize: "100% 100%", maskMode: "luminance", WebkitMaskSourceType: "luminance" } as React.CSSProperties
            : {}
        }
      >
        <OffthreadVideo src={staticFile("v10/source.mp4")} muted style={{ width: W, height: H, filter: "saturate(1.08) contrast(1.05)" }} />
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
  return <AbsoluteFill style={{ background: "#fff", opacity: s.start > 0 ? interpolate(d, [0, 4], [0.35, 0], clamp) : 0, pointerEvents: "none" }} />;
};

/* ---------- small paper pieces ---------- */
const Pop: React.FC<{ x: number; y: number; at?: number; rot?: number; seed?: number; sound?: string | null; vol?: number; children: React.ReactNode }> = ({ x, y, at = 0, rot = 0, seed = 1, sound = "paper_fold", vol = 0.18, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - at), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.8)}deg) translateY(${Math.sin(frame / 12 + seed) * 6}px)` }}>{children}</div>
        </div>
      )}
    </>
  );
};
const Em: React.FC<{ code: string; size: number; style?: React.CSSProperties }> = ({ code, size, style }) => (
  <Img src={icon(code)} style={{ width: size, height: size, display: "block", filter: stickerFilter(Math.max(5, size / 30)), ...style }} />
);
const Hand: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = INK, children, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);
const TornLabel: React.FC<{ text: string; size?: number; color?: string; seed?: number; tx?: "white" | "kraft"; tint?: string }> = ({ text, size = 66, color = INK, seed = 3, tx = "white", tint }) => {
  const w = 110 + text.length * size * 0.5;
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed} tint={tint}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Hand size={size} color={color}>
          {text}
        </Hand>
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};

/* graphics BEHIND him (above his head, around him) — stickers */
const BackGraphics: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const box = (children: React.ReactNode) => <AbsoluteFill style={{ opacity: 1 - out, transform: `scale(${1 - out * 0.1})` }}>{children}</AbsoluteFill>;
  switch (kind) {
    case "motiv":
      return box(
        <>
          <Pop x={540} y={250} at={4} seed={1}>
            <Em code="1f525" size={260} style={{ transform: `scale(${1 + Math.sin(frame / 4) * 0.04})` }} />
          </Pop>
          <Pop x={200} y={420} at={10} seed={2} rot={-12}>
            <Em code="2728" size={130} />
          </Pop>
          <Pop x={880} y={420} at={13} seed={3} rot={12}>
            <Em code="2728" size={110} />
          </Pop>
        </>,
      );
    case "effort":
      return box(
        <>
          <Pop x={240} y={300} at={3} seed={1} rot={-10}>
            <Em code="1f4aa" size={230} />
          </Pop>
          <Pop x={840} y={300} at={9} seed={2} rot={8}>
            <Em code="1f4da" size={240} />
          </Pop>
        </>,
      );
    case "grades":
      return box(
        <Pop x={540} y={290} at={2} seed={2} rot={-3}>
          <Sheet w={640} h={330} seed={1}>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-around", alignItems: "center", direction: "rtl" }}>
              {[
                ["الفصل 1", "؟"],
                ["الفصل 2", "؟"],
              ].map(([a, b], i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <Hand size={52} color={PEN}>
                    {a}
                  </Hand>
                  <div style={{ fontFamily: FONT, fontSize: 130, color: RED, lineHeight: 1.1, transform: `rotate(${jitter(frame, i, 4)}deg)` }}>{b}</div>
                </div>
              ))}
            </div>
            <Em code="1f4c9" size={130} style={{ position: "absolute", right: -40, top: -50 }} />
            <Tape x={320} y={4} />
          </Sheet>
        </Pop>,
      );
    case "sixteen": {
      const n = Math.round(interpolate(frame, [4, 22], [0, 16], { ...clamp, easing: Easing.out(Easing.cubic) }));
      return box(
        <>
          {frame >= 4 && frame < 22 && frame % 2 === 0 && <Sfx at={frame} name="tick" vol={0.08} />}
          <Pop x={540} y={290} at={2} seed={3}>
            <Sheet w={420} h={300} tx="kraft" seed={2}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 210, color: n >= 16 ? GREEN : INK }}>{n}</div>
              <Tape x={210} y={4} />
            </Sheet>
          </Pop>
          <Pop x={860} y={250} at={22} seed={4} rot={12} sound="sparkle" vol={0.2}>
            <Em code="1f3af" size={160} />
          </Pop>
        </>,
      );
    }
    case "tired":
      return box(
        <>
          <Pop x={250} y={320} at={3} seed={1} rot={-8}>
            <Em code="1f629" size={220} />
          </Pop>
          <Pop x={830} y={320} at={8} seed={2} rot={6}>
            <div style={{ position: "relative", width: 260, height: 140 }}>
              <Sheet w={240} h={130} seed={3}>
                <div style={{ position: "absolute", left: 22, top: 22, bottom: 22, width: 196 * interpolate(frame, [8, 40], [0.7, 0.08], clamp), background: RED, borderRadius: 8 }} />
                <div style={{ position: "absolute", inset: 14, border: `8px solid ${INK}`, borderRadius: 14 }} />
              </Sheet>
              <div style={{ position: "absolute", right: 0, top: 44, width: 22, height: 44, background: INK, borderRadius: 4 }} />
            </div>
          </Pop>
        </>,
      );
    case "change":
      return box(
        <Pop x={540} y={260} at={3} seed={2}>
          <Em code="1f504" size={240} style={{ transform: `rotate(${frame * 5}deg)` }} />
        </Pop>,
      );
    case "program":
      return box(
        <Pop x={540} y={300} at={2} seed={3} rot={-2}>
          <Sheet w={600} h={360} seed={4}>
            <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Hand size={58} color={PEN}>
                البروغرام
              </Hand>
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, top: 110, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ height: 90, borderRadius: 10, background: [GOLD, "#8FD3FF", "#B7E4A0", "#FFB3A7", "#D7C2FF"][i % 5], opacity: frame >= 6 + i * 2 ? 1 : 0, transform: `scale(${spring({ frame: frame - 6 - i * 2, fps: FPS, config: { damping: 10 } })})` }} />
              ))}
            </div>
            <Tape x={300} y={4} />
          </Sheet>
        </Pop>,
      );
    case "smart":
      return box(
        <>
          <Pop x={250} y={300} at={3} seed={1} rot={-6}>
            <div style={{ position: "relative" }}>
              <Em code="1f9e0" size={220} />
            </div>
          </Pop>
          <DrawMark kind="check" x={340} y={420} size={130} at={12} />
          <Pop x={830} y={300} at={6} seed={2} rot={6}>
            <Em code="1f4aa" size={200} style={{ opacity: 0.85 }} />
          </Pop>
          <DrawMark kind="cross" x={830} y={300} size={200} at={20} />
          <Sfx at={20} name="paper_crumple" vol={0.25} />
        </>,
      );
    case "plan":
      return box(
        <Pop x={540} y={290} at={2} seed={4} rot={2}>
          <Sheet w={520} h={360} seed={5}>
            <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
              <Hand size={60} color={PEN}>
                الخطة
              </Hand>
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", right: 60, top: 120 + i * 72, display: "flex", alignItems: "center", gap: 18, direction: "rtl" }}>
                <div style={{ width: 44, height: 44, border: `5px solid ${INK}`, borderRadius: 8, position: "relative" }}>
                  {frame >= 10 + i * 8 && <div style={{ position: "absolute", inset: 4, background: GREEN, borderRadius: 4 }} />}
                </div>
                <div style={{ width: 300, height: 10, borderRadius: 5, background: "#CFC5B2" }} />
                {frame === 10 + i * 8 && <Sfx at={frame} name="tick" vol={0.15} />}
              </div>
            ))}
            <Tape x={260} y={4} />
          </Sheet>
        </Pop>,
      );
    case "comment":
      return box(
        <Pop x={540} y={300} at={2} seed={2}>
          <div style={{ position: "relative", width: 760, height: 220, background: "#fff", borderRadius: 40, boxShadow: "0 16px 26px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", gap: 20, padding: "0 36px", direction: "rtl" }}>
            <Em code="1f4ac" size={120} style={{ filter: "none" }} />
            <div style={{ fontFamily: FONT, fontSize: 90, color: INK }}>{"خطة".slice(0, Math.max(0, Math.floor((frame - 8) / 4)))}</div>
            <div style={{ width: 6, height: 90, background: PEN, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
            <div style={{ position: "absolute", left: 30, top: 60, padding: "16px 30px", borderRadius: 30, background: frame >= 30 ? GREEN : PEN, color: "#fff", fontFamily: FONT, fontSize: 44, transform: `scale(${frame >= 30 ? interpolate(spring({ frame: frame - 30, fps: FPS, config: { damping: 9, stiffness: 300 } }), [0, 0.4, 1], [1, 0.88, 1]) : 1})` }}>
              {frame >= 30 ? "✓" : "نشر"}
            </div>
          </div>
          {frame >= 8 && frame < 22 && frame % 4 === 0 && <Sfx at={frame} name="tick" vol={0.12} />}
          <Sfx at={30} name="click" vol={0.3} />
        </Pop>,
      );
    case "pray":
      return box(
        <>
          <Pop x={540} y={260} at={3} seed={1}>
            <Em code="1f932" size={240} />
          </Pop>
          <Pop x={230} y={420} at={10} seed={2} rot={-10}>
            <Em code="2728" size={110} />
          </Pop>
          <Pop x={860} y={420} at={13} seed={3} rot={10}>
            <Em code="1f393" size={150} />
          </Pop>
        </>,
      );
  }
};

/* labels IN FRONT (text stays readable) */
const FRONT: Partial<Record<Kind, { text: string; color?: string; y?: number }>> = {
  motiv: { text: "أكبر تحفيز", color: RED },
  effort: { text: "تتعب وتقرا" },
  sixteen: { text: "لازمو 16", color: PEN },
  tired: { text: "المورال طايح", color: RED },
  change: { text: "قرر يبدّل", color: GREEN },
  smart: { text: "بذكاء ماشي بالجهد", color: PEN },
  comment: { text: "اكتب «خطة» في التعليقات", color: PEN },
  pray: { text: "ربي يوفقو", color: GREEN },
};
const FrontLabel: React.FC<{ kind: Kind; dur: number }> = ({ kind, dur }) => {
  const frame = useCurrentFrame();
  const l = FRONT[kind];
  if (!l) return null;
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Pop x={540} y={l.y ?? 1150} at={8} seed={7} rot={-2} sound="paper_rustle" vol={0.2}>
        <TornLabel text={l.text} size={64} color={l.color} seed={kind.length} />
      </Pop>
    </AbsoluteFill>
  );
};

/* ---------- cut-aways ---------- */
const PaperBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#B98B5A", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 + Math.sin(frame / 40) * 0.015})`, filter: "blur(2px)" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,226,170,0.5) 0%, rgba(0,0,0,0) 60%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(50,25,8,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

/* "this man is my friend Mohamed": photo with a black bar over the eyes */
const FriendCut: React.FC = () => {
  const frame = useCurrentFrame();
  const bar = ramp(frame, 22, 30, Easing.out(Easing.back(1.5)));
  return (
    <AbsoluteFill>
      <PaperBg />
      <Pop x={540} y={860} at={6} seed={2} rot={-3}>
        <div style={{ position: "relative", background: "#fff", padding: "28px 28px 150px", boxShadow: "0 24px 40px rgba(40,20,5,0.5)" }}>
          <div style={{ position: "relative", width: 640, height: 760, overflow: "hidden", background: "linear-gradient(180deg, #CFC6B8, #9C9384)" }}>
            <Img src={staticFile("v10/friend.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) contrast(1.05)" }} />
            {/* eye bar */}
            <div style={{ position: "absolute", left: 40, right: 40, top: 262, height: 92, background: "#0B0B0B", transformOrigin: "0% 50%", transform: `scaleX(${bar}) rotate(-2deg)` }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
            <Hand size={84} color={INK}>
              صاحبي محمد
            </Hand>
          </div>
          <Tape x={120} y={-6} w={170} rot={-20} />
          <Tape x={580} y={-6} w={170} rot={18} />
        </div>
      </Pop>
      <Sfx at={22} name="mj_hit" vol={0.15} />
      <Pop x={880} y={300} at={30} seed={4} rot={12} sound="pop" vol={0.15}>
        <Em code="1f60e" size={170} />
      </Pop>
    </AbsoluteFill>
  );
};

/* "he told me: can you help me?" chat on a phone */
const ChatCut: React.FC = () => {
  const frame = useCurrentFrame();
  const msgs = [
    { me: false, text: "خويا تقدر تعاوني؟", at: 10 },
    { me: false, text: "باش ننجح في قرايتي 🙏", at: 34 },
    { me: true, text: "أكيد! نبداو اليوم 💪", at: 56 },
  ];
  return (
    <AbsoluteFill>
      <PaperBg />
      <Pop x={540} y={900} at={2} seed={2} rot={2}>
        <div style={{ width: 760, height: 1300, background: "#111", borderRadius: 80, padding: 22, boxShadow: "0 28px 46px rgba(30,15,5,0.55)", position: "relative" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 60, background: "#ECE5DD", overflow: "hidden", position: "relative" }}>
            <div style={{ height: 150, background: "#075E54", display: "flex", alignItems: "center", gap: 20, padding: "30px 30px 0", direction: "rtl" }}>
              <div style={{ width: 84, height: 84, borderRadius: 42, background: "#B9B0A2", overflow: "hidden" }}>
                <Img src={staticFile("v10/friend.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(4px)" }} />
              </div>
              <div style={{ fontFamily: FONT, fontSize: 46, color: "#fff" }}>محمد</div>
            </div>
            <div style={{ padding: "40px 30px", display: "flex", flexDirection: "column", gap: 28 }}>
              {msgs.map((m, i) => {
                const typing = frame >= m.at - 14 && frame < m.at && !m.me;
                const p = spring({ frame: frame - m.at, fps: FPS, config: { damping: 12, stiffness: 200 } });
                if (typing)
                  return (
                    <div key={i} style={{ alignSelf: "flex-end", background: "#fff", borderRadius: 30, padding: "22px 30px", display: "flex", gap: 10 }}>
                      {[0, 1, 2].map((k) => (
                        <div key={k} style={{ width: 18, height: 18, borderRadius: 9, background: "#999", transform: `translateY(${Math.sin(frame / 2 + k) * 5}px)` }} />
                      ))}
                    </div>
                  );
                if (frame < m.at) return null;
                return (
                  <div key={i} dir="rtl" style={{ alignSelf: m.me ? "flex-start" : "flex-end", maxWidth: 560, background: m.me ? "#DCF8C6" : "#fff", borderRadius: 30, padding: "18px 30px", fontFamily: FONT, fontSize: 48, color: INK, boxShadow: "0 3px 6px rgba(0,0,0,0.12)", transform: `scale(${p})`, transformOrigin: m.me ? "0% 100%" : "100% 100%" }}>
                    {m.text}
                  </div>
                );
              })}
            </div>
          </div>
          <Tape x={150} y={-6} w={180} rot={-18} />
        </div>
      </Pop>
      {msgs.map((m, i) => (
        <Sfx key={i} at={m.at} name="pop" vol={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* "in the third term he got 15 ... and passed the BAC" */
const ResultCut: React.FC = () => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [10, 40], [9, 15], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bac = sec(42.3 - 39.95 + CUT_LEAD) - 2;
  return (
    <AbsoluteFill>
      <PaperBg />
      <Pop x={540} y={720} at={2} seed={3} rot={-2}>
        <Sheet w={820} h={760} seed={3}>
          <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <Hand size={78} color={PEN}>
              الفصل الثالث
            </Hand>
          </div>
          <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 10, direction: "ltr" }}>
            <div style={{ fontFamily: FONT, fontSize: 300, lineHeight: 1, color: n >= 15 ? GREEN : INK }}>{n.toFixed(1).replace(".0", "")}</div>
            <div style={{ fontFamily: FONT, fontSize: 90, color: "#8A7F6C" }}>/20</div>
          </div>
          {/* growth line */}
          <svg width="640" height="150" viewBox="0 0 100 24" style={{ position: "absolute", left: 90, bottom: 40 }}>
            <path d="M2 22 L25 19 L50 14 L75 8 L98 2" stroke={GREEN} strokeWidth="2.4" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ramp(frame, 12, 40)} />
          </svg>
          <Tape x={410} y={4} w={180} />
        </Sheet>
      </Pop>
      {frame >= 10 && frame < 40 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.08} />}
      <Pop x={540} y={1330} at={bac} seed={5} rot={3} sound="paper_slide">
        <Sheet w={760} h={240} tx="kraft" seed={4}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <Em code="1f393" size={150} />
            <div style={{ fontFamily: FONT, fontSize: 96, color: INK }}>الباك</div>
          </div>
        </Sheet>
      </Pop>
      <Stamp text="ناجح" x={820} y={1260} delay={bac + 10} color={GREEN} rot={-14} size={110} />
      <Sfx at={bac + 10} name="sparkle" vol={0.25} />
      {frame >= bac + 10 &&
        Array.from({ length: 36 }, (_, i) => {
          const d = frame - bac - 10;
          const a = (i / 36) * Math.PI * 2 + i;
          const v = 16 + (i % 5) * 5;
          const cols = [GOLD, RED, PEN, GREEN, "#fff"];
          return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * v * d, top: 1100 + Math.sin(a) * v * d + d * d * 0.9, width: 22, height: 14, background: cols[i % 5], transform: `rotate(${d * 20 + i * 40}deg)`, opacity: Math.max(0, 1 - d / 40) }} />;
        })}
      <Pop x={180} y={1560} at={bac + 14} seed={6} rot={-12} sound="pop" vol={0.15}>
        <Em code="1f973" size={180} />
      </Pop>
    </AbsoluteFill>
  );
};

/* page tears in two at the end of a cut-away */
const TearOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [dur - 10, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const jag = Array.from({ length: 13 }, (_, i) => `${(i / 12) * 100}% ${50 + (i % 2 ? 2.2 : -2.2)}%`);
  const top = `polygon(0% 0%, 100% 0%, ${[...jag].reverse().join(", ")})`;
  const bottom = `polygon(${jag.join(", ")}, 100% 100%, 0% 100%)`;
  return (
    <AbsoluteFill>
      <Sfx at={dur - 10} name="paper_tear" vol={0.3} />
      <AbsoluteFill style={{ clipPath: top, transform: `translate(${-p * 140}px, ${-p * 1100}px) rotate(${-p * 9}deg)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: bottom, transform: `translate(${p * 140}px, ${p * 1100}px) rotate(${p * 9}deg)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const MJWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const x = (lag: number) => interpolate(frame - lag, [0, 8, 13, 21], [1300, 0, 0, -1400], { ...clamp, easing: ease });
  const mj = ramp(frame, 6, 11);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={9} name="mj_hit" vol={0.2} />
      <div style={{ position: "absolute", left: x(-2) - 100, top: -100, width: W + 300, height: H + 200, background: GOLD, ...maskStyle(1) }} />
      <div style={{ position: "absolute", left: x(1) - 60, top: -100, width: W + 200, height: H + 200, background: "#151515", ...maskStyle(4) }}>
        <div style={{ position: "absolute", left: 60, top: 100, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 260, lineHeight: 1, letterSpacing: interpolate(mj, [0, 1], [40, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: mj }}>MJ</div>
          <div style={{ width: 260 * ramp(frame, 9, 14), height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- captions ---------- */
const Caption: React.FC<{ c: Cap; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const words = c.text.split(" ");
  const per = (dur * 0.92) / words.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `translateY(${(1 - p) * 50}px) rotate(${(idx % 2 ? 1.4 : -1.4) + jitter(frame, idx, 0.3)}deg) scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 1.5), filter: "drop-shadow(0 10px 12px rgba(20,10,0,0.45))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "12px 38px 20px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", maxWidth: 940 }}>
          {words.map((w, i) => {
            const st = Math.floor(i * per);
            const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
            const hl = c.hl?.includes(w);
            const mk = ramp(frame, st, st + 6);
            return (
              <span key={i} style={{ fontFamily: FONT, fontSize: hl ? 70 : 64, lineHeight: 1.35, color: active ? PEN : INK, backgroundImage: hl ? `linear-gradient(transparent 42%, ${MARKER} 42%, ${MARKER} 92%, transparent 92%)` : "none", backgroundRepeat: "no-repeat", backgroundPosition: "right", backgroundSize: hl ? `${mk * 100}% 100%` : "auto", padding: hl ? "0 8px" : 0 }}>
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

export const V10: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Room />
      {SCENES.map((s, i) => {
        const end = i < SCENES.length - 1 ? SCENES[i + 1].start : DUR;
        const visibleEnd = Math.min(end, ...CUTS.filter((c) => c.start > s.start).map((c) => c.start + 0.3));
        const dur = sec(visibleEnd - s.start);
        return (
          <Sequence key={i} from={sec(s.start)} durationInFrames={dur} layout="none">
            <BackGraphics kind={s.kind} dur={dur} />
          </Sequence>
        );
      })}
      <Room cutout />
      {SCENES.map((s, i) => {
        const end = i < SCENES.length - 1 ? SCENES[i + 1].start : DUR;
        const visibleEnd = Math.min(end, ...CUTS.filter((c) => c.start > s.start).map((c) => c.start + 0.3));
        const dur = sec(visibleEnd - s.start);
        return (
          <Sequence key={i} from={sec(s.start)} durationInFrames={dur} layout="none">
            <FrontLabel kind={s.kind} dur={dur} />
            <Sfx at={0} name={i % 2 ? "paper_slide" : "paper_flip"} vol={i ? 0.15 : 0} />
          </Sequence>
        );
      })}
      <Flash />
      {/* soft vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)", pointerEvents: "none" }} />
      {CUTS.map((c, i) => {
        const from = sec(c.start) + 10;
        const dur = sec(c.end) - from;
        const C = c.kind === "friend" ? FriendCut : c.kind === "chat" ? ChatCut : ResultCut;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} layout="none">
            <TearOut dur={dur}>
              <C />
            </TearOut>
          </Sequence>
        );
      })}
      {CUTS.map((c, i) => (
        <Sequence key={i} from={sec(c.start)} durationInFrames={24} layout="none">
          <MJWipe />
        </Sequence>
      ))}
      {CAPS.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.start - CAP_LEAD))} durationInFrames={sec(c.end - c.start)} layout="none">
          <Caption c={c} idx={i} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, background: "rgba(0,0,0,0.25)" }}>
        <div style={{ height: "100%", width: `${(frame / V10_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 40, fontFamily: FONT, fontSize: 58, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.5))", opacity: inCut(t) ? 0 : 1 }}>MJ</div>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("v10/voice.wav")} />
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 10, V10_FRAMES - 20, V10_FRAMES], [0, 0.06, 0.06, 0], clamp)} />
    </AbsoluteFill>
  );
};
