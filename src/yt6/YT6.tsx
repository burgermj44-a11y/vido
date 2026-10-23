/*
 * YouTube video 6 (16:9, ~9.5 min, English): his voice only (the clips were black
 * with captions), full motion graphics. Bomi the MJ owl reacts to every line
 * (bottom-left), each line gets its own stage visual, English karaoke captions,
 * Arabic translation on a torn paper strip at the bottom, MJ wipe between
 * sections, subscribe + follow in the first minutes, energetic music bed.
 */
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { FONT, loadFonts } from "../fonts";
import { Owl, POSES, Pose } from "../mascot/Owl";
import { ENV, ENV_FPS } from "./env";
import { BEATS, Beat, PROMO_AT, SECTIONS, THUMB } from "./script";

loadFonts();

export const YT6_FPS = 30;
const FPS = YT6_FPS;
const W = 1920;
const H = 1080;
const sec = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (
  f: number,
  a: number,
  b: number,
  ease = Easing.out(Easing.cubic),
) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301.17 + 49297.3) * 233280.5;
  return x - Math.floor(x);
};
const INK = "#2A1E14";
const GOLD = "#FFC233";
const ORANGE = "#FF8A00";
const MJ_GOLD =
  "linear-gradient(180deg, #FFE68A 0%, #FFC93C 45%, #E09A00 100%)";
const SFX_GAIN = 0.22;
const LEAD = 0.25; // visuals start a bit before the word

const VOICE_END = BEATS[BEATS.length - 1].end;
const OUTRO = 4.5;
export const YT6_FRAMES = sec(VOICE_END + OUTRO);

const img = (c: string) => staticFile(`yt6/img/${c}.svg`);
const Sfx: React.FC<{ at: number; name: string; vol?: number }> = ({
  at,
  name,
  vol = 1,
}) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`yt6/sfx/${name}.wav`)} volume={vol * SFX_GAIN} />
  </Sequence>
);

const envAt = (f: number) => {
  const i = Math.floor((f / FPS) * ENV_FPS);
  return ENV[Math.max(0, Math.min(ENV.length - 1, i))] ?? 0;
};

/* ---------- section palettes ---------- */
const PALETTES: Record<string, [string, string, string]> = {
  gold: ["#FFF3D6", "#FFD98A", "#F2A93B"],
  blue: ["#E4F0FF", "#A9CCFF", "#4F86E8"],
  pink: ["#FFE6EE", "#FFB3C9", "#E5577E"],
  green: ["#E5F8EA", "#A8E3B8", "#3BA567"],
  purple: ["#EFE6FF", "#C8B0FF", "#7B5BE0"],
  night: ["#2B2350", "#1C1838", "#0F0C22"],
};

const sectionAt = (t: number) => {
  let s = SECTIONS[0];
  for (const x of SECTIONS) if (t >= x.at) s = x;
  return s;
};

const Background: React.FC<{ pal: [string, string, string]; f: number }> = ({
  pal,
  f,
}) => {
  const dark = pal === PALETTES.night;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 60% 40%, ${pal[0]} 0%, ${pal[1]} 55%, ${pal[2]} 120%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dark ? "rgba(255,255,255,0.10)" : "rgba(42,30,20,0.10)"} 3px, transparent 3.5px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${f * 0.5}px ${f * 0.25}px`,
        }}
      />
      {/* drifting shapes */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x =
          ((rand(i) * W + f * (0.3 + rand(i + 9) * 0.6)) % (W + 200)) - 100;
        const y = rand(i + 3) * H * 0.85 + Math.sin(f / 50 + i) * 20;
        const s = 20 + rand(i + 5) * 46;
        const kind = i % 3;
        const col = dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              transform: `rotate(${f * (rand(i) - 0.5) * 2}deg)`,
            }}
          >
            {kind === 0 && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `6px solid ${col}`,
                }}
              />
            )}
            {kind === 1 && (
              <svg viewBox="0 0 10 10" width={s} height={s}>
                <path d="M4 0h2v4h4v2H6v4H4V6H0V4h4Z" fill={col} />
              </svg>
            )}
            {kind === 2 && (
              <svg viewBox="0 0 10 10" width={s} height={s}>
                <path
                  d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z"
                  fill={col}
                />
              </svg>
            )}
          </div>
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,15,0,0.28) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- building blocks ---------- */
const Em: React.FC<{
  code: string;
  size: number;
  style?: React.CSSProperties;
}> = ({ code, size, style }) => (
  <Img
    src={img(code)}
    style={{
      width: size,
      height: size,
      display: "block",
      filter: `drop-shadow(0 0 0 #fff) drop-shadow(${size / 28}px 0 0 #fff) drop-shadow(-${size / 28}px 0 0 #fff) drop-shadow(0 ${size / 28}px 0 #fff) drop-shadow(0 -${size / 28}px 0 #fff) drop-shadow(0 ${size / 18}px ${size / 14}px rgba(0,0,0,0.3))`,
      ...style,
    }}
  />
);

const PopIn: React.FC<{
  f: number;
  at: number;
  x: number;
  y: number;
  rot?: number;
  seed?: number;
  children: React.ReactNode;
  float?: number;
}> = ({ f, at, x, y, rot = 0, seed = 1, children, float = 8 }) => {
  if (f < at) return null;
  const p = spring({
    frame: f - at,
    fps: FPS,
    config: { damping: 10, stiffness: 170 },
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${p}) rotate(${rot + (1 - p) * -25 + Math.sin(f / 22 + seed) * 3}deg) translateY(${Math.sin(f / 16 + seed) * float}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Chip: React.FC<{
  text: string;
  bg?: string;
  color?: string;
  size?: number;
}> = ({ text, bg = "#fff", color = INK, size = 46 }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      color,
      background: bg,
      border: `6px solid ${INK}`,
      borderRadius: size * 0.6,
      padding: `${size * 0.08}px ${size * 0.55}px`,
      boxShadow: `0 ${size * 0.16}px 0 ${INK}`,
      whiteSpace: "nowrap",
      lineHeight: 1.35,
    }}
  >
    {text}
  </div>
);

const STAGE_X = 1140; // stage centre (right of Bomi)
const STAGE_Y = 400;

/* ---------- stage visuals ---------- */
const Stage: React.FC<{ b: Beat; f: number; acc: string }> = ({
  b,
  f,
  acc,
}) => {
  const at = 0;
  const lf = f; // local frame inside the beat sequence
  const em = b.emoji ?? [];
  switch (b.kind) {
    case "title": {
      const words = (b.big ?? "").split(" ");
      return (
        <>
          <div
            style={{
              position: "absolute",
              left: STAGE_X - 700,
              width: 1400,
              top: STAGE_Y - 230,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 30px",
            }}
          >
            {words.map((w, i) => {
              const p = spring({
                frame: lf - 3 - i * 4,
                fps: FPS,
                config: { damping: 11, stiffness: 180 },
              });
              const key = (b.keys ?? []).includes(w.replace(/[^\w']/g, ""));
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontSize: words.length > 4 ? 130 : 170,
                    lineHeight: 1.15,
                    display: "inline-block",
                    transform: `translateY(${(1 - p) * 120}px) scale(${0.6 + p * 0.4}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
                    opacity: Math.min(1, p * 2),
                    ...(key
                      ? {
                          background: MJ_GOLD,
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                          WebkitTextStroke: `3px ${INK}`,
                          filter: "drop-shadow(0 10px 0 #2A1E14)",
                        }
                      : {
                          color: "#fff",
                          WebkitTextStroke: `16px ${INK}`,
                          paintOrder: "stroke fill",
                          filter: "drop-shadow(0 10px 0 rgba(42,30,20,0.9))",
                        }),
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
          {em.map((c, i) => (
            <PopIn
              key={c + i}
              f={lf}
              at={at + 10 + i * 5}
              x={STAGE_X + (i % 2 ? 1 : -1) * (560 + (i > 1 ? -80 : 0))}
              y={STAGE_Y - 230 + (i > 1 ? 360 : 0)}
              rot={i % 2 ? 12 : -12}
              seed={i}
            >
              <Em code={c} size={150} />
            </PopIn>
          ))}
        </>
      );
    }
    case "emoji": {
      const n = em.length;
      const labels = b.labels ?? [];
      return (
        <>
          {em.map((c, i) => {
            const x = STAGE_X + (i - (n - 1) / 2) * (n > 2 ? 420 : 520);
            return (
              <PopIn
                key={c + i}
                f={lf}
                at={at + 2 + i * 7}
                x={x}
                y={STAGE_Y - 10}
                rot={(i - 1) * 6}
                seed={i * 3}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <Em code={c} size={n > 2 ? 250 : 300} />
                  {labels[i] && (
                    <Chip
                      text={labels[i]}
                      bg={i === n - 1 ? acc : "#fff"}
                      size={50}
                    />
                  )}
                </div>
              </PopIn>
            );
          })}
        </>
      );
    }
    case "vs": {
      const [l, r] = b.labels ?? ["", ""];
      const card = (
        side: number,
        text: string,
        good: boolean,
        code?: string,
      ) => (
        <PopIn
          f={lf}
          at={at + (side ? 14 : 2)}
          x={STAGE_X + (side ? 330 : -330)}
          y={STAGE_Y}
          rot={side ? 3 : -3}
          seed={side}
        >
          <div
            style={{
              width: 560,
              minHeight: 430,
              background: "#fff",
              borderRadius: 40,
              border: `8px solid ${INK}`,
              boxShadow: `0 16px 0 ${INK}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 26,
              boxSizing: "border-box",
            }}
          >
            {code && <Em code={code} size={170} />}
            <div
              style={{
                fontFamily: FONT,
                fontSize: 52,
                color: INK,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {text}
            </div>
            <div
              style={{
                position: "absolute",
                top: -46,
                right: -36,
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: good ? "#2E9E5B" : "#E5383B",
                border: `7px solid ${INK}`,
                color: "#fff",
                fontFamily: FONT,
                fontSize: 70,
                display: "grid",
                placeItems: "center",
              }}
            >
              {good ? "✓" : "✗"}
            </div>
          </div>
        </PopIn>
      );
      return (
        <>
          {card(0, l, false, em[0])}
          {card(1, r, true, em[1])}
          <PopIn f={lf} at={at + 9} x={STAGE_X} y={STAGE_Y} seed={7} float={3}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 90,
                color: "#fff",
                WebkitTextStroke: `14px ${INK}`,
                paintOrder: "stroke fill",
              }}
            >
              VS
            </div>
          </PopIn>
        </>
      );
    }
    case "steps": {
      const items = b.labels ?? [];
      const dur = sec(b.end - b.start);
      return (
        <div
          style={{
            position: "absolute",
            left: STAGE_X - 560,
            top: STAGE_Y - 280,
            width: 1120,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {items.map((t, i) => {
            const st =
              2 + Math.round((i * dur * 0.8) / Math.max(1, items.length));
            const p = spring({
              frame: lf - st,
              fps: FPS,
              config: { damping: 13, stiffness: 170 },
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  transform: `translateX(${(1 - p) * 300}px)`,
                  opacity: Math.min(1, p * 1.6),
                }}
              >
                <div
                  style={{
                    width: 104,
                    height: 104,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: acc,
                    border: `7px solid ${INK}`,
                    fontFamily: FONT,
                    fontSize: 60,
                    color: INK,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#fff",
                    border: `7px solid ${INK}`,
                    borderRadius: 28,
                    padding: "10px 30px",
                    fontFamily: FONT,
                    fontSize: 54,
                    color: INK,
                    boxShadow: `0 10px 0 ${INK}`,
                  }}
                >
                  {t}
                </div>
                {em[i] && <Em code={em[i]} size={110} />}
              </div>
            );
          })}
        </div>
      );
    }
    case "number": {
      const v = b.value ?? 0;
      const p = ramp(
        lf,
        4,
        4 + sec(Math.min(1.6, b.end - b.start)),
        Easing.out(Easing.cubic),
      );
      return (
        <>
          <PopIn f={lf} at={at} x={STAGE_X} y={STAGE_Y - 40} seed={2} float={4}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 300,
                  lineHeight: 1,
                  background: MJ_GOLD,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: `5px ${INK}`,
                  filter: `drop-shadow(0 14px 0 ${INK})`,
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>
                  {Math.round(v * p)}
                  <span style={{ fontSize: 130 }}>{b.unit ?? ""}</span>
                </span>
              </div>
              {b.labels?.[0] && <Chip text={b.labels[0]} size={56} />}
            </div>
          </PopIn>
          {em.map((c, i) => (
            <PopIn
              key={c}
              f={lf}
              at={at + 8 + i * 4}
              x={STAGE_X + (i % 2 ? 520 : -520)}
              y={STAGE_Y - 120 + i * 80}
              rot={i % 2 ? 10 : -10}
              seed={i}
            >
              <Em code={c} size={170} />
            </PopIn>
          ))}
        </>
      );
    }
    case "quote": {
      const p = spring({
        frame: lf,
        fps: FPS,
        config: { damping: 14, stiffness: 140 },
      });
      return (
        <div
          style={{
            position: "absolute",
            left: STAGE_X - 720,
            top: STAGE_Y - 300,
            width: 1440,
            height: 600,
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* rays */}
          <div
            style={{
              position: "absolute",
              width: 1500,
              height: 1500,
              borderRadius: "50%",
              background: `repeating-conic-gradient(rgba(255,214,90,0.28) 0deg 10deg, transparent 10deg 20deg)`,
              transform: `rotate(${lf * 0.4}deg) scale(${p})`,
              maskImage: "radial-gradient(circle, black 20%, transparent 65%)",
              WebkitMaskImage:
                "radial-gradient(circle, black 20%, transparent 65%)",
            }}
          />
          <div
            style={{
              transform: `scale(${0.7 + p * 0.3}) rotate(${(1 - p) * -6}deg)`,
              opacity: Math.min(1, p * 1.5),
              background: "#1C1712",
              border: `8px solid ${GOLD}`,
              borderRadius: 44,
              padding: "44px 64px",
              maxWidth: 1250,
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 120,
                lineHeight: 0.6,
                color: GOLD,
              }}
            >
              “
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: (b.big ?? "").length > 40 ? 70 : 88,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              {(b.big ?? "").split(" ").map((w, i) => {
                const key = (b.keys ?? []).includes(w.replace(/[^\w']/g, ""));
                return (
                  <span
                    key={i}
                    style={
                      key
                        ? {
                            background: MJ_GOLD,
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }
                        : undefined
                    }
                  >
                    {w}{" "}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    case "word": {
      return (
        <>
          <PopIn
            f={lf}
            at={at + 2}
            x={STAGE_X}
            y={STAGE_Y - 20}
            seed={4}
            float={5}
          >
            <div
              style={{
                background: "#fff",
                border: `9px solid ${INK}`,
                borderRadius: 46,
                padding: "30px 70px",
                textAlign: "center",
                boxShadow: `0 18px 0 ${INK}`,
              }}
            >
              {em[0] && (
                <Em code={em[0]} size={150} style={{ margin: "0 auto 6px" }} />
              )}
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 130,
                  lineHeight: 1.1,
                  color: "#E63E62",
                }}
              >
                {b.big}
              </div>
              {b.labels?.[0] && (
                <div style={{ fontFamily: FONT, fontSize: 56, color: INK }}>
                  {b.labels[0]}
                </div>
              )}
            </div>
          </PopIn>
        </>
      );
    }
    default:
      return null;
  }
};

/* ---------- captions ---------- */
type Word = { w: string; s: number; e: number };
const wordsOf = (b: Beat): Word[] => {
  const ws = b.en.split(" ");
  const total = ws.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  return ws.map((w) => {
    const s = b.start + ((b.end - b.start) * acc) / total;
    acc += w.length + 1;
    return { w, s, e: b.start + ((b.end - b.start) * acc) / total };
  });
};

// split a beat's words into caption lines of max ~7 words
const captionLines = (b: Beat) => {
  const ws = wordsOf(b);
  const lines: Word[][] = [];
  let cur: Word[] = [];
  for (const w of ws) {
    cur.push(w);
    if (cur.length >= 7 || (/[,.?!:]$/.test(w.w) && cur.length >= 3)) {
      lines.push(cur);
      cur = [];
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
};

const Captions: React.FC<{ t: number; f: number; acc: string }> = ({
  t,
  f,
  acc,
}) => {
  const b = BEATS.find((x) => t >= x.start - 0.1 && t < x.end + 0.15);
  if (!b) return null;
  const lines = captionLines(b);
  const line =
    lines.find((l) => t < l[l.length - 1].e + 0.1) ?? lines[lines.length - 1];
  const ls = line[0].s - 0.1;
  const p = ramp(f, sec(ls), sec(ls) + 6);
  const keys = new Set(b.keys ?? []);
  return (
    <div
      style={{
        position: "absolute",
        left: 440,
        right: 40,
        top: 800,
        textAlign: "center",
        transform: `translateY(${(1 - p) * 30}px)`,
        opacity: p,
        filter: `blur(${(1 - p) * 6}px)`,
      }}
    >
      {line.map((w, i) => {
        const on = t >= w.s - 0.05 && t < w.e + 0.05;
        const said = t >= w.s;
        const clean = w.w.replace(/[^\w']/g, "");
        const key = keys.has(clean);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 13px",
              fontFamily: FONT,
              fontSize: key ? 66 : 60,
              color: key ? INK : on ? GOLD : "#fff",
              WebkitTextStroke: key ? undefined : `10px ${INK}`,
              paintOrder: "stroke fill",
              background: key
                ? `linear-gradient(135deg, ${GOLD}, ${ORANGE})`
                : undefined,
              border: key ? `5px solid ${INK}` : undefined,
              borderRadius: key ? 18 : undefined,
              padding: key ? "0 16px" : undefined,
              transform: `scale(${on ? 1.08 : 1}) translateY(${on ? -4 : 0}px)`,
              opacity: said || !on ? 1 : 0.9,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Arabic translation on a paper strip ---------- */
const tornPath = (seed: number, w: number, h: number) => {
  const pts: string[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++)
    pts.push(`${(i / steps) * w},${8 + (rand(seed + i) - 0.5) * 12}`);
  for (let i = steps; i >= 0; i--)
    pts.push(`${(i / steps) * w},${h - 8 - (rand(seed + 60 + i) - 0.5) * 12}`);
  return `polygon(${pts
    .map((p) =>
      p
        .split(",")
        .map((v) => `${v}px`)
        .join(" "),
    )
    .join(",")})`;
};

// Arabic chunk that matches the English caption line being shown
const arabicChunk = (b: Beat, t: number) => {
  const lines = captionLines(b);
  const li = Math.max(
    0,
    lines.findIndex((l) => t < l[l.length - 1].e + 0.1),
  );
  const n = lines.length;
  if (n <= 1) return { text: b.ar, li: 0 };
  const ws = b.ar.split(" ");
  const parts: string[][] = Array.from({ length: n }, () => []);
  const total = b.ar.length;
  let acc = 0;
  for (const w of ws) {
    const k = Math.min(n - 1, Math.floor((acc / total) * n));
    parts[k].push(w);
    acc += w.length + 1;
  }
  const idx = li < 0 ? n - 1 : li;
  return { text: parts[idx].join(" ") || b.ar, li: idx };
};

const ArabicStrip: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const idx = BEATS.findIndex((x) => t >= x.start - 0.15 && t < x.end + 0.2);
  if (idx < 0) return null;
  const b = BEATS[idx];
  const { text, li } = arabicChunk(b, t);
  const lines = captionLines(b);
  const ls = (lines[li]?.[0]?.s ?? b.start) - 0.15;
  const p = spring({
    frame: f - sec(ls),
    fps: FPS,
    config: { damping: 15, stiffness: 190 },
  });
  const w = 1400;
  const h = 118;
  const len = text.length;
  return (
    <div
      style={{
        position: "absolute",
        left: STAGE_X - w / 2 - 30,
        top: 925,
        width: w,
        height: h,
        transform: `rotate(${-0.6 + rand(idx) * 1.2}deg)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.3))",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#FFFDF6",
            clipPath: tornPath(idx * 7, w, h),
          }}
        >
          <Img
            src={staticFile("yt6/paper_white.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              mixBlendMode: "multiply",
              opacity: 0.5,
            }}
          />
        </div>
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          inset: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: len > 80 ? 36 : len > 60 ? 42 : 50,
          lineHeight: 1.25,
          color: INK,
          textAlign: "center",
          opacity: Math.min(1, p * 1.4),
          transform: `translateY(${(1 - p) * 16}px)`,
        }}
      >
        {text}
      </div>
      {/* tape */}
      <div
        style={{
          position: "absolute",
          left: 30,
          top: -18,
          width: 130,
          height: 40,
          background: "rgba(255,226,140,0.75)",
          transform: "rotate(-14deg)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 30,
          top: -18,
          width: 130,
          height: 40,
          background: "rgba(255,226,140,0.75)",
          transform: "rotate(12deg)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
};

/* ---------- Bomi ---------- */
const BomiLayer: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  // pose: blend between beats
  const i = Math.max(
    0,
    BEATS.findIndex((x) => t < x.end + 0.2),
  );
  const cur = BEATS[Math.min(i, BEATS.length - 1)];
  const prev = BEATS[Math.max(0, i - 1)];
  const pc = POSES[cur.pose ?? "idle"];
  const pp = POSES[prev.pose ?? "idle"];
  const k = ramp(
    f,
    sec(cur.start - LEAD),
    sec(cur.start - LEAD) + 7,
    Easing.inOut(Easing.cubic),
  );
  const pose = {} as Pose;
  (Object.keys(pc) as (keyof Pose)[]).forEach(
    (key) => (pose[key] = pp[key] + (pc[key] - pp[key]) * k),
  );
  const e = envAt(f);
  const talk = Math.min(1, e * 2.2);
  // fly in at start
  const fly = ramp(f, 0, sec(1.6), Easing.out(Easing.cubic));
  const flying = f < sec(1.6);
  const pz = flying ? POSES.fly : pose;
  return (
    <div
      style={{
        position: "absolute",
        left: 10 + (1 - fly) * -600,
        top: 430 + (1 - fly) * -700 - e * 10,
        width: 470,
        height: 420,
      }}
    >
      <Owl
        frame={f}
        pose={pz}
        talk={talk}
        shine={cur.kind === "quote" ? 0.6 + 0.4 * Math.sin(f * 0.3) : 0}
      />
    </div>
  );
};

/* ---------- subscribe + follow (English) ---------- */
const Promo: React.FC = () => {
  const f = useCurrentFrame();
  const enter = spring({
    frame: f,
    fps: FPS,
    config: { damping: 13, stiffness: 150 },
  });
  const exit = ramp(f, sec(6.6), sec(7));
  const stage = f < sec(3.4) ? 0 : 1;
  const local = stage === 0 ? f : f - sec(3.4);
  const tap = sec(1.5);
  const tapped = local >= tap;
  const press = spring({
    frame: local - tap,
    fps: FPS,
    config: { damping: 9, stiffness: 320 },
  });
  const btn = tapped ? interpolate(press, [0, 0.4, 1], [1, 0.86, 1]) : 1;
  const hand = spring({
    frame: local - (tap - 12),
    fps: FPS,
    config: { damping: 15, stiffness: 170 },
  });
  const handPress = local >= tap - 2 && local < tap + 5 ? 0.85 : 1;
  const pop = spring({
    frame: local,
    fps: FPS,
    config: { damping: 12, stiffness: 180 },
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{ background: `rgba(15,10,5,${0.45 * enter * (1 - exit)})` }}
      />
      <div
        style={{
          position: "absolute",
          left: STAGE_X,
          top: 430,
          transform: `translate(-50%,-50%) scale(${enter * (1 - exit) * (0.92 + pop * 0.08)})`,
        }}
      >
        {stage === 0 ? (
          <div
            style={{
              width: 1100,
              borderRadius: 34,
              overflow: "hidden",
              background: "#0F0F0F",
              border: "6px solid #fff",
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <Img
              src={staticFile("promo/banner.png")}
              style={{
                width: "100%",
                height: 260,
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 26,
                padding: "24px 30px",
              }}
            >
              <Img
                src={staticFile("promo/avatar.png")}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: 65,
                  border: "4px solid #fff",
                }}
              />
              <div
                style={{
                  flex: 1,
                  fontFamily: "Roboto, Arial, sans-serif",
                  color: "#fff",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 46 }}>
                  Abdelwahab Mj
                </div>
                <div style={{ fontSize: 30, color: "#AAA" }}>
                  Learn smarter, not harder
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  height: 96,
                  padding: "0 40px",
                  borderRadius: 48,
                  background: tapped ? "#272727" : "#FF0033",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontFamily: "Roboto, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: 44,
                  transform: `scale(${btn})`,
                }}
              >
                {tapped && (
                  <span
                    style={{
                      display: "inline-block",
                      transform: `rotate(${local > tap + 6 && local < tap + 36 ? Math.sin(local * 1.5) * 24 : 0}deg)`,
                    }}
                  >
                    🔔
                  </span>
                )}
                {tapped ? "Subscribed" : "Subscribe"}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 760,
              borderRadius: 34,
              overflow: "hidden",
              background: "#0F1116",
              border: "6px solid #fff",
              padding: 16,
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
            }}
          >
            <Img
              src={staticFile("promo/profile_shot.png")}
              style={{ width: "100%", display: "block", borderRadius: 18 }}
            />
            <div
              style={{
                marginTop: 14,
                height: 84,
                borderRadius: 18,
                background: tapped ? "#363636" : "#0095F6",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Roboto, Arial, sans-serif",
                fontWeight: 700,
                fontSize: 42,
                transform: `scale(${btn})`,
              }}
            >
              {tapped ? "Following ✓" : "Follow on Instagram"}
            </div>
          </div>
        )}
        {/* tapping hand */}
        <div
          style={{
            position: "absolute",
            right: stage === 0 ? 70 : 250,
            bottom: stage === 0 ? -120 : -110,
            fontSize: 130,
            transform: `translate(${(1 - hand) * 300}px, ${(1 - hand) * 300}px) scale(${handPress})`,
            opacity: local < tap + sec(1.2) ? Math.min(1, hand) : 0,
          }}
        >
          👆
        </div>
        {/* hearts after follow */}
        {tapped &&
          Array.from({ length: 8 }).map((_, i) => {
            const q = ramp(local, tap + i * 2, tap + 30 + i * 2);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 40,
                  fontSize: 60,
                  opacity: q > 0 && q < 1 ? 1 - q : 0,
                  transform: `translate(${(rand(i) - 0.5) * 700 * q}px, ${-q * 420}px) scale(${0.6 + q})`,
                }}
              >
                {stage === 0 ? "🔔" : "❤️"}
              </div>
            );
          })}
      </div>
      <div
        style={{
          position: "absolute",
          left: STAGE_X,
          top: 60,
          transform: `translateX(-50%) scale(${enter * (1 - exit)})`,
        }}
      >
        <Chip
          text={stage === 0 ? "Subscribe for more!" : "Follow me on Instagram"}
          bg={GOLD}
          size={58}
        />
      </div>
      <Sfx at={0} name="whoosh_in" vol={1.2} />
      <Sfx at={tap} name="click" vol={1.4} />
      <Sfx at={tap + 2} name="ding" vol={1.2} />
      <Sfx at={sec(3.4)} name="swipe" />
      <Sfx at={sec(3.4) + tap} name="click" vol={1.4} />
      <Sfx at={sec(3.4) + tap + 2} name="sparkle" vol={1.2} />
      <Sfx at={sec(6.6)} name="whoosh_out" />
    </AbsoluteFill>
  );
};

/* ---------- MJ transition ---------- */
const maskStyle = (seed: number): React.CSSProperties => {
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++)
    pts.push(`${8 + (rand(seed + i) - 0.5) * 10}px ${(i / 30) * 100}%`);
  pts.push("100% 100%", "100% 0%");
  return { clipPath: `polygon(${pts.join(",")})` };
};

const MJWipe: React.FC<{ seed: number; title: string }> = ({ seed, title }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) =>
    interpolate(frame - lag, [0, 9, 20, 29], [2000, 0, 0, -2150], {
      ...clamp,
      easing: ease,
    });
  const tilt = (lag: number) =>
    interpolate(frame - lag, [0, 9, 20, 29], [5, 0, 0, -4], clamp);
  const mj = ramp(frame, 7, 12);
  const line = ramp(frame, 10, 15);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={1.3} />
      <Sfx at={2} name="paper_flip" vol={0.8} />
      <Sfx at={10} name="mj_hit" vol={1.1} />
      <div
        style={{
          position: "absolute",
          left: sheetX(-2) - 160,
          top: -200,
          transform: `rotate(${tilt(-2)}deg)`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 2300,
            height: 1500,
            filter: "drop-shadow(-18px 0 30px rgba(0,0,0,0.35))",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: GOLD,
              overflow: "hidden",
              ...maskStyle(seed),
            }}
          >
            <Img
              src={staticFile("yt6/paper_white.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                mixBlendMode: "multiply",
                opacity: 0.9,
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: sheetX(1) - 80,
          top: -200,
          transform: `rotate(${tilt(1)}deg)`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 2200,
            height: 1500,
            filter: "drop-shadow(-24px 0 40px rgba(0,0,0,0.5))",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#151515",
              overflow: "hidden",
              ...maskStyle(seed + 3),
            }}
          >
            <Img
              src={staticFile("yt6/paper_kraft.jpg")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                mixBlendMode: "overlay",
                opacity: 0.5,
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              left: 80,
              top: 200,
              width: W,
              height: H,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 260,
                lineHeight: 1,
                letterSpacing: interpolate(mj, [0, 1], [50, -4]),
                background: MJ_GOLD,
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))",
                opacity: mj,
              }}
            >
              MJ
            </div>
            <div
              style={{
                width: 300 * line,
                height: 6,
                borderRadius: 3,
                background: GOLD,
                marginTop: 8,
              }}
            />
            <div
              style={{
                fontFamily: FONT,
                fontSize: 64,
                color: "#fff",
                marginTop: 20,
                opacity: line,
              }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- outro ---------- */
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const p = spring({ frame: f, fps: FPS, config: { damping: 14 } });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #2A2016 0%, #0E0A06 75%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 300,
          width: 520,
          height: 470,
        }}
      >
        <Owl
          frame={f}
          pose={POSES.wave}
          talk={0}
          shine={0.6 + 0.4 * Math.sin(f * 0.3)}
        />
      </div>
      <div
        style={{
          marginLeft: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${p})`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 280,
            lineHeight: 1,
            background: MJ_GOLD,
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.6))",
          }}
        >
          MJ
        </div>
        <div
          style={{
            width: 360 * p,
            height: 7,
            background: GOLD,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 60,
            color: "#fff",
            marginTop: 24,
          }}
        >
          Subscribe for more
        </div>
        <div style={{ fontFamily: FONT, fontSize: 46, color: GOLD }}>
          @abdelwahab__mj
        </div>
      </div>
      <Sfx at={0} name="mj_hit" vol={1.2} />
      <Sfx at={4} name="sparkle" />
    </AbsoluteFill>
  );
};

/* ---------- main ---------- */
export const YT6: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sect = sectionAt(t + LEAD);
  const pal = PALETTES[sect.pal];
  const acc = pal[2];
  const cur = BEATS.find((b) => t + LEAD >= b.start && t + LEAD < b.end + 0.3);
  // punch: small zoom pulse on every beat
  const bs = cur ? sec(cur.start - LEAD) : 0;
  const punch = cur
    ? 1 + 0.035 * Math.exp(-(f - bs) / 10) * (f >= bs ? 1 : 0)
    : 1;
  const drift = 1 + Math.sin(f / 90) * 0.006;
  const flash = SECTIONS.some(
    (s) => s.at > 0 && f >= sec(s.at) && f < sec(s.at) + 4,
  )
    ? 0.5
    : 0;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${punch * drift})` }}>
        <Background pal={pal} f={f} />
        {BEATS.map((b, i) => {
          const from = sec(b.start - LEAD);
          const next = BEATS[i + 1];
          const to = next ? sec(next.start - LEAD) : sec(b.end + 0.5);
          if (f < from - 2 || f > to + 12) return null;
          const out = ramp(f, to, to + 8, Easing.in(Easing.cubic));
          return (
            <Sequence
              key={i}
              from={from}
              durationInFrames={to - from + 10}
              layout="none"
            >
              <AbsoluteFill
                style={{
                  opacity: 1 - out,
                  transform: `scale(${1 - out * 0.08}) translateY(${out * -30}px)`,
                }}
              >
                <StageSeq b={b} acc={acc} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <BomiLayer t={t} f={f} />
      <Captions t={t} f={f} acc={acc} />
      <ArabicStrip t={t} f={f} />
      {/* section chip */}
      <div style={{ position: "absolute", right: 40, top: 36 }}>
        <Chip text={sect.title} bg={GOLD} size={38} />
      </div>
      <Sequence from={sec(PROMO_AT)} durationInFrames={sec(7)} layout="none">
        <Promo />
      </Sequence>
      {SECTIONS.slice(1).map((s, i) => (
        <Sequence
          key={i}
          from={sec(s.at) - 9}
          durationInFrames={32}
          layout="none"
        >
          <MJWipe seed={i * 5} title={s.title} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, pointerEvents: "none" }}
      />
      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: 10,
          width: `${(f / YT6_FRAMES) * 100}%`,
          background: `linear-gradient(90deg, ${GOLD}, ${ORANGE})`,
        }}
      />
      <Sequence from={sec(VOICE_END + 0.4)} layout="none">
        <Outro />
      </Sequence>
      {/* audio */}
      <Audio src={staticFile("yt6/voice.wav")} />
      <Audio
        src={staticFile("yt6/music.wav")}
        volume={(fr) =>
          interpolate(
            fr,
            [0, sec(2.2), sec(3), sec(VOICE_END), sec(VOICE_END + 1)],
            [0.28, 0.28, 0.085, 0.085, 0.3],
            clamp,
          )
        }
      />
      <Audio src={staticFile("yt6/riser.wav")} volume={0.55} />
    </AbsoluteFill>
  );
};

const StageSeq: React.FC<{ b: Beat; acc: string }> = ({ b, acc }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Stage b={b} f={f} acc={acc} />
      {b.sfx !== null && (
        <Sfx
          at={0}
          name={
            b.sfx ??
            (b.kind === "quote"
              ? "boom"
              : b.kind === "title"
                ? "whoosh_in"
                : "pop")
          }
          vol={b.kind === "quote" ? 0.9 : 1}
        />
      )}
      {(b.emoji ?? []).slice(1).map((_, i) => (
        <Sfx key={i} at={8 + (i + 1) * 6} name="pop2" vol={0.7} />
      ))}
    </>
  );
};

/* ---------- thumbnail ---------- */
export const YT6Thumb: React.FC = () => <Thumb />;
const Thumb: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 70% 40%, #FFE08A 0%, #FFB020 40%, #E0631A 100%)",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 72% 45%, rgba(255,255,255,0.22) 0deg 9deg, transparent 9deg 18deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -30,
          top: 70,
          width: 640,
          height: 580,
        }}
      >
        <Owl frame={50} pose={POSES.surprised} talk={0.8} shine={0} />
      </div>
      <div style={{ position: "absolute", left: 50, top: 70, width: 760 }}>
        {THUMB.lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontSize: l.size,
              lineHeight: 1.02,
              ...(l.gold
                ? {
                    color: "#fff",
                    background: "#E5383B",
                    display: "inline-block",
                    padding: "0 22px",
                    borderRadius: 18,
                    border: `7px solid ${INK}`,
                    transform: "rotate(-3deg)",
                    margin: "10px 0",
                  }
                : {
                    color: "#fff",
                    WebkitTextStroke: `16px ${INK}`,
                    paintOrder: "stroke fill",
                  }),
              filter: `drop-shadow(0 10px 0 ${INK})`,
            }}
          >
            {l.text}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 50,
          bottom: 40,
          display: "flex",
          gap: 20,
        }}
      >
        {THUMB.emoji.map((c) => (
          <Em key={c} code={c} size={120} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
