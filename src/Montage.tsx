import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPTIONS, SCENES, Caption, Scene } from "./script";
import { FONT, loadFonts } from "./fonts";

export const FPS = 24;
export const DURATION_SEC = 23.08;

loadFonts();

const YELLOW = "#FFD400";
const RED = "#FF2E4D";
const sec = (s: number) => Math.round(s * FPS);
const icon = (code: string) => staticFile(`img/${code}.svg`);

/* ---------------- base video with punch-in zooms ---------------- */

const BaseVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = Math.max(
    0,
    SCENES.findIndex((s) => t >= s.start && t < s.end),
  );
  const scene = SCENES[idx];
  const prevZoom = idx > 0 ? SCENES[idx - 1].zoom : scene.zoom;
  const local = frame - sec(scene.start);
  const snap = spring({ frame: local, fps, config: { damping: 18, stiffness: 220 } });
  // slow push-in during each scene keeps the shot alive
  const drift = interpolate(local, [0, sec(scene.end - scene.start)], [0, 0.035]);
  const zoom = interpolate(snap, [0, 1], [prevZoom, scene.zoom]) + drift;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("source.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          transformOrigin: "50% 38%",
          filter: "saturate(1.12) contrast(1.06)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- quick white flash on every cut ---------------- */

const CutFlash: React.FC = () => {
  const frame = useCurrentFrame();
  let opacity = 0;
  for (const s of SCENES.slice(1)) {
    const d = frame - sec(s.start);
    if (d >= 0 && d < 5) opacity = interpolate(d, [0, 4], [0.45, 0]);
  }
  return <AbsoluteFill style={{ backgroundColor: "white", opacity }} />;
};

/* ---------------- shading for readability ---------------- */

const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

/* ---------------- animated captions ---------------- */

const CaptionView: React.FC<{ cap: Caption }> = ({ cap }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = cap.text.split(" ");
  const total = sec(cap.end - cap.start);
  // reveal words quickly so the full line is readable well before it leaves
  const step = Math.max(2, Math.min(5, Math.floor((total * 0.5) / words.length)));
  const out = interpolate(frame, [total - 3, total], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1330,
          width: 980,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 22px",
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
                fontSize: isHl ? 112 : 98,
                lineHeight: 1.25,
                color: isHl ? "#111" : "white",
                background: isHl ? YELLOW : "transparent",
                borderRadius: 22,
                padding: isHl ? "0 22px" : 0,
                WebkitTextStroke: isHl ? "0" : "4px #000",
                paintOrder: "stroke fill",
                textShadow: isHl ? "none" : "0 8px 0 rgba(0,0,0,0.55)",
                boxShadow: isHl ? "0 10px 0 rgba(0,0,0,0.35)" : "none",
                transform: `scale(${s}) translateY(${(1 - s) * 40}px) rotate(${isHl ? -2 : 0}deg)`,
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
}> = ({ text, y, bg = "white", color = "#111", size = 74, delay = 0 }) => {
  const p = usePop(delay, 12);
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          color,
          background: bg,
          padding: "4px 40px 12px",
          borderRadius: 28,
          boxShadow: "0 12px 0 rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.35)",
          transform: `scale(${p}) rotate(${(1 - p) * 8 - 1.5}deg)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/* ---------------- scenes (images that follow the speech) ---------------- */

const GradeCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(2, 9);
  const count = Math.round(interpolate(frame, [4, 30], [0, 12], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 540 - 230,
          top: 90,
          width: 460,
          height: 330,
          background: "#FFFDF4",
          borderRadius: 36,
          border: "8px solid #111",
          boxShadow: "0 18px 0 #111",
          transform: `scale(${p}) rotate(${-4 + (1 - p) * 20}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: FONT, fontSize: 52, color: "#555", marginBottom: -20 }} dir="rtl">
          المعدل
        </div>
        <div style={{ fontFamily: FONT, fontSize: 190, color: "#18A558", lineHeight: 1.05 }}>
          {count}
          <span style={{ fontSize: 90, color: "#111" }}>/20</span>
        </div>
      </div>
      <Sticker code="1f393" x={830} y={110} size={190} delay={10} rot={14} />
      <Sticker code="2705" x={250} y={400} size={120} delay={22} rot={-10} />
    </>
  );
};

const BooksScene: React.FC = () => (
  <>
    <Sticker code="1f4da" x={540} y={250} size={290} />
    <Sticker code="270d" x={280} y={200} size={150} delay={8} rot={-12} />
    <Sticker code="1f4c8" x={810} y={210} size={160} delay={14} rot={10} />
    <Label text="ضامن 12 من البداية" y={430} bg={YELLOW} size={64} delay={18} />
  </>
);

const Bulb: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const p = usePop(6 + i * 9, 9);
  const glow = 0.5 + 0.5 * Math.sin((frame - i * 6) / 4);
  return (
    <div
      style={{
        position: "absolute",
        left: 210 + i * 330 - 120,
        top: 120,
        width: 240,
        height: 240,
        borderRadius: 999,
        background: `radial-gradient(circle, rgba(255,212,0,${0.55 * glow}) 0%, rgba(255,212,0,0) 70%)`,
        transform: `scale(${p})`,
      }}
    >
      <Img src={icon("1f4a1")} style={{ width: 180, height: 180, margin: 30 }} />
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: 0,
          width: 84,
          height: 84,
          borderRadius: 999,
          background: RED,
          color: "white",
          fontFamily: FONT,
          fontSize: 56,
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
    <Label text="3 نصائح ذهبية" y={400} bg={RED} color="white" delay={30} />
  </>
);

const WarningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 1.9) * interpolate(frame, [0, 20], [14, 3], { extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateX(${shake}px)` }}>
        <Sticker code="26a0" x={540} y={240} size={270} />
      </div>
      <Label text="انتبه!" y={420} bg={RED} color="white" size={80} delay={6} />
    </>
  );
};

const SubscribeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clickAt = sec(13.5 - 11.4);
  const clicked = frame >= clickAt;
  const press = spring({ frame: frame - clickAt, fps, config: { damping: 8, stiffness: 300 } });
  const scale = clicked ? interpolate(press, [0, 0.5, 1], [1, 0.86, 1]) : 1;
  const enter = usePop(2, 11);
  const ring = clicked ? Math.sin((frame - clickAt) * 1.4) * interpolate(frame - clickAt, [0, 24], [22, 0], { extrapolateRight: "clamp" }) : 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          transform: `scale(${enter * scale})`,
        }}
      >
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 92,
            color: "white",
            background: clicked ? "#555" : RED,
            padding: "6px 60px 18px",
            borderRadius: 26,
            boxShadow: "0 14px 0 rgba(0,0,0,0.35)",
          }}
        >
          {clicked ? "مشترك ✓" : "اشترك"}
        </div>
        <Img
          src={icon("1f514")}
          style={{ width: 150, height: 150, transform: `rotate(${ring}deg)`, transformOrigin: "50% 10%" }}
        />
      </div>
      <Sticker code="1f44d" x={200} y={140} size={140} delay={clickAt + 2} rot={-15} />
      <Sticker code="2764" x={880} y={420} size={130} delay={clickAt + 6} rot={12} />
    </>
  );
};

const Tip1Scene: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <NumberBadge />
    </div>
    <Sticker code="1f525" x={250} y={230} size={150} delay={20} rot={-12} />
    <Sticker code="1f9e0" x={830} y={230} size={150} delay={26} rot={12} />
    <Label text="مهمة بزاف" y={430} bg={YELLOW} size={66} delay={sec(16.6 - 14.72)} />
  </>
);

const NumberBadge: React.FC = () => {
  const p = usePop(2, 8);
  return (
    <div
      dir="rtl"
      style={{
        fontFamily: FONT,
        fontSize: 86,
        color: "white",
        background: "linear-gradient(135deg,#6C3BFF,#FF2E89)",
        padding: "10px 50px 22px",
        borderRadius: 40,
        border: "6px solid white",
        boxShadow: "0 16px 0 rgba(0,0,0,0.3)",
        transform: `scale(${p}) rotate(${(1 - p) * -25 + 2}deg)`,
      }}
    >
      النصيحة رقم 1
    </div>
  );
};

const GoalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hitAt = 22;
  const fly = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: hitAt - 8 });
  const boom = spring({ frame: frame - hitAt, fps, config: { damping: 7, stiffness: 260 } });
  return (
    <>
      <Sticker code="1f3af" x={540} y={250} size={290} />
      {/* rocket flies into the target */}
      <Img
        src={icon("1f680")}
        style={{
          position: "absolute",
          width: 150,
          height: 150,
          left: interpolate(fly, [0, 1], [-160, 400]),
          top: interpolate(fly, [0, 1], [520, 200]),
          opacity: frame < hitAt + 2 ? 1 : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 220,
          top: 250 - 220,
          width: 440,
          height: 440,
          borderRadius: 999,
          border: `12px solid ${YELLOW}`,
          opacity: frame >= hitAt ? interpolate(boom, [0, 1], [1, 0]) : 0,
          transform: `scale(${0.4 + boom * 0.9})`,
        }}
      />
      <Sticker code="1f3c6" x={850} y={190} size={160} delay={hitAt + 4} rot={12} />
      <Label text="حدد هدفك 🎯" y={440} bg="white" size={70} delay={hitAt + 8} />
    </>
  );
};

const SCENE_COMPONENTS: Record<Scene["kind"], React.FC> = {
  grade: GradeCard,
  books: BooksScene,
  tips: TipsScene,
  warning: WarningScene,
  subscribe: SubscribeScene,
  tip1: Tip1Scene,
  goal: GoalScene,
};

const SceneOut: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [dur - 4, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, transform: `scale(${0.9 + o * 0.1})` }}>{children}</AbsoluteFill>;
};

/* ---------------- progress bar ---------------- */

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: "rgba(255,255,255,0.25)" }}>
      <div style={{ height: "100%", width: `${(frame / durationInFrames) * 100}%`, background: YELLOW }} />
    </div>
  );
};

/* ---------------- main ---------------- */

export const Montage: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <BaseVideo />
      <Shade />
      {SCENES.map((s) => {
        const C = SCENE_COMPONENTS[s.kind];
        const dur = sec(s.end - s.start);
        return (
          <Sequence key={s.kind} from={sec(s.start)} durationInFrames={dur} layout="none">
            <SceneOut dur={dur}>
              <C />
            </SceneOut>
          </Sequence>
        );
      })}
      {CAPTIONS.map((c, i) => (
        <Sequence key={i} from={sec(c.start)} durationInFrames={sec(c.end - c.start)} layout="none">
          <CaptionView cap={c} />
        </Sequence>
      ))}
      <CutFlash />
      <Progress />
    </AbsoluteFill>
  );
};
