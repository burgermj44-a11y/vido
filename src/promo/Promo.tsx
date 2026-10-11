/*
 * Short promo (16:9, ~13 s) to drop into any video:
 * YouTube channel card -> Subscribe + bell, then MJ wipe -> Instagram follow.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { FPS, GOLD, H, Hand, INK, MJ_GOLD, Sfx, Sheet, Tape, Unfold, W, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, tex } from "../yt2/kit";
import { LINES, PROMO_DURATION } from "./timing";

loadFonts();
loadHand();

export const PROMO_FPS = FPS;
export const PROMO_FRAMES = Math.round(PROMO_DURATION * FPS);

const L = (i: number) => LINES[i];
const word = (i: number, w: string) => {
  const t = L(i).text;
  const k = Math.max(0, t.indexOf(w));
  return sec(L(i).start + ((L(i).end - L(i).start) * k) / t.length);
};
const SPLIT = (LINES[0].end + LINES[1].start) / 2;
const YT_RED = "#FF0033";

const Hand2: React.FC<{ x: number; y: number; at: number; from: [number, number] }> = ({ x, y, at, from }) => {
  const frame = useCurrentFrame();
  const inP = spring({ frame: frame - (at - 12), fps: FPS, config: { damping: 16, stiffness: 170 } });
  const out = ramp(frame, at + 10, at + 22);
  const tap = interpolate(frame - at, [-4, 0, 4], [1, 0.82, 1], clamp);
  if (frame < at - 14) return null;
  return (
    <Img
      src={icon("1f446")}
      style={{
        position: "absolute",
        left: interpolate(inP, [0, 1], [from[0], x]) + out * 500,
        top: interpolate(inP, [0, 1], [from[1], y]) + out * 300,
        width: 150,
        height: 150,
        transform: `scale(${tap}) rotate(-20deg)`,
        filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))",
        opacity: 1 - out,
      }}
    />
  );
};

const YouTubePart: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = word(0, "اشترك") + 6;
  const bell = word(0, "الجرس");
  const subbed = frame >= tap;
  const bellOn = frame >= bell;
  const subs = Math.round(interpolate(frame, [10, tap + 10], [159.2, 160], { ...clamp, easing: Easing.out(Easing.cubic) }) * 10) / 10;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const ring = bellOn && frame < bell + 30 ? Math.sin((frame - bell) * 1.5) * 22 * (1 - (frame - bell) / 30) : 0;
  const notif = spring({ frame: frame - bell - 8, fps: FPS, config: { damping: 13 } });
  return (
    <AbsoluteFill>
      <Unfold x={W / 2 + 120} y={470} delay={2} seed={3} sound="paper_slide">
        <div style={{ position: "relative", width: 1240, filter: "drop-shadow(0 22px 26px rgba(40,25,10,0.35))" }}>
          <div style={{ background: "#fff", borderRadius: 34, overflow: "hidden", border: "10px solid #fff" }}>
            <Img src={staticFile("promo/banner.png")} style={{ width: "100%", display: "block", borderRadius: 24 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 34, padding: "26px 34px 30px", background: "#0F0F0F", borderRadius: "0 0 24px 24px" }}>
              <Img src={staticFile("promo/avatar.png")} style={{ width: 150, height: 150, flexShrink: 0, borderRadius: 75, border: "5px solid #fff" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT, fontSize: 38, color: "#fff", lineHeight: 1.1, whiteSpace: "nowrap", unicodeBidi: "plaintext" }}>
                  <span>Abdelwahab Mj</span> / <span dir="rtl">عبد الوهاب مجاج</span>
                </div>
                <div style={{ fontFamily: "Roboto, Arial, sans-serif", fontSize: 30, color: "#AAA", marginTop: 8 }}>
                  @Abdelwahab_mj · <span style={{ color: "#fff", fontWeight: 700 }}>{subs >= 160 ? "160" : subs.toFixed(1)}K</span> subscribers
                </div>
              </div>
              <div
                style={{
                  height: 92,
                  padding: "0 36px",
                  flexShrink: 0,
                  borderRadius: 46,
                  background: subbed ? "#272727" : YT_RED,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontFamily: '-apple-system, "Segoe UI", Roboto, Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: 38,
                  transform: `scale(${subbed ? interpolate(press, [0, 0.4, 1], [1, 0.88, 1]) : 1})`,
                }}
              >
                {subbed && <span style={{ display: "inline-block", fontSize: 40, transform: `rotate(${ring}deg)`, transformOrigin: "50% 10%" }}>{bellOn ? "🔔" : "🔕"}</span>}
                {subbed ? "Subscribed" : "Subscribe"}
              </div>
            </div>
          </div>
          <Tape x={90} y={6} w={170} rot={-24} />
          <Tape x={1150} y={6} w={170} rot={22} />
        </div>
      </Unfold>
      <Hand2 x={1440} y={600} at={tap} from={[1900, 1100]} />
      {bellOn && (
        <div style={{ position: "absolute", right: 70, top: 60, transform: `translateY(${(1 - notif) * -160}px)`, opacity: Math.min(1, notif * 1.5) }}>
          <div dir="rtl" style={{ background: "#fff", borderRadius: 22, padding: "16px 26px", boxShadow: "0 14px 22px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 16, border: `4px solid ${INK}` }}>
            <span style={{ fontSize: 44 }}>🔔</span>
            <Hand size={40}>فيديو جديد من عبد الوهاب!</Hand>
          </div>
        </div>
      )}
      {subbed &&
        [0, 1, 2, 3, 4, 5].map((k) => {
          const t = frame - tap - k * 3;
          return t > 0 ? (
            <Img key={k} src={icon(k % 2 ? "2764" : "2b50")} style={{ position: "absolute", left: 1500 + Math.sin(k * 2.2) * 60, top: 560 - t * 6, width: 60, height: 60, opacity: interpolate(t, [0, 34], [1, 0], clamp), transform: `rotate(${(k - 2.5) * 14}deg)` }} />
          ) : null;
        })}
      <Sfx at={tap} name="click" vol={0.35} />
      <Sfx at={tap + 2} name="sparkle" vol={0.2} />
      <Sfx at={bell} name="ring" vol={0.16} />
    </AbsoluteFill>
  );
};

const InstaPart: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const tap = word(1, "الإنستغرام") + 10 - offset;
  const clicked = frame >= tap;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const ripple = ramp(frame, tap, tap + 14);
  return (
    <AbsoluteFill>
      <Unfold x={760} y={470} delay={4} seed={5} rot={-1.5} sound="paper_slide">
        <div style={{ width: 900, background: "#0F1116", border: "10px solid #fff", borderRadius: 44, padding: "26px 30px", boxShadow: "0 24px 40px rgba(0,0,0,0.4)", position: "relative" }}>
          <Img src={staticFile("promo/profile_shot.png")} style={{ width: "100%", display: "block", borderRadius: 18 }} />
          <div
            style={{
              position: "relative",
              marginTop: 16,
              height: 84,
              borderRadius: 20,
              background: clicked ? "#363636" : "#0095F6",
              color: "#fff",
              fontFamily: '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 700,
              fontSize: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              transform: `scale(${clicked ? interpolate(press, [0, 0.4, 1], [1, 0.9, 1]) : 1})`,
            }}
          >
            {clicked ? "Following ✓" : "Follow"}
            <div style={{ position: "absolute", left: 420 - 400 * ripple, top: 42 - 400 * ripple, width: 800 * ripple, height: 800 * ripple, borderRadius: 999, background: "rgba(0,149,246,0.35)", opacity: 1 - ripple }} />
          </div>
          <Tape x={110} y={-4} w={150} rot={-24} />
          <Tape x={790} y={-4} w={150} rot={22} />
        </div>
      </Unfold>
      <Hand2 x={820} y={640} at={tap} from={[1300, 1100]} />
      {/* instagram logo + handle on a kraft strip */}
      <Unfold x={1500} y={330} delay={10} seed={6} rot={4}>
        <div style={{ width: 230, height: 230, borderRadius: 60, background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", display: "flex", alignItems: "center", justifyContent: "center", border: "8px solid #fff", boxShadow: "0 16px 22px rgba(0,0,0,0.3)" }}>
          <div style={{ width: 130, height: 130, borderRadius: 40, border: "14px solid #fff", position: "relative" }}>
            <div style={{ position: "absolute", left: 22, top: 22, width: 58, height: 58, borderRadius: 29, border: "13px solid #fff", boxSizing: "border-box" }} />
            <div style={{ position: "absolute", right: 10, top: 10, width: 16, height: 16, borderRadius: 8, background: "#fff" }} />
          </div>
        </div>
      </Unfold>
      <Unfold x={1500} y={620} delay={word(1, "عبد") - offset} seed={7} rot={-2} sound="paper_rustle">
        <Sheet w={500} h={120} tx="kraft" seed={7}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Roboto, Arial, sans-serif", fontWeight: 800, fontSize: 46, color: INK }}>@abdelwahab__mj</div>
          <Tape x={250} y={4} />
        </Sheet>
      </Unfold>
      {clicked &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const d = frame - tap - 3 - i * 2;
          if (d < 0) return null;
          const prog = d / 30;
          return <Img key={i} src={icon("2764")} style={{ position: "absolute", left: 1150 + Math.sin(i * 2.1) * 50 * prog + (i % 2) * 30, top: 640 - prog * 420, width: 70 + (i % 3) * 20, height: 70 + (i % 3) * 20, opacity: interpolate(prog, [0, 0.2, 1], [0, 1, 0], { extrapolateRight: "clamp" }) }} />;
        })}
      <Sfx at={tap} name="click" vol={0.35} />
      <Sfx at={tap + 3} name="sparkle" vol={0.2} />
    </AbsoluteFill>
  );
};

/* MJ transition (landscape) */
const MJWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [2000, 0, 0, -2150], { ...clamp, easing: ease });
  const mj = ramp(frame, 7, 12);
  const line = ramp(frame, 10, 15);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={10} name="mj_hit" vol={0.24} />
      <div style={{ position: "absolute", left: sheetX(-2) - 160, top: -200 }}>
        <div style={{ position: "relative", width: 2300, height: 1500, filter: "drop-shadow(-18px 0 30px rgba(0,0,0,0.35))" }}>
          <div style={{ position: "absolute", inset: 0, background: GOLD, overflow: "hidden", ...maskStyle(1) }}>
            <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.9 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: sheetX(1) - 80, top: -200 }}>
        <div style={{ position: "relative", width: 2200, height: 1500, filter: "drop-shadow(-24px 0 40px rgba(0,0,0,0.5))" }}>
          <div style={{ position: "absolute", inset: 0, background: "#151515", overflow: "hidden", ...maskStyle(4) }}>
            <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.5 }} />
          </div>
          <div style={{ position: "absolute", left: 80, top: 200, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 300, lineHeight: 1, letterSpacing: interpolate(mj, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: mj, filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))" }}>MJ</div>
            <div style={{ width: 300 * line, height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; dur: number; idx: number }> = ({ text, dur, idx }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 5);
  const out = interpolate(frame, [dur - 4, dur], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 940, display: "flex", justifyContent: "center", opacity: Math.min(inP, out) }}>
      <div style={{ position: "relative", transform: `rotate(${idx ? 0.8 : -0.8}deg) translateY(${(1 - inP) * 12}px)`, filter: "drop-shadow(0 8px 10px rgba(40,30,20,0.35))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx + 2) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "8px 46px 14px", fontFamily: FONT, fontSize: 46, color: INK, maxWidth: 1600, textAlign: "center" }}>
          {text}
        </div>
      </div>
    </div>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const split = sec(SPLIT);
  const end = PROMO_FRAMES;
  const outro = ramp(frame, end - 10, end);
  return (
    <AbsoluteFill style={{ background: "#EFE8D8" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 + Math.sin(frame / 60) * 0.01})` }}>
        <Img src={tex("notebook")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(60,40,20,0.3) 100%)" }} />
      <Sequence durationInFrames={split} layout="none">
        <YouTubePart />
      </Sequence>
      <Sequence from={split} layout="none">
        <InstaPart offset={split} />
      </Sequence>
      {LINES.map((l, i) => (
        <Sequence key={i} from={sec(l.start) - 3} durationInFrames={sec(l.end - l.start) + 8} layout="none">
          <Caption text={l.text} dur={sec(l.end - l.start) + 8} idx={i} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 44, top: 30, fontFamily: FONT, fontSize: 54, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))", transform: `rotate(${jitter(onTwos(frame), 1, 0.3)}deg)` }}>MJ</div>
      <Sequence from={split - 12} durationInFrames={24} layout="none">
        <MJWipe />
      </Sequence>
      <AbsoluteFill style={{ background: "#141414", opacity: outro }} />
      <Audio src={staticFile("promo/narration.wav")} />
      <Audio src={staticFile("yt2/music.wav")} volume={(f) => interpolate(f, [0, 10, end - 20, end], [0, 0.12, 0.12, 0], clamp)} />
      <Sfx at={0} name="paper_slide" vol={0.2} />
    </AbsoluteFill>
  );
};
