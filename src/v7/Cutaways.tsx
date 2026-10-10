/* Video 7: full-screen paper cut-aways (the speaker is hidden, voice continues). */
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame } from "remotion";
import { FONT } from "../fonts";
import { DrawMark, FPS, GOLD, GREEN, HAND, INK, MARKER, PEN, RED, Sheet, Tape, TOMATO, clamp, icon, jitter, onTwos, stickerFilter, tex } from "../yt2/kit";

const W = 1080;

/* layer that pops up (hinged at the bottom), animated on twos */
const Pop: React.FC<{ x: number; y: number; delay: number; seed?: number; rot?: number; children: React.ReactNode }> = ({ x, y, delay, seed = 1, rot = 0, children }) => {
  const frame = useCurrentFrame();
  if (frame < delay) return null;
  const p = spring({ frame: onTwos(frame - delay), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
      <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.7)}deg)` }}>{children}</div>
    </div>
  );
};

const PaperIcon: React.FC<{ code: string; size: number }> = ({ code, size }) => (
  <Img src={icon(code)} style={{ width: size, height: size, filter: stickerFilter(Math.max(5, size / 30)) }} />
);

const Hand: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = INK, children, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);

/* page tears in two and slides away during the last frames */
const TearOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [dur - 10, dur], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  if (p <= 0) return <AbsoluteFill>{children}</AbsoluteFill>;
  const jag = Array.from({ length: 13 }, (_, i) => `${(i / 12) * 100}% ${50 + (i % 2 ? 2.2 : -2.2)}%`);
  const top = `polygon(0% 0%, 100% 0%, ${[...jag].reverse().join(", ")})`;
  const bottom = `polygon(${jag.join(", ")}, 100% 100%, 0% 100%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: top, transform: `translate(${-p * 140}px, ${-p * 1100}px) rotate(${-p * 9}deg)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: bottom, transform: `translate(${p * 140}px, ${p * 1100}px) rotate(${p * 9}deg)` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const PaperBg: React.FC<{ kind?: "notebook" | "kraft" | "white"; tint?: string }> = ({ kind = "notebook", tint }) => (
  <AbsoluteFill style={{ background: tint ?? "#EFE8D8" }}>
    <Img src={tex(kind)} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: tint ? "multiply" : "normal" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,20,0.3) 100%)" }} />
  </AbsoluteFill>
);

/* 1 — "build a program that fits YOU": a weekly planner fills up */
export const PlannerCut: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء"];
  const blocks: [number, number, string, string][] = [
    [0, 0, "الماط", TOMATO],
    [1, 0, "الفيزيك", PEN],
    [2, 0, "العلوم", GREEN],
    [0, 1, "عربية", "#F28C28"],
    [3, 0, "الماط", TOMATO],
    [1, 1, "فلسفة", "#8E44AD"],
    [4, 0, "الفيزيك", PEN],
    [2, 1, "تمارين", GOLD],
    [3, 1, "إنجليزية", "#1ABC9C"],
    [4, 1, "مراجعة", GREEN],
  ];
  const pen = interpolate(frame, [20, 100], [0, 1], clamp);
  return (
    <TearOut dur={dur}>
      <PaperBg />
      <Pop x={W / 2} y={300} delay={8} seed={1}>
        <Sheet w={820} h={190} tx="kraft" seed={2}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hand size={92}>بروغرامك أنت ✍️</Hand>
          </div>
          <Tape x={410} y={6} w={160} rot={-3} />
        </Sheet>
      </Pop>
      <Pop x={W / 2} y={900} delay={12} seed={3}>
        <Sheet w={960} h={820} seed={4}>
          {days.map((d, r) => (
            <div key={r} dir="rtl" style={{ position: "absolute", right: 36, top: 60 + r * 150, width: 888, height: 130, display: "flex", alignItems: "center", gap: 18, borderBottom: "3px dashed rgba(43,89,195,0.35)" }}>
              <Hand size={46} style={{ width: 210 }}>
                {d}
              </Hand>
            </div>
          ))}
          {blocks.map(([r, c, t, col], i) => {
            const d = 18 + i * 7;
            const p = spring({ frame: onTwos(frame - d), fps: FPS, config: { damping: 11, stiffness: 190 } });
            return frame >= d ? (
              <div
                key={i}
                style={{
                  position: "absolute",
                  right: 260 + c * 330,
                  top: 76 + r * 150,
                  width: 310,
                  height: 98,
                  borderRadius: 14,
                  background: col,
                  transform: `scale(${p}) rotate(${(i % 2 ? 1.5 : -1.5) + jitter(frame, i, 0.5)}deg)`,
                  boxShadow: "0 6px 8px rgba(0,0,0,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div dir="rtl" style={{ fontFamily: FONT, fontSize: 44, color: "#fff" }}>
                  {t}
                </div>
              </div>
            ) : null;
          })}
        </Sheet>
      </Pop>
      <div style={{ position: "absolute", left: 140 + pen * 760, top: 1300 + Math.sin(pen * 30) * 30, transform: "rotate(-30deg)" }}>
        {frame > 18 && <PaperIcon code="270f" size={170} />}
      </div>
      <Pop x={W / 2} y={1720} delay={70} seed={5}>
        <div style={{ background: MARKER, padding: "6px 34px 14px", borderRadius: 10, transform: "rotate(-2deg)", boxShadow: "0 6px 8px rgba(0,0,0,0.2)" }}>
          <Hand size={64}>يليق بيك انتايا</Hand>
        </div>
      </Pop>
    </TearOut>
  );
};

/* 2 — "hard subjects at the start of the day": paper sunrise */
export const MorningCut: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const sun = interpolate(frame, [4, 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const books: [string, string][] = [
    ["الماط", TOMATO],
    ["الفيزيك", PEN],
    ["العلوم", GREEN],
  ];
  return (
    <TearOut dur={dur}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${interpolate(sun, [0, 1], [0, 1]) > 0.5 ? "#FFD27A" : "#F7B267"} 0%, #FFE9C2 60%, #FFF5E1 100%)` }}>
        <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.6 }} />
      </AbsoluteFill>
      {/* sun rising behind paper hills */}
      <div style={{ position: "absolute", left: W / 2 - 230, top: 1060 - sun * 560, width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #FFE680, #FFB627)", boxShadow: "0 0 120px rgba(255,190,60,0.8)" }} />
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: W / 2 - 8,
            top: 1290 - sun * 560 - 400,
            width: 16,
            height: 120,
            borderRadius: 8,
            background: "#FFC93C",
            opacity: sun,
            transformOrigin: "50% 400px",
            transform: `rotate(${i * 30 + frame * 0.6}deg)`,
          }}
        />
      ))}
      {[
        { y: 1080, c: "#7BC47F", s: 6 },
        { y: 1180, c: "#4FA35A", s: 7 },
        { y: 1300, c: "#3C8A47", s: 8 },
      ].map((h, i) => (
        <div key={i} style={{ position: "absolute", left: -100, right: -100, top: h.y + (1 - Math.min(1, frame / (8 + i * 4))) * 400, height: 900, background: h.c, borderRadius: "50% 50% 0 0 / 18% 18% 0 0", boxShadow: "0 -10px 16px rgba(0,0,0,0.15)" }}>
          <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.35, borderRadius: "inherit" }} />
        </div>
      ))}
      <Pop x={W / 2} y={260} delay={10} seed={2}>
        <Sheet w={820} h={190} tx="kraft" seed={3}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hand size={84}>الصعيب في الصباح ☀️</Hand>
          </div>
          <Tape x={410} y={6} w={160} rot={3} />
        </Sheet>
      </Pop>
      <Pop x={210} y={560} delay={18} seed={4} rot={-8}>
        <div style={{ position: "relative" }}>
          <PaperIcon code="23f0" size={200} />
          <Hand size={60} style={{ position: "absolute", left: 30, top: 200 }}>
            8:00
          </Hand>
        </div>
      </Pop>
      {books.map(([t, c], i) => (
        <Pop key={i} x={W / 2 + 70} y={1800 - i * 125} delay={30 + i * 7} seed={6 + i} rot={i % 2 ? 2 : -2}>
          <div style={{ width: 560 - i * 40, height: 110, borderRadius: 14, background: c, boxShadow: "0 10px 12px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", right: 20, top: 0, bottom: 0, width: 26, background: "rgba(255,255,255,0.35)" }} />
            <div dir="rtl" style={{ fontFamily: FONT, fontSize: 56, color: "#fff" }}>
              {t}
            </div>
          </div>
        </Pop>
      ))}
      <Pop x={150} y={1150} delay={56} seed={9} rot={10}>
        <PaperIcon code="1f4aa" size={170} />
      </Pop>
    </TearOut>
  );
};

/* 3 — "two or three days... and you quit": calendar torn off */
export const QuitCut: React.FC<{ dur: number }> = () => {
  const frame = useCurrentFrame();
  const days = ["1", "2", "3", "4", "5", "6", "7"];
  return (
    <AbsoluteFill>
      <PaperBg kind="white" tint="#F4E9D6" />
      <Pop x={W / 2} y={300} delay={6} seed={2}>
        <Sheet w={860} h={190} tx="kraft" seed={5}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hand size={80}>يومين ولا 3 أيام...</Hand>
          </div>
          <Tape x={430} y={6} w={160} rot={-3} />
        </Sheet>
      </Pop>
      <Pop x={W / 2} y={880} delay={10} seed={3}>
        <Sheet w={940} h={700} seed={6}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: TOMATO, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hand size={66} color="#fff">
              الأسبوع
            </Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 160, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
            {days.map((d, i) => {
              const at = 16 + i * 6;
              const ok = i < 3;
              const shown = frame >= at;
              const fall = !ok ? interpolate(frame, [at + 4, at + 20], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }) : 0;
              return (
                <div key={i} style={{ height: 210, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: `6px solid ${INK}`,
                      borderRadius: 16,
                      background: ok ? "#E7F6EC" : "#fff",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "flex-end",
                      padding: 12,
                      opacity: shown ? 1 - fall * 0.85 : 0.25,
                      transform: `translateY(${fall * 160}px) rotate(${fall * (i % 2 ? 18 : -14)}deg)`,
                    }}
                  >
                    <div style={{ fontFamily: FONT, fontSize: 52, color: INK }}>{d}</div>
                  </div>
                  {shown && ok && <DrawMark kind="check" x={95} y={125} size={120} at={at} />}
                  {shown && !ok && fall < 0.5 && <DrawMark kind="cross" x={95} y={125} size={120} at={at} />}
                </div>
              );
            })}
          </div>
        </Sheet>
      </Pop>
      <Pop x={200} y={1720} delay={46} seed={7} rot={-8}>
        <PaperIcon code="1f629" size={220} />
      </Pop>
      <Pop x={680} y={1720} delay={54} seed={8} rot={6}>
        <div style={{ background: "#fff", border: `6px solid ${RED}`, borderRadius: 18, padding: "6px 30px 12px", transform: "rotate(-6deg)" }}>
          <Hand size={70} color={RED}>
            بروغرام ماشي واقعي
          </Hand>
        </div>
      </Pop>
    </AbsoluteFill>
  );
};
