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
import { BROLLS5, CAPTIONS5, FPS5, SCENES5, SFX5, Scene5 } from "./script5";

loadFonts();

/* palette: series navy + gold, sky blue to match the jersey */
const GOLD = "#FFC93C";
const ORANGE = "#FF8A00";
const GOLD_GRAD = `linear-gradient(135deg, #FFE16A 0%, ${GOLD} 45%, ${ORANGE} 100%)`;
const RED = "#FF3B30";
const SKY = "#4FC3F7";
const NAVY = "#0B1530";
const SKY_GRAD = `linear-gradient(135deg, #8FDFFF 0%, ${SKY} 45%, #1E88E5 100%)`;
// effects kept low so they never cover the voice
const SFX_GAIN = 0.22;

const sec = (s: number) => Math.round(s * FPS5);
const icon = (code: string) => staticFile(`v5/img/${code}.svg`);
const pad4 = (n: number) => String(n).padStart(4, "0");

/* ---------------- depth layers ---------------- */
type Layer = "back" | "front";
const LayerCtx = createContext<Layer>("back");
const useLayer = () => useContext(LayerCtx);
/* ---------------- zoom shared by background + cut-out ---------------- */
const useZoom = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = SCENES5.findIndex((s) => t >= s.start && t < s.end);
  if (idx < 0) idx = SCENES5.length - 1;
  const scene = SCENES5[idx];
  const prev = idx > 0 ? SCENES5[idx - 1].zoom : scene.zoom;
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
      <OffthreadVideo src={staticFile("v5/source.mp4")} muted style={videoStyle(zoom)} />
    </AbsoluteFill>
  );
};

const SpeakerCutout: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = useZoom();
  const matte = `url(${staticFile(`v5/matte/${pad4(Math.min(frame, 956))}.jpg`)})`;
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
        <OffthreadVideo src={staticFile("v5/source.mp4")} muted style={{ ...videoStyle(1), transform: "none" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const s of SCENES5.slice(1)) {
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
          const size = solo ? 116 : isHl ? 70 : 64;
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
                WebkitTextStroke: "3px #0B0B0B",
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

/* ---------------- share animation (behind the speaker) ---------------- */
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

const SceneOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.9 + o * 0.1})` }}>{children}</AbsoluteFill>;
};


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
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #F6FCFF 0%, #CDEFFF 55%, #7FD0F5 100%)" }} />
      <div style={{ position: "absolute", width: 720, height: 720, borderRadius: 999, background: "rgba(30,136,229,0.14)", left: -280 + frame * 2, top: 150 }} />
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: 999, background: "rgba(255,255,255,0.55)", right: -180 - frame * 1.5, top: 980 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile(`v5/broll/${b.img}.svg`)}
          style={{ width: 880, height: 880, objectFit: "contain", marginTop: -140, transform: `scale(${kb})`, filter: "drop-shadow(0 30px 40px rgba(20,60,120,0.25))" }}
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


/* ---------------- scenes ---------------- */

const Dad: React.FC = () => (
  <>
    <Sticker code="1f468-200d-1f466" x={540} y={280} size={290} delay={2} />
    <Sticker code="1f4ac" x={860} y={170} size={150} delay={8} rot={10} />
    <Label text="كلام باباك 👨‍👦" delay={6} bg={SKY_GRAD} color={NAVY} />
  </>
);

const Easy: React.FC = () => (
  <>
    <Rays x={540} y={280} size={620} />
    <Sticker code="1f4c8" x={540} y={280} size={290} delay={2} />
    <Sticker code="1f60e" x={880} y={450} size={150} delay={8} rot={10} />
    <Label text="المعدل عادي 😎" delay={5} />
  </>
);

const Secret: React.FC = () => (
  <>
    <Sticker code="1f92b" x={540} y={280} size={290} delay={2} />
    <Sticker code="1f512" x={190} y={450} size={140} delay={10} rot={-10} />
    <Label text="حتى واحد ما يقولهالك" delay={6} bg={`linear-gradient(135deg, #FF6B5A, ${RED})`} color="white" />
  </>
);

const Gift: React.FC = () => (
  <>
    <Rays x={540} y={280} size={620} color="255,220,120" />
    <Sticker code="1f381" x={540} y={280} size={290} delay={2} />
    <Sticker code="2728" x={200} y={200} size={120} delay={10} rot={-10} />
    <Sticker code="2728" x={880} y={200} size={120} delay={14} rot={10} />
    <Label text="نعطيهالك أنا 🎁" delay={6} />
  </>
);

const Life: React.FC = () => (
  <>
    <Rays x={540} y={280} size={620} color="255,220,120" />
    <Sticker code="1f31f" x={540} y={280} size={280} delay={2} />
    <Label text="تفيدك في حياتك 🌟" delay={5} bg={SKY_GRAD} color={NAVY} />
  </>
);

/* big numbered badge for each of the three points */
const NumberBadge: React.FC<{ n: number; delay?: number }> = ({ n, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: FPS5, config: { damping: 8, stiffness: 220 } });
  if (useLayer() !== "back") return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - 150,
        top: 120,
        width: 300,
        height: 300,
        borderRadius: 999,
        background: `radial-gradient(circle at 40% 35%, #1F3373, ${NAVY})`,
        border: `10px solid ${GOLD}`,
        boxShadow: "0 22px 50px rgba(0,0,0,0.45), inset 0 -12px 0 rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${p}) rotate(${(1 - p) * -90}deg)`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 210, lineHeight: 1, marginTop: -16, background: GOLD_GRAD, WebkitBackgroundClip: "text", color: "transparent" }}>
        {n}
      </div>
    </div>
  );
};

const Point1: React.FC = () => (
  <>
    <Rays x={540} y={270} size={640} />
    <NumberBadge n={1} />
    <Sticker code="1f3eb" x={180} y={460} size={150} delay={6} rot={-10} />
    <Sticker code="1f468-200d-1f3eb" x={900} y={460} size={150} delay={10} rot={10} />
    <Label text="من المسيد 🏫" delay={4} bg={SKY_GRAD} color={NAVY} />
  </>
);

const Point2: React.FC = () => (
  <>
    <Rays x={540} y={270} size={640} />
    <NumberBadge n={2} delay={1} />
    <Sticker code="1f3e0" x={180} y={460} size={150} delay={6} rot={-10} />
    <Sticker code="1f4da" x={900} y={460} size={150} delay={10} rot={10} />
    <Label text="المسيد وحدو ما يكفيش" delay={8} bg={`linear-gradient(135deg, #FF6B5A, ${RED})`} color="white" />
  </>
);

const Point3: React.FC = () => (
  <>
    <Rays x={540} y={270} size={640} />
    <NumberBadge n={3} delay={1} />
    <Sticker code="1f3eb" x={180} y={460} size={140} delay={6} rot={-10} />
    <Sticker code="1f3e0" x={900} y={460} size={140} delay={10} rot={10} />
    <Label text="حتى هاذو ما يكفيوش" delay={8} bg={`linear-gradient(135deg, #FF6B5A, ${RED})`} color="white" />
  </>
);

/* private lessons vs free YouTube lessons */
const LessonCard: React.FC<{ x: number; delay: number; title: string; children: React.ReactNode; color: string }> = ({ x, delay, title, children, color }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: FPS5, config: { damping: 11, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x - 170,
        top: 120,
        width: 340,
        height: 300,
        borderRadius: 36,
        background: "white",
        border: `7px solid ${color}`,
        boxShadow: "0 20px 44px rgba(0,0,0,0.4)",
        transform: `scale(${p}) rotate(${(x < 540 ? -5 : 5) * p}deg)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      {children}
      <div dir="rtl" style={{ fontFamily: FONT, fontSize: 52, color: NAVY }}>
        {title}
      </div>
    </div>
  );
};

const Lessons: React.FC = () => {
  const layer = useLayer();
  const youAt = Math.round((25.6 - 24.0) * FPS5);
  return (
    <>
      {layer === "back" && (
        <>
          <LessonCard x={300} delay={3} title="الكور" color={GOLD}>
            <Img src={icon("1f468-200d-1f3eb")} style={{ width: 150, height: 150 }} />
          </LessonCard>
          <LessonCard x={780} delay={youAt} title="يوتيوب" color="#FF0033">
            <div style={{ width: 170, height: 120, borderRadius: 34, background: "#FF0033", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="70" height="70" viewBox="0 0 24 24">
                <path d="M7 4.5v15l13-7.5z" fill="white" />
              </svg>
            </div>
          </LessonCard>
        </>
      )}
      <Sequence from={youAt} layout="none">
        <Label text="حصص مجانية ✅" y={460} delay={4} size={50} />
      </Sequence>
    </>
  );
};

/* exercise sheets fanning out */
const Series: React.FC = () => {
  const frame = useCurrentFrame();
  const layer = useLayer();
  return (
    <>
      {layer === "back" &&
        [0, 1, 2].map((i) => {
          const p = spring({ frame: frame - 4 - i * 4, fps: FPS5, config: { damping: 11, stiffness: 220 } });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 540 - 130 + (i - 1) * 150,
                top: 110 + Math.abs(i - 1) * 30,
                width: 260,
                height: 330,
                borderRadius: 18,
                background: "white",
                boxShadow: "0 16px 34px rgba(0,0,0,0.35)",
                transform: `scale(${p}) rotate(${(i - 1) * 12 * p}deg)`,
                padding: "26px 24px",
                boxSizing: "border-box",
              }}
            >
              <div dir="rtl" style={{ fontFamily: FONT, fontSize: 34, color: NAVY, marginBottom: 12 }}>
                سيري {i + 1}
              </div>
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} style={{ height: 14, borderRadius: 7, background: k === 0 ? SKY : "#DDE7F2", marginBottom: 18, width: `${90 - k * 8}%` }} />
              ))}
            </div>
          );
        })}
      <Sticker code="270d" x={880} y={470} size={140} delay={10} rot={10} />
      <Label text="السيريات 📝" delay={2} />
    </>
  );
};

/* the 17 / 20 finale */
const Seventeen: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [0, 18], [0, 17], { extrapolateRight: "clamp" }));
  const hit = spring({ frame: frame - 20, fps: FPS5, config: { damping: 7, stiffness: 260 } });
  const p = spring({ frame, fps: FPS5, config: { damping: 10, stiffness: 200 } });
  const layer = useLayer();
  return (
    <>
      <Rays x={540} y={270} size={720} color="255,200,60" />
      {layer === "back" && (
        <div
          style={{
            position: "absolute",
            left: 540 - 250,
            top: 90,
            width: 500,
            height: 340,
            borderRadius: 40,
            background: "#FFFDF4",
            border: `8px solid ${NAVY}`,
            boxShadow: `0 16px 0 ${NAVY}`,
            transform: `scale(${p * (frame >= 20 ? 1 + (1 - hit) * 0.2 : 1)}) rotate(-4deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div dir="rtl" style={{ fontFamily: FONT, fontSize: 48, color: "#555", marginBottom: -26 }}>
            المعدل
          </div>
          <div style={{ fontFamily: FONT, fontSize: 190, lineHeight: 1.05, color: "#18A558" }}>
            {n}
            <span style={{ fontSize: 86, color: NAVY }}>/20</span>
          </div>
        </div>
      )}
      <Sticker code="1f3c6" x={180} y={470} size={150} delay={22} rot={-10} />
      <Sticker code="1f389" x={900} y={470} size={150} delay={24} rot={10} />
    </>
  );
};

const ShareFriends: React.FC = () => <ShareScene />;

const SCENE_COMPONENTS: Record<Scene5["kind"], React.FC> = {
  dad: Dad,
  easy: Easy,
  secret: Secret,
  gift: Gift,
  share: ShareFriends,
  life: Life,
  point1: Point1,
  point2: Point2,
  point3: Point3,
  lessons: Lessons,
  series: Series,
  seventeen: Seventeen,
};

const SceneLayer: React.FC<{ layer: Layer }> = ({ layer }) => (
  <LayerCtx.Provider value={layer}>
    {SCENES5.map((s) => {
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

const sfxSrc = (file: string) => (file.startsWith("v5/") ? `${file}.wav` : `sfx/${file}.wav`);

export const Montage5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <BackgroundVideo />
    <SceneLayer layer="back" />
    <SpeakerCutout />
    <Shade />
    <SceneLayer layer="front" />
    <CutFlash />
    {BROLLS5.map((b) => (
      <Sequence key={b.img} from={sec(b.start)} durationInFrames={sec(b.end - b.start)} layout="none">
        <BrollView b={b} last={false} />
      </Sequence>
    ))}
    {CAPTIONS5.map((c, i) => (
      <Sequence key={i} from={sec(c.start)} durationInFrames={Math.max(1, sec(c.end - c.start))} layout="none">
        <CaptionLegend cap={c} />
      </Sequence>
    ))}
    <Audio src={staticFile("v5/voice.wav")} />
    {SFX5.map((s, i) => (
      <Sequence key={`sfx-${i}`} from={Math.max(0, sec(s.at))} layout="none">
        <Audio src={staticFile(sfxSrc(s.file))} volume={s.volume * SFX_GAIN} />
      </Sequence>
    ))}
    <Progress />
  </AbsoluteFill>
);
