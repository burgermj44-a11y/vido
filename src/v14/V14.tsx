/*
 * Video 14 (vertical short, <60 s): "the miracle student" story, his MSA voice.
 * Paper style: one cinematic paper scene per sentence on an animated kraft desk,
 * torn-strip captions, MJ wipes on the turning points.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { DrawMark, FPS, GOLD, GREEN, HAND, INK, MARKER, MJ_GOLD, PEN, RED, Sfx, Sheet, Stamp, Tape, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";
import { LINES, V14_DURATION } from "./timing";

loadFonts();
loadHand();

const W = 1080;
const H = 1920;
export const V14_FPS = FPS;
export const V14_FRAMES = Math.min(1799, Math.round(V14_DURATION * FPS));
const LEAD = 0.25;
const CX = W / 2;
const CY = 820;

/* ---------- desk ---------- */
const Desk: React.FC<{ night: number }> = ({ night }) => {
  const frame = useCurrentFrame();
  const lx = 50 + Math.sin(frame / 60) * 20;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#B98B5A" }}>
      <AbsoluteFill style={{ transform: `scale(${1.12 + Math.sin(frame / 50) * 0.015})`, filter: "blur(3px) saturate(1.1)" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% 35%, rgba(255,226,170,0.5) 0%, rgba(0,0,0,0) 60%)` }} />
      {Array.from({ length: 20 }, (_, i) => {
        const x = ((i * 211) % W) + Math.sin(frame / (30 + i * 2) + i) * 20;
        const y = ((((i * 337) % H) - frame * (0.6 + (i % 4) * 0.25) + 4000) % (H + 60)) - 30;
        const s = 6 + (i % 5) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.7, borderRadius: 2, background: i % 3 ? "rgba(255,240,215,0.5)" : "rgba(90,55,25,0.3)", transform: `rotate(${frame + i * 30}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: `rgba(20,15,45,${night})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(40,20,5,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

const Pop: React.FC<{ x: number; y: number; at?: number; rot?: number; seed?: number; sound?: string | null; vol?: number; children: React.ReactNode }> = ({ x, y, at = 0, rot = 0, seed = 1, sound = "paper_fold", vol = 0.16, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - at), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.8)}deg) translateY(${Math.sin(frame / 14 + seed) * 5}px)` }}>{children}</div>
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
const Torn: React.FC<{ text: string; size?: number; color?: string; seed?: number; tx?: "white" | "kraft"; tint?: string; bold?: boolean }> = ({ text, size = 70, color = INK, seed = 3, tx = "white", tint, bold }) => {
  const w = 120 + text.length * size * (bold ? 0.56 : 0.5);
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed} tint={tint}>
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bold ? FONT : HAND, fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap" }}>
        {text}
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};
const Bubble: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 64, color = INK }) => (
  <div style={{ position: "relative", background: "#fff", borderRadius: 50, padding: "22px 44px", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>
    <div dir="rtl" style={{ fontFamily: FONT, fontSize: size, color, whiteSpace: "nowrap" }}>{text}</div>
    <div style={{ position: "absolute", left: 70, bottom: -30, width: 0, height: 0, borderTop: "34px solid #fff", borderRight: "30px solid transparent" }} />
  </div>
);

/* ---------- one scene per sentence ---------- */
const Scene: React.FC<{ i: number; dur: number }> = ({ i, dur }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 7, dur, Easing.in(Easing.cubic));
  const inP = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 160 } });
  const wrap = (c: React.ReactNode) => (
    <AbsoluteFill style={{ opacity: Math.min(1, inP * 1.5) * (1 - out), transform: `translateY(${(1 - inP) * 200 - out * 200}px) scale(${0.95 + inP * 0.05})` }}>
      <Sfx at={0} name="paper_slide" vol={0.18} />
      {c}
    </AbsoluteFill>
  );
  switch (i) {
    case 0: // 6/20
      return wrap(
        <>
          <Pop x={CX} y={CY} rot={-2}>
            <Sheet w={800} h={820} seed={2}>
              <div style={{ position: "absolute", top: 50, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <Hand size={78} color={PEN}>
                  كشف النقاط
                </Hand>
              </div>
              <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "baseline", direction: "ltr", gap: 10 }}>
                <div style={{ fontFamily: FONT, fontSize: 330, lineHeight: 1, color: RED }}>6</div>
                <div style={{ fontFamily: FONT, fontSize: 110, color: "#8A7F6C" }}>/20</div>
              </div>
              <Tape x={400} y={4} w={180} />
            </Sheet>
          </Pop>
          <Stamp text="ضعيف" x={780} y={1130} delay={18} rot={-14} size={110} />
          <Pop x={230} y={380} at={10} seed={3} rot={-10} sound={null}>
            <Em code="1f61e" size={200} />
          </Pop>
        </>,
      );
    case 1: // teachers: it's over
      return wrap(
        <>
          <Pop x={300} y={CY + 120} seed={2}>
            <Em code="1f9d1-200d-1f3eb" size={380} />
          </Pop>
          <Pop x={650} y={CY - 260} at={6} seed={3} sound="pop" vol={0.15}>
            <Bubble text="انتهى!" size={90} color={RED} />
          </Pop>
          <Pop x={680} y={CY + 200} at={16} seed={4} rot={4}>
            <Torn text="هذه السنة ضاعت" size={68} color={RED} seed={5} />
          </Pop>
          <DrawMark kind="cross" x={680} y={CY + 200} size={260} at={28} />
        </>,
      );
    case 2: // friends laugh
      return wrap(
        <>
          <Pop x={CX} y={CY + 60} seed={1}>
            <Em code="1f4d6" size={300} />
          </Pop>
          {[
            [220, CY - 260],
            [860, CY - 220],
            [200, CY + 330],
            [880, CY + 320],
          ].map(([x, y], k) => (
            <Pop key={k} x={x} y={y} at={4 + k * 4} seed={k + 3} sound="pop" vol={0.1}>
              <Em code="1f602" size={190} style={{ transform: `rotate(${Math.sin(frame / 3 + k) * 10}deg)` }} />
            </Pop>
          ))}
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: 140 + k * 300, top: CY - 420 + ((frame * 3 + k * 40) % 120), fontFamily: HAND, fontWeight: 700, fontSize: 70, color: RED, opacity: frame > 8 ? 0.8 : 0 }}>
              ها ها
            </div>
          ))}
        </>,
      );
    case 3: // mother praying at night
      return wrap(
        <>
          <Pop x={CX} y={CY - 280} seed={2}>
            <Sheet w={560} h={420} tint="#26305A" tx="kraft" seed={5}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 12, background: "#E9D9B8" }} />
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 12, background: "#E9D9B8" }} />
              <Em code="1f319" size={150} style={{ position: "absolute", left: 330, top: 40, filter: "drop-shadow(0 0 22px rgba(255,230,140,0.9))" }} />
              <Tape x={280} y={2} w={130} />
            </Sheet>
          </Pop>
          <div style={{ position: "absolute", left: CX - 450, top: CY - 40, width: 900, height: 800, background: "radial-gradient(ellipse at 50% 40%, rgba(255,214,140,0.55) 0%, rgba(0,0,0,0) 65%)", opacity: ramp(frame, 6, 20) }} />
          <Pop x={CX} y={CY + 230} at={6} seed={3}>
            <Em code="1f932" size={330} />
          </Pop>
          {[0, 1].map((k) => {
            const t = (frame - 18 - k * 14) % 36;
            return frame > 18 + k * 14 ? <Img key={k} src={icon("1f4a7")} style={{ position: "absolute", left: CX - 40 + k * 70, top: CY + 80 + t * 6, width: 60, height: 60, opacity: 1 - t / 36 }} /> : null;
          })}
          <Sfx at={10} name="sparkle" vol={0.12} />
        </>,
      );
    case 4: {
      // phone into drawer, note "60 days only"
      const slide = ramp(frame, 10, 26, Easing.in(Easing.cubic));
      const write = ramp(frame, 40, 80);
      return wrap(
        <>
          <div style={{ position: "absolute", left: CX - 380, top: 560, width: 760, height: 260, background: "#8A5A2B", borderRadius: 20, boxShadow: "0 14px 22px rgba(0,0,0,0.35)", border: "8px solid #6E4520" }}>
            <div style={{ position: "absolute", left: 330, top: 110, width: 100, height: 26, borderRadius: 13, background: "#E9D9B8" }} />
          </div>
          {slide < 1 && <Em code="1f4f1" size={240} style={{ position: "absolute", left: CX - 120, top: 300 + slide * 360, transform: `rotate(${slide * 20}deg)`, opacity: 1 - slide * 0.8 }} />}
          <Sfx at={22} name="paper_slide" vol={0.25} />
          <Pop x={CX} y={1160} at={34} seed={4} rot={-3}>
            <Sheet w={760} h={300} seed={3}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", clipPath: `inset(0 0 0 ${(1 - write) * 100}%)` }}>
                <Hand size={110} color={RED}>
                  60 يومًا فقط
                </Hand>
              </div>
              <Tape x={380} y={4} w={160} />
            </Sheet>
          </Pop>
          <Pop x={900} y={1000} at={40} seed={5} rot={-30} sound={null}>
            <Em code="270d" size={170} />
          </Pop>
        </>,
      );
    }
    case 5: // before dawn
      return wrap(
        <>
          <div style={{ position: "absolute", left: 90, top: 300, width: 900, height: 520, borderRadius: 24, background: `linear-gradient(180deg, #1F2A55 0%, #6B4A7A ${60 - ramp(frame, 0, 60) * 30}%, #F5A86B 100%)`, boxShadow: "0 16px 24px rgba(0,0,0,0.35)", ...maskStyle(3) }} />
          <Img src={icon("1f305")} style={{ position: "absolute", left: CX - 140, top: 560 - ramp(frame, 0, 60) * 120, width: 280, height: 280, opacity: 0.9 }} />
          <Pop x={250} y={1060} at={4} seed={2} sound="ring" vol={0.12}>
            <Em code="23f0" size={230} style={{ transform: `rotate(${frame < 30 ? Math.sin(frame * 2) * 10 : 0}deg)` }} />
          </Pop>
          <Pop x={250} y={1260} at={8} seed={3} sound={null}>
            <div style={{ fontFamily: FONT, fontSize: 80, color: INK, background: "#fff", padding: "0 24px", borderRadius: 14 }}>04:30</div>
          </Pop>
          <Pop x={CX + 60} y={1100} at={20} seed={4}>
            <Em code="1f4da" size={220} />
          </Pop>
          <Pop x={860} y={1140} at={36} seed={5}>
            <Em code="1f3eb" size={230} />
          </Pop>
        </>,
      );
    case 6: // understand, explain to the mirror
      return wrap(
        <>
          <Pop x={760} y={CY} seed={2}>
            <div style={{ width: 400, height: 600, borderRadius: 200, background: "linear-gradient(135deg, #DDEEF5, #9CC3D4)", border: "18px solid #8A5A2B", boxShadow: "0 16px 22px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={icon("1f9d1-200d-1f3eb")} style={{ width: 240, height: 240, transform: "scaleX(-1)", opacity: 0.85 }} />
            </div>
          </Pop>
          <Pop x={300} y={CY + 80} at={6} seed={3}>
            <Em code="1f9d1-200d-1f3eb" size={320} />
          </Pop>
          <Pop x={CX} y={CY - 440} at={12} seed={4} sound="paper_rustle">
            <Torn text="افهم… ثم احفظ" size={72} seed={6} tx="kraft" />
          </Pop>
        </>,
      );
    case 7: // mistakes notebook
      return wrap(
        <>
          <Pop x={CX} y={CY} seed={2} rot={-3}>
            <div style={{ width: 700, height: 860, borderRadius: 26, background: RED, border: "10px solid #8E1E1C", boxShadow: "0 18px 26px rgba(0,0,0,0.4)", position: "relative" }}>
              <div style={{ position: "absolute", left: 70, right: 70, top: 60, background: "#FFF8EA", borderRadius: 14, padding: "20px 0", display: "flex", justifyContent: "center", transform: "rotate(-2deg)" }}>
                <Hand size={70}>دفتر الأخطاء</Hand>
              </div>
              <div style={{ position: "absolute", left: 70, right: 70, top: 230, bottom: 60, background: "#FFF8EA", borderRadius: 14 }}>
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={{ position: "absolute", right: 40, top: 50 + k * 120, height: 12, borderRadius: 6, background: k % 2 ? PEN : RED, width: 440 * ramp(frame, 8 + k * 8, 16 + k * 8) }} />
                ))}
              </div>
            </div>
          </Pop>
          {[0, 1, 2, 3].map((k) => (
            <Sfx key={k} at={8 + k * 8} name="tick" vol={0.1} />
          ))}
        </>,
      );
    case 8: // week 1 wants to stop, week 3 cries
      return wrap(
        <>
          {[
            ["الأسبوع 1", "1f629"],
            ["الأسبوع 3", "1f622"],
          ].map(([t, c], k) => (
            <Pop key={k} x={CX} y={520 + k * 620} at={k * 30} seed={k + 2} rot={k ? 3 : -3}>
              <Sheet w={760} h={470} seed={k + 3} tx={k ? "kraft" : "white"}>
                <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                  <Hand size={70} color={PEN}>
                    {t}
                  </Hand>
                </div>
                <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40 }}>
                  <Img src={icon(c)} style={{ width: 260, height: 260 }} />
                  <Img src={icon("1faab")} style={{ width: 200, height: 200, marginTop: 40 }} />
                </div>
                <Tape x={380} y={4} w={160} />
              </Sheet>
            </Pop>
          ))}
        </>,
      );
    case 9: {
      // never two days in a row
      const n = Math.floor(ramp(frame, 4, 60) * 30);
      return wrap(
        <>
          <Pop x={CX} y={CY - 40} seed={2}>
            <Sheet w={920} h={720} seed={4}>
              <div style={{ position: "absolute", inset: 50, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, direction: "rtl" }}>
                {Array.from({ length: 30 }, (_, k) => {
                  const done = k < n;
                  const miss = k === 11;
                  return (
                    <div key={k} style={{ border: `4px solid ${INK}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 60, color: miss ? RED : GREEN, background: done ? (miss ? "rgba(215,50,47,0.15)" : "rgba(46,158,91,0.15)") : "transparent" }}>
                      {done ? (miss ? "✗" : "✓") : ""}
                    </div>
                  );
                })}
              </div>
              <Tape x={460} y={4} w={180} />
            </Sheet>
          </Pop>
          {frame >= 4 && frame < 60 && frame % 4 === 0 && <Sfx at={frame} name="tick" vol={0.06} />}
          <Pop x={CX} y={CY + 430} at={20} seed={5} sound="paper_rustle">
            <Torn text="لا يومين متتاليين" size={70} color={RED} seed={3} tx="kraft" />
          </Pop>
        </>,
      );
    }
    case 10: {
      // results day: board, trembling
      const shake = Math.sin(frame * 1.7) * 6;
      return wrap(
        <>
          <div style={{ position: "absolute", left: CX - 420, top: 300, width: 840, height: 1000, transform: `translate(${shake}px, ${Math.cos(frame * 1.3) * 4}px)` }}>
            <div style={{ position: "absolute", inset: 0, background: "#7A5232", borderRadius: 20, boxShadow: "0 18px 26px rgba(0,0,0,0.4)" }} />
            <div style={{ position: "absolute", inset: 40, background: "#FFF8EA", ...maskStyle(2) }}>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <Hand size={80} color={PEN}>
                  النتائج
                </Hand>
              </div>
              {Array.from({ length: 8 }, (_, k) => (
                <div key={k} style={{ margin: "28px 60px 0", height: 16, borderRadius: 8, background: "#CFC5B2", filter: "blur(1px)" }} />
              ))}
            </div>
            <Tape x={420} y={0} w={180} />
          </div>
          <Pop x={850} y={1350} at={10} seed={3} sound={null}>
            <Em code="1f633" size={220} style={{ transform: `translateX(${Math.sin(frame * 2) * 6}px)` }} />
          </Pop>
          {[0, 1, 2, 3].map((k) => (
            <Sfx key={k} at={6 + k * 18} name="tick" vol={0.22} />
          ))}
        </>,
      );
    }
    case 11: {
      // 16/20
      const hit = 6;
      return wrap(
        <>
          <Pop x={CX} y={CY} seed={2} rot={-2}>
            <Sheet w={860} h={640} seed={6}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", direction: "ltr", gap: 10 }}>
                <div style={{ fontFamily: FONT, fontSize: 380, lineHeight: 1, color: GREEN, transform: `scale(${1 + 0.15 * spring({ frame: frame - hit, fps: FPS, config: { damping: 6 } }) * Math.max(0, 1 - (frame - hit) / 20)})` }}>16</div>
                <div style={{ fontFamily: FONT, fontSize: 120, color: "#8A7F6C" }}>/20</div>
              </div>
              <Tape x={430} y={4} w={180} />
            </Sheet>
          </Pop>
          <Sfx at={hit} name="mj_hit" vol={0.3} />
          <Sfx at={hit + 1} name="sparkle" vol={0.3} />
          {frame >= hit &&
            Array.from({ length: 40 }, (_, k) => {
              const d = frame - hit;
              const a = (k / 40) * Math.PI * 2 + k;
              const v = 18 + (k % 5) * 5;
              const cols = [GOLD, RED, PEN, GREEN, "#fff"];
              return <div key={k} style={{ position: "absolute", left: CX + Math.cos(a) * v * d, top: CY + Math.sin(a) * v * d + d * d * 0.9, width: 24, height: 14, background: cols[k % 5], transform: `rotate(${d * 20 + k * 40}deg)`, opacity: Math.max(0, 1 - d / 40) }} />;
            })}
        </>,
      );
    }
    case 12: // everyone: a miracle
      return wrap(
        <>
          {[
            [200, CY - 300],
            [CX, CY - 380],
            [880, CY - 300],
          ].map(([x, y], k) => (
            <Pop key={k} x={x} y={y} at={k * 4} seed={k + 2} sound="pop" vol={0.12}>
              <Em code="1f62e" size={200} />
            </Pop>
          ))}
          <Pop x={CX} y={CY + 120} at={10} seed={6} sound="paper_rustle">
            <Torn text="معجزة!" size={150} color={PEN} seed={4} bold />
          </Pop>
          {[0, 1, 2, 3].map((k) => (
            <Img key={k} src={icon("2728")} style={{ position: "absolute", left: 160 + k * 230, top: CY + 330 + Math.sin(frame / 5 + k) * 20, width: 110, height: 110, transform: `rotate(${frame * 3 + k * 40}deg) scale(${ramp(frame, 14 + k * 3, 20 + k * 3)})` }} />
          ))}
        </>,
      );
    case 13: // the real miracle: 60 days without giving up
      return wrap(
        <>
          <Pop x={CX} y={CY - 260} seed={2}>
            <Em code="1f469-200d-1f466" size={360} />
          </Pop>
          <Pop x={CX} y={CY - 520} at={10} seed={3} sound="pop" vol={0.12}>
            <Em code="2764" size={150} style={{ transform: `scale(${1 + Math.sin(frame / 4) * 0.08})` }} />
          </Pop>
          <Pop x={CX} y={CY + 180} at={40} seed={4} sound="paper_rustle">
            <Sheet w={900} h={330} seed={5} tx="kraft">
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Hand size={60} color={PEN}>
                  المعجزة الحقيقية
                </Hand>
                <div dir="rtl" style={{ fontFamily: FONT, fontSize: 84, color: INK, background: `linear-gradient(transparent 50%, ${MARKER} 50%)`, padding: "0 14px" }}>
                  60 يومًا بلا استسلام
                </div>
              </div>
              <Tape x={450} y={4} w={180} />
            </Sheet>
          </Pop>
        </>,
      );
    case 14: // and you?
      return wrap(
        <>
          <Pop x={CX} y={CY - 200} seed={2}>
            <Em code="1faf5" size={360} />
          </Pop>
          <Pop x={CX} y={CY + 230} at={10} seed={3} sound="paper_rustle">
            <Torn text="متى تبدأ ستّينك؟" size={90} color={RED} seed={2} bold />
          </Pop>
        </>,
      );
    default: {
      // CTA: comment + share
      const typed = "سأبدأ اليوم 💪".slice(0, Math.max(0, Math.floor((frame - 6) / 2)));
      return wrap(
        <>
          <Pop x={CX} y={CY - 200} seed={2}>
            <div style={{ width: 900, background: "#fff", borderRadius: 34, padding: "30px 40px", boxShadow: "0 18px 26px rgba(0,0,0,0.3)" }}>
              <div dir="rtl" style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Img src={icon("1f4ac")} style={{ width: 100, height: 100 }} />
                <div style={{ fontFamily: FONT, fontSize: 70, color: INK }}>
                  {typed}
                  <span style={{ color: PEN, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>
                </div>
              </div>
            </div>
          </Pop>
          {frame >= 6 && frame < 30 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.06} />}
          <Pop x={CX} y={CY + 250} at={34} seed={3} sound="click" vol={0.3}>
            <Sheet w={300} h={300} tint={PEN} seed={3} style={{ borderRadius: 999 }}>
              <svg width="300" height="300" viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
                <path d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z" fill="white" stroke={INK} strokeWidth="0.5" strokeLinejoin="round" />
              </svg>
            </Sheet>
          </Pop>
          {[0, 1, 2, 3].map((k) => {
            const t = ramp(frame, 40 + k * 3, 54 + k * 3);
            if (t <= 0 || t >= 1) return null;
            const tx = [180, 900, 160, 920][k];
            const ty = [CY + 60, CY + 60, CY + 480, CY + 480][k];
            return (
              <svg key={k} width="100" height="100" viewBox="0 0 24 24" style={{ position: "absolute", left: CX + (tx - CX) * t - 50, top: CY + 250 + (ty - CY - 250) * t - 50 - Math.sin(t * Math.PI) * 120 }}>
                <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
              </svg>
            );
          })}
          {[0, 1, 2, 3].map((k) => (
            <Pop key={k} x={[180, 900, 160, 920][k]} y={[CY + 60, CY + 60, CY + 480, CY + 480][k]} at={54 + k * 3} seed={k + 5} sound="pop" vol={0.1}>
              <Em code={["1f468-200d-1f393", "1f469-200d-1f393", "1f9d1-200d-1f393", "1f929"][k]} size={170} />
            </Pop>
          ))}
        </>,
      );
    }
  }
};

/* ---------- captions ---------- */
type Chunk = { start: number; end: number; text: string };
const split = (text: string, start: number, end: number): Chunk[] => {
  const words = text.split(" ");
  if (words.length <= 6) return [{ start, end, text }];
  const parts: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if ((cur.length >= 3 && /[،,:؛…]$/.test(w)) || cur.length >= 6) {
      parts.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    if (cur.length < 2 && parts.length) parts[parts.length - 1].push(...cur);
    else parts.push(cur);
  }
  const total = words.join("").length;
  let t = start;
  return parts.map((p) => {
    const d = ((end - start) * p.join("").length) / total;
    const c = { start: t, end: t + d, text: p.join(" ") };
    t += d;
    return c;
  });
};
const CHUNKS = LINES.flatMap((l) => split(l.text, l.start, l.end));
const KEY = /^(ستة|عشرين|انتهى|ضاعت|يضحكون|أمّه|تبكي|ستّون|ستّين|يومًا|الفجر|يفهمه|المرآة|خطأ|دفتر|يتوقف|بكى|أبدًا|النتائج|يرتجف|عشر|معجزة|المعجزة|أستسلم|ستّينك؟|اليوم،|شارك)/;
const Caption: React.FC<{ c: Chunk; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const words = c.text.split(" ");
  const per = (dur * 0.92) / words.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1520, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `translateY(${(1 - p) * 50}px) rotate(${idx % 2 ? 1.2 : -1.2}deg) scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 1.5), filter: "drop-shadow(0 10px 12px rgba(40,22,8,0.45))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "12px 38px 20px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px", maxWidth: 960 }}>
          {words.map((w, i) => {
            const st = Math.floor(i * per);
            const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
            const hl = KEY.test(w.replace(/^[وفلب]/, "")) || KEY.test(w);
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
    </div>
  );
};

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

const WIPES = [4, 10]; // before "he closed his phone" and "results day"

export const V14: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const night = interpolate(t, [LINES[3].start - 0.3, LINES[3].start, LINES[5].start, LINES[5].start + 1.5], [0, 0.35, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      <Desk night={night} />
      {LINES.map((l, i) => {
        const from = Math.max(0, sec(l.start - LEAD));
        const to = i < LINES.length - 1 ? sec(LINES[i + 1].start - LEAD) : V14_FRAMES;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(8, to - from)} layout="none">
            <Scene i={i} dur={Math.max(8, to - from)} />
          </Sequence>
        );
      })}
      {CHUNKS.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.start - 0.1))} durationInFrames={Math.max(6, sec(c.end - c.start))} layout="none">
          <Caption c={c} idx={i} />
        </Sequence>
      ))}
      {WIPES.map((li, i) => (
        <Sequence key={i} from={sec(LINES[li].start - LEAD) - 11} durationInFrames={24} layout="none">
          <MJWipe />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 12, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ height: "100%", width: `${(frame / V14_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 40, fontFamily: FONT, fontSize: 60, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.4))" }}>MJ</div>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("v14/voice.wav")} />
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 10, V14_FRAMES - 20, V14_FRAMES], [0, 0.07, 0.07, 0], clamp)} />
    </AbsoluteFill>
  );
};
