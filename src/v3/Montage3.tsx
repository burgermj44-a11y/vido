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
import type { Caption } from "../script";
import { FONT, loadFonts } from "../fonts";
import { CAPTIONS3, COLLAGE3, DURATION3, END_START3, FPS3, SCENES3, SFX3, SHOP, SHOTS3, SPEECH_END3, Scene3, Shot } from "./script3";

loadFonts();

/* palette: burger mustard + ketchup red, pops on the white/purple shop */
const GOLD = "#FFC72C";
const ORANGE = "#FF5A1F";
const GOLD_GRAD = `linear-gradient(135deg, #FFE066 0%, ${GOLD} 45%, ${ORANGE} 100%)`;
const KETCHUP = "#D7261E";
const SFX_GAIN = 0.6;

const sec = (s: number) => Math.round(s * FPS3);
const icon = (code: string) => staticFile(`v3/img/${code}.svg`);
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
  let idx = SCENES3.findIndex((s) => t >= s.start && t < s.end);
  if (idx < 0) idx = SCENES3.length - 1;
  const scene = SCENES3[idx];
  const prev = idx > 0 ? SCENES3[idx - 1].zoom : scene.zoom;
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
      <OffthreadVideo src={staticFile("v3/source.mp4")} muted style={videoStyle(zoom)} />
    </AbsoluteFill>
  );
};

const SpeakerCutout: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = useZoom();
  const matte = `url(${staticFile(`v3/matte/${pad4(Math.min(frame, 762))}.jpg`)})`;
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
        <OffthreadVideo src={staticFile("v3/source.mp4")} muted style={{ ...videoStyle(1), transform: "none" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const s of SCENES3.slice(1)) {
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
          gap: "6px 32px",
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
                  boxShadow: `0 8px 0 #9E1B12, 0 14px 30px rgba(255,90,30,${active ? 0.65 : 0.35})`,
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
                  ? `0 0 22px rgba(255,200,40,0.9), 0 7px 0 rgba(0,0,0,0.6)`
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


/* the real MJ Burger logo (cut out from its background) */
const BrandCard: React.FC<{ y?: number; scale?: number; delay?: number }> = ({ y = 40, scale = 1, delay = 1 }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay, 9);
  const h = 430 * scale;
  return (
    <Img
      src={staticFile("v3/logo.png")}
      style={{
        position: "absolute",
        left: 540 - (h * 562) / 637 / 2,
        top: y + Math.sin(frame / 12) * 6,
        height: h,
        transform: `scale(${p}) rotate(${(1 - p) * -14}deg)`,
        filter: "drop-shadow(0 18px 26px rgba(0,0,0,0.5))",
      }}
    />
  );
};

const Intro: React.FC = () => (
  <>
    <Back>
      <BrandCard />
    </Back>
    <Sticker code="1f4cd" x={170} y={470} size={140} delay={12} rot={-10} />
    <Sticker code="1f35f" x={910} y={470} size={140} delay={18} rot={10} />
    <Label text={`📍 ${SHOP.city}`} y={500} delay={10} size={48} />
  </>
);

const MenuTease: React.FC = () => (
  <>
    <Rays x={540} y={280} size={560} color="255,200,40" />
    <Sticker code="1f354" x={540} y={270} size={300} delay={3} />
    <Sticker code="1f96a" x={190} y={430} size={150} delay={8} rot={-10} />
    <Sticker code="1f32f" x={890} y={430} size={150} delay={12} rot={10} />
    <Label text="📋 المينيو" delay={8} />
  </>
);

const Look: React.FC = () => (
  <>
    <Sticker code="26bd" x={880} y={440} size={140} delay={3} rot={10} />
  </>
);

/* the Ronaldo joke: whistle, crowd, SIUUU, then the laugh */
const Siuuu: React.FC = () => {
  const frame = useCurrentFrame();
  const big = usePop(10, 7);
  const laughAt = 30;
  const bounce = Math.abs(Math.sin(frame / 5)) * -70;
  const shake = frame < laughAt ? Math.sin(frame * 2.2) * interpolate(frame, [10, 26], [10, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const layer = useLayer();
  return (
    <>
      <Rays x={540} y={270} size={700} color="255,200,40" />
      {layer === "back" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 120,
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 190,
              lineHeight: 1,
              letterSpacing: 4,
              background: GOLD_GRAD,
              WebkitBackgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 10px 0 #8E1410) drop-shadow(0 20px 30px rgba(0,0,0,0.4))",
              transform: `translateX(${shake}px) scale(${big}) rotate(-5deg)`,
            }}
          >
            SIUUU
          </div>
          <Img
            src={icon("26bd")}
            style={{ position: "absolute", left: 120, top: 380 + bounce, width: 150, height: 150, transform: `rotate(${frame * 12}deg)` }}
          />
        </>
      )}
      <Sticker code="1f410" x={910} y={450} size={150} delay={14} rot={10} />
      <Sticker code="1f923" x={870} y={180} size={150} delay={laughAt} rot={14} />
      <Label text="رونالدو تاع الشلف 😂" delay={laughAt + 4} bg={`linear-gradient(135deg, #FF5A36, ${KETCHUP})`} color="white" />
    </>
  );
};

const Best: React.FC = () => (
  <>
    <Rays x={540} y={280} size={560} />
    <Sticker code="1f3c6" x={540} y={270} size={310} delay={2} />
    <Sticker code="1f4cd" x={190} y={440} size={130} delay={10} rot={-10} />
    <Sticker code="1f525" x={890} y={440} size={130} delay={14} rot={10} />
    <Label text="الأفضل في الشلف 🏆" delay={6} />
  </>
);

const Quality: React.FC = () => {
  const frame = useCurrentFrame();
  const layer = useLayer();
  return (
    <>
      {layer === "back" &&
        [0, 1, 2, 3, 4].map((i) => {
          const p = spring({ frame: frame - 4 - i * 3, fps: FPS3, config: { damping: 9, stiffness: 240 } });
          const x = 540 + (i - 2) * 175;
          const y = 260 + Math.abs(i - 2) * 30;
          return (
            <Img
              key={i}
              src={icon("2b50")}
              style={{ position: "absolute", left: x - 80, top: y - 80, width: 160, height: 160, transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`, filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.35))" }}
            />
          );
        })}
      <Sticker code="1f60b" x={180} y={470} size={140} delay={22} rot={-10} />
      <Sticker code="1f4af" x={900} y={470} size={140} delay={22} rot={10} />
      <Label text="الجودة والبنّة 😋" delay={8} />
    </>
  );
};

const Welcome: React.FC = () => (
  <>
    <Back>
      <BrandCard y={40} scale={0.95} delay={1} />
    </Back>
    <Sticker code="1f917" x={180} y={450} size={150} delay={8} rot={-10} />
    <Sticker code="1f389" x={900} y={450} size={150} delay={14} rot={10} />
    <Label text="مرحبا بيكم 🤗" y={500} delay={6} size={50} />
  </>
);

const Chefs: React.FC = () => (
  <>
    <Rays x={540} y={280} size={520} />
    <Sticker code="1f468-200d-1f373" x={540} y={270} size={300} delay={2} />
    <Sticker code="26bd" x={190} y={440} size={130} delay={10} rot={-10} />
    <Sticker code="1f354" x={890} y={440} size={140} delay={14} rot={10} />
    <Label text="في الخدمة 👨‍🍳" delay={6} />
  </>
);

const None: React.FC = () => null;

const SCENE_COMPONENTS: Record<Scene3["kind"], React.FC> = {
  intro: Intro,
  menuTease: MenuTease,
  look: Look,
  siuuu: Siuuu,
  best: Best,
  quality: Quality,
  menu: None,
  welcome: Welcome,
  chefs: Chefs,
};

const SceneOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.9 + o * 0.1})` }}>{children}</AbsoluteFill>;
};

const SceneLayer: React.FC<{ layer: Layer }> = ({ layer }) => (
  <LayerCtx.Provider value={layer}>
    {SCENES3.map((s) => {
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

/* ---------------- product showcase (real food photos / clips) ---------------- */

const Tag: React.FC<{ text: string; delay?: number }> = ({ text, delay = 5 }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - delay, fps: FPS3, config: { damping: 10, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontSize: 76,
          color: "#1B1205",
          background: GOLD_GRAD,
          padding: "4px 46px 14px",
          borderRadius: 999,
          border: "5px solid white",
          boxShadow: "0 12px 0 #9E1B12, 0 20px 40px rgba(0,0,0,0.4)",
          transform: `scale(${p}) rotate(-2deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = sec(s.end - s.start);
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 200 } });
  const kb = interpolate(frame, [0, dur], [1.04, 1.14]);
  const tilt = (1 - enter) * 8;

  let media: React.ReactNode = null;
  let bg: React.ReactNode = null;
  if (s.kind === "image") {
    bg = <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.55) saturate(1.3)", transform: "scale(1.2)" }} />;
    media = <Img src={staticFile(s.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb})` }} />;
  } else if (s.kind === "video") {
    const start = Math.round((s.from ?? 0) * fps);
    bg = <OffthreadVideo src={staticFile(s.src)} muted startFrom={start} playbackRate={s.rate ?? 1} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.55) saturate(1.3)", transform: "scale(1.2)" }} />;
    media = <OffthreadVideo src={staticFile(s.src)} muted startFrom={start} playbackRate={s.rate ?? 1} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${kb})` }} />;
  } else {
    bg = <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #3A0B08, #120403)` }} />;
    media = (
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 14, padding: 14, boxSizing: "border-box" }}>
        {COLLAGE3.map((src, i) => {
          const p = spring({ frame: frame - 3 - i * 4, fps, config: { damping: 11, stiffness: 220 } });
          return (
            <div key={src} style={{ borderRadius: 26, overflow: "hidden", transform: `scale(${p}) rotate(${(i % 2 ? 2 : -2) * (1 - p) * 4}deg)`, boxShadow: "0 12px 26px rgba(0,0,0,0.5)", border: `4px solid ${GOLD}` }}>
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + frame * 0.002})` }} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ transform: `translateX(${(1 - enter) * 1080}px)` }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>{bg}</AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 280,
          height: 1000,
          borderRadius: 48,
          overflow: "hidden",
          border: `6px solid ${s.kind === "collage" ? "transparent" : "white"}`,
          boxShadow: s.kind === "collage" ? "none" : "0 30px 60px rgba(0,0,0,0.55)",
          transform: `rotate(${tilt}deg)`,
        }}
      >
        {media}
      </div>
      <Tag text={s.tag} />
    </AbsoluteFill>
  );
};

/* ---------------- end card: shop, address, phone ---------------- */

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 180 } });
  const row = (d: number) => spring({ frame: frame - d, fps, config: { damping: 11, stiffness: 220 } });
  const ring = Math.sin(frame * 1.6) * interpolate((frame - 32) % 40, [0, 16], [16, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - enter) * 1920}px)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #6B3218 0%, #3A1709 55%, #160703 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.45, mixBlendMode: "overlay" }}>
        <Img src={staticFile("v3/leather.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.18 }}>
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, transform: `translateY(${-frame * 1.5}px)` }}>
          {[...COLLAGE3, ...COLLAGE3, ...COLLAGE3].map((src, i) => (
            <Img key={i} src={staticFile(src)} style={{ width: "100%", height: 420, objectFit: "cover" }} />
          ))}
        </div>
      </AbsoluteFill>
      <Rays x={540} y={400} size={950} color="255,200,90" />
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Img
          src={staticFile("v3/logo.png")}
          style={{
            height: 560,
            marginTop: -110,
            transform: `scale(${row(2)}) rotate(${Math.sin(frame / 10) * 2}deg)`,
            filter: "drop-shadow(0 22px 30px rgba(0,0,0,0.6))",
          }}
        />
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 62, color: "white", marginTop: 6, transform: `scale(${row(10)})` }}>
          أحسن بنّة في {SHOP.city} 🔥
        </div>
      </div>
      <div style={{ position: "absolute", top: 860, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 28 }}>
        {[
          { code: "1f4cd", text: `${SHOP.address} – ${SHOP.city}`, d: 16 },
          { code: "1f4de", text: SHOP.phone, d: 24 },
        ].map((r) => (
          <div
            key={r.code}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 34,
              padding: "18px 34px",
              boxShadow: "0 12px 0 rgba(0,0,0,0.25)",
              transform: `translateX(${(1 - row(r.d)) * -900}px)`,
            }}
          >
            <Img src={icon(r.code)} style={{ width: 96, height: 96, transform: r.code === "1f4de" ? `rotate(${ring}deg)` : "none" }} />
            <div style={{ fontFamily: FONT, fontSize: 70, color: "#3A1709", letterSpacing: r.code === "1f4de" ? 4 : 0 }} dir="rtl">
              {r.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1180, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 72,
            color: "#1B1205",
            background: GOLD_GRAD,
            padding: "6px 60px 16px",
            borderRadius: 999,
            border: "5px solid white",
            boxShadow: "0 12px 0 #3A1709",
            transform: `scale(${row(32) * (1 + Math.sin(frame / 6) * 0.03)})`,
          }}
        >
          اطلب دركا! 🛵
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

const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [sec(END_START3) - 6, sec(END_START3)], [0.95, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p = spring({ frame: frame - 10, fps: FPS3, config: { damping: 12, stiffness: 160 } });
  return (
    <Img
      src={staticFile("v3/logo.png")}
      style={{ position: "absolute", right: 28, top: 30, height: 130, opacity: o * p, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}
    />
  );
};

const sfxSrc = (file: string) => (file.startsWith("v3/") ? `v3/sfx/${file.slice(3)}.wav` : `sfx/${file}.wav`);

export const Montage3: React.FC = () => {
  const endFrom = sec(END_START3);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundVideo />
      <SceneLayer layer="back" />
      <SpeakerCutout />
      <Shade />
      <SceneLayer layer="front" />
      <CutFlash />
      {SHOTS3.map((s) => (
        <Sequence key={`${s.start}`} from={sec(s.start)} durationInFrames={sec(s.end - s.start)} layout="none">
          <ShotView s={s} />
        </Sequence>
      ))}
      <Sequence from={endFrom} layout="none">
        <EndCard />
      </Sequence>
      {CAPTIONS3.map((c, i) => (
        <Sequence key={i} from={sec(c.start)} durationInFrames={Math.max(1, sec(c.end - c.start))} layout="none">
          <CaptionLegend cap={c} />
        </Sequence>
      ))}
      <Audio src={staticFile("v3/voice.wav")} />
      {/* background beat: quiet under the voice, rises on the end card */}
      <Audio
        src={staticFile("v3/sfx/beat.wav")}
        volume={(f) =>
          interpolate(f, [0, sec(SPEECH_END3) - 6, sec(SPEECH_END3), sec(DURATION3)], [0.1, 0.1, 0.35, 0.35], {
            extrapolateRight: "clamp",
          })
        }
      />
      {SFX3.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={Math.max(0, sec(s.at))} layout="none">
          <Audio src={staticFile(sfxSrc(s.file))} volume={s.volume * SFX_GAIN} />
        </Sequence>
      ))}
      <Watermark />
      <Progress />
    </AbsoluteFill>
  );
};
