import React from "react";
import { Easing, interpolate, spring, useVideoConfig } from "remotion";
import { LAT, boil, rand } from "./paper";
import { H, PALETTE, W, CutKind } from "./config";

export const TRANSITION_FRAMES = 26;

const edge = (seed: number, frame: number, y: number, amp: number) => {
  const b = boil(frame, 3);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 26; i++) pts.push([(i / 26) * W, y + (rand(seed + i * 3 + b * 7) - 0.5) * 2 * amp]);
  return pts;
};
const band = (seed: number, frame: number, top: number, bottom: number, amp: number) => {
  const a = edge(seed, frame, top, amp);
  const b = edge(seed + 100, frame, bottom, amp).reverse();
  return `M ${[...a, ...b].map((p) => p.join(",")).join(" L ")} Z`;
};

const Gold: React.FC<{ local: number }> = ({ local }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: local, fps, config: { damping: 9, stiffness: 190, mass: 0.7 } });
  const line = interpolate(local, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 - 190, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${s})` }}>
      <div style={{ fontFamily: LAT, fontWeight: 900, fontSize: 330, letterSpacing: -14, lineHeight: 1, background: "linear-gradient(180deg,#ffe58a 0%,#e6a823 52%,#a8690a 100%)", WebkitBackgroundClip: "text", color: "transparent" }}>MJ</div>
      <div style={{ height: 10, width: 420 * line, marginTop: 6, background: "linear-gradient(90deg,#e6a823,#ffe58a,#e6a823)" }} />
    </div>
  );
};

const Word: React.FC<{ word: string; local: number }> = ({ word, local }) => {
  const { fps } = useVideoConfig();
  const s = spring({ frame: local, fps, config: { damping: 9, stiffness: 180, mass: 0.7 } });
  const rot = (rand(word.length * 13) - 0.5) * 8 + (boil(local, 3) % 2);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 - 150, display: "flex", justifyContent: "center", transform: `scale(${s}) rotate(${rot}deg)` }}>
      <div style={{ background: PALETTE.yellow, border: `14px solid ${PALETTE.ink}`, padding: "28px 64px", boxShadow: "14px 18px 0 rgba(0,0,0,0.3)", fontFamily: LAT, fontWeight: 900, fontSize: 140, letterSpacing: -4, color: PALETTE.ink, whiteSpace: "nowrap" }}>{word}</div>
    </div>
  );
};

export const PaperTransition: React.FC<{ frame: number; index: number; kind: CutKind; word?: string }> = ({ frame, index, kind, word }) => {
  if (frame < 0 || frame > TRANSITION_FRAMES) return null;
  const p = frame / TRANSITION_FRAMES;
  const s = Easing.inOut(Easing.cubic)(p);
  const L = H * 2.6;
  const top = H - s * (H + L);
  const bottom = top + L;
  const flip = index % 2 === 1;
  const seed = index * 31 + 5;
  const dark = kind === "mj";
  const local = frame - 8;
  const showCard = kind !== "tear" && frame >= 8 && frame <= 19;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transform: flip ? "scaleY(-1)" : undefined }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id={`sh${index}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="-14" stdDeviation="10" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>
        <path d={band(seed, frame, top - 70, bottom + 70, 34)} fill={PALETTE.kraft} filter={`url(#sh${index})`} />
        <path d={band(seed + 7, frame, top, bottom, 22)} fill={dark ? PALETTE.black : PALETTE.paper} />
      </svg>
      {showCard && (
        <div style={{ position: "absolute", inset: 0, transform: flip ? "scaleY(-1)" : undefined }}>
          {kind === "mj" ? <Gold local={local} /> : <Word word={word ?? ""} local={local} />}
        </div>
      )}
    </div>
  );
};
