import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { FONT, boil, rand } from "./paper";
import { PALETTE, PROFILE } from "./config";

const usePop = (frame: number, duration: number) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 10, stiffness: 170, mass: 0.7 } });
  const exit = interpolate(frame, [duration - 8, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { scale: enter * exit, visible: frame >= 0 && frame <= duration };
};

const shadow = "10px 14px 0 rgba(0,0,0,0.28)";

// "هذا الإنسان": paper-cut person with a black bar over the eyes.
export const PersonSticker: React.FC<{ frame: number; seed: number }> = ({ frame, seed }) => {
  const duration = 46;
  const { scale, visible } = usePop(frame, duration);
  if (!visible) return null;
  const wob = (rand(seed + boil(frame, 3)) - 0.5) * 4;
  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: 880,
        width: 430,
        transform: `scale(${scale}) rotate(${6 + wob}deg)`,
        filter: "drop-shadow(10px 14px 0 rgba(0,0,0,0.28))",
      }}
    >
      <svg viewBox="0 0 300 340" width={430}>
        {/* white paper-cut border (same shape, stroked thick) */}
        <g stroke="#fff" strokeWidth={26} strokeLinejoin="round" fill="#fff">
          <ellipse cx="150" cy="112" rx="72" ry="86" />
          <path d="M20 340 C20 250 80 215 150 215 C220 215 280 250 280 340 Z" />
        </g>
        <path d="M20 340 C20 250 80 215 150 215 C220 215 280 250 280 340 Z" fill={PALETTE.blue} />
        <path d="M110 218 L150 270 L190 218 Z" fill="#fff" />
        <rect x="128" y="170" width="44" height="52" fill="#d9a77c" />
        <ellipse cx="150" cy="112" rx="72" ry="86" fill="#eab98c" />
        <path d="M78 100 C78 40 118 22 160 24 C206 26 226 62 222 104 C205 76 175 62 150 64 C120 66 95 78 78 100 Z" fill={PALETTE.ink} />
        <ellipse cx="124" cy="140" rx="0" ry="0" fill="none" />
        <path d="M132 168 Q150 180 168 168" stroke="#8a4b3a" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* censor bar over the eyes */}
        <g transform="rotate(-4 150 118)">
          <rect x="68" y="98" width="164" height="38" rx="4" fill="#000" />
        </g>
      </svg>
    </div>
  );
};

// "بارطاجي": share icon flying out to friends.
export const ShareSticker: React.FC<{ frame: number }> = ({ frame }) => {
  const duration = 62;
  const { scale, visible } = usePop(frame, duration);
  if (!visible) return null;
  const wob = (rand(boil(frame, 3)) - 0.5) * 6;
  const fly = (i: number) => {
    const t = Math.max(0, frame - 14 - i * 5) / 22;
    return Math.min(1, t);
  };
  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: 300,
        width: 440,
        transform: `scale(${scale}) rotate(${-7 + wob}deg)`,
      }}
    >
      <div
        style={{
          width: 300,
          height: 300,
          margin: "0 auto",
          borderRadius: "50%",
          background: PALETTE.teal,
          border: "16px solid #fff",
          boxShadow: shadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 100 100" width={170}>
          <g stroke="#fff" strokeWidth={7} strokeLinecap="round" fill="#fff">
            <path d="M72 24 L30 48 M30 52 L72 76" fill="none" />
            <circle cx="74" cy="22" r="13" />
            <circle cx="26" cy="50" r="13" />
            <circle cx="74" cy="78" r="13" />
          </g>
        </svg>
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 150 + fly(i) * (i - 1) * 190,
            top: 120 + fly(i) * (70 + i * 25),
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: [PALETTE.yellow, PALETTE.pink, PALETTE.blue][i],
            border: "8px solid #fff",
            boxShadow: "6px 8px 0 rgba(0,0,0,0.25)",
            opacity: Math.min(1, fly(i) * 3),
            transform: `scale(${0.4 + fly(i) * 0.6})`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 10,
          right: 10,
          textAlign: "center",
          background: PALETTE.yellow,
          border: `10px solid ${PALETTE.ink}`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 78,
          color: PALETTE.ink,
          padding: "6px 0",
          transform: "rotate(3deg)",
          boxShadow: shadow,
        }}
      >
        Partage !
      </div>
    </div>
  );
};

// "ابوني": Instagram-style profile card with a follow button.
export const FollowCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  if (frame < 0) return null;
  const followed = frame > 38;
  const press = interpolate(frame, [34, 38, 42], [1, 0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wob = (rand(boil(frame, 4)) - 0.5) * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        top: 1130 + (1 - enter) * 700,
        width: 900,
        transform: `rotate(${-3 + wob}deg)`,
        background: "#fff",
        borderRadius: 36,
        boxShadow: "14px 18px 0 rgba(0,0,0,0.3)",
        padding: 44,
        display: "flex",
        alignItems: "center",
        gap: 40,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          padding: 10,
          background:
            "conic-gradient(from 200deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5, #feda75)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "8px solid #fff",
            background: PALETTE.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 84,
            letterSpacing: -5,
          }}
        >
          {PROFILE.name}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: PALETTE.ink }}>{PROFILE.handle}</div>
        <div
          style={{
            marginTop: 22,
            display: "inline-block",
            transform: `scale(${press})`,
            padding: "16px 54px",
            borderRadius: 18,
            fontSize: 48,
            fontWeight: 800,
            background: followed ? "#e8e8e8" : "#2f7bf5",
            color: followed ? PALETTE.ink : "#fff",
          }}
        >
          {followed ? "Suivi ✓" : "Suivre"}
        </div>
      </div>
      {/* tapping finger */}
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 150 + interpolate(frame, [18, 34], [200, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 100,
          opacity: interpolate(frame, [18, 24, 46, 54], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        👆
      </div>
    </div>
  );
};
