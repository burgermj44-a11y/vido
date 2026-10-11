import React from "react";

export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Stop-motion "boil": values only change every few frames.
export const boil = (frame: number, step = 4) => Math.floor(frame / step);

export const AR = "Cairo, Inter, 'DejaVu Sans', sans-serif";
export const HAND = "'Aref Ruqaa', Cairo, 'DejaVu Sans', serif";
export const LAT = "Inter, 'Liberation Sans', sans-serif";

export const Tape: React.FC<{ style: React.CSSProperties; w?: number }> = ({ style, w = 150 }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: 44,
      background: "rgba(245,214,110,0.88)",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      clipPath:
        "polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,96% 25%,100% 50%,96% 75%,100% 100%,10% 100%,6% 90%,0 100%)",
      ...style,
    }}
  />
);

// Jagged torn-paper outline (percent polygon).
export const tornClip = (seed: number, steps = 26, depth = 6) => {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(`${(i / steps) * 100}% ${(rand(seed + i) * depth).toFixed(1)}%`);
  }
  for (let i = steps; i >= 0; i--) {
    pts.push(`${(i / steps) * 100}% ${(100 - rand(seed + 50 + i) * depth).toFixed(1)}%`);
  }
  return `polygon(${pts.join(",")})`;
};
