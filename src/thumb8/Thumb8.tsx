/* YouTube thumbnail (1280x720): him pointing up at "معدل 17 🥶" on animated-style kraft paper with a light study mood. */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { GOLD, INK, MJ_GOLD, Tape, icon, maskStyle, tex } from "../yt2/kit";

loadFonts();

const cut = "drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff)";
const Sticker: React.FC<{ code: string; x: number; y: number; s: number; r: number; o?: number }> = ({ code, x, y, s, r, o = 1 }) => (
  <Img src={icon(code)} style={{ position: "absolute", left: x, top: y, width: s, height: s, transform: `rotate(${r}deg)`, opacity: o, filter: `${cut} drop-shadow(0 10px 10px rgba(40,20,5,0.45))` }} />
);

export const Thumb8: React.FC = () => (
  <AbsoluteFill style={{ background: "#B98B5A", overflow: "hidden" }}>
    <AbsoluteFill style={{ filter: "blur(2px) saturate(1.15)" }}>
      <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    {/* paper sunburst behind him */}
    <div style={{ position: "absolute", left: 420 - 900, top: 330 - 900, width: 1800, height: 1800, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(255,236,190,0.30) 0deg 9deg, rgba(0,0,0,0) 9deg 18deg)", WebkitMaskImage: "radial-gradient(circle, #000 15%, transparent 55%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 34% 45%, rgba(255,230,170,0.65) 0%, rgba(255,210,150,0.15) 35%, rgba(0,0,0,0) 60%)" }} />
    <Sticker code="1f4da" x={480} y={60} s={110} r={-10} />
    <Sticker code="270f" x={-40} y={540} s={170} r={-25} o={0.95} />
    <Sticker code="1f393" x={20} y={30} s={120} r={-14} o={0.9} />
    <Sticker code="2b50" x={700} y={40} s={70} r={12} />
    <Sticker code="1f4a1" x={1170} y={30} s={90} r={14} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 45%, rgba(0,0,0,0) 55%, rgba(45,22,6,0.5) 100%)" }} />
    {/* him */}
    <Img src={staticFile("thumb8/host.png")} style={{ position: "absolute", left: 40, top: 150, width: 680, filter: `drop-shadow(8px 0 0 #fff) drop-shadow(-8px 0 0 #fff) drop-shadow(0 -8px 0 #fff) drop-shadow(0 16px 22px rgba(30,15,5,0.6)) saturate(1.12) contrast(1.06) brightness(1.04)` }} />
    {/* "معدل 17" above his raised hand */}
    <div style={{ position: "absolute", left: 690, top: 30, width: 560, height: 420, transform: "rotate(-4deg)" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", filter: "drop-shadow(0 16px 18px rgba(30,15,5,0.55))" }}>
        <div style={{ position: "absolute", inset: 0, ...maskStyle(7), overflow: "hidden" }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      <Tape x={70} y={-4} w={150} rot={-20} />
      <Tape x={480} y={-4} w={150} rot={18} />
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 30 }}>
        <div style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1, color: INK, marginTop: 8 }}>معدل</div>
        <div style={{ position: "relative", fontFamily: FONT, fontSize: 270, lineHeight: 0.92, color: "#fff", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", background: MJ_GOLD, WebkitBackgroundClip: "text", filter: "drop-shadow(0 8px 0 #000)" }}>
          <span style={{ color: GOLD, WebkitTextStroke: "14px #111", paintOrder: "stroke fill" }}>17</span>
        </div>
      </div>
    </div>
    <Sticker code="1f976" x={1120} y={20} s={150} r={14} />
    {/* bottom strip (also hides the cut edge of his arm) */}
    <div style={{ position: "absolute", left: 630, top: 480, width: 620, height: 230, transform: "rotate(-3deg)", filter: "drop-shadow(0 14px 16px rgba(30,15,5,0.55))" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(11) }}>
        <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Tape x={520} y={-6} w={130} rot={16} />
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 66, color: INK, whiteSpace: "nowrap" }}>
        <span style={{ background: "linear-gradient(transparent 45%, #FFE14D 45%, #FFE14D 92%, transparent 92%)", padding: "0 10px" }}>5 طرق</span>&nbsp;للدراسة
      </div>
    </div>
    {/* little pointer from finger to the card */}
    <svg width="120" height="90" viewBox="0 0 120 90" style={{ position: "absolute", left: 600, top: 260 }}>
      <path d="M10 80 Q 40 20 105 18" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M86 4 L108 18 L88 34" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", left: 30, bottom: 16, fontFamily: FONT, fontSize: 64, letterSpacing: -3, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>MJ</div>
  </AbsoluteFill>
);
