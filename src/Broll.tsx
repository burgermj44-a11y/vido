import React from "react";
import { Img, spring, staticFile, useVideoConfig } from "remotion";
import { AR, HAND, Tape, rand, tornClip } from "./paper";
import { H, PALETTE, W } from "./config";

// Full-screen ruled-paper scene: a week with a tick for every day.
export const BrollScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const pop = (d: number) => spring({ frame: frame - d, fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
  const days = ["1", "2", "3", "4", "5", "6", "7"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: PALETTE.paper }}>
      <Img src={staticFile("paper.png")} style={{ width: W, height: H, position: "absolute" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(transparent 0 66px, rgba(70,110,200,0.35) 66px 69px)", backgroundPositionY: 60 }} />
      <div style={{ position: "absolute", left: 120, top: 0, bottom: 0, width: 4, background: "rgba(220,60,60,0.55)" }} />
      {/* kraft title tag */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center", transform: `scale(${pop(0)}) rotate(-2deg)`, filter: "drop-shadow(6px 9px 0 rgba(0,0,0,0.3))" }}>
        <div style={{ position: "relative" }}>
          <div style={{ background: PALETTE.kraft, clipPath: tornClip(5, 16, 7), padding: "26px 80px 40px", fontFamily: HAND, fontWeight: 700, fontSize: 110, direction: "rtl", color: PALETTE.ink }}>بروغرام ✍️</div>
          <Tape style={{ left: "50%", top: -20, marginLeft: -60 }} w={120} />
        </div>
      </div>
      {/* week card */}
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, transform: `rotate(1.2deg) scale(${pop(4)})`, filter: "drop-shadow(8px 12px 0 rgba(0,0,0,0.3))" }}>
        <div style={{ background: "#fff", clipPath: tornClip(21, 22, 2), paddingBottom: 40 }}>
          <div style={{ background: PALETTE.red, color: "#fff", fontFamily: AR, fontWeight: 900, fontSize: 70, textAlign: "center", padding: "10px 0 16px", direction: "rtl" }}>كل يوم</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, padding: "36px 40px 0", direction: "ltr", justifyContent: "center" }}>
            {days.map((d, i) => {
              const s = pop(10 + i * 4);
              return (
                <div key={d} style={{ width: 175, height: 175, border: "5px solid #2a2a2a", borderRadius: 16, position: "relative", transform: `rotate(${(rand(i) - 0.5) * 6}deg)`, fontFamily: AR, fontWeight: 900, fontSize: 40, padding: "6px 14px", color: "#555" }}>
                  {d}
                  <svg viewBox="0 0 100 100" width={130} style={{ position: "absolute", left: 24, top: 28, transform: `scale(${Math.max(0, s)})` }}>
                    <path d="M12 54 L40 82 L90 18" fill="none" stroke="#1fa14a" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
        <Tape style={{ left: -34, top: -10, transform: "rotate(-35deg)" }} w={130} />
      </div>
      {/* chip */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", transform: `scale(${Math.max(0, pop(30))}) rotate(-3deg)` }}>
        <div style={{ background: "#2c9b4f", color: "#fff", fontFamily: AR, fontWeight: 900, fontSize: 84, padding: "10px 60px 20px", borderRadius: 20, boxShadow: "8px 12px 0 rgba(0,0,0,0.3)", direction: "rtl" }}>⏰ زوج سوايع</div>
      </div>
    </div>
  );
};
