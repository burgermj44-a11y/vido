/*
 * Reusable series intro ("sting") for Abdelwahab's study series.
 * Drop it into any video with <Sequence from={...} durationInFrames={STING_FRAMES(fps)}>.
 * Full-screen: iris-in from a circle, rotating gold emblem with the series
 * logo, title + episode number, light sweep, then a zoom-through exit.
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT } from "../fonts";

export const STING_SECONDS = 2.2;
export const STING_FRAMES = (fps: number) => Math.round(STING_SECONDS * fps);

export type SeriesProps = {
  title: string; // e.g. "طريقك للباك"
  subtitle?: string; // e.g. "مع عبد الوهاب"
  episode?: number;
};

const GOLD = "#FFC93C";
const GOLD_GRAD = "linear-gradient(135deg, #FFF0A8 0%, #FFC93C 40%, #FF8A00 100%)";
const NAVY = "#0B1530";

/* the series logo: a gold emblem with an open book and a rising star */
export const SeriesLogo: React.FC<{ size: number; spin?: number; glow?: number }> = ({ size, spin = 0, glow = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="sl-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF0A8" />
        <stop offset="0.45" stopColor="#FFC93C" />
        <stop offset="1" stopColor="#FF8A00" />
      </linearGradient>
      <radialGradient id="sl-core" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#1E2F66" />
        <stop offset="1" stopColor="#0B1530" />
      </radialGradient>
      <filter id="sl-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={6 * glow} result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* rotating dashed outer ring */}
    <g transform={`rotate(${spin} 100 100)`}>
      <circle cx="100" cy="100" r="96" fill="none" stroke="url(#sl-gold)" strokeWidth="3" strokeDasharray="10 8" />
    </g>
    <g transform={`rotate(${-spin * 0.6} 100 100)`}>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="98" y="8" width="4" height="10" rx="2" fill="url(#sl-gold)" transform={`rotate(${i * 30} 100 100)`} />
      ))}
    </g>
    {/* badge */}
    <circle cx="100" cy="100" r="78" fill="url(#sl-core)" stroke="url(#sl-gold)" strokeWidth="6" filter="url(#sl-glow)" />
    {/* open book */}
    <g transform="translate(100 118)">
      <path d="M-52 -14 C-30 -24 -12 -22 0 -12 C12 -22 30 -24 52 -14 L52 30 C30 20 12 22 0 32 C-12 22 -30 20 -52 30 Z" fill="url(#sl-gold)" />
      <path d="M0 -12 L0 32" stroke={NAVY} strokeWidth="3" />
      <path d="M-42 -4 C-28 -10 -14 -9 -6 -3 M-42 8 C-28 2 -14 3 -6 9 M42 -4 C28 -10 14 -9 6 -3 M42 8 C28 2 14 3 6 9" stroke={NAVY} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
    {/* rising star */}
    <g transform="translate(100 62)" filter="url(#sl-glow)">
      <path d="M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z" fill="url(#sl-gold)" />
    </g>
  </svg>
);

export const SeriesSting: React.FC<SeriesProps> = ({ title, subtitle = "مع عبد الوهاب", episode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = STING_FRAMES(fps);

  // iris in (circle grows from center), zoom-through out
  const iris = interpolate(frame, [0, 9], [0, 1500], { extrapolateRight: "clamp" });
  const exitT = interpolate(frame, [total - 9, total], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoIn = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 160 } });
  const titleIn = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 170 } });
  const subIn = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 170 } });
  const epIn = spring({ frame: frame - 22, fps, config: { damping: 9, stiffness: 220 } });
  const sweep = interpolate(frame, [10, 34], [-600, 1600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [total - 4, total - 1, total], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at 50% 45%)` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, #1F3373 0%, ${NAVY} 55%, #050A18 100%)`,
          transform: `scale(${1 + exitT * 0.6})`,
          opacity: 1 - exitT * 0.9,
        }}
      >
        {/* light rays */}
        <AbsoluteFill
          style={{
            background: `repeating-conic-gradient(from ${frame * 1.5}deg at 50% 42%, rgba(255,201,60,0.13) 0deg 8deg, rgba(255,201,60,0) 8deg 22deg)`,
          }}
        />
        {/* floating particles */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = (i * 397) % 1080;
          const y = 1920 - ((frame * (4 + (i % 5)) + i * 211) % 2100);
          const s = 4 + (i % 4) * 3;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: 99, background: GOLD, opacity: 0.55, boxShadow: `0 0 12px ${GOLD}` }} />;
        })}
        {/* emblem */}
        <div
          style={{
            position: "absolute",
            left: 540 - 230,
            top: 470,
            transform: `scale(${logoIn * (1 + exitT * 1.8)}) rotate(${(1 - logoIn) * -120}deg)`,
          }}
        >
          <SeriesLogo size={460} spin={frame * 3} glow={1 + Math.sin(frame / 4) * 0.3} />
        </div>
        {/* title, subtitle and episode stacked in one column */}
        <div style={{ position: "absolute", top: 960, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div
            dir="rtl"
            style={{
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 100,
              lineHeight: 1.15,
              background: GOLD_GRAD,
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 8px 0 #4A2A00)",
              transform: `translateY(${(1 - titleIn) * 80}px)`,
              opacity: titleIn,
            }}
          >
            {title}
          </div>
          <div
            dir="rtl"
            style={{
              fontFamily: FONT,
              fontSize: 50,
              color: "white",
              transform: `translateY(${(1 - subIn) * 60}px)`,
              opacity: subIn,
            }}
          >
            {subtitle}
          </div>
          {episode !== undefined && (
            <div
              dir="rtl"
              style={{
                marginTop: 10,
                fontFamily: FONT,
                fontSize: 50,
                color: NAVY,
                background: GOLD_GRAD,
                borderRadius: 999,
                padding: "2px 40px 10px",
                boxShadow: "0 10px 0 #7A4300",
                transform: `scale(${epIn})`,
              }}
            >
              الحلقة {episode}
            </div>
          )}
        </div>
        {/* light sweep across the title */}
        <div
          style={{
            position: "absolute",
            top: 900,
            left: sweep,
            width: 160,
            height: 500,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))",
            transform: "skewX(-20deg)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};
