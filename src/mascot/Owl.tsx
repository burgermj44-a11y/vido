// "Bomi", the MJ owl mascot. Drawn in SVG so every part (wings, eyes, beak)
// can be driven per frame: pick a pose and the owl blends into it.
import React from "react";
import { Easing, interpolate } from "remotion";

const O = "#2A1E14";
const S = { stroke: O, strokeWidth: 7, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export type Pose = {
  lw: number; // left wing angle (deg, + = raise outward)
  rw: number; // right wing angle (deg, - = raise outward)
  lookX: number;
  lookY: number;
  pupil: number; // pupil scale (small = surprised)
  wink: number; // 0..1 right eye closed
  happy: number; // 0..1 eyes become ^ ^
  wave: number; // 0..1 right wing waves
  flap: number; // 0..1 both wings flap (flying / dancing)
  bounce: number; // 0..1 body bounce
};

export const POSES: Record<string, Pose> = {
  idle: { lw: 0, rw: 0, lookX: 0, lookY: 0, pupil: 1, wink: 0, happy: 0, wave: 0, flap: 0, bounce: 0 },
  fly: { lw: 70, rw: -70, lookX: 0, lookY: 4, pupil: 1, wink: 0, happy: 0, wave: 0, flap: 1, bounce: 0 },
  wave: { lw: 0, rw: -115, lookX: 0, lookY: 0, pupil: 1, wink: 0, happy: 0.0, wave: 1, flap: 0, bounce: 0 },
  point: { lw: 0, rw: -120, lookX: 7, lookY: -5, pupil: 1, wink: 1, happy: 0, wave: 0, flap: 0, bounce: 0 },
  think: { lw: 0, rw: 38, lookX: 7, lookY: -9, pupil: 0.85, wink: 0, happy: 0, wave: 0, flap: 0, bounce: 0 },
  surprised: { lw: 125, rw: -125, lookX: 0, lookY: 0, pupil: 0.55, wink: 0, happy: 0, wave: 0, flap: 0.25, bounce: 0 },
  happy: { lw: 45, rw: -45, lookX: 0, lookY: 0, pupil: 1, wink: 0, happy: 1, wave: 0, flap: 0.6, bounce: 1 },
};

export type PoseKey = { at: number; pose: keyof typeof POSES };

// Blend from the previous pose into the current one over `blend` frames.
export const poseAt = (frame: number, keys: PoseKey[], blend = 7): Pose => {
  let i = 0;
  while (i + 1 < keys.length && keys[i + 1].at <= frame) i++;
  const cur = POSES[keys[i].pose];
  if (i === 0) return cur;
  const prev = POSES[keys[i - 1].pose];
  const t = interpolate(frame - keys[i].at, [0, blend], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const out = {} as Pose;
  (Object.keys(cur) as (keyof Pose)[]).forEach((k) => (out[k] = prev[k] + (cur[k] - prev[k]) * t));
  return out;
};

const Eye: React.FC<{ cx: number; cy: number; p: Pose; closed: number; frame: number }> = ({ cx, cy, p, closed, frame }) => {
  const r = 22 * p.pupil;
  const x = cx + p.lookX;
  const y = cy + p.lookY;
  if (closed > 0.5 || p.happy > 0.5) {
    const d = p.happy > 0.5 ? `M${cx - 18} ${cy + 6} Q${cx} ${cy - 16} ${cx + 18} ${cy + 6}` : `M${cx - 18} ${cy + 2} Q${cx} ${cy - 10} ${cx + 18} ${cy + 2}`;
    return <path d={d} stroke={O} strokeWidth={8} fill="none" strokeLinecap="round" />;
  }
  // blink every ~3.3 s
  const b = frame % 100;
  const sy = b < 3 ? 0.12 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${sy}) translate(${-x} ${-y})`}>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={O} />
      <circle cx={x + r * 0.35} cy={y - r * 0.45} r={Math.max(4, r * 0.36)} fill="#fff" />
      <circle cx={x - r * 0.35} cy={y + r * 0.4} r={Math.max(2, r * 0.15)} fill="#fff" />
    </g>
  );
};

export const Owl: React.FC<{
  frame: number;
  pose: Pose;
  talk?: number; // 0..1 beak open
  shine?: number; // 0..1 gold glow on the MJ chest
}> = ({ frame, pose: p, talk = 0, shine = 0 }) => {
  const flap = Math.sin(frame * 0.9) * 38 * p.flap;
  const waveA = Math.sin(frame * 0.5) * 22 * p.wave;
  const lw = p.lw + flap;
  const rw = p.rw - flap + waveA;
  const breathe = Math.sin(frame * 0.12) * 0.012;
  const hop = -Math.abs(Math.sin(frame * 0.32)) * 26 * p.bounce;
  const open = Math.max(0, Math.min(1, talk));
  return (
    <svg viewBox="-40 -20 480 420" style={{ width: "100%", height: "100%", overflow: "visible" }}>
      <ellipse cx={200} cy={386} rx={110 - hop * 0.8} ry={13} fill="#000" opacity={0.14} />
      <g transform={`translate(0 ${hop}) translate(200 378) scale(${1 - breathe} ${1 + breathe}) translate(-200 -378)`}>
        {/* left wing (behind body) */}
        <g transform={`rotate(${lw} 104 236)`}>
          <path d="M102 236 Q46 290 104 350 Q118 300 102 236 Z" fill="#6E452C" {...S} />
        </g>
        <path d="M96 222 Q92 118 200 110 Q308 118 304 222 L300 320 Q296 378 200 378 Q104 378 100 320 Z" fill="#8A5A3B" {...S} />
        <path d="M136 262 Q200 228 264 262 L260 330 Q252 368 200 368 Q148 368 140 330 Z" fill="#EBCB9F" />
        <path d="M150 276 Q200 260 250 276 L246 350 Q200 364 154 350 Z" fill={O} {...S} />
        <text x={200} y={332} fontFamily="CairoBlack" fontSize={54} textAnchor="middle" fill="#FFC233">
          MJ
        </text>
        {shine > 0 && (
          <path d="M150 276 Q200 260 250 276 L246 350 Q200 364 154 350 Z" fill="#FFE9A8" opacity={0.55 * shine} />
        )}
        <path d="M160 380 l-6 10 M172 380 l0 12 M240 380 l6 10 M228 380 l0 12" stroke="#FF8A00" strokeWidth={8} strokeLinecap="round" />
        {/* right wing (front) */}
        <g transform={`rotate(${rw} 296 236)`}>
          <path d="M298 236 Q354 290 296 350 Q282 300 298 236 Z" fill="#6E452C" {...S} />
        </g>
        <circle cx={154} cy={196} r={50} fill="#FFF8EC" stroke="#FFC233" strokeWidth={9} />
        <circle cx={246} cy={196} r={50} fill="#FFF8EC" stroke="#FFC233" strokeWidth={9} />
        <path d="M204 196 L196 196" stroke="#FFC233" strokeWidth={9} />
        <Eye cx={160} cy={200} p={p} closed={0} frame={frame} />
        <Eye cx={240} cy={200} p={p} closed={p.wink} frame={frame} />
        {/* beak: upper + lower half, lower drops when talking */}
        <path d={`M182 236 L218 236 L200 ${252 + open * 2} Z`} fill="#FF8A00" {...S} />
        <path d={`M188 ${248 + open * 4} L212 ${248 + open * 4} L200 ${264 + open * 12} Z`} fill="#E07000" {...S} />
        {open > 0.15 && <ellipse cx={200} cy={250 + open * 4} rx={7} ry={3 + open * 5} fill="#5A1A00" />}
        {/* cap */}
        <g transform={`rotate(${Math.sin(frame * 0.1) * 2 + p.lookX * 0.4} 200 112)`}>
          <path d="M112 112 L200 70 L288 112 L200 152 Z" fill={O} {...S} />
          <rect x={160} y={112} width={80} height={26} fill={O} />
          <g transform={`rotate(${Math.sin(frame * 0.25) * 10} 284 112)`}>
            <path d="M282 112 L288 166" stroke="#FFC233" strokeWidth={6} />
            <path d="M280 162 L296 162 L292 190 L284 190 Z" fill="#FFC233" {...S} />
          </g>
        </g>
      </g>
    </svg>
  );
};
