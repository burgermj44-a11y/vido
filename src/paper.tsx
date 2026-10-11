import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { H, PALETTE, W } from "./config";

export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Stop-motion "boil": values only change every few frames.
export const boil = (frame: number, step = 4) => Math.floor(frame / step);

export const FONT =
  "Inter, 'Liberation Sans', 'DejaVu Sans', sans-serif";

export const PaperBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const b = boil(frame, 5);
  const shapes = Array.from({ length: 9 }, (_, i) => {
    const colors = [PALETTE.red, PALETTE.yellow, PALETTE.teal, PALETTE.blue, PALETTE.pink];
    return {
      x: rand(i + 1) * W,
      y: rand(i + 20) * H,
      s: 160 + rand(i + 40) * 260,
      r: rand(i + 60) * 360 + (b % 3) * 1.5,
      c: colors[i % colors.length],
      round: i % 3 === 0,
    };
  });
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.paper }}>
      <Img src={staticFile("paper.png")} style={{ width: W, height: H }} />
      {shapes.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x - s.s / 2,
            top: s.y - s.s / 2,
            width: s.s,
            height: s.s,
            background: s.c,
            opacity: 0.85,
            borderRadius: s.round ? "50%" : 14,
            transform: `rotate(${s.r}deg)`,
            boxShadow: "6px 10px 0 rgba(0,0,0,0.12)",
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.10) 2px, transparent 2.5px)",
          backgroundSize: "26px 26px",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

export const Tape: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: 190,
      height: 54,
      background: "rgba(245,214,130,0.82)",
      boxShadow: "0 3px 6px rgba(0,0,0,0.18)",
      clipPath:
        "polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,96% 25%,100% 50%,96% 75%,100% 100%,10% 100%,6% 90%,0 100%)",
      ...style,
    }}
  />
);

// A jagged torn edge polygon (percent based) for a paper strip.
export const tornClip = (seed: number, steps = 22, depth = 2.2) => {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(`${(i / steps) * 100}% ${rand(seed + i) * depth}%`);
  }
  for (let i = steps; i >= 0; i--) {
    pts.push(`${(i / steps) * 100}% ${100 - rand(seed + 50 + i) * depth}%`);
  }
  return `polygon(${pts.join(",")})`;
};
