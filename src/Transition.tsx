import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { FONT, boil, rand } from "./paper";
import { H, PALETTE, W } from "./config";

export const TRANSITION_FRAMES = 22;

const edge = (seed: number, frame: number, y: number, amp: number) => {
  const b = boil(frame, 3);
  const n = 26;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const j = (rand(seed + i * 3 + b * 7) - 0.5) * 2 * amp;
    pts.push([(i / n) * W, y + j]);
  }
  return pts;
};

const bandPath = (seed: number, frame: number, top: number, bottom: number, amp: number) => {
  const a = edge(seed, frame, top, amp);
  const b = edge(seed + 100, frame, bottom, amp).reverse();
  return `M ${[...a, ...b].map((p) => p.join(",")).join(" L ")} Z`;
};

const Logo: React.FC<{ word: string; local: number; fps: number }> = ({ word, local, fps }) => {
  const s = spring({ frame: local, fps, config: { damping: 9, stiffness: 180, mass: 0.7 } });
  const isLogo = word === "mj";
  const rot = (rand(word.length * 13) - 0.5) * 10 + (boil(local, 3) % 2) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: H / 2 - 260,
        width: W,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${s}) rotate(${rot}deg)`,
      }}
    >
      {isLogo ? (
        <div
          style={{
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: PALETTE.red,
            border: `18px solid ${PALETTE.paper}`,
            boxShadow: "14px 18px 0 rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 250,
            letterSpacing: -14,
            color: PALETTE.paper,
            textShadow: "8px 8px 0 rgba(0,0,0,0.3)",
          }}
        >
          mj
        </div>
      ) : (
        <div
          style={{
            background: PALETTE.yellow,
            border: `14px solid ${PALETTE.ink}`,
            padding: "30px 64px",
            boxShadow: "14px 18px 0 rgba(0,0,0,0.28)",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 150,
            color: PALETTE.ink,
            letterSpacing: -4,
            whiteSpace: "nowrap",
            clipPath:
              "polygon(0 3%,5% 0,12% 3%,22% 0,35% 2%,50% 0,66% 3%,80% 0,92% 2%,100% 0,100% 97%,93% 100%,80% 97%,66% 100%,50% 97%,35% 100%,20% 97%,8% 100%,0 97%)",
          }}
        >
          {word}
        </div>
      )}
    </div>
  );
};

export const PaperTransition: React.FC<{
  frame: number; // frames since transition start
  index: number;
  word: string;
}> = ({ frame, index, word }) => {
  const { fps } = useVideoConfig();
  if (frame < 0 || frame > TRANSITION_FRAMES) return null;
  const p = frame / TRANSITION_FRAMES;
  const s = Easing.inOut(Easing.cubic)(p);
  const L = H * 1.6;
  const top = H - s * (H + L);
  const bottom = top + L;
  const flip = index % 2 === 1;
  const seed = index * 31 + 5;

  const showLogo = frame > 6 && frame < 17;
  const logoOpacity = interpolate(frame, [6, 8, 15, 17], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: flip ? "scaleY(-1)" : undefined, pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`sh${index}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="-14" stdDeviation="10" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        <path
          d={bandPath(seed, frame, top - 70, bottom + 70, 34)}
          fill={PALETTE.kraft}
          filter={`url(#sh${index})`}
        />
        <path d={bandPath(seed + 7, frame, top, bottom, 22)} fill={PALETTE.paper} />
        {/* fibre lines on the cream sheet */}
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M ${rand(seed + i) * W} ${top + 60} q 30 ${L / 4} -20 ${L / 2}`}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth={3}
            fill="none"
          />
        ))}
      </svg>
      {showLogo && (
        <div style={{ opacity: logoOpacity, transform: flip ? "scaleY(-1)" : undefined }}>
          <Logo word={word} local={frame - 6} fps={fps} />
        </div>
      )}
    </AbsoluteFill>
  );
};
