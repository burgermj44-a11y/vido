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
import { BROLLS, CAPTIONS, SCENES, SFX, Broll, Caption, Scene } from "./script";
import { FONT, loadFonts } from "./fonts";

export const FPS = 24;
export const DURATION_SEC = 23.08;

loadFonts();

const YELLOW = "#FFD400";
// highlight colour picked from the rose/red wall behind the speaker
const ACCENT = "#E63E62";
const RED = "#FF2E4D";
const sec = (s: number) => Math.round(s * FPS);
const icon = (code: string) => staticFile(`img/${code}.svg`);
// effects stay well under the voice
const SFX_GAIN = 0.6;
const pad4 = (n: number) => String(n).padStart(4, "0");

/* ---------------- depth layers ----------------
 * Graphics are drawn on the "back" layer, between the wall and the speaker.
 * Text labels are drawn on the "front" layer so they stay readable.
 */
type Layer = "back" | "front";
const LayerCtx = createContext<Layer>("back");
const useLayer = () => useContext(LayerCtx);

/* ---------------- shared zoom (punch-in per scene) ---------------- */

const useZoom = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  let idx = SCENES.findIndex((s) => t >= s.start && t < s.end);
  if (idx < 0) idx = SCENES.length - 1;
  const scene = SCENES[idx];
  const prevZoom = idx > 0 ? SCENES[idx - 1].zoom : scene.zoom;
  const local = frame - sec(scene.start);
  const snap = spring({ frame: local, fps, config: { damping: 18, stiffness: 220 } });
  const drift = interpolate(local, [0, sec(scene.end - scene.start)], [0, 0.035], {
    extrapolateRight: "clamp",
  });
  return interpolate(snap, [0, 1], [prevZoom, scene.zoom]) + drift;
};

const videoStyle = (zoom: number): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transform: `scale(${zoom})`,
  transformOrigin: "50% 38%",
  filter: "saturate(1.12) contrast(1.06)",
});

const BackgroundVideo: React.FC = () => {
  const zoom = useZoom();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("source.mp4")} muted style={videoStyle(zoom)} />
    </AbsoluteFill>
  );
};

/* The speaker cut out with a per-frame matte, drawn above the graphics. */
const SpeakerCutout: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = useZoom();
  const matte = `url(${staticFile(`matte/${pad4(frame)}.jpg`)})`;
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
        <OffthreadVideo
          src={staticFile("source.mp4")}
          muted
          style={{ ...videoStyle(1), transform: "none" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- quick white flash on every cut ---------------- */

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const s of SCENES.slice(1)) {
    const d = frame - sec(s.start);
    if (d >= 0 && d < 5) opacity = interpolate(d, [0, 4], [0.4, 0]);
  }
  return <AbsoluteFill style={{ backgroundColor: "white", opacity }} />;
};

const Shade: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)",
      }}
    />
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)" }}
    />
  </>
);

/* ---------------- animated captions ---------------- */

const CaptionView: React.FC<{ cap: Caption }> = ({ cap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = cap.text.split(" ");
  const total = sec(cap.end - cap.start);
  const step = Math.max(2, Math.min(5, Math.floor((total * 0.5) / words.length)));
  const out = interpolate(frame, [total - 3, total], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1350,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "4px 18px",
          opacity: out,
        }}
      >
        {words.map((w, i) => {
          const s = spring({
            frame: frame - i * step,
            fps,
            config: { damping: 11, stiffness: 260, mass: 0.6 },
          });
          const isHl = cap.hl?.includes(w);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: isHl ? 86 : 78,
                lineHeight: 1.3,
                color: "white",
                background: isHl ? ACCENT : "transparent",
                borderRadius: 18,
                padding: isHl ? "0 18px" : 0,
                WebkitTextStroke: isHl ? "0" : "3px #000",
                paintOrder: "stroke fill",
                textShadow: isHl ? "none" : "0 6px 0 rgba(0,0,0,0.5)",
                boxShadow: isHl ? "0 8px 0 rgba(120,10,35,0.55)" : "none",
                transform: `scale(${s}) translateY(${(1 - s) * 30}px) rotate(${isHl ? -2 : 0}deg)`,
                opacity: Math.min(1, s * 1.5),
                display: "inline-block",
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

/* ---------------- reusable graphic pieces ---------------- */

const usePop = (delay = 0, damping = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 200, mass: 0.7 } });
};

const Back: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  useLayer() === "back" ? <>{children}</> : null;

const Sticker: React.FC<{
  code: string;
  x: number;
  y: number;
  size: number;
  delay?: number;
  rot?: number;
}> = ({ code, x, y, size, delay = 0, rot = 0 }) => {
  const frame = useCurrentFrame();
  const p = usePop(delay);
  if (useLayer() !== "back") return null;
  const float = Math.sin((frame + delay * 7) / 9) * 10;
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
        filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.45))",
      }}
    />
  );
};

const Label: React.FC<{
  text: string;
  y: number;
  bg?: string;
  color?: string;
  size?: number;
  delay?: number;
}> = ({ text, y, bg = "white", color = "#111", size = 64, delay = 0 }) => {
  const p = usePop(delay, 12);
  if (useLayer() !== "front") return null;
  return (
    <div
      dir="rtl"
      style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color,
          background: bg,
          padding: "2px 36px 10px",
          borderRadius: 26,
          boxShadow: "0 10px 0 rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.35)",
          transform: `scale(${p}) rotate(${(1 - p) * 8 - 1.5}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------------- scenes (graphics that follow the speech) ----------------
 * The speaker's head starts around y=520, so the main graphic of each scene
 * sits just above it and slides behind the head for a depth effect.
 */

const GradeCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(1, 9);
  const count = Math.round(
    interpolate(frame, [4, 28], [0, 12], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
  );
  return (
    <>
      <Back>
        <div
          style={{
            position: "absolute",
            left: 540 - 240,
            top: 200,
            width: 480,
            height: 400,
            background: "#FFFDF4",
            borderRadius: 40,
            border: "8px solid #111",
            boxShadow: "0 18px 0 #111",
            transform: `scale(${p}) rotate(${-4 + (1 - p) * 20}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 18,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 50, color: "#555", marginBottom: -24 }} dir="rtl">
            المعدل
          </div>
          <div style={{ fontFamily: FONT, fontSize: 180, color: "#18A558", lineHeight: 1.05 }}>
            {count}
            <span style={{ fontSize: 86, color: "#111" }}>/20</span>
          </div>
        </div>
      </Back>
      <Sticker code="1f393" x={830} y={230} size={180} delay={10} rot={14} />
      <Sticker code="2705" x={210} y={560} size={130} delay={20} rot={-10} />
    </>
  );
};

const BooksScene: React.FC = () => (
  <>
    <Sticker code="1f4da" x={540} y={420} size={330} />
    <Sticker code="270d" x={220} y={520} size={150} delay={8} rot={-12} />
    <Sticker code="1f4c8" x={860} y={500} size={160} delay={14} rot={10} />
    <Label text="ضامن 12 من البداية" y={110} bg={YELLOW} delay={10} />
  </>
);

const Bulb: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const p = usePop(6 + i * 9, 9);
  if (useLayer() !== "back") return null;
  const glow = 0.5 + 0.5 * Math.sin((frame - i * 6) / 4);
  const lift = i === 1 ? 0 : 70;
  return (
    <div
      style={{
        position: "absolute",
        left: 210 + i * 330 - 130,
        top: 250 + lift,
        width: 260,
        height: 260,
        borderRadius: 999,
        background: `radial-gradient(circle, rgba(255,212,0,${0.6 * glow}) 0%, rgba(255,212,0,0) 70%)`,
        transform: `scale(${p})`,
      }}
    >
      <Img src={icon("1f4a1")} style={{ width: 200, height: 200, margin: 30 }} />
      <div
        style={{
          position: "absolute",
          right: 14,
          bottom: 6,
          width: 84,
          height: 84,
          borderRadius: 999,
          background: ACCENT,
          color: "white",
          fontFamily: FONT,
          fontSize: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "5px solid white",
        }}
      >
        {i + 1}
      </div>
    </div>
  );
};

const TipsScene: React.FC = () => (
  <>
    {[0, 1, 2].map((i) => (
      <Bulb key={i} i={i} />
    ))}
    <Label text="3 نصائح ذهبية" y={110} bg={ACCENT} color="white" delay={4} />
  </>
);

const WarningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shake =
    Math.sin(frame * 1.9) * interpolate(frame, [0, 20], [16, 3], { extrapolateRight: "clamp" });
  return (
    <>
      <Back>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
          <Sticker code="26a0" x={540} y={360} size={330} />
        </div>
      </Back>
      <Label text="انتبه!" y={110} bg={RED} color="white" size={74} delay={4} />
    </>
  );
};

const IG_FONT = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';


/* Instagram-style "follow" animation: profile card, a hand taps Follow. */
const FollowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clickAt = sec(13.5 - 11.4);
  const clicked = frame >= clickAt;
  const enter = usePop(1, 13);
  const press = spring({ frame: frame - clickAt, fps, config: { damping: 9, stiffness: 320 } });
  const btnScale = clicked ? interpolate(press, [0, 0.4, 1], [1, 0.9, 1]) : 1;

  // hand moves in, taps the button, then leaves
  const handIn = spring({ frame: frame - 30, fps, config: { damping: 16, stiffness: 120 } });
  const handOut = interpolate(frame, [clickAt + 10, clickAt + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tap = interpolate(frame - clickAt, [-4, 0, 4], [1, 0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handX = interpolate(handIn, [0, 1], [1150, 600]) + handOut * 600;
  const handY = interpolate(handIn, [0, 1], [900, 470]) + handOut * 300;

  // ripple + follower counter
  const ripple = interpolate(frame - clickAt, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (useLayer() !== "back") return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 60,
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
        {/* the real profile screenshot */}
        <Img
          src={staticFile("profile_shot.png")}
          style={{ width: "100%", display: "block", borderRadius: 18 }}
        />
        {/* follow button */}
        <div
          style={{
            position: "relative",
            marginTop: 16,
            height: 84,
            borderRadius: 20,
            background: clicked ? "#363636" : "#0095F6",
            color: "white",
            fontFamily: IG_FONT,
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
              left: 510 - 400 * ripple,
              top: 46 - 400 * ripple,
              width: 800 * ripple,
              height: 800 * ripple,
              borderRadius: 999,
              background: "rgba(0,149,246,0.35)",
              opacity: 1 - ripple,
            }}
          />
        </div>
      </div>
      {/* hearts burst after following */}
      {clicked &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const d = frame - clickAt - 3 - i * 2;
          if (d < 0) return null;
          const prog = d / 30;
          const x = 950 + Math.sin(i * 2.1) * 50 * prog + (i % 2) * 30;
          const y = 470 - prog * 420;
          return (
            <Img
              key={i}
              src={icon("2764")}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 70 + (i % 3) * 20,
                height: 70 + (i % 3) * 20,
                opacity: interpolate(prog, [0, 0.2, 1], [0, 1, 0], { extrapolateRight: "clamp" }),
                transform: `rotate(${(i - 2.5) * 12}deg) scale(${Math.min(1, prog * 5)})`,
              }}
            />
          );
        })}
      {/* tapping hand */}
      <Img
        src={icon("1f446")}
        style={{
          position: "absolute",
          left: handX,
          top: handY,
          width: 170,
          height: 170,
          transform: `scale(${tap}) rotate(-20deg)`,
          filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))",
          opacity: frame >= 30 ? 1 : 0,
        }}
      />
    </>
  );
};

const NumberBadge: React.FC = () => {
  const p = usePop(2, 8);
  if (useLayer() !== "front") return null;
  return (
    <div style={{ position: "absolute", top: 100, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontSize: 76,
          color: "white",
          background: `linear-gradient(135deg, ${ACCENT}, #8E2DE2)`,
          padding: "6px 46px 18px",
          borderRadius: 36,
          border: "6px solid white",
          boxShadow: "0 14px 0 rgba(0,0,0,0.3)",
          transform: `scale(${p}) rotate(${(1 - p) * -25 + 2}deg)`,
        }}
      >
        النصيحة رقم 1
      </div>
    </div>
  );
};

const Tip1Scene: React.FC = () => (
  <>
    <NumberBadge />
    <Sticker code="1f525" x={540} y={430} size={280} delay={8} />
    <Sticker code="1f9e0" x={220} y={520} size={150} delay={20} rot={-12} />
    <Sticker code="2b50" x={860} y={500} size={150} delay={26} rot={12} />
    <Label text="مهمة بزاف" y={270} bg={YELLOW} size={60} delay={sec(16.6 - 14.72)} />
  </>
);

const GoalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hitAt = 22;
  const fly = spring({ frame: frame - 6, fps, config: { damping: 200 }, durationInFrames: hitAt - 6 });
  const boom = spring({ frame: frame - hitAt, fps, config: { damping: 7, stiffness: 260 } });
  return (
    <>
      <Sticker code="1f3af" x={540} y={400} size={330} />
      <Back>
        <Img
          src={icon("1f680")}
          style={{
            position: "absolute",
            width: 150,
            height: 150,
            left: interpolate(fly, [0, 1], [-160, 390]),
            top: interpolate(fly, [0, 1], [700, 330]),
            opacity: frame < hitAt + 2 ? 1 : 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 540 - 240,
            top: 400 - 240,
            width: 480,
            height: 480,
            borderRadius: 999,
            border: `12px solid ${YELLOW}`,
            opacity: frame >= hitAt ? interpolate(boom, [0, 1], [1, 0]) : 0,
            transform: `scale(${0.4 + boom * 0.9})`,
          }}
        />
      </Back>
      <Sticker code="1f3c6" x={880} y={540} size={160} delay={hitAt + 4} rot={12} />
      <Label text="حدد هدفك" y={110} bg="white" delay={hitAt + 6} />
    </>
  );
};

const SCENE_COMPONENTS: Record<Scene["kind"], React.FC> = {
  grade: GradeCard,
  books: BooksScene,
  tips: TipsScene,
  warning: WarningScene,
  subscribe: FollowScene,
  tip1: Tip1Scene,
  goal: GoalScene,
};

const SceneOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 4, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.9 + o * 0.1})` }}>{children}</AbsoluteFill>;
};

const SceneLayer: React.FC<{ layer: Layer }> = ({ layer }) => (
  <LayerCtx.Provider value={layer}>
    {SCENES.map((s) => {
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

const BrollView: React.FC<{ b: Broll }> = ({ b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = sec(b.end - b.start);
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const exit = interpolate(frame, [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = (1 - enter) * 1080 - exit * 1080;
  const kb = interpolate(frame, [0, dur], [1.0, 1.1]);
  const tagPop = spring({ frame: frame - 4, fps, config: { damping: 10, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)` }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 40%, #FFF7F9 0%, #FBD3DD 55%, #F29BB0 100%)",
        }}
      />
      {/* soft decorative blobs */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: 999,
          background: "rgba(230,62,98,0.12)",
          left: -260 + frame * 2,
          top: 160,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 520,
          height: 520,
          borderRadius: 999,
          background: "rgba(255,255,255,0.5)",
          right: -180 - frame * 1.5,
          top: 980,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Img
          src={staticFile(`broll/${b.img}.svg`)}
          style={{
            width: 860,
            height: 860,
            objectFit: "contain",
            marginTop: -140,
            transform: `scale(${kb})`,
            filter: "drop-shadow(0 30px 40px rgba(120,10,35,0.25))",
          }}
        />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 70,
            color: "white",
            background: ACCENT,
            padding: "4px 44px 14px",
            borderRadius: 999,
            boxShadow: "0 12px 0 rgba(120,10,35,0.45)",
            transform: `scale(${tagPop})`,
          }}
        >
          {b.tag}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- progress bar ---------------- */

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: "rgba(255,255,255,0.25)" }}>
      <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: ACCENT }} />
    </div>
  );
};

/* ---------------- main ---------------- */

export const Montage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BackgroundVideo />
      <SceneLayer layer="back" />
      <SpeakerCutout />
      <Shade />
      <SceneLayer layer="front" />
      <CutFlash />
      {BROLLS.map((b) => (
        <Sequence key={b.img} from={sec(b.start)} durationInFrames={sec(b.end - b.start)} layout="none">
          <BrollView b={b} />
        </Sequence>
      ))}
      {CAPTIONS.map((c, i) => (
        <Sequence key={i} from={sec(c.start)} durationInFrames={sec(c.end - c.start)} layout="none">
          <CaptionView cap={c} />
        </Sequence>
      ))}
      <Audio src={staticFile("voice.wav")} />
      {SFX.map((s, i) => (
        <Sequence key={`sfx-${i}`} from={Math.max(0, sec(s.at))} layout="none">
          <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.volume * SFX_GAIN} />
        </Sequence>
      ))}
      <Progress />
    </AbsoluteFill>
  );
};
