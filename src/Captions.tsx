import React from "react";
import { spring, useVideoConfig } from "remotion";
import { AR, HAND, Tape, boil, rand, tornClip } from "./paper";
import { CAPTIONS, TOPICS, Topic } from "./script";
import { PALETTE, f } from "./config";

const parse = (text: string) =>
  text.split(/(\{[^}]+\}|\[[^\]]+\])/).filter(Boolean).map((p, i) => {
    if (p.startsWith("{"))
      return (
        <span key={i} style={{ background: `linear-gradient(transparent 38%, ${PALETTE.yellow} 38%, ${PALETTE.yellow} 92%, transparent 92%)`, padding: "0 6px" }}>
          {p.slice(1, -1)}
        </span>
      );
    if (p.startsWith("["))
      return <span key={i} style={{ color: PALETTE.blue }}>{p.slice(1, -1)}</span>;
    return <span key={i}>{p}</span>;
  });

export const CaptionLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const idx = CAPTIONS.findIndex((c) => frame >= c.from && frame < c.to);
  if (idx < 0) return null;
  const cap = CAPTIONS[idx];
  const local = frame - cap.from;
  const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  const exit = Math.min(1, (cap.to - frame) / 4);
  const rot = -1.2 + (rand(idx) - 0.5) * 2 + (boil(frame, 5) % 2) * 0.3;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1370,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${(0.7 + 0.3 * pop) * (0.9 + 0.1 * exit)}) rotate(${rot}deg)`,
        opacity: exit,
      }}
    >
      <div style={{ position: "relative", filter: "drop-shadow(5px 8px 0 rgba(0,0,0,0.32))" }}>
        <div
          style={{
            background: PALETTE.paper,
            clipPath: tornClip(idx * 11 + 3, 20, 5),
            padding: "26px 52px 32px",
            maxWidth: 940,
            direction: "rtl",
            textAlign: "center",
            fontFamily: AR,
            fontWeight: 900,
            fontSize: 74,
            lineHeight: 1.25,
            color: PALETTE.ink,
          }}
        >
          {parse(cap.text)}
        </div>
        <Tape style={{ left: -26, top: -16, transform: "rotate(-30deg)" }} w={110} />
      </div>
    </div>
  );
};

const Emoji: React.FC<{ e: string; x: number; y: number; s: number; r: number; local: number; delay: number; seed: number }> = ({ e, x, y, s, r, local, delay, seed }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: local - delay, fps, config: { damping: 8, stiffness: 190, mass: 0.6 } });
  const w = (rand(seed + boil(local, 4)) - 0.5) * 6;
  const o = "#fff";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontSize: s,
        lineHeight: 1,
        transform: `scale(${Math.max(0, p)}) rotate(${r + w}deg)`,
        textShadow: `4px 0 0 ${o}, -4px 0 0 ${o}, 0 4px 0 ${o}, 0 -4px 0 ${o}, 3px 3px 0 ${o}, -3px -3px 0 ${o}, 3px -3px 0 ${o}, -3px 3px 0 ${o}, 8px 12px 0 rgba(0,0,0,0.25)`,
      }}
    >
      {e}
    </div>
  );
};

export const TopicLayer: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const i = TOPICS.findIndex((t) => frame >= t.from && frame < t.to);
  if (i < 0) return null;
  const tp: Topic = TOPICS[i];
  const local = frame - tp.from;
  const pop = spring({ frame: local, fps, config: { damping: 10, stiffness: 170, mass: 0.7 } });
  const exit = Math.min(1, (tp.to - frame) / 5);
  const rot = (rand(i * 7) - 0.5) * 4 + (boil(frame, 6) % 2) * 0.4;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: exit }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 70,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${(1 - pop) * -160}px) rotate(${rot}deg)`,
        }}
      >
        <div style={{ position: "relative", filter: "drop-shadow(5px 8px 0 rgba(0,0,0,0.3))" }}>
          <div
            style={{
              background: PALETTE.paper,
              clipPath: tornClip(i * 5 + 1, 18, 7),
              padding: "22px 70px 36px",
              direction: "rtl",
              fontFamily: HAND,
              fontWeight: 700,
              fontSize: 92,
              lineHeight: 1.1,
              color: tp.red ? PALETTE.red : PALETTE.ink,
              whiteSpace: "nowrap",
            }}
          >
            {tp.title}
          </div>
          <Tape style={{ left: "50%", top: -20, marginLeft: -60, transform: "rotate(-3deg)" }} w={120} />
        </div>
      </div>
      {tp.stickers.map((s, k) => (
        <Emoji key={k} e={s.e} x={s.x} y={s.y} s={s.s ?? 140} r={s.r ?? 0} local={local} delay={4 + k * 4} seed={i * 10 + k} />
      ))}
      {tp.note && frame >= f(tp.noteFrom ?? 0) && (
        <PaperNote text={tp.note} local={frame - f(tp.noteFrom ?? 0)} />
      )}
    </div>
  );
};

const PaperNote: React.FC<{ text: string; local: number }> = ({ text, local }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: local, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } });
  return (
    <div style={{ position: "absolute", left: 360, top: 250, transform: `scale(${p}) rotate(${-5 + (boil(local, 4) % 2)}deg)`, filter: "drop-shadow(6px 9px 0 rgba(0,0,0,0.3))" }}>
      <div style={{ background: PALETTE.paper, clipPath: tornClip(41, 14, 6), padding: "10px 46px 24px", fontFamily: AR, fontWeight: 900, fontSize: 150, color: PALETTE.red, letterSpacing: -4, direction: "ltr" }}>{text}</div>
      <Tape style={{ left: 40, top: -18, transform: "rotate(-8deg)" }} w={120} />
    </div>
  );
};
