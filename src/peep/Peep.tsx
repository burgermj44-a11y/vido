import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT, loadFonts } from "../fonts";

loadFonts();

// MJ Burger "who knocked on match night?" carousel: door peephole views.
// Anonymous back-lit figures, numbers only (no faces, no names).
const GOLD = "#FFC83D";
const ORANGE = "#FF7A1A";
const PHONE = "0542547119";

type Slide = { scene?: number; top: string; big: string; small?: string };
export const SLIDES: Slide[] = [
  { scene: 0, top: "ليلة الماتش… 🔔", big: "شكون دقّ الباب؟", small: "اسحب ←" },
  { scene: 1, top: "طق طق…", big: "رقم 10 جا بكري… وجاب البرغر", small: "قبل الماتش بساعة" },
  { scene: 2, top: "طق طق…", big: "رقم 5: ما نلعبش بلا MJ", small: "الدفاع يبدا من الكرش" },
  { scene: 3, top: "طق طق…", big: "رقم 8 يجري 90 دقيقة… بالبرغر", small: "الطاقة كاملة من MJ" },
  { scene: 4, top: "طق طق…", big: "رقم 15 جا يسقسي: كاين بلاصة؟", small: "كاين… وكاين البرغر" },
  { scene: 5, top: "طق طق…", big: "رقم 22: الماتش بدا، وين البرغر؟", small: "التوصيل قبل الصفارة" },
  { scene: 6, top: "وفي اللخر…", big: "حتى المدرب جا وجاب للفريق كامل", small: "الخطة: برغر MJ للجميع" },
  { top: "ليلة الماتش", big: "اطلب برغرك قبل ما يدقّ عليك واحد آخر" },
];

const Door: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "repeating-linear-gradient(92deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0) 9px, rgba(255,190,120,0.04) 16px), radial-gradient(ellipse at 50% 42%, #3a2112 0%, #1d0f07 55%, #0a0503 100%)",
    }}
  />
);

const Peephole: React.FC<{ scene: number }> = ({ scene }) => {
  const S = 900;
  return (
    <div style={{ position: "absolute", left: (1080 - S) / 2, top: 175, width: S, height: S }}>
      {/* brass ring */}
      <div
        style={{
          position: "absolute",
          inset: -34,
          borderRadius: "50%",
          background: "conic-gradient(from 210deg, #6b4a12, #f6d77a, #8a6216, #ffe9a8, #5c3d0c, #d9ad45, #6b4a12)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.75), inset 0 0 18px rgba(0,0,0,0.6)",
        }}
      />
      <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: "#050302" }} />
      <Img src={staticFile(`peep/scene_${scene}.png`)} style={{ position: "absolute", inset: 0, width: S, height: S, borderRadius: "50%" }} />
      {/* glass reflections */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse 38% 16% at 32% 20%, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.65) 100%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)",
        }}
      />
    </div>
  );
};

const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("peep/logo.png")} style={{ width: size, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.8))", ...style }} />
);

const glow = `0 0 18px rgba(255,122,26,0.65), 0 4px 0 #000, 0 8px 22px rgba(0,0,0,0.9)`;

export const PeepSlide: React.FC<{ i: number }> = ({ i }) => {
  const s = SLIDES[i];
  if (s.scene === undefined) return <Final />;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, direction: "rtl" }}>
      <Door />
      <div style={{ position: "absolute", top: 40, right: 60, fontSize: 52, color: GOLD, textShadow: glow }}>{s.top}</div>
      <Logo size={150} style={{ position: "absolute", top: 18, left: 44 }} />
      <Peephole scene={s.scene} />
      <div style={{ position: "absolute", left: 50, right: 50, top: 1118, textAlign: "center", fontSize: s.big.length > 26 ? 62 : 74, lineHeight: 1.15, color: "#fff", textShadow: glow }}>
        {s.big}
      </div>
      {s.small ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center" }}>
          <span style={{ fontSize: 38, color: "#1a0a02", background: `linear-gradient(90deg, ${GOLD}, ${ORANGE})`, padding: "4px 26px", borderRadius: 40 }}>{s.small}</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", bottom: 22, left: 40, fontSize: 26, color: "rgba(255,231,163,0.7)", direction: "ltr" }}>
        {i + 1}/{SLIDES.length}
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, direction: "rtl", alignItems: "center" }}>
    <Door />
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,122,26,0.35), rgba(0,0,0,0) 55%)" }} />
    <Logo size={480} style={{ position: "absolute", top: 30 }} />
    <div style={{ position: "absolute", top: 590, left: 60, right: 60, textAlign: "center", fontSize: 64, lineHeight: 1.2, color: "#fff", textShadow: glow }}>
      اطلب برغرك قبل ما يدقّ عليك واحد آخر 🍔
    </div>
    <div
      style={{
        position: "absolute",
        top: 800,
        padding: "18px 50px",
        borderRadius: 30,
        background: "linear-gradient(135deg, rgba(150,52,8,0.9), rgba(42,16,0,0.9))",
        border: `3px solid ${GOLD}`,
        boxShadow: `0 0 30px rgba(255,122,26,0.55)`,
        fontSize: 84,
        color: GOLD,
        direction: "ltr",
        letterSpacing: 4,
      }}
    >
      📞 {PHONE}
    </div>
    <div style={{ position: "absolute", top: 990, left: 40, right: 40, textAlign: "center", fontSize: 44, color: "#fff", textShadow: glow }}>
      📍 عند أكاديمية الفكر الرائد – DNC – البقعة
    </div>
    <div style={{ position: "absolute", top: 1080, fontSize: 46, color: GOLD, direction: "ltr", textShadow: glow }}>@mj_burger_02</div>
    <div style={{ position: "absolute", bottom: 40, fontSize: 34, color: "rgba(255,231,163,0.75)" }}>شارك المنشور مع صاحبك اللي يتفرج معاك الماتش ⚽</div>
  </AbsoluteFill>
);
