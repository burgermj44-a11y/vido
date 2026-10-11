import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { HAND, LAT, Tape, boil, rand, tornClip } from "./paper";
import { PALETTE, PROFILE } from "./config";

const exitK = (frame: number, dur: number) =>
  interpolate(frame, [dur - 7, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// "هذا الإنسان": paper-cut person with a black bar over the eyes.
export const PersonSticker: React.FC<{ frame: number; seed: number }> = ({ frame, seed }) => {
  const { fps } = useVideoConfig();
  const dur = 44;
  if (frame < 0 || frame > dur) return null;
  const p = spring({ frame, fps, config: { damping: 9, stiffness: 180, mass: 0.7 } }) * exitK(frame, dur);
  const wob = (rand(seed + boil(frame, 3)) - 0.5) * 4;
  return (
    <div style={{ position: "absolute", left: 640, top: 760, width: 380, transform: `scale(${p}) rotate(${7 + wob}deg)`, filter: "drop-shadow(8px 12px 0 rgba(0,0,0,0.3))" }}>
      <svg viewBox="0 0 300 340" width={380}>
        <g stroke="#fff" strokeWidth={26} strokeLinejoin="round" fill="#fff">
          <ellipse cx="150" cy="112" rx="72" ry="86" />
          <path d="M20 340 C20 250 80 215 150 215 C220 215 280 250 280 340 Z" />
        </g>
        <path d="M20 340 C20 250 80 215 150 215 C220 215 280 250 280 340 Z" fill={PALETTE.blue} />
        <path d="M110 218 L150 270 L190 218 Z" fill="#fff" />
        <rect x="128" y="170" width="44" height="52" fill="#d9a77c" />
        <ellipse cx="150" cy="112" rx="72" ry="86" fill="#eab98c" />
        <path d="M78 100 C78 40 118 22 160 24 C206 26 226 62 222 104 C205 76 175 62 150 64 C120 66 95 78 78 100 Z" fill={PALETTE.ink} />
        <path d="M132 168 Q150 180 168 168" stroke="#8a4b3a" strokeWidth={5} fill="none" strokeLinecap="round" />
        <g transform="rotate(-4 150 118)"><rect x="68" y="98" width="164" height="38" rx="4" fill="#000" /></g>
      </svg>
    </div>
  );
};

// "بارطاجي": handwritten tag + curved share arrow on cork, as in the reference.
export const ShareSticker: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const dur = 38;
  if (frame < 0 || frame > dur) return null;
  const p = spring({ frame, fps, config: { damping: 10, stiffness: 170, mass: 0.7 } });
  const k = exitK(frame, dur);
  const slide = interpolate(frame, [6, 24], [0, 40], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, display: "flex", justifyContent: "center", transform: `scale(${p}) rotate(-2deg)`, filter: "drop-shadow(5px 8px 0 rgba(0,0,0,0.3))" }}>
        <div style={{ position: "relative" }}>
          <div style={{ background: PALETTE.paper, clipPath: tornClip(77, 18, 7), padding: "22px 64px 36px", direction: "rtl", fontFamily: HAND, fontWeight: 700, fontSize: 90, color: PALETTE.ink, whiteSpace: "nowrap" }}>بارطاجي مع صحابك</div>
          <Tape style={{ left: "50%", top: -20, marginLeft: -60 }} w={120} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 390, top: 270, width: 300, height: 190, background: PALETTE.kraft, clipPath: tornClip(9, 12, 6), transform: `scale(${p})`, filter: "drop-shadow(5px 8px 0 rgba(0,0,0,0.3))" }} />
      <svg style={{ position: "absolute", left: 420 + slide, top: 285, transform: `scale(${p})` }} width={260} height={170} viewBox="0 0 260 170">
        <path d="M20 150 C30 70 100 40 170 50 L170 16 L245 72 L170 128 L170 94 C120 90 70 110 20 150 Z" fill="#fff" stroke="#e4e4e4" strokeWidth={3} />
      </svg>
      {[{ e: "🧑‍🎓", x: 80, y: 300 }, { e: "👩‍🎓", x: 840, y: 300 }].map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.x, top: s.y, fontSize: 130, transform: `scale(${p}) rotate(${i ? 8 : -8}deg)`, textShadow: "4px 0 #fff,-4px 0 #fff,0 4px #fff,0 -4px #fff,8px 12px 0 rgba(0,0,0,0.25)" }}>{s.e}</div>
      ))}
    </div>
  );
};

// "ابوني": dark profile card at the top, button taps to "Abonné ✓".
export const FollowCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const dur = 56;
  if (frame < 0 || frame > dur) return null;
  const p = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const k = exitK(frame, dur);
  const done = frame > 26;
  const press = interpolate(frame, [22, 26, 30], [1, 0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hand = interpolate(frame, [10, 22], [160, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wob = (rand(boil(frame, 4)) - 0.5) * 1.4;
  return (
    <div style={{ position: "absolute", left: 100, top: 50 - (1 - p) * 420, width: 880, opacity: k, transform: `rotate(${-1.5 + wob}deg)`, fontFamily: LAT }}>
      <div style={{ background: "#14161a", borderRadius: 34, padding: "40px 44px 38px", boxShadow: "10px 14px 0 rgba(0,0,0,0.35)", border: "3px solid #2a2d33" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 170, height: 170, borderRadius: "50%", background: PALETTE.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 80, letterSpacing: -4, border: "6px solid #fff" }}>{PROFILE.handle}</div>
            {!done && <div style={{ position: "absolute", right: 0, bottom: 0, width: 54, height: 54, borderRadius: "50%", background: "#2f7bf5", border: "4px solid #14161a", color: "#fff", fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>+</div>}
          </div>
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 64, fontWeight: 800 }}>{PROFILE.handle}</div>
            <div style={{ fontSize: 34, color: "#a8adb5", marginTop: 6 }}>Montage · Motivation</div>
          </div>
        </div>
        <div style={{ marginTop: 34, height: 100, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, fontWeight: 800, transform: `scale(${press})`, background: done ? "#3a3d44" : "#2f7bf5", color: "#fff" }}>
          {done ? "Abonné ✓" : "S'abonner"}
        </div>
      </div>
      <Tape style={{ left: -30, top: -14, transform: "rotate(-35deg)" }} w={120} />
      <Tape style={{ right: -30, top: -14, transform: "rotate(35deg)" }} w={120} />
      <div style={{ position: "absolute", right: 120, top: 330 + hand, fontSize: 110, opacity: interpolate(frame, [10, 14, 44, 52], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>👆</div>
      {done && <div style={{ position: "absolute", right: -30 + (frame - 26) * 1.5, top: 80 - (frame - 26) * 4, fontSize: 100, opacity: Math.max(0, 1 - (frame - 26) / 26) }}>❤️</div>}
    </div>
  );
};
