/*
 * YouTube video 5 (16:9, ~9 min): "he failed the BAC twice… the third time changed
 * everything". His Darija voice; paper style. Each section has its own paper set
 * (living room, night room, desk, calendar, planner, exam hall) and every sentence
 * adds paper stickers/labels picked from its words; key lessons get big quote cards.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { FPS, GOLD, GREEN, H, HAND, INK, MARKER, MJ_GOLD, PEN, RED, Sfx, Sheet, Tape, W, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";
import { MiniPromo } from "../yt3/YT3";
import { LINES } from "./timing";

loadFonts();
loadHand();

export const YT5_FPS = FPS;
const END_AT = LINES[LINES.length - 1].end + 0.8;
export const YT5_FRAMES = Math.round((END_AT + 3.2) * FPS);
const LEAD = 0.25;
const CX = W / 2;

/* ---------- helpers ---------- */
const Pop: React.FC<{ x: number; y: number; at?: number; rot?: number; seed?: number; sound?: string | null; vol?: number; children: React.ReactNode }> = ({ x, y, at = 0, rot = 0, seed = 1, sound = "paper_fold", vol = 0.14, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - at), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.7)}deg) translateY(${Math.sin(frame / 14 + seed) * 5}px)` }}>{children}</div>
        </div>
      )}
    </>
  );
};
const Em: React.FC<{ code: string; size: number; style?: React.CSSProperties }> = ({ code, size, style }) => (
  <Img src={icon(code)} style={{ width: size, height: size, display: "block", filter: stickerFilter(Math.max(5, size / 30)), ...style }} />
);
const Torn: React.FC<{ text: string; size?: number; color?: string; seed?: number; tx?: "white" | "kraft"; bold?: boolean }> = ({ text, size = 60, color = INK, seed = 3, tx = "white", bold }) => {
  const w = 110 + text.length * size * (bold ? 0.56 : 0.5);
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed}>
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: bold ? FONT : HAND, fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap" }}>
        {text}
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};

/* ---------- section sets ---------- */
const Kraft: React.FC<{ tint?: string; dark?: number }> = ({ tint, dark = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: tint ?? "#B98B5A", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.08 + Math.sin(frame / 120) * 0.01})`, filter: "blur(2px)", mixBlendMode: tint ? "multiply" : "normal" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(15,10,35,${dark})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(40,20,5,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
const Family: React.FC<{ happy?: boolean; sad?: boolean }> = ({ happy, sad }) => {
  const frame = useCurrentFrame();
  const people = ["1f468", "1f469", "1f466", "1f467"];
  return (
    <>
      {people.map((c, i) => (
        <Img key={i} src={icon(happy ? ["1f973", "1f970", "1f929", "1f60d"][i] : sad ? ["1f614", "1f97a", "1f61f", "1f625"][i] : c)} style={{ position: "absolute", left: 300 + i * 190 + (i > 1 ? 560 : 0), top: 560 + Math.sin(frame / 15 + i) * (happy ? 18 : 4), width: 170, height: 170, filter: stickerFilter(6) }} />
      ))}
    </>
  );
};
const Laptop: React.FC<{ state: "wait" | "fail" | "pass"; at?: number }> = ({ state, at = 0 }) => {
  const frame = useCurrentFrame();
  const shown = frame >= at;
  return (
    <div style={{ position: "absolute", left: CX - 300, top: 330, width: 600 }}>
      <div style={{ height: 360, background: "#1E1E24", borderRadius: "22px 22px 0 0", padding: 18, boxShadow: "0 16px 24px rgba(0,0,0,0.35)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 10, background: state === "pass" && shown ? "#E8F7EC" : state === "fail" && shown ? "#FBE9E8" : "#F3F1EC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {!shown || state === "wait" ? (
            <>
              <div style={{ fontFamily: FONT, fontSize: 40, color: "#666" }}>نتائج الباكالوريا</div>
              <div style={{ marginTop: 16, width: 70, height: 70, borderRadius: 35, border: "8px solid #ccc", borderTopColor: PEN, transform: `rotate(${frame * 12}deg)` }} />
            </>
          ) : (
            <div style={{ fontFamily: FONT, fontSize: 130, color: state === "pass" ? GREEN : RED, transform: `scale(${spring({ frame: frame - at, fps: FPS, config: { damping: 8 } })})` }}>{state === "pass" ? "ناجح" : "راسب"}</div>
          )}
        </div>
      </div>
      <div style={{ height: 30, background: "#B9B9C2", borderRadius: "0 0 30px 30px", margin: "0 -40px" }} />
    </div>
  );
};

type SetKind = "room" | "night" | "dawn" | "desk" | "paper" | "exercise" | "calendar" | "planner" | "chart" | "exam";
const SECTION_SET: Record<string, SetKind> = { open: "room", night: "night", turn: "dawn", habit: "desk", fail2: "desk", recall: "paper", solve: "exercise", spaced: "calendar", plan: "planner", progress: "chart", bac3: "exam", result: "room" };
const SECTION_NAMES: Record<string, string> = {
  open: "يوم النتائج",
  night: "تلك الليلة",
  turn: "البداية",
  habit: "الطريقة القديمة",
  fail2: "الرسوب الثاني",
  recall: "التغيير 1: اختبر روحك",
  solve: "التغيير 2: حلّ وحدك",
  spaced: "التغيير 3: راجع قبل ما تنسى",
  plan: "التغيير 4: برنامج واقعي",
  progress: "التغيير ماشي سحري",
  bac3: "الباك للمرة الثالثة",
  result: "النتيجة",
};

const SetBg: React.FC<{ kind: SetKind; section: string; secStart: number }> = ({ kind, section, secStart }) => {
  const frame = useCurrentFrame();
  switch (kind) {
    case "room": {
      const pass = section === "result";
      const reveal = sec(pass ? (LINES.find((l) => l.text.startsWith("ونجح"))?.start ?? 0) : (LINES[1]?.end ?? 3) + 0.4) - secStart;
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 120, top: 80, width: 300, height: 260, background: "#7FA7C9", border: "14px solid #F3E6CC", borderRadius: 8, ...maskStyle(3) }} />
          <div style={{ position: "absolute", left: 160, top: 690, width: 1600, height: 260, background: "#8E5B3A", borderRadius: "60px 60px 20px 20px", boxShadow: "0 -10px 24px rgba(0,0,0,0.25)", ...maskStyle(5) }} />
          <Family happy={pass && frame >= reveal} sad={!pass && frame >= reveal + 10} />
          <Laptop state={frame >= reveal ? (pass ? "pass" : "fail") : "wait"} at={reveal} />
          {frame === reveal && <Sfx at={reveal} name={pass ? "sparkle" : "mj_hit"} vol={0.35} />}
          {pass &&
            frame >= reveal &&
            Array.from({ length: 50 }, (_, k) => {
              const d = frame - reveal;
              const a = (k / 50) * Math.PI * 2 + k;
              const v = 16 + (k % 5) * 5;
              const cols = [GOLD, RED, PEN, GREEN, "#fff"];
              return d < 50 ? <div key={k} style={{ position: "absolute", left: CX + Math.cos(a) * v * d, top: 420 + Math.sin(a) * v * d + d * d * 0.9, width: 24, height: 14, background: cols[k % 5], transform: `rotate(${d * 20 + k * 40}deg)`, opacity: 1 - d / 50 }} /> : null;
            })}
        </>
      );
    }
    case "night":
      return (
        <>
          <Kraft tint="#3A3F66" dark={0.35} />
          <div style={{ position: "absolute", left: 1400, top: 110, width: 340, height: 300, background: "#1D2346", border: "14px solid #CDBF9E", ...maskStyle(2) }}>
            <Img src={icon("1f319")} style={{ position: "absolute", left: 180, top: 30, width: 120, height: 120, filter: "drop-shadow(0 0 20px rgba(255,230,140,0.9))" }} />
          </div>
          <div style={{ position: "absolute", left: 160, top: 180, width: 300, height: 620, background: "#6E4520", borderRadius: 8, boxShadow: "0 16px 26px rgba(0,0,0,0.5)", transformOrigin: "0% 50%", transform: `perspective(1400px) rotateY(${interpolate(frame, [0, 20], [-60, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}deg)` }}>
            <div style={{ position: "absolute", right: 30, top: 300, width: 30, height: 30, borderRadius: 15, background: GOLD }} />
          </div>
          {frame === 18 && <Sfx at={18} name="paper_slide" vol={0.4} />}
        </>
      );
    case "dawn":
      return (
        <>
          <Kraft tint="#E7B98A" />
          <div style={{ position: "absolute", left: CX - 220, top: 640 - ramp(frame, 0, 90) * 200, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, #FFE08A 0%, #FFB347 55%, rgba(255,179,71,0) 72%)" }} />
        </>
      );
    case "desk":
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 120, top: 700, width: 1680, height: 230, background: "#8E5B3A", borderRadius: 18, boxShadow: "0 -6px 18px rgba(0,0,0,0.25)", ...maskStyle(4) }} />
          <div style={{ position: "absolute", left: 1350, top: 140, width: 500, height: 600, background: "radial-gradient(ellipse at 50% 20%, rgba(255,226,140,0.55) 0%, rgba(0,0,0,0) 65%)" }} />
          <Img src={icon("1f4da")} style={{ position: "absolute", left: 1560, top: 520, width: 220, height: 220, filter: stickerFilter(6) }} />
          <Img src={icon("1f4f1")} style={{ position: "absolute", left: 150, top: 590, width: 150, height: 150, filter: stickerFilter(5), transform: `rotate(${-15 + (Math.floor(frame / 50) % 4 === 0 ? Math.sin(frame * 2) * 4 : 0)}deg)` }} />
        </>
      );
    case "paper":
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 1450, top: 520, opacity: 0.9 }}>
            <Img src={icon("1f4d2")} style={{ width: 260, height: 260, filter: stickerFilter(6) }} />
          </div>
        </>
      );
    case "exercise":
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 1440, top: 480 }}>
            <div style={{ width: 280, height: 360, borderRadius: 16, background: RED, border: "8px solid #8E1E1C", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)", boxShadow: "0 12px 18px rgba(0,0,0,0.35)" }}>
              <div style={{ background: "#FFF8EA", padding: "10px 16px", borderRadius: 10 }}>
                <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: 44 }}>كراس الأخطاء</div>
              </div>
            </div>
          </div>
        </>
      );
    case "calendar": {
      const days = [1, 2, 4, 8, 15];
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 1380, top: 140, width: 440, height: 520 }}>
            <Sheet w={440} h={520} seed={6}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: RED, ...maskStyle(4) }} />
              <div style={{ position: "absolute", inset: "110px 30px 30px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, direction: "rtl" }}>
                {Array.from({ length: 20 }, (_, k) => (
                  <div key={k} style={{ borderRadius: 8, border: `3px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 26, color: days.includes(k + 1) ? "#fff" : "#8A7F6C", background: days.includes(k + 1) && frame > 10 + days.indexOf(k + 1) * 10 ? GREEN : "transparent" }}>
                    {k + 1}
                  </div>
                ))}
              </div>
            </Sheet>
          </div>
        </>
      );
    }
    case "planner":
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 1400, top: 160 }}>
            <Sheet w={420} h={520} seed={7}>
              <div style={{ position: "absolute", top: 24, left: 0, right: 0, textAlign: "center" }}>
                <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: 54, color: PEN }}>برنامج اليوم</div>
              </div>
              {["مهمة 1", "مهمة 2", "مهمة 3", "راحة ☕"].map((t, k) => (
                <div key={k} dir="rtl" style={{ position: "absolute", right: 40, top: 130 + k * 92, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, border: `5px solid ${INK}`, borderRadius: 8, background: frame > 20 + k * 30 ? GREEN : "transparent" }} />
                  <div style={{ fontFamily: FONT, fontSize: 40, color: INK, textDecoration: frame > 20 + k * 30 ? "line-through" : "none" }}>{t}</div>
                </div>
              ))}
            </Sheet>
          </div>
        </>
      );
    case "chart": {
      const p = ramp(frame, 10, 120);
      return (
        <>
          <Kraft />
          <div style={{ position: "absolute", left: 1330, top: 160 }}>
            <Sheet w={520} h={420} seed={8}>
              <svg width="520" height="420" viewBox="0 0 52 42" style={{ position: "absolute", inset: 0 }}>
                <path d="M5 36 L13 30 L19 33 L26 24 L32 27 L39 16 L47 8" stroke={GREEN} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
                <line x1="4" y1="38" x2="49" y2="38" stroke={INK} strokeWidth="0.5" />
              </svg>
            </Sheet>
          </div>
        </>
      );
    }
    case "exam":
      return (
        <>
          <Kraft tint="#D9CDB4" />
          {Array.from({ length: 6 }, (_, k) => (
            <div key={k} style={{ position: "absolute", left: 160 + (k % 3) * 560, top: 520 + Math.floor(k / 3) * 220, width: 420, height: 90, background: "#8E5B3A", borderRadius: 12, boxShadow: "0 10px 14px rgba(0,0,0,0.25)" }} />
          ))}
          <div style={{ position: "absolute", left: CX - 110, top: 80 }}>
            <Img src={icon("23f0")} style={{ width: 220, height: 220, filter: stickerFilter(6), transform: `rotate(${Math.sin(frame / 20) * 4}deg)` }} />
          </div>
        </>
      );
  }
};

/* ---------- per-sentence accents ---------- */
const KEYS: [RegExp, string][] = [
  [/النتيجة|النتائج/, "1f4bb"],
  [/ماما|أمّ/, "1f469"],
  [/يبكي/, "1f622"],
  [/التعب|نتعب/, "1f62b"],
  [/حلم/, "1f4ad"],
  [/والديه/, "1f46a"],
  [/راسب|رسب/, "274c"],
  [/الجامعة/, "1f3db"],
  [/الثانوية/, "1f3eb"],
  [/يتغدى/, "1f37d"],
  [/مكتب/, "1fa91"],
  [/الكراس|كراريس|كراس/, "1f4d2"],
  [/يكتب|كتب/, "270d"],
  [/الامتحان|الاختبار/, "1f4dd"],
  [/مشكل/, "26a0"],
  [/نسى|ناسي|النسيان|ينساه/, "1f9e0"],
  [/تمرين|التمارين/, "1f522"],
  [/الطريقة|طريقة/, "1f504"],
  [/برنامج/, "1f4c5"],
  [/ساعة|الساعات|ساعات/, "23f0"],
  [/الحل|فهمت/, "1f4a1"],
  [/يشك|قدراتو/, "1f615"],
  [/ليلة/, "1f319"],
  [/ورقة/, "1f4c4"],
  [/أسئلة|سؤال/, "2753"],
  [/الغلطة|أخطاء|غلط/, "274c"],
  [/أيام|النهار|يوم/, "1f4c6"],
  [/ضغط/, "1f630"],
  [/الراحة|للراحة/, "1f6cb"],
  [/الفجر|السهر/, "1f305"],
  [/مهام|مهمة/, "2705"],
  [/علاماتو|يتحسن/, "1f4c8"],
  [/الفرق/, "2728"],
  [/خايف/, "1f628"],
  [/الانتظار/, "23f3"],
  [/ونجح/, "1f389"],
  [/ابدا|غدوة/, "1f680"],
  [/يفكر|يتفكر|تفكّر|الذاكرة|ذاكرتو/, "1f9e0"],
  [/يشرح|نشرح/, "1f9d1-200d-1f3eb"],
];
const accentsFor = (t: string) => {
  const out: string[] = [];
  for (const [r, c] of KEYS) if (r.test(t) && !out.includes(c)) out.push(c);
  return out.slice(0, 2);
};
/* the lessons: big quote cards */
const QUOTES = [/^التعرّف على المعلومة/, /^اقرا، غلق الكراس/, /^ما تكتفيش بفهم الحل/, /^راجع على فترات، واختبر/, /^خطّط على حساب/, /^بدّل طريقتك/];
const isQuote = (t: string) => QUOTES.some((q) => q.test(t));
const isQuestion = (t: string) => /^واش هي|^كيفاش نقدر|^علاش طحت|^واش لازم نفهم|^هل /.test(t);

const SECTION_DEFAULT: Record<string, string[]> = {
  open: ["1f4bb"], night: ["1f622", "1f4ad"], turn: ["1f4a1"], habit: ["1f4d6", "1f4d2"], fail2: ["1f4d6", "23f0"], recall: ["1f4c4", "1f9e0"], solve: ["1f522", "1f4a1"], spaced: ["1f4c6", "1f9e0"], plan: ["1f4c5", "2705"], progress: ["1f4c8", "1f4aa"], bac3: ["1f4dd", "1f9e0"], result: ["1f389", "1f46a"],
};
const Accent: React.FC<{ text: string; idx: number; dur: number; hasSide: boolean; section: string }> = ({ text, idx, dur, hasSide, section }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 7, dur, Easing.in(Easing.cubic));
  if (isQuote(text)) {
    const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 12, stiffness: 150 } });
    return (
      <AbsoluteFill style={{ opacity: 1 - out }}>
        <AbsoluteFill style={{ background: `rgba(20,12,4,${0.45 * Math.min(1, p)})` }} />
        <div style={{ position: "absolute", left: CX - 760, top: 200, width: 1520, transform: `rotateX(${(1 - p) * 80}deg) rotate(-1.5deg)`, transformOrigin: "50% 100%" }}>
          <Sheet w={1520} h={440} seed={idx}>
            <div dir="rtl" style={{ position: "absolute", inset: 40, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontSize: 76, lineHeight: 1.35, color: INK }}>
              <span style={{ background: `linear-gradient(transparent 55%, ${MARKER} 55%, ${MARKER} 92%, transparent 92%)`, backgroundSize: `${ramp(frame, 8, 30) * 100}% 100%`, backgroundRepeat: "no-repeat", backgroundPosition: "right" }}>{text}</span>
            </div>
            <Tape x={160} y={4} w={180} rot={-12} />
            <Tape x={1360} y={4} w={180} rot={12} />
          </Sheet>
        </div>
        <Sfx at={0} name="mj_hit" vol={0.18} />
        <Sfx at={4} name="paper_rustle" vol={0.25} />
      </AbsoluteFill>
    );
  }
  const found = accentsFor(text);
  const codes = found.length ? found : (SECTION_DEFAULT[section] ?? []).slice(idx % 2, idx % 2 + 1);
  const q = isQuestion(text);
  const left = hasSide ? 760 : CX;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${out * -30}px)` }}>
      {q && (
        <Pop x={left} y={300} seed={idx} rot={idx % 2 ? 2 : -2} sound="pop" vol={0.15}>
          <div style={{ position: "relative", background: "#fff", borderRadius: 50, padding: "26px 54px", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>
            <div dir="rtl" style={{ fontFamily: FONT, fontSize: 60, color: PEN, whiteSpace: "nowrap" }}>{text}</div>
            <div style={{ position: "absolute", left: 80, bottom: -30, width: 0, height: 0, borderTop: "34px solid #fff", borderRight: "30px solid transparent" }} />
          </div>
        </Pop>
      )}
      {!q &&
        codes.map((c, k) => (
          <Pop key={k} x={left + (codes.length === 2 ? (k ? -240 : 240) : 0)} y={330 + (k % 2) * 30} at={3 + k * 5} seed={idx * 3 + k} rot={(k ? 1 : -1) * 8} sound="pop" vol={0.1}>
            <Em code={c} size={250} />
          </Pop>
        ))}
    </AbsoluteFill>
  );
};

/* ---------- subtitles ---------- */
type Chunk = { start: number; end: number; text: string };
const splitLine = (text: string, start: number, end: number): Chunk[] => {
  const words = text.split(" ");
  if (words.length <= 9) return [{ start, end, text }];
  const parts: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if ((cur.length >= 5 && /[،,:؛.…]$/.test(w)) || cur.length >= 9) {
      parts.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    if (cur.length < 3 && parts.length) parts[parts.length - 1].push(...cur);
    else parts.push(cur);
  }
  const total = words.join("").length;
  let t = start;
  return parts.map((p) => {
    const d = ((end - start) * p.join("").length) / total;
    const c = { start: t, end: t + d, text: p.join(" ") };
    t += d;
    return c;
  });
};
const CHUNKS: Chunk[] = LINES.filter((l) => !isQuote(l.text)).flatMap((l) => splitLine(l.text, l.start, l.end));
const KEY = /^(راسب|رسب|النتيجة|النتائج|التعب|حلم|الطريقة|الكراس|يتعرف|استرجاع|استرجع|الباكالوريا|ونجح|الفرق|النسيان|المرة|الأخطاء|الغلطة|برنامج|فترات|اختبر|ابدا|اليوم|الحقيقي)/;
const Subtitle: React.FC<{ c: Chunk; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const words = c.text.split(" ");
  const per = (dur * 0.95) / words.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 910, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `translateY(${(1 - p) * 30}px) rotate(${idx % 2 ? 0.6 : -0.6}deg)`, opacity: Math.min(1, p * 1.6), filter: "drop-shadow(0 8px 10px rgba(40,20,5,0.4))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "10px 46px 16px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 13px", maxWidth: 1700 }}>
          {words.map((w, i) => {
            const st = Math.floor(i * per);
            const active = frame >= st && frame < Math.floor((i + 1) * per) + 2;
            const hl = KEY.test(w.replace(/^[وفلب]/, "")) || KEY.test(w);
            const mk = ramp(frame, st, st + 6);
            return (
              <span key={i} style={{ fontFamily: FONT, fontSize: 52, lineHeight: 1.35, color: active ? PEN : INK, backgroundImage: hl ? `linear-gradient(transparent 45%, ${MARKER} 45%, ${MARKER} 92%, transparent 92%)` : "none", backgroundRepeat: "no-repeat", backgroundPosition: "right", backgroundSize: hl ? `${mk * 100}% 100%` : "auto" }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------- sections, chip, wipes, intro, end ---------- */
type Bound = { t: number; section: string };
const BOUNDS: Bound[] = [{ t: LINES[0].start - 0.6, section: LINES[0].section }];
for (let i = 1; i < LINES.length; i++) if (LINES[i].section !== LINES[i - 1].section) BOUNDS.push({ t: (LINES[i - 1].end + LINES[i].start) / 2, section: LINES[i].section });
const hasSide = (s: string) => !["room", "night", "dawn"].includes(SECTION_SET[s]);

const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = BOUNDS.filter((x) => x.t <= t).pop() ?? BOUNDS[0];
  const p = spring({ frame: onTwos(frame - sec(b.t) - 8), fps: FPS, config: { damping: 12 } });
  const name = SECTION_NAMES[b.section] ?? "";
  return (
    <div style={{ position: "absolute", right: 40, top: 34, transformOrigin: "100% 0%", transform: `scale(${p}) rotate(2deg)`, opacity: t < LINES[0].start || t > END_AT ? 0 : 1 }}>
      <Sheet w={60 + name.length * 26} h={84} tx="kraft" seed={name.length}>
        <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 40, color: INK }}>{name}</div>
      </Sheet>
    </div>
  );
};
const MJWipe: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [2100, 0, 0, -2250], { ...clamp, easing: ease });
  const mj = ramp(frame, 7, 12);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.28} />
      <Sfx at={2} name="paper_flip" vol={0.16} />
      <Sfx at={10} name="mj_hit" vol={0.2} />
      <div style={{ position: "absolute", left: sheetX(-2) - 160, top: -200, width: 2300, height: 1500, background: GOLD, ...maskStyle(seed) }} />
      <div style={{ position: "absolute", left: sheetX(1) - 80, top: -200, width: 2200, height: 1500, background: "#151515", ...maskStyle(seed + 3) }}>
        <div style={{ position: "absolute", left: 80, top: 200, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT, fontSize: 300, lineHeight: 1, letterSpacing: interpolate(mj, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: mj }}>MJ</div>
          <div style={{ width: 300 * ramp(frame, 10, 15), height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const out = ramp(frame, sec(LINES[0].start) - 10, sec(LINES[0].start), Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Kraft />
      <Pop x={CX} y={380} seed={1} sound="paper_rustle" vol={0.25}>
        <Sheet w={1500} h={240} seed={2}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 100, color: RED, whiteSpace: "nowrap" }}>رسب مرتين في الباكالوريا…</div>
          <Tape x={150} y={4} rot={-12} />
          <Tape x={1350} y={4} rot={12} />
        </Sheet>
      </Pop>
      <Pop x={CX} y={640} at={14} seed={3}>
        <Torn text="لكن المرة الثالثة غيّرت كل شيء!" size={76} seed={4} tx="kraft" bold />
      </Pop>
    </AbsoluteFill>
  );
};
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const p = ramp(frame, 4, 18);
  return (
    <AbsoluteFill style={{ background: "#141414" }}>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.5 }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: FONT, fontSize: 280, lineHeight: 1, letterSpacing: interpolate(p, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: p }}>MJ</div>
        <div style={{ width: 320 * p, height: 6, background: GOLD, borderRadius: 3 }} />
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 52, color: GOLD, opacity: p, marginTop: 16 }}>بدّل طريقتك، وابدا اليوم</div>
        <div style={{ fontFamily: FONT, fontSize: 40, color: "#ddd", opacity: p, marginTop: 10 }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PROMO_AT = (LINES.find((l) => l.start >= 60) ?? LINES[0]).start - 0.2;

export const YT5: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      {BOUNDS.map((b, i) => {
        const to = i < BOUNDS.length - 1 ? BOUNDS[i + 1].t : END_AT;
        const from = Math.max(0, sec(b.t));
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(10, sec(to) - from + 12)} layout="none">
            <SetBg kind={SECTION_SET[b.section]} section={b.section} secStart={from} />
          </Sequence>
        );
      })}
      {LINES.map((l, i) => {
        const from = Math.max(0, sec(l.start - LEAD));
        const to = i < LINES.length - 1 ? sec(LINES[i + 1].start - LEAD) : sec(END_AT);
        if (i < 2) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(8, to - from)} layout="none">
            <Accent text={l.text} idx={i} dur={Math.max(8, to - from)} hasSide={hasSide(l.section)} section={l.section} />
          </Sequence>
        );
      })}
      {CHUNKS.map((c, i) => (
        <Sequence key={i} from={Math.max(0, sec(c.start - 0.1))} durationInFrames={Math.max(6, sec(c.end - c.start))} layout="none">
          <Subtitle c={c} idx={i} />
        </Sequence>
      ))}
      <Chip />
      <Sequence from={sec(PROMO_AT)} durationInFrames={240} layout="none">
        <MiniPromo />
      </Sequence>
      {BOUNDS.slice(1).map((b, i) => (
        <Sequence key={i} from={sec(b.t) - 12} durationInFrames={24} layout="none">
          <MJWipe seed={i} />
        </Sequence>
      ))}
      <Sequence durationInFrames={sec(LINES[0].start)} layout="none">
        <Intro />
      </Sequence>
      <Sequence from={sec(END_AT)} layout="none">
        <EndCard />
      </Sequence>
      <Sequence from={sec(END_AT) - 12} durationInFrames={24} layout="none">
        <MJWipe seed={9} />
      </Sequence>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ height: "100%", width: `${(frame / YT5_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("yt5/narration.wav")} />
      <Audio src={staticFile("yt2/music.wav")} loop volume={(f) => interpolate(f, [0, 20, YT5_FRAMES - 40, YT5_FRAMES], [0, 0.08, 0.08, 0], clamp)} />
    </AbsoluteFill>
  );
};
