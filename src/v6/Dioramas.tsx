/*
 * Pop-up paper dioramas that replace the room at key moments.
 * Each layer is a flat paper cut-out hinged at its bottom edge: it pops up
 * (rotateX 90° -> 0°) one after another, animated on twos, and folds back
 * down at the end. A paper grain is multiplied over the whole scene.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const HAND = '"ArefRuqaa", "CairoBlack", serif';
const onTwos = (f: number) => f - (f % 2);
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};

/* a wobbly, hand-cut edge along y = base */
const wobble = (x0: number, x1: number, base: number, amp: number, seed: number, steps = 24) => {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    pts.push(`${x.toFixed(1)},${(base + Math.sin(i * 1.3 + seed) * amp + (rand(seed + i) - 0.5) * amp).toFixed(1)}`);
  }
  return pts;
};

const PopLayer: React.FC<{ delay: number; dur: number; outDelay?: number; children: React.ReactNode; shadow?: number; hinge?: string }> = ({
  delay,
  dur,
  outDelay = 0,
  children,
  shadow = 10,
  hinge = "50% 100%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: onTwos(frame - delay), fps, config: { damping: 12, stiffness: 150 } });
  const out = interpolate(onTwos(frame), [dur - 12 + outDelay, dur - 4 + outDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <AbsoluteFill
        style={{
          transformOrigin: hinge,
          transform: `rotateX(${(1 - p) * 92 + out * 92}deg)`,
          filter: `drop-shadow(0 ${shadow}px ${shadow * 1.2}px rgba(40,25,10,0.28))`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.55, pointerEvents: "none" }}>
    <Img src={staticFile("v6/paper_white.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </AbsoluteFill>
);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    {children}
  </svg>
);

/* ---------------- school ---------------- */
export const SchoolScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const cloud = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF">
      <circle cx="0" cy="20" r="46" />
      <circle cx="55" cy="0" r="62" />
      <circle cx="120" cy="22" r="48" />
      <rect x="0" y="20" width="120" height="48" />
    </g>
  );
  const windowsAt = (x0: number) =>
    [700, 860, 1020].flatMap((y) =>
      [0, 1].map((c) => (
        <g key={`${x0}-${y}-${c}`} transform={`translate(${x0 + c * 120} ${y})`}>
          <rect width="84" height="112" rx="6" fill="#FFFFFF" />
          <rect x="8" y="8" width="68" height="96" rx="4" fill="#8ED1F0" />
          <path d="M42 8 V104 M8 56 H76" stroke="#FFFFFF" strokeWidth="6" />
        </g>
      )),
    );
  const wave = Math.sin(frame / 4) * 6;
  return (
    <AbsoluteFill>
      {/* sky */}
      <PopLayer delay={0} dur={dur} outDelay={6} shadow={0}>
        <Svg>
          <defs>
            <linearGradient id="sch-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8FD3F2" />
              <stop offset="0.7" stopColor="#DDF3FC" />
            </linearGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#sch-sky)" />
        </Svg>
      </PopLayer>
      {/* sun + clouds */}
      <PopLayer delay={3} dur={dur} outDelay={5}>
        <Svg>
          <g transform={`translate(190 230) rotate(${frame * 0.8})`}>
            {Array.from({ length: 12 }, (_, i) => (
              <polygon key={i} points="0,-150 18,-100 -18,-100" fill="#FFB938" transform={`rotate(${i * 30})`} />
            ))}
            <circle r="88" fill="#FFD23F" />
          </g>
          {cloud(650 + Math.sin(frame / 40) * 30, 140, 1.1)}
          {cloud(60 + Math.sin(frame / 50 + 2) * 25, 470, 0.8)}
          {cloud(860 + Math.sin(frame / 45 + 1) * 20, 520, 0.7)}
        </Svg>
      </PopLayer>
      {/* school building */}
      <PopLayer delay={6} dur={dur} outDelay={4}>
        <Svg>
          {/* wings */}
          <rect x="50" y="640" width="980" height="820" fill="#F2C9A0" />
          <rect x="30" y="600" width="1020" height="56" fill="#C0533A" />
          {windowsAt(90)}
          {windowsAt(750)}
          {/* central tower */}
          <rect x="350" y="380" width="380" height="1080" fill="#F7DDBE" />
          <polygon points="320,395 540,240 760,395" fill="#C0533A" />
          <circle cx="540" cy="330" r="46" fill="#FFFFFF" stroke="#7A3A28" strokeWidth="6" />
          <path d={`M540 330 L540 300 M540 330 L${540 + 22 * Math.cos(frame / 20)} ${330 + 22 * Math.sin(frame / 20)}`} stroke="#333" strokeWidth="5" strokeLinecap="round" />
          {/* flag of Algeria on the roof */}
          <rect x="537" y="110" width="6" height="135" fill="#6B4A2B" />
          <g transform={`translate(543 112) skewY(${wave * 0.4})`}>
            <rect width="70" height="92" fill="#006233" />
            <rect x="70" width="70" height="92" fill="#FFFFFF" />
            <circle cx="70" cy="46" r="24" fill="#D21034" />
            <circle cx="78" cy="46" r="20" fill="#FFFFFF" />
            <polygon points="92.0,37.0 94.1,43.1 100.6,43.2 95.4,47.1 97.3,53.3 92.0,49.6 86.7,53.3 88.6,47.1 83.4,43.2 89.9,43.1" fill="#D21034" />
          </g>
          {/* sign */}
          <g transform="translate(90 530) rotate(-3)">
            <rect width="250" height="66" rx="10" fill="#8B5A2B" />
            <text x="125" y="48" textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="44" fill="#FFF6DD">
              المدرسة
            </text>
          </g>
        </Svg>
      </PopLayer>
      {/* trees */}
      <PopLayer delay={9} dur={dur} outDelay={2}>
        <Svg>
          {[
            [70, 1120],
            [1010, 1080],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <rect x="-22" y="80" width="44" height="260" fill="#8B5A2B" />
              <circle cx="0" cy="40" r="110" fill="#43A047" />
              <circle cx="-70" cy="90" r="80" fill="#388E3C" />
              <circle cx="70" cy="95" r="80" fill="#4CAF50" />
            </g>
          ))}
        </Svg>
      </PopLayer>
      {/* ground */}
      <PopLayer delay={4} dur={dur} outDelay={0}>
        <Svg>
          <polygon points={[...wobble(0, 1080, 1390, 12, 3), "1080,1920", "0,1920"].join(" ")} fill="#7CC576" />
          <polygon points="440,1400 640,1400 820,1920 260,1920" fill="#EAD7AE" />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={40 + i * 80} cy={1460 + (i % 3) * 30} r="10" fill={["#FF7043", "#FFEE58", "#FFFFFF"][i % 3]} />
          ))}
        </Svg>
      </PopLayer>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------------- home (studying at night) ---------------- */
export const HomeScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const glow = 0.55 + Math.sin(frame / 5) * 0.08;
  const books = ["#E53935", "#1E88E5", "#43A047", "#FDD835", "#8E24AA", "#FB8C00", "#00897B"];
  return (
    <AbsoluteFill>
      <PopLayer delay={0} dur={dur} outDelay={6} shadow={0}>
        <Svg>
          <rect width="1080" height="1920" fill="#F3E3C3" />
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x={i * 60} y="0" width="30" height="1920" fill="#EBD5AA" opacity="0.7" />
          ))}
        </Svg>
      </PopLayer>
      {/* window with the night sky */}
      <PopLayer delay={3} dur={dur} outDelay={5}>
        <Svg>
          <rect x="80" y="170" width="330" height="400" rx="10" fill="#FFFFFF" />
          <rect x="100" y="190" width="290" height="360" fill="#1E2A5A" />
          <circle cx="300" cy="270" r="44" fill="#FFF3B0" />
          <circle cx="322" cy="258" r="40" fill="#1E2A5A" />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={120 + rand(i) * 250} cy={210 + rand(i + 20) * 320} r={3 + (i % 3)} fill="#FFFFFF" opacity={0.6 + 0.4 * Math.sin(frame / 5 + i)} />
          ))}
          <path d="M245 190 V550 M100 370 H390" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M60 160 Q120 380 70 590 L40 590 L40 160 Z" fill="#C62828" />
          <path d="M430 160 Q370 380 420 590 L450 590 L450 160 Z" fill="#C62828" />
        </Svg>
      </PopLayer>
      {/* bookshelf */}
      <PopLayer delay={6} dur={dur} outDelay={4}>
        <Svg>
          <rect x="690" y="190" width="330" height="560" fill="#8B5A2B" />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x="705" y={210 + r * 180} width="300" height="160" fill="#6D4220" />
              {Array.from({ length: 7 }, (_, i) => (
                <rect
                  key={i}
                  x={712 + i * 41}
                  y={230 + r * 180 + (i % 2) * 14}
                  width="34"
                  height={136 - (i % 2) * 14}
                  rx="3"
                  fill={books[(i + r * 3) % books.length]}
                />
              ))}
            </g>
          ))}
        </Svg>
      </PopLayer>
      {/* desk lamp with warm light */}
      <PopLayer delay={9} dur={dur} outDelay={2}>
        <Svg>
          <polygon points="250,900 60,1300 440,1300" fill="#FFE9A8" opacity={glow} />
          <path d="M180 1290 L200 1080 L300 960" stroke="#37474F" strokeWidth="16" fill="none" strokeLinecap="round" />
          <polygon points="240,880 360,860 330,960 230,960" fill="#FFB300" />
          <ellipse cx="180" cy="1295" rx="70" ry="16" fill="#37474F" />
          {/* picture frame */}
          <rect x="740" y="820" width="220" height="170" rx="6" fill="#FFFFFF" />
          <rect x="756" y="836" width="188" height="138" fill="#9CCC65" />
          <circle cx="900" cy="870" r="20" fill="#FFEE58" />
          <polygon points="756,974 830,900 900,974" fill="#558B2F" />
        </Svg>
      </PopLayer>
      {/* desk */}
      <PopLayer delay={4} dur={dur} outDelay={0}>
        <Svg>
          <rect x="0" y="1300" width="1080" height="50" fill="#A1673A" />
          <rect x="40" y="1350" width="40" height="570" fill="#8B5A2B" />
          <rect x="1000" y="1350" width="40" height="570" fill="#8B5A2B" />
          <rect x="0" y="1350" width="1080" height="570" fill="#C9A27A" opacity="0.35" />
        </Svg>
      </PopLayer>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------------- stage (the 17/20 finale) ---------------- */
export const StageScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const sweep = Math.sin(frame / 10) * 10;
  const confetti = ["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB", "#FFFFFF"];
  const ft = onTwos(frame);
  return (
    <AbsoluteFill>
      <PopLayer delay={0} dur={dur} outDelay={6} shadow={0}>
        <Svg>
          <defs>
            <radialGradient id="stg-bg" cx="0.5" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#5A1A48" />
              <stop offset="1" stopColor="#14040F" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#stg-bg)" />
        </Svg>
      </PopLayer>
      {/* spotlights */}
      <PopLayer delay={3} dur={dur} outDelay={5} shadow={0}>
        <Svg>
          <g opacity="0.45">
            <polygon points={`120,0 260,0 ${560 + sweep * 8},1500 ${300 + sweep * 8},1500`} fill="#FFF2B3" />
            <polygon points={`820,0 960,0 ${780 - sweep * 8},1500 ${520 - sweep * 8},1500`} fill="#FFF2B3" />
          </g>
        </Svg>
      </PopLayer>
      {/* curtains + garland */}
      <PopLayer delay={6} dur={dur} outDelay={4}>
        <Svg>
          {[0, 1].map((side) => (
            <g key={side} transform={side ? "translate(1080 0) scale(-1 1)" : ""}>
              <path d={`M0 0 H220 Q170 700 ${200 + sweep} 1500 L0 1500 Z`} fill="#C62828" />
              {[40, 100, 160].map((x) => (
                <path key={x} d={`M${x} 0 Q${x - 20} 750 ${x + sweep * 0.5} 1500`} stroke="#8E1B1B" strokeWidth="14" fill="none" />
              ))}
            </g>
          ))}
          <path d="M0 0 H1080 V90 Q1000 150 920 90 Q840 150 760 90 Q680 150 600 90 Q520 150 440 90 Q360 150 280 90 Q200 150 120 90 Q60 150 0 90 Z" fill="#B71C1C" />
          <path d="M40 160 Q540 260 1040 160" stroke="#FFD740" strokeWidth="4" fill="none" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = 80 + i * 115;
            const y = 160 + Math.sin((i / 8) * Math.PI) * 95;
            return <polygon key={i} transform={`translate(${x} ${y + 18}) rotate(${Math.sin(frame / 6 + i) * 10})`} points="0,-24 7,-8 24,-8 10,3 15,20 0,10 -15,20 -10,3 -24,-8 -7,-8" fill="#FFD740" />;
          })}
        </Svg>
      </PopLayer>
      {/* stage floor */}
      <PopLayer delay={4} dur={dur} outDelay={0}>
        <Svg>
          <rect x="0" y="1420" width="1080" height="500" fill="#8D5A33" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x="0" y={1430 + i * 56} width="1080" height="4" fill="#6B4226" />
          ))}
          <rect x="0" y="1410" width="1080" height="24" fill="#A9743F" />
        </Svg>
      </PopLayer>
      {/* paper confetti */}
      <AbsoluteFill>
        <Svg>
          {Array.from({ length: 70 }, (_, i) => {
            const startF = 6 + (i % 14);
            const t = Math.max(0, ft - startF);
            const x = rand(i) * 1080 + Math.sin(t / 7 + i) * 30;
            const y = -40 + t * (9 + rand(i + 9) * 7);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={14 + rand(i + 3) * 12}
                height={8 + rand(i + 5) * 8}
                fill={confetti[i % confetti.length]}
                transform={`rotate(${t * (6 + rand(i) * 10)} ${x} ${y})`}
                opacity={t > 0 ? 1 : 0}
              />
            );
          })}
        </Svg>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
