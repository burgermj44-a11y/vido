import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Broll, Caption } from "../script";
import { FONT, loadFonts } from "../fonts";
import { BROLLS2, CAPTIONS2, FPS2, SCENES2, SFX2, Scene2 } from "./script2";

loadFonts();

/* palette: warm gold picked to pop on the beige wall and blue shirt */
const GOLD = "#FFC233";
const ORANGE = "#FF8A00";
const GOLD_GRAD = `linear-gradient(135deg, #FFE16A 0%, ${GOLD} 45%, ${ORANGE} 100%)`;
const RED = "#FF3B30";
const SFX_GAIN = 0.6;

const sec = (s: number) => Math.round(s * FPS2);
const icon = (code: string) => staticFile(`v2/img/${code}.svg`);
const pad4 = (n: number) => String(n).padStart(4, "0");

/* ---------------- depth layers ---------------- */
type Layer = "back" | "front";
const LayerCtx = createContext<Layer>("back");
const useLayer = () => useContext(LayerCtx);
const Back: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  useLayer() === "back" ? <>{children}</> : null;

/* ---------------- zoom shared by background + cut-out ---------------- */
const useZoom = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = SCENES2.findIndex((s) => t >= s.start && t < s.end);
  if (idx < 0) idx = SCENES2.length - 1;
  const scene = SCENES2[idx];
  const prev = idx > 0 ? SCENES2[idx - 1].zoom : scene.zoom;
  const local = frame - sec(scene.start);
  const snap = spring({ frame: local, fps, config: { damping: 18, stiffness: 220 } });
  const drift = interpolate(local, [0, sec(scene.end - scene.start)], [0, 0.035], { extrapolateRight: "clamp" });
  return interpolate(snap, [0, 1], [prev, scene.zoom]) + drift;
};

const videoStyle = (zoom: number): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: `scale(${zoom})`,
  transformOrigin: "50% 38%",
  filter: "saturate(1.15) contrast(1.07) brightness(1.02)",
});

const BackgroundVideo: React.FC = () => {
  const zoom = useZoom();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("v2/source.mp4")} muted style={videoStyle(zoom)} />
    </AbsoluteFill>
  );
};

const SpeakerCutout: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = useZoom();
  const matte = `url(${staticFile(`v2/matte/${pad4(Math.min(frame, 985))}.jpg`)})`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "50% 38%",
          maskImage: matte,
          WebkitMaskImage: matte,
          maskMode: "luminance",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        <OffthreadVideo src={staticFile("v2/source.mp4")} muted style={{ ...videoStyle(1), transform: "none" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const s of SCENES2.slice(1)) {
    const d = frame - sec(s.start);
    if (d >= 0 && d < 6) opacity = interpolate(d, [0, 5], [0.35, 0]);
  }
  return <AbsoluteFill style={{ backgroundColor: "white", opacity }} />;
};

const Shade: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)" }} />
  </>
);

/* ---------------- legendary captions ----------------
 * - the line rises in from a blur
 * - words appear as they are spoken (karaoke timing)
 * - the word being spoken glows gold and grows
 * - key words sit on a gold gradient badge with a moving shine
 */
const CaptionLegend: React.FC<{ cap: Caption }> = ({ cap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = cap.text.split(" ");
  const total = sec(cap.end - cap.start);
  const per = (total * 0.85) / words.length;
  const lineIn = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const out = interpolate(frame, [total - 4, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const solo = words.length === 1;

  return (
    <AbsoluteFill>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1330,
          left: 60,
          right: 60,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px 26px",
          opacity: out,
          transform: `translateY(${(1 - lineIn) * 60}px) scale(${0.92 + lineIn * 0.08 + (1 - out) * 0.06})`,
          filter: `blur(${(1 - lineIn) * 10 + (1 - out) * 6}px)`,
        }}
      >
        {words.map((w, i) => {
          const start = Math.floor(i * per);
          const pop = spring({ frame: frame - i * 2, fps, config: { damping: 10, stiffness: 280, mass: 0.55 } });
          const active = words.length > 1 && frame >= start && frame < Math.floor((i + 1) * per) + 2;
          const isHl = cap.hl?.includes(w);
          const size = solo ? 150 : isHl ? 88 : 80;
          const shine = interpolate((frame - start) % 40, [0, 22], [-140, 140], { extrapolateRight: "clamp" });

          if (isHl) {
            return (
              <span
                key={i}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "inline-block",
                  fontFamily: FONT,
                  fontSize: size,
                  lineHeight: 1.28,
                  color: "#1B1205",
                  background: GOLD_GRAD,
                  borderRadius: 20,
                  padding: "0 20px",
                  boxShadow: `0 8px 0 #B35A00, 0 14px 30px rgba(255,140,0,${active ? 0.65 : 0.35})`,
                  transform: `scale(${pop * (active ? 1.08 : 1)}) rotate(-2.5deg)`,
                  opacity: Math.min(1, pop * 1.6),
                }}
              >
                {w}
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 60,
                    left: `calc(50% + ${shine}%)`,
                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
                    transform: "skewX(-20deg)",
                  }}
                />
              </span>
            );
          }
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: FONT,
                fontSize: size,
                lineHeight: 1.28,
                color: active ? GOLD : "white",
                WebkitTextStroke: "4px #0B0B0B",
                paintOrder: "stroke fill",
                textShadow: active
                  ? `0 0 22px rgba(255,180,0,0.85), 0 7px 0 rgba(0,0,0,0.6)`
                  : "0 7px 0 rgba(0,0,0,0.6), 0 12px 24px rgba(0,0,0,0.4)",
                transform: `scale(${pop * (active ? 1.07 : 1)}) translateY(${(1 - pop) * 26}px)`,
                opacity: Math.min(1, pop * 1.6),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- graphic helpers ---------------- */
const usePop = (delay = 0, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 200, mass: 0.7 } });
};

const Sticker: React.FC<{ code: string; x: number; y: number; size: number; delay?: number; rot?: number }> = ({
  code,
  x,
  y,
  size,
  delay = 0,
  rot = 0,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(delay);
  if (useLayer() !== "back") return null;
  const float = Math.sin((frame + delay * 7) / 11) * 10;
  return (
    <Img
      src={icon(code)}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + float,
        width: size,
        height: size,
        transform: `scale(${p}) rotate(${rot + (1 - p) * -40}deg)`,
        filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.4))",
      }}
    />
  );
};

const Label: React.FC<{ text: string; y?: number; bg?: string; color?: string; size?: number; delay?: number; shake?: boolean }> = ({
  text,
  y = 34,
  bg = GOLD_GRAD,
  color = "#1B1205",
  size = 54,
  delay = 0,
  shake = false,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 12);
  if (useLayer() !== "front") return null;
  const sx = shake ? Math.sin(frame * 2.1) * interpolate(frame - delay, [0, 18], [10, 2], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) : 0;
  return (
    <div dir="rtl" style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: size,
          color,
          background: bg,
          padding: "2px 38px 10px",
          borderRadius: 999,
          border: "4px solid rgba(255,255,255,0.9)",
          boxShadow: "0 10px 0 rgba(0,0,0,0.28), 0 18px 36px rgba(0,0,0,0.35)",
          transform: `translateX(${sx}px) scale(${p}) rotate(${(1 - p) * 8 - 1.5}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* golden light rays rotating behind an object */
const Rays: React.FC<{ x: number; y: number; size: number; delay?: number; color?: string }> = ({ x, y, size, delay = 0, color = "255,200,60" }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 14);
  if (useLayer() !== "back") return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: 999,
        background: `repeating-conic-gradient(from ${frame * 1.2}deg, rgba(${color},0.55) 0deg 10deg, rgba(${color},0) 10deg 24deg)`,
        WebkitMaskImage: "radial-gradient(circle, black 20%, transparent 70%)",
        maskImage: "radial-gradient(circle, black 20%, transparent 70%)",
        transform: `scale(${p})`,
      }}
    />
  );
};

/* ---------------- scenes ---------------- */

const Bac2027: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(1, 9);
  const year = Math.round(interpolate(frame, [4, 26], [2000, 2027], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <>
      <Back>
        <div
          style={{
            position: "absolute",
            left: 540 - 260,
            top: 70,
            width: 520,
            height: 330,
            borderRadius: 40,
            background: "linear-gradient(160deg,#1E2A44,#0E1424)",
            border: `6px solid ${GOLD}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            transform: `scale(${p}) rotate(${-3 + (1 - p) * 18}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 22,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 58, color: "white", letterSpacing: 4 }}>BAC • BEM</div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 150,
              lineHeight: 1,
              background: GOLD_GRAD,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {year}
          </div>
        </div>
      </Back>
      <Sticker code="1f393" x={850} y={110} size={170} delay={10} rot={14} />
      <Sticker code="1f4c5" x={210} y={460} size={140} delay={16} rot={-10} />
    </>
  );
};

const Trust: React.FC = () => (
  <>
    <Rays x={540} y={280} size={520} />
    <Sticker code="1f91d" x={540} y={280} size={330} delay={3} />
    <Sticker code="2705" x={880} y={440} size={130} delay={14} rot={10} />
    <Label text="تيقوني 🤞" delay={6} />
  </>
);

const Hundred: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0, 8);
  const n = Math.round(interpolate(frame, [0, 20], [0, 100], { extrapolateRight: "clamp" }));
  const hit = spring({ frame: frame - 22, fps: FPS2, config: { damping: 7, stiffness: 260 } });
  return (
    <>
      <Rays x={540} y={280} size={640} color="255,170,0" />
      <Back>
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 230,
            lineHeight: 1,
            background: GOLD_GRAD,
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 10px 0 #9A4A00) drop-shadow(0 20px 30px rgba(0,0,0,0.4))",
            transform: `scale(${p * (frame >= 22 ? 1 + (1 - hit) * 0.25 : 1)}) rotate(-4deg)`,
          }}
        >
          {n}%
        </div>
      </Back>
      <Sticker code="1f4af" x={880} y={430} size={150} delay={22} rot={12} />
      <Sticker code="1f525" x={190} y={430} size={140} delay={24} rot={-12} />
    </>
  );
};

const Secret: React.FC = () => {
  const frame = useCurrentFrame();
  const keyAt = sec(6.27 - 5.2);
  const fly = spring({ frame: frame - keyAt, fps: FPS2, config: { damping: 200 }, durationInFrames: 14 });
  const opened = frame >= keyAt + 14;
  const shake = opened ? 0 : Math.sin(frame * 1.6) * 3;
  return (
    <>
      <Rays x={540} y={280} size={520} delay={keyAt + 14} />
      <Back>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
          <Sticker code={opened ? "1f48e" : "1f512"} x={540} y={280} size={opened ? 300 : 320} delay={opened ? keyAt + 14 : 2} />
        </div>
        {frame >= keyAt && !opened && (
          <Img
            src={icon("1f511")}
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              left: interpolate(fly, [0, 1], [1100, 560]),
              top: interpolate(fly, [0, 1], [520, 230]),
              transform: `rotate(${interpolate(fly, [0, 1], [-90, -45])}deg)`,
            }}
          />
        )}
      </Back>
      <Sticker code="2753" x={190} y={430} size={130} delay={4} rot={-12} />
      <Label text={opened ? "سر عظيم 💎" : "عندي سر 🤫"} delay={6} />
    </>
  );
};

const Hush: React.FC = () => (
  <>
    <Sticker code="1f92b" x={540} y={280} size={330} delay={3} />
    <Sticker code="1f64a" x={880} y={440} size={140} delay={14} rot={12} />
    <Sticker code="1f9e0" x={200} y={440} size={130} delay={20} rot={-10} />
    <Label text="حتى حد ما حكالكم" delay={6} />
  </>
);

/* share arrow + paper plane drawn as SVG so they stay crisp */
const ShareArrow: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M13.5 4.5 21.5 11.5 13.5 18.5V14.4C8.2 14.4 4.7 16 2 20.2 3 14.2 6.6 9.6 13.5 8.6Z" fill="white" />
  </svg>
);
const Plane: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke="#FF8A00" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M11.5 13.2 22 3" stroke="#FF8A00" strokeWidth="1.2" />
  </svg>
);

const FRIENDS = [
  { code: "1f468-200d-1f393", x: 140, y: 240 },
  { code: "1f469-200d-1f393", x: 940, y: 240 },
  { code: "1f929", x: 160, y: 520 },
  { code: "1f465", x: 920, y: 520 },
];

/* "share" animation, drawn behind the speaker */
const ShareScene: React.FC<{ story?: boolean }> = ({ story = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tapAt = story ? 10 : 12;
  const enter = usePop(1, 9);
  const tap = frame >= tapAt ? interpolate(frame - tapAt, [0, 3, 8], [1, 0.85, 1], { extrapolateRight: "clamp" }) : 1;
  const pulse = (k: number) => ((frame + k * 10) % 30) / 30;
  const layer = useLayer();
  const cx = 540;
  const cy = 280;
  return (
    <>
      {layer === "back" && (
        <>
          {/* pulse rings */}
          {[0, 1, 2].map((k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                left: cx - 150,
                top: cy - 150,
                width: 300,
                height: 300,
                borderRadius: 999,
                border: `6px solid ${GOLD}`,
                opacity: (1 - pulse(k)) * enter * 0.8,
                transform: `scale(${1 + pulse(k) * 1.3})`,
              }}
            />
          ))}
          {/* the button */}
          <div
            style={{
              position: "absolute",
              left: cx - 150,
              top: cy - 150,
              width: 300,
              height: 300,
              borderRadius: 999,
              padding: story ? 10 : 0,
              boxSizing: "border-box",
              background: story
                ? `conic-gradient(from ${frame * 3}deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5, #FEDA75)`
                : GOLD_GRAD,
              boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 -10px 0 rgba(0,0,0,0.12)",
              transform: `scale(${enter * tap})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {story ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 999,
                  background: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Img src={icon("1f4f1")} style={{ width: 140, height: 140 }} />
              </div>
            ) : (
              <ShareArrow size={175} />
            )}
          </div>
          {/* planes fly to each friend, friends pop with a check */}
          {FRIENDS.map((fr, i) => {
            const launch = tapAt + 2 + i * 3;
            const t = spring({ frame: frame - launch, fps, config: { damping: 200 }, durationInFrames: 12 });
            const arrived = frame >= launch + 12;
            const fp = spring({ frame: frame - launch - 12, fps, config: { damping: 9, stiffness: 240 } });
            const px = interpolate(t, [0, 1], [cx, fr.x]);
            const py = interpolate(t, [0, 1], [cy, fr.y]) - Math.sin(t * Math.PI) * 80;
            const ang = (Math.atan2(fr.y - cy, fr.x - cx) * 180) / Math.PI + 45;
            return (
              <React.Fragment key={i}>
                {frame >= launch && !arrived && (
                  <div style={{ position: "absolute", left: px - 45, top: py - 45, transform: `rotate(${ang}deg)` }}>
                    <Plane size={90} />
                  </div>
                )}
                {arrived && (
                  <div
                    style={{
                      position: "absolute",
                      left: fr.x - 75,
                      top: fr.y - 75,
                      width: 150,
                      height: 150,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.92)",
                      boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
                      transform: `scale(${fp})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Img src={icon(fr.code)} style={{ width: 110, height: 110 }} />
                    <Img
                      src={icon("2705")}
                      style={{ position: "absolute", right: -6, bottom: -6, width: 56, height: 56 }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </>
      )}
      <Label text={story ? "شاركه فالستوري 📲" : "بارطاجي مع صحابك 🚀"} delay={5} />
    </>
  );
};

const Tawfiq: React.FC = () => {
  const glowAt = sec(13.68 - 11.12);
  return (
    <>
      <Rays x={540} y={280} size={700} />
      <Rays x={540} y={280} size={460} delay={glowAt} color="255,240,180" />
      <Sticker code="1f932" x={540} y={280} size={310} delay={2} />
      <Sticker code="2728" x={200} y={180} size={120} delay={glowAt} rot={-10} />
      <Sticker code="1f31f" x={880} y={180} size={120} delay={glowAt + 4} rot={10} />
      <Sequence durationInFrames={glowAt - 2} layout="none">
        <Label text="السر 🔑" delay={6} />
      </Sequence>
      <Sequence from={glowAt} layout="none">
        <Label text="التوفيق من الله ✨" delay={4} size={64} />
      </Sequence>
    </>
  );
};

const Students: React.FC = () => (
  <>
    <Sticker code="1f468-200d-1f393" x={540} y={280} size={300} delay={2} />
    <Sticker code="1f469-200d-1f393" x={260} y={230} size={170} delay={6} rot={-8} />
    <Sticker code="1f469-200d-1f393" x={820} y={230} size={170} delay={10} rot={8} />
    <Sticker code="1f477" x={170} y={470} size={130} delay={14} rot={-10} />
    <Sticker code="1f3c6" x={910} y={470} size={130} delay={18} rot={10} />
    <Label text="بزاف شباب 🎓" delay={6} />
  </>
);

const Concept: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [10, 34], [0, -60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <Rays x={540} y={280} size={520} delay={4} />
      <Back>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${lift}px)` }}>
          <Sticker code="1f680" x={540} y={280} size={310} delay={2} rot={-10} />
        </div>
      </Back>
      <Sticker code="23f3" x={190} y={440} size={130} delay={12} rot={-10} />
      <Label text="الكونسبت 🔥" delay={6} />
    </>
  );
};

const NotNormal: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 2.3) * interpolate(frame, [0, 16], [14, 3], { extrapolateRight: "clamp" });
  return (
    <>
      <Rays x={540} y={280} size={600} color="255,90,40" />
      <Back>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
          <Sticker code="1f525" x={540} y={280} size={340} />
        </div>
      </Back>
      <Sticker code="1f4a5" x={180} y={430} size={140} delay={12} rot={-12} />
      <Sticker code="1f929" x={900} y={430} size={140} delay={sec(29.39 - 28.45) + 14} rot={12} />
      <Label text="ماشي نورمال 🤯" bg={`linear-gradient(135deg, #FF5A36, ${RED})`} color="white" delay={6} shake />
    </>
  );
};

const Ending: React.FC = () => null;

/* Instagram follow card (real profile screenshot), scaled to fit above the head */
const FollowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clickAt = sec(26.25 - 25.45);
  const clicked = frame >= clickAt;
  const enter = usePop(1, 13);
  const press = spring({ frame: frame - clickAt, fps, config: { damping: 9, stiffness: 320 } });
  const btnScale = clicked ? interpolate(press, [0, 0.4, 1], [1, 0.9, 1]) : 1;
  const handIn = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 150 } });
  const handOut = interpolate(frame, [clickAt + 8, clickAt + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tap = interpolate(frame - clickAt, [-4, 0, 4], [1, 0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const handX = interpolate(handIn, [0, 1], [1150, 600]) + handOut * 600;
  const handY = interpolate(handIn, [0, 1], [900, 470]) + handOut * 300;
  const ripple = interpolate(frame - clickAt, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (useLayer() !== "back") return null;
  return (
    <div style={{ position: "absolute", inset: 0, transform: "scale(0.72)", transformOrigin: "540px 20px" }}>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 30,
          width: 900,
          height: 488,
          background: "#0F1116",
          border: "2px solid #262A30",
          borderRadius: 44,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - enter) * -260}px) scale(${0.85 + enter * 0.15})`,
          opacity: Math.min(1, enter * 1.4),
          padding: "26px 30px",
          boxSizing: "border-box",
        }}
      >
        <Img src={staticFile("profile_shot.png")} style={{ width: "100%", display: "block", borderRadius: 18 }} />
        <div
          style={{
            position: "relative",
            marginTop: 16,
            height: 84,
            borderRadius: 20,
            background: clicked ? "#363636" : "#0095F6",
            color: "white",
            fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            transform: `scale(${btnScale})`,
          }}
        >
          {clicked ? "Following ✓" : "Follow"}
          <div
            style={{
              position: "absolute",
              left: 420 - 400 * ripple,
              top: 42 - 400 * ripple,
              width: 800 * ripple,
              height: 800 * ripple,
              borderRadius: 999,
              background: "rgba(0,149,246,0.35)",
              opacity: 1 - ripple,
            }}
          />
        </div>
      </div>
      {clicked &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const d = frame - clickAt - 3 - i * 2;
          if (d < 0) return null;
          const prog = d / 30;
          return (
            <Img
              key={i}
              src={staticFile("img/2764.svg")}
              style={{
                position: "absolute",
                left: 950 + Math.sin(i * 2.1) * 50 * prog + (i % 2) * 30,
                top: 470 - prog * 420,
                width: 70 + (i % 3) * 20,
                height: 70 + (i % 3) * 20,
                opacity: interpolate(prog, [0, 0.2, 1], [0, 1, 0], { extrapolateRight: "clamp" }),
                transform: `rotate(${(i - 2.5) * 12}deg) scale(${Math.min(1, prog * 5)})`,
              }}
            />
          );
        })}
      <Img
        src={staticFile("img/1f446.svg")}
        style={{
          position: "absolute",
          left: handX,
          top: handY,
          width: 170,
          height: 170,
          transform: `scale(${tap}) rotate(-20deg)`,
          filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))",
          opacity: frame >= 6 ? 1 : 0,
        }}
      />
    </div>
  );
};

const ShareFriends: React.FC = () => <ShareScene />;
const ShareStory: React.FC = () => <ShareScene story />;

const SCENE_COMPONENTS: Record<Scene2["kind"], React.FC> = {
  bac2027: Bac2027,
  trust: Trust,
  hundred: Hundred,
  secret: Secret,
  hush: Hush,
  share: ShareFriends,
  tawfiq: Tawfiq,
  students: Students,
  concept: Concept,
  follow: FollowScene,
  story: ShareStory,
  notnormal: NotNormal,
  ending: Ending,
};

const SceneOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.9 + o * 0.1})` }}>{children}</AbsoluteFill>;
};

const SceneLayer: React.FC<{ layer: Layer }> = ({ layer }) => (
  <LayerCtx.Provider value={layer}>
    {SCENES2.map((s) => {
      const C = SCENE_COMPONENTS[s.kind];
      const from = s.gfxStart ?? s.start;
      const dur = sec(s.end - from);
      return (
        <Sequence key={s.kind} from={sec(from)} durationInFrames={dur} layout="none">
          <SceneOut dur={dur}>
            <C />
          </SceneOut>
        </Sequence>
      );
    })}
  </LayerCtx.Provider>
);

/* ---------------- B-roll cutaways ---------------- */
const BrollView: React.FC<{ b: Broll; last: boolean }> = ({ b, last }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = sec(b.end - b.start);
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const exit = last ? 0 : interpolate(frame, [dur - 7, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = (1 - enter) * 1080 - exit * 1080;
  const kb = interpolate(frame, [0, dur], [1.0, 1.1]);
  const tagPop = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #FFFBF2 0%, #FCE8BF 55%, #F6C76A 100%)" }} />
      <div style={{ position: "absolute", width: 720, height: 720, borderRadius: 999, background: "rgba(255,138,0,0.12)", left: -280 + frame * 2, top: 150 }} />
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: 999, background: "rgba(255,255,255,0.55)", right: -180 - frame * 1.5, top: 980 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile(`v2/broll/${b.img}.svg`)}
          style={{ width: 880, height: 880, objectFit: "contain", marginTop: -140, transform: `scale(${kb})`, filter: "drop-shadow(0 30px 40px rgba(150,80,0,0.25))" }}
        />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 70,
            color: "#1B1205",
            background: GOLD_GRAD,
            padding: "4px 44px 14px",
            borderRadius: 999,
            border: "4px solid white",
            boxShadow: "0 12px 0 #B35A00",
            transform: `scale(${tagPop})`,
          }}
        >
          {b.tag}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "rgba(255,255,255,0.25)" }}>
      <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: GOLD_GRAD }} />
    </div>
  );
};

export const Montage2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <BackgroundVideo />
    <SceneLayer layer="back" />
    <SpeakerCutout />
    <Shade />
    <SceneLayer layer="front" />
    <CutFlash />
    {BROLLS2.map((b, i) => (
      <Sequence key={b.img} from={sec(b.start)} durationInFrames={sec(b.end - b.start)} layout="none">
        <BrollView b={b} last={i === BROLLS2.length - 1} />
      </Sequence>
    ))}
    {CAPTIONS2.map((c, i) => (
      <Sequence key={i} from={sec(c.start)} durationInFrames={Math.max(1, sec(c.end - c.start))} layout="none">
        <CaptionLegend cap={c} />
      </Sequence>
    ))}
    <Audio src={staticFile("v2/voice.wav")} />
    {SFX2.map((s, i) => (
      <Sequence key={`sfx-${i}`} from={Math.max(0, sec(s.at))} layout="none">
        <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume * SFX_GAIN} />
      </Sequence>
    ))}
    <Progress />
  </AbsoluteFill>
);
