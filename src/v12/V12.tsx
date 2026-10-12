/*
 * Video 8 (16:9): his voice over a black clip. His photo (paper cut-out) stands
 * in the centre, the words pop up around him on torn paper, animated kraft
 * background, share animation on "تبارطاجي", Instagram follow card on "تبونيو".
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { FPS, GOLD, GREEN, H, INK, MARKER, MJ_GOLD, PEN, Sfx, Sheet, Tape, W, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";
import { ENV, ENV_FPS } from "./env";
import { CAPTIONS12 as CAPTIONS8, Cap12 as Cap8, DURATION12 as DURATION8, FOLLOW_AT, MILLION_AT, SUB_AT, WIPES12 as WIPES8 } from "./script12";

loadFonts();
loadHand();

export const V12_FPS = FPS;
export const V12_FRAMES = Math.round(DURATION8 * FPS);
const END_AT = CAPTIONS8[CAPTIONS8.length - 1].end + 0.3;

/* ---------------- animated kraft background ---------------- */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const lx = 50 + Math.sin(frame / 140) * 22;
  const ly = 40 + Math.cos(frame / 170) * 14;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#B98B5A" }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 + Math.sin(frame / 90) * 0.012}) translate(${Math.sin(frame / 200) * 12}px, ${Math.cos(frame / 230) * 8}px)`, filter: "blur(4px) saturate(1.1)" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% ${ly}%, rgba(255,226,170,0.55) 0%, rgba(255,210,150,0.18) 35%, rgba(0,0,0,0) 65%)`, mixBlendMode: "soft-light" }} />
      {[0.18, 0.62, 0.86].map((x, i) => (
        <div key={i} style={{ position: "absolute", top: -100, bottom: -100, left: `${x * 100}%`, width: 120, background: "linear-gradient(90deg, rgba(0,0,0,0), rgba(70,40,15,0.10), rgba(255,240,210,0.10), rgba(0,0,0,0))", transform: `rotate(${4 - i * 3}deg) translateX(${Math.sin(frame / (160 + i * 40)) * 10}px)`, filter: "blur(6px)" }} />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const sp = 0.25 + ((i * 37) % 10) / 20;
        const x = (((i * 173) % 1920) + frame * sp * (i % 2 ? 1 : -1) * 0.6 + 4000) % 1980 - 30;
        const y = ((i * 97) % 1080) + Math.sin(frame / (40 + i * 3) + i) * 18;
        const s = 6 + (i % 5) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.7, borderRadius: 2, background: i % 3 ? "rgba(255,240,215,0.55)" : "rgba(90,55,25,0.35)", transform: `rotate(${frame * (i % 2 ? 0.6 : -0.4) + i * 30}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(50,25,8,0.38) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------- his photo in the centre ---------------- */
const Host: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const e = ENV[Math.min(ENV.length - 1, Math.floor(t * ENV_FPS))] ?? 0;
  const enter = spring({ frame: onTwos(frame - 4), fps: FPS, config: { damping: 12, stiffness: 140 } });
  const exit = ramp(frame, sec(END_AT) - 6, sec(END_AT) + 6, Easing.in(Easing.cubic));
  const dip = (ramp(frame, DIP_FROM - 4, DIP_FROM + 10, Easing.inOut(Easing.cubic)) - ramp(frame, DIP_TO - 14, DIP_TO, Easing.inOut(Easing.cubic))) * 80;
  return (
    <div style={{ position: "absolute", left: W / 2 - 330, bottom: -10, width: 660, perspective: 1400 }}>
      <div
        style={{
          transformOrigin: "50% 100%",
          transform: `rotateX(${(1 - enter) * 80}deg) translateY(${exit * 900 - e * 8 + dip}px) rotate(${jitter(frame, 3, 0.5)}deg) scale(${1 + Math.sin(frame / 28) * 0.006 + e * 0.008})`,
        }}
      >
        <Img
          src={staticFile("v8/host.png")}
          style={{ width: 660, display: "block", filter: "drop-shadow(9px 0 0 #fff) drop-shadow(-9px 0 0 #fff) drop-shadow(0 -9px 0 #fff) drop-shadow(0 18px 24px rgba(40,22,8,0.55))" }}
        />
      </div>
      <Sfx at={4} name="paper_fold" vol={0.25} />
    </div>
  );
};

/* ---------------- words around him ---------------- */
const SLOTS = { L: [250, 430, 610], R: [250, 430, 610] };
const CapStrip: React.FC<{ c: Cap8; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start) + 10;
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 13, stiffness: 180 } });
  const out = ramp(frame, dur - 6, dur, Easing.in(Easing.cubic));
  const words = c.text.split(" ");
  const per = (sec(c.end - c.start) * 0.9) / words.length;
  const left = c.side === "L";
  const y = SLOTS[c.side][Math.floor(idx / 2) % 3];
  const rot = (left ? -2 : 2) + jitter(frame, idx * 7, 0.4);
  return (
    <div style={{ position: "absolute", top: y, [left ? "left" : "right"]: 60 - (1 - p) * 120 + out * -200, width: 620, display: "flex", justifyContent: left ? "flex-start" : "flex-end", opacity: Math.min(p * 1.4, 1 - out) } as React.CSSProperties}>
      <div style={{ position: "relative", transform: `rotate(${rot}deg) scale(${0.85 + p * 0.15})`, transformOrigin: left ? "0% 50%" : "100% 50%", filter: "drop-shadow(0 10px 12px rgba(40,22,8,0.4))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "14px 34px 20px", display: "flex", flexWrap: "wrap", gap: "0 14px", justifyContent: "center", maxWidth: 620 }}>
          {words.map((w, i) => {
            const start = Math.floor(i * per);
            const active = frame >= start && frame < Math.floor((i + 1) * per) + 2;
            const hl = c.hl?.includes(w.replace(/[،.؟]/g, ""));
            const mk = ramp(frame, start, start + 6);
            return (
              <span
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: 52,
                  lineHeight: 1.35,
                  color: active ? PEN : INK,
                  backgroundImage: hl ? `linear-gradient(transparent 40%, ${MARKER} 40%, ${MARKER} 92%, transparent 92%)` : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right",
                  backgroundSize: hl ? `${mk * 100}% 100%` : "auto",
                  padding: hl ? "0 6px" : 0,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <Tape x={left ? 60 : 560} y={4} w={100} rot={left ? -18 : 18} />
      </div>
      {c.code && (
        <div style={{ position: "absolute", top: -125, [left ? "left" : "right"]: 30, width: 120, height: 120, perspective: 800 } as React.CSSProperties}>
          <Img src={icon(c.code)} style={{ width: 120, height: 120, transformOrigin: "50% 100%", transform: `rotateX(${(1 - spring({ frame: onTwos(frame - 5), fps: FPS, config: { damping: 11 } })) * 90}deg) rotate(${(left ? 10 : -10) + jitter(frame, idx, 1.2)}deg)`, filter: stickerFilter(5), opacity: frame >= 5 ? 1 : 0 }} />
        </div>
      )}
      <Sfx at={0} name="paper_rustle" vol={0.22} />
      {c.code && <Sfx at={5} name="paper_fold" vol={0.18} />}
    </div>
  );
};

/* ---------------- cards that rise from behind his head ---------------- */
const SUB_FROM = sec(SUB_AT) - 12;
const SUB_LEN = sec(FOLLOW_AT - SUB_AT) - 2;
const MIL_FROM = sec(MILLION_AT) - 10;
const MIL_LEN = 150;
const DIP_FROM = SUB_FROM;
const DIP_TO = MIL_FROM + MIL_LEN;
const Rise: React.FC<{ len: number; w: number; children: React.ReactNode }> = ({ len, w, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 13, stiffness: 120 } });
  const out = ramp(frame, len - 14, len - 2, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: W / 2 - 560, top: -200, width: 1120, height: 700, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,230,160,0.7), rgba(255,210,130,0))", opacity: p * (1 - out) }} />
      <div style={{ position: "absolute", left: W / 2 - w / 2, top: 26, width: w, transform: `translateY(${(1 - p) * 420 + out * 420}px) rotate(${(1 - p) * 6 - 1.5 + jitter(frame, 9, 0.3)}deg)`, opacity: Math.min(1, p * 2) * (1 - out) }}>{children}</div>
    </AbsoluteFill>
  );
};
const YtCard: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 22;
  const done = frame >= tap;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  return (
    <Rise len={SUB_LEN} w={820}>
      <div style={{ borderRadius: 26, overflow: "hidden", background: "#0F0F0F", border: "9px solid #fff", boxShadow: "0 18px 30px rgba(0,0,0,0.45)", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
          <Img src={staticFile("promo/avatar.png")} style={{ width: 96, height: 96, borderRadius: 48, border: "4px solid #fff" }} />
          <div style={{ flex: 1, fontFamily: "Roboto, Arial, sans-serif", color: "#fff" }}>
            <div style={{ fontWeight: 800, fontSize: 38 }}>Abdelwahab Mj</div>
            <div style={{ fontSize: 24, color: "#AAA" }}>YouTube</div>
          </div>
          <div style={{ height: 74, padding: "0 30px", borderRadius: 37, background: done ? "#272727" : "#FF0033", color: "#fff", display: "flex", alignItems: "center", gap: 10, fontFamily: "Roboto, Arial, sans-serif", fontWeight: 800, fontSize: 32, transform: `scale(${done ? interpolate(press, [0, 0.4, 1], [1, 0.88, 1]) : 1})` }}>
            {done && <span style={{ display: "inline-block", transform: `rotate(${frame > tap + 4 && frame < tap + 30 ? Math.sin(frame * 1.6) * 22 : 0}deg)` }}>🔔</span>}
            {done ? "Subscribed" : "Subscribe"}
          </div>
        </div>
        <Tape x={90} y={-8} w={130} rot={-20} />
        <Tape x={730} y={-8} w={130} rot={18} />
      </div>
      {frame > tap - 12 && frame < tap + 16 && (
        <Img src={icon("1f446")} style={{ position: "absolute", left: interpolate(spring({ frame: frame - tap + 12, fps: FPS, config: { damping: 16 } }), [0, 1], [900, 640]), top: interpolate(spring({ frame: frame - tap + 12, fps: FPS, config: { damping: 16 } }), [0, 1], [500, 80]), width: 120, height: 120, transform: `rotate(-20deg) scale(${interpolate(frame - tap, [-3, 0, 3], [1, 0.82, 1], clamp)})` }} />
      )}
      <Sfx at={0} name="paper_slide" vol={0.25} />
      <Sfx at={tap} name="click" vol={0.35} />
      <Sfx at={tap + 3} name="ring" vol={0.12} />
    </Rise>
  );
};
const MillionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 60], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const n = Math.round(497000 + p * 503000);
  const hit = frame >= 60;
  return (
    <Rise len={MIL_LEN} w={760}>
      <div style={{ position: "relative" }}>
        <Sheet w={760} h={250} seed={4}>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, display: "flex", justifyContent: "center", fontFamily: FONT, fontSize: 104, color: hit ? GREEN : INK, transform: `scale(${hit ? 1 + 0.1 * Math.max(0, 1 - (frame - 60) / 10) : 1})` }}>{n.toLocaleString("en-US")}</div>
          <div style={{ position: "absolute", left: 60, right: 60, bottom: 40, height: 26, borderRadius: 13, background: "#E5DCCB", overflow: "hidden" }}>
            <div style={{ width: `${49.7 + p * 50.3}%`, height: "100%", background: GOLD }} />
          </div>
          <Tape x={380} y={4} w={150} />
        </Sheet>
        <Img src={icon("1f3af")} style={{ position: "absolute", right: -60, top: -50, width: 130, height: 130, filter: stickerFilter(5) }} />
      </div>
      {frame >= 10 && frame < 60 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.06} />}
      <Sfx at={60} name="sparkle" vol={0.25} />
    </Rise>
  );
};

/* ---------------- follow: Instagram card rises from behind his head ---------------- */
const FOLLOW_FROM = sec(FOLLOW_AT) - 14;
const FOLLOW_LEN = sec(MILLION_AT - FOLLOW_AT) - 4;
const CARD_W = 820;
const CARD_X = W / 2 - CARD_W / 2;
const BTN_Y = 262; // centre of the Follow button on screen
const FollowMoment: React.FC<{ layer: "back" | "front" }> = ({ layer }) => {
  const frame = useCurrentFrame();
  const tap = 16;
  const clicked = frame >= tap;
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 13, stiffness: 120 } });
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const out = ramp(frame, FOLLOW_LEN - 14, FOLLOW_LEN - 2, Easing.in(Easing.cubic));
  const handIn = spring({ frame: frame - (tap - 11), fps: FPS, config: { damping: 16, stiffness: 180 } });
  const btnX = CARD_X + CARD_W / 2;
  if (layer === "back") {
    return (
      <AbsoluteFill>
        {/* glow behind the card */}
        <div style={{ position: "absolute", left: W / 2 - 560, top: -200, width: 1120, height: 700, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,230,160,0.7), rgba(255,210,130,0))", opacity: p * (1 - out) }} />
        {clicked &&
          [0, 1, 2].map((k) => {
            const r = ((frame - tap + k * 8) % 24) / 24;
            return <div key={k} style={{ position: "absolute", left: btnX - 200 - r * 220, top: BTN_Y - 60 - r * 120, width: 400 + r * 440, height: 120 + r * 240, borderRadius: 999, border: "6px solid #0095F6", opacity: (1 - r) * 0.6 * (1 - out) }} />;
          })}
        <div style={{ position: "absolute", left: CARD_X, top: 26, width: CARD_W, transform: `translateY(${(1 - p) * 420 + out * 420}px) rotate(${(1 - p) * 6 - 1.5 + jitter(frame, 9, 0.3)}deg)`, opacity: Math.min(1, p * 2) * (1 - out) }}>
          <div style={{ background: "#0F1116", border: "9px solid #fff", borderRadius: 30, padding: "18px 20px 16px", boxShadow: "0 18px 30px rgba(0,0,0,0.45)", position: "relative" }}>
            <Img src={staticFile("v8/ig_head.png")} style={{ width: "100%", display: "block" }} />
            <div style={{ marginTop: 10, height: 66, borderRadius: 14, background: clicked ? "#363636" : "#0095F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Roboto, Arial, sans-serif", fontWeight: 700, fontSize: 34, transform: `scale(${clicked ? interpolate(press, [0, 0.4, 1], [1, 0.9, 1]) : 1})` }}>
              {clicked ? "Following ✓" : "Follow"}
            </div>
            <Tape x={90} y={-8} w={130} rot={-20} />
            <Tape x={CARD_W - 90} y={-8} w={130} rot={18} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* handle tag on the side */}
      <div dir="ltr" style={{ position: "absolute", left: CARD_X + CARD_W - 40, top: 300, background: MARKER, padding: "4px 24px 10px", borderRadius: 8, transform: `rotate(4deg) scale(${spring({ frame: onTwos(frame - 10), fps: FPS, config: { damping: 10 } })})`, boxShadow: "0 8px 12px rgba(0,0,0,0.3)" }}>
        <span style={{ fontFamily: "Roboto, Arial, sans-serif", fontWeight: 800, fontSize: 40, color: INK }}>@abdelwahab__mj</span>
      </div>
      {frame > tap - 12 && frame < tap + 20 && (
        <Img src={icon("1f446")} style={{ position: "absolute", left: interpolate(handIn, [0, 1], [1500, btnX + 40]), top: interpolate(handIn, [0, 1], [700, BTN_Y + 10]), width: 130, height: 130, transform: `rotate(-20deg) scale(${interpolate(frame - tap, [-3, 0, 3], [1, 0.82, 1], clamp)})`, filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.4))" }} />
      )}
      {clicked &&
        Array.from({ length: 8 }, (_, i) => {
          const d = frame - tap - 2 - i * 2;
          if (d < 0) return null;
          const prog = d / 34;
          const side = i % 2 ? 1 : -1;
          return <Img key={i} src={icon("2764")} style={{ position: "absolute", left: btnX + side * (430 + (i % 3) * 40) + Math.sin(d / 4 + i) * 20 - 32, top: BTN_Y - prog * 220, width: 64, height: 64, transform: `rotate(${side * 15}deg) scale(${0.6 + prog})`, opacity: interpolate(prog, [0, 0.2, 1], [0, 1, 0], clamp) }} />;
        })}
      <Sfx at={0} name="paper_slide" vol={0.25} />
      <Sfx at={tap} name="click" vol={0.35} />
      <Sfx at={tap + 3} name="sparkle" vol={0.2} />
    </AbsoluteFill>
  );
};

/* ---------------- MJ wipe ---------------- */
const MJWipe: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [2000, 0, 0, -2150], { ...clamp, easing: ease });
  const mj = ramp(frame, 7, 12);
  const line = ramp(frame, 10, 15);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={10} name="mj_hit" vol={0.22} />
      <div style={{ position: "absolute", left: sheetX(-2) - 160, top: -200 }}>
        <div style={{ position: "relative", width: 2300, height: 1500, filter: "drop-shadow(-18px 0 30px rgba(0,0,0,0.35))" }}>
          <div style={{ position: "absolute", inset: 0, background: GOLD, overflow: "hidden", ...maskStyle(seed) }}>
            <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.9 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: sheetX(1) - 80, top: -200 }}>
        <div style={{ position: "relative", width: 2200, height: 1500, filter: "drop-shadow(-24px 0 40px rgba(0,0,0,0.5))" }}>
          <div style={{ position: "absolute", inset: 0, background: "#151515", overflow: "hidden", ...maskStyle(seed + 3) }}>
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

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 0, 16);
  return (
    <AbsoluteFill style={{ background: "#141414" }}>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.5 }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: FONT, fontSize: 280, lineHeight: 1, letterSpacing: interpolate(p, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: p }}>MJ</div>
        <div style={{ width: 320 * p, height: 6, background: GOLD, borderRadius: 3 }} />
        <div style={{ fontFamily: FONT, fontSize: 44, color: GOLD, opacity: p, marginTop: 16 }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const V12: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      <Backdrop />
      <Sequence from={SUB_FROM} durationInFrames={SUB_LEN} layout="none">
        <YtCard />
      </Sequence>
      <Sequence from={FOLLOW_FROM} durationInFrames={FOLLOW_LEN} layout="none">
        <FollowMoment layer="back" />
      </Sequence>
      <Sequence from={MIL_FROM} durationInFrames={MIL_LEN} layout="none">
        <MillionCard />
      </Sequence>
      <Host />
      {CAPTIONS8.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.start) - 3)} durationInFrames={sec(c.end - c.start) + 10} layout="none">
          <CapStrip c={c} idx={i} />
        </Sequence>
      ))}
      <Sequence from={FOLLOW_FROM} durationInFrames={FOLLOW_LEN} layout="none">
        <FollowMoment layer="front" />
      </Sequence>
      <div style={{ position: "absolute", left: 40, top: 26, fontFamily: FONT, fontSize: 54, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>MJ</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ height: "100%", width: `${(frame / V12_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      {WIPES8.map((t, i) => (
        <Sequence key={i} from={sec(t) - 12} durationInFrames={24} layout="none">
          <MJWipe seed={i} />
        </Sequence>
      ))}
      <Sequence from={sec(END_AT)} layout="none">
        <EndCard />
      </Sequence>
      <Sequence from={sec(END_AT) - 12} durationInFrames={24} layout="none">
        <MJWipe seed={5} />
      </Sequence>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("v12/voice.wav")} />
      <Audio src={staticFile("v8/music.wav")} volume={(f) => interpolate(f, [0, 15, V12_FRAMES - 30, V12_FRAMES], [0, 0.07, 0.07, 0], clamp)} />
    </AbsoluteFill>
  );
};
