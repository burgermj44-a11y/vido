// Short vertical demo of Bomi the owl: flies in, waves, points at a word,
// thinks, gets surprised, dances, then taps Follow.
import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { Owl, PoseKey, poseAt } from "./Owl";

export const OWL_FPS = 30;
const sec = (s: number) => Math.round(s * OWL_FPS);
export const OWL_FRAMES = sec(13);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SFX_GAIN = 0.22;

const KEYS: PoseKey[] = [
  { at: 0, pose: "fly" },
  { at: sec(1.1), pose: "idle" },
  { at: sec(1.5), pose: "wave" },
  { at: sec(3.4), pose: "point" },
  { at: sec(5.6), pose: "think" },
  { at: sec(7.6), pose: "surprised" },
  { at: sec(9.0), pose: "happy" },
  { at: sec(11.0), pose: "point" },
];

// beak moves only while "talking"
const TALK: [number, number][] = [
  [1.6, 3.2],
  [3.6, 5.3],
  [5.8, 7.3],
  [7.7, 8.8],
  [11.1, 12.6],
];

const LINES: { from: number; to: number; text: string; key?: string }[] = [
  { from: 1.5, to: 3.4, text: "Hi! I'm", key: "Bomi" },
  { from: 3.4, to: 5.6, text: "New word:", key: "BOOK" },
  { from: 5.6, to: 7.6, text: "What does it", key: "mean?" },
  { from: 7.6, to: 9.0, text: "", key: "WOW!" },
  { from: 9.0, to: 11.0, text: "You got it!", key: "" },
  { from: 11.0, to: 13, text: "Follow", key: "@abdelwahab__mj" },
];

const Sfx: React.FC<{ at: number; name: string; vol?: number }> = ({ at, name, vol = 1 }) => (
  <Sequence from={sec(at)} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol * SFX_GAIN} />
  </Sequence>
);

const pop = (f: number, at: number, fps = OWL_FPS) => spring({ frame: f - sec(at), fps, config: { damping: 11, stiffness: 160 } });

const Bubble: React.FC<{ f: number; at: number; until: number; x: number; y: number; children: React.ReactNode }> = ({
  f,
  at,
  until,
  x,
  y,
  children,
}) => {
  const s = pop(f, at) * interpolate(f, [sec(until) - 6, sec(until)], [1, 0], clamp);
  if (s <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${s}) rotate(${Math.sin(f * 0.08) * 3}deg)`,
      }}
    >
      {children}
    </div>
  );
};

export const OwlDemo: React.FC = () => {
  loadFonts();
  const f = useCurrentFrame();
  const pose = poseAt(f, KEYS);

  // fly in from top-left, land with a squash
  const flyT = interpolate(f, [0, sec(1.1)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const ox = interpolate(flyT, [0, 1], [-700, 0]);
  const oy = interpolate(flyT, [0, 1], [-900, 0]) + Math.sin(flyT * Math.PI) * -120;
  const land = spring({ frame: f - sec(1.1), fps: OWL_FPS, config: { damping: 7, stiffness: 220 } });
  const squash = f >= sec(1.1) ? 1 - (1 - land) * 0.25 : 1;
  const surpriseJump = -Math.max(0, Math.sin(interpolate(f, [sec(7.6), sec(8.1)], [0, Math.PI], clamp))) * 90;

  const talking = TALK.some(([a, b]) => f >= sec(a) && f < sec(b));
  const talk = talking ? Math.abs(Math.sin(f * 0.75)) * (0.55 + 0.45 * Math.abs(Math.sin(f * 0.23))) : 0;
  const shine = interpolate(f, [sec(9.0), sec(9.4), sec(10.6), sec(11)], [0, 1, 1, 0], clamp) * (0.6 + 0.4 * Math.sin(f * 0.6));

  const line = LINES.find((l) => f >= sec(l.from) && f < sec(l.to));
  const lineIn = line ? spring({ frame: f - sec(line.from), fps: OWL_FPS, config: { damping: 14 } }) : 0;

  // follow button: tapped at 11.9 s
  const tapped = f >= sec(11.9);
  const tapS = 1 - 0.12 * Math.max(0, Math.sin(interpolate(f, [sec(11.8), sec(12.05)], [0, Math.PI], clamp)));

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #FFF6E6 0%, #F3E2C7 60%, #E8CFA8 100%)", fontFamily: FONT }}>
      {/* soft dots pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(#D9BB8F 3px, transparent 3.5px)",
          backgroundSize: "54px 54px",
          backgroundPosition: `${f * 0.6}px ${f * 0.3}px`,
          opacity: 0.45,
        }}
      />

      {/* word card the owl points at */}
      <Bubble f={f} at={3.55} until={5.6} x={790} y={640}>
        <div
          style={{
            background: "#fff",
            border: "8px solid #2A1E14",
            borderRadius: 34,
            padding: "26px 48px",
            textAlign: "center",
            boxShadow: "0 14px 0 #2A1E14",
          }}
        >
          <div style={{ fontSize: 120, color: "#E63E62", lineHeight: 1.1 }}>BOOK</div>
          <div style={{ fontSize: 76, color: "#2A1E14", lineHeight: 1.2 }}>كتاب 📖</div>
        </div>
      </Bubble>

      {/* thinking bubble */}
      <Bubble f={f} at={5.75} until={7.6} x={800} y={720}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 230,
              height: 230,
              borderRadius: "50%",
              background: "#fff",
              border: "8px solid #2A1E14",
              display: "grid",
              placeItems: "center",
              fontSize: 170,
              color: "#2A1E14",
            }}
          >
            ?
          </div>
          <div style={{ position: "absolute", left: -40, bottom: -50, width: 60, height: 60, borderRadius: "50%", background: "#fff", border: "7px solid #2A1E14" }} />
          <div style={{ position: "absolute", left: -80, bottom: -95, width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "6px solid #2A1E14" }} />
        </div>
      </Bubble>

      {/* surprise burst */}
      <Bubble f={f} at={7.65} until={9.0} x={540} y={560}>
        <svg width={520} height={300} viewBox="0 0 520 300">
          <path
            d="M260 10 L300 90 L390 40 L370 120 L500 120 L400 175 L470 260 L360 225 L320 295 L260 225 L190 295 L160 220 L50 260 L120 175 L20 120 L150 115 L130 40 L220 90 Z"
            fill="#FFC233"
            stroke="#2A1E14"
            strokeWidth={8}
            strokeLinejoin="round"
          />
          <text x={260} y={190} textAnchor="middle" fontFamily="CairoBlack" fontSize={96} fill="#E63E62">
            !!
          </text>
        </svg>
      </Bubble>

      {/* sparkles while dancing */}
      {f >= sec(9.0) && f < sec(11.0)
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + f * 0.05;
            const r = 360 + Math.sin(f * 0.2 + i) * 30;
            const s = 0.6 + 0.4 * Math.abs(Math.sin(f * 0.25 + i));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 540 + Math.cos(a) * r - 40,
                  top: 1080 + Math.sin(a) * r * 0.8 - 40,
                  fontSize: 80,
                  transform: `scale(${s})`,
                }}
              >
                {i % 2 ? "⭐" : "✨"}
              </div>
            );
          })
        : null}

      {/* the owl */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 760,
          width: 840,
          height: 735,
          transform: `translate(${ox}px, ${oy + surpriseJump}px) scale(${2 - squash}, ${squash})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Owl frame={f} pose={pose} talk={talk} shine={shine} />
      </div>

      {/* follow card */}
      <Bubble f={f} at={11.1} until={13.5} x={540} y={430}>
        <div
          style={{
            background: "#fff",
            borderRadius: 40,
            border: "8px solid #2A1E14",
            padding: "30px 44px",
            display: "flex",
            alignItems: "center",
            gap: 30,
            boxShadow: "0 14px 0 #2A1E14",
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "conic-gradient(#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5,#FEDA75)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#2A1E14", color: "#FFC233", fontSize: 44, display: "grid", placeItems: "center" }}>
              MJ
            </div>
          </div>
          <div
            style={{
              background: tapped ? "#EFEFEF" : "#0095F6",
              color: tapped ? "#2A1E14" : "#fff",
              fontSize: 60,
              borderRadius: 22,
              padding: "6px 46px",
              transform: `scale(${tapS})`,
            }}
          >
            {tapped ? "Following ✓" : "Follow"}
          </div>
        </div>
      </Bubble>

      {/* caption */}
      {line && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1620,
            textAlign: "center",
            transform: `translateY(${(1 - lineIn) * 60}px)`,
            opacity: lineIn,
            filter: `blur(${(1 - lineIn) * 8}px)`,
          }}
        >
          {line.text && (
            <span style={{ fontSize: 76, color: "#fff", WebkitTextStroke: "14px #2A1E14", paintOrder: "stroke fill", marginRight: 22 }}>
              {line.text}
            </span>
          )}
          {line.key && (
            <span
              style={{
                fontSize: line.key.length > 10 ? 64 : 92,
                color: "#2A1E14",
                background: "linear-gradient(135deg,#FFC233,#FF8A00)",
                padding: "4px 30px",
                borderRadius: 24,
                border: "6px solid #2A1E14",
                display: "inline-block",
              }}
            >
              {line.key}
            </span>
          )}
        </div>
      )}

      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, top: 0, height: 12, width: `${(f / OWL_FRAMES) * 100}%`, background: "#FF8A00" }} />

      <Sfx at={0} name="whoosh_in" />
      <Sfx at={1.1} name="pop" />
      <Sfx at={1.5} name="pop2" />
      <Sfx at={3.55} name="swipe" />
      <Sfx at={3.7} name="pop2" />
      <Sfx at={5.75} name="pop" />
      <Sfx at={7.6} name="boom" vol={0.7} />
      <Sfx at={9.0} name="sparkle" />
      <Sfx at={11.1} name="whoosh_in" />
      <Sfx at={11.9} name="click" />
      <Sfx at={12.0} name="ding" />
    </AbsoluteFill>
  );
};
