/*
 * YouTube video 4 (16:9): "the 60-day challenge" for the first term, with his own
 * MSA voice. Animated kraft desk, one paper visual per sentence, torn-strip
 * subtitles, section chip, MJ wipe between sections, silent subscribe reminder.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { DrawMark, FPS, GOLD, GREEN, H, HAND, INK, MARKER, MJ_GOLD, PEN, RED, Sfx, Sheet, Stamp, TOMATO, Tape, W, clamp, icon, jitter, loadHand, maskStyle, onTwos, ramp, sec, stickerFilter, tex } from "../yt2/kit";
import { MiniPromo } from "../yt3/YT3";
import { LINES, YT4_DURATION } from "./timing";

loadFonts();
loadHand();

export const YT4_FPS = FPS;
const END_AT = LINES[LINES.length - 1].end + 0.6;
export const YT4_FRAMES = Math.round((END_AT + 3.2) * FPS);
const LEAD = 0.25;
void YT4_DURATION;

/* ---------- basics ---------- */
const Desk: React.FC = () => {
  const frame = useCurrentFrame();
  const lx = 50 + Math.sin(frame / 160) * 22;
  const ly = 40 + Math.cos(frame / 190) * 14;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#B98B5A" }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 + Math.sin(frame / 120) * 0.012}) translate(${Math.sin(frame / 220) * 12}px, ${Math.cos(frame / 250) * 8}px)`, filter: "blur(3px) saturate(1.1)" }}>
        <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% ${ly}%, rgba(255,226,170,0.5) 0%, rgba(255,210,150,0.15) 35%, rgba(0,0,0,0) 65%)` }} />
      {Array.from({ length: 22 }, (_, i) => {
        const sp = 0.25 + ((i * 37) % 10) / 20;
        const x = ((((i * 173) % 1920) + frame * sp * (i % 2 ? 1 : -1) * 0.5 + 4000) % 1980) - 30;
        const y = ((i * 97) % 1080) + Math.sin(frame / (40 + i * 3) + i) * 18;
        const s = 6 + (i % 5) * 4;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.7, borderRadius: 2, background: i % 3 ? "rgba(255,240,215,0.5)" : "rgba(90,55,25,0.3)", transform: `rotate(${frame * (i % 2 ? 0.6 : -0.4) + i * 30}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(50,25,8,0.4) 100%)" }} />
    </AbsoluteFill>
  );
};

const Pop: React.FC<{ x: number; y: number; at?: number; rot?: number; seed?: number; sound?: string | null; vol?: number; float?: boolean; children: React.ReactNode }> = ({ x, y, at = 0, rot = 0, seed = 1, sound = "paper_fold", vol = 0.16, float = true, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - at), fps: FPS, config: { damping: 12, stiffness: 170 } });
  return (
    <>
      {sound && <Sfx at={at} name={sound} vol={vol} />}
      {frame >= at && (
        <div style={{ position: "absolute", left: x, top: y, perspective: 1100, transform: "translate(-50%, -50%)" }}>
          <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 95}deg) rotate(${rot + jitter(frame, seed, 0.7)}deg) translateY(${float ? Math.sin(frame / 14 + seed) * 5 : 0}px)` }}>{children}</div>
        </div>
      )}
    </>
  );
};
const Em: React.FC<{ code: string; size: number; style?: React.CSSProperties }> = ({ code, size, style }) => (
  <Img src={icon(code)} style={{ width: size, height: size, display: "block", filter: stickerFilter(Math.max(5, size / 30)), ...style }} />
);
const Hand: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = INK, children, style }) => (
  <div dir="rtl" style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, color, lineHeight: 1.2, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);
const Bold: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, color = INK, children, style }) => (
  <div dir="rtl" style={{ fontFamily: FONT, fontSize: size, color, lineHeight: 1.15, whiteSpace: "nowrap", ...style }}>
    {children}
  </div>
);
const Torn: React.FC<{ text: string; size?: number; color?: string; seed?: number; tx?: "white" | "kraft"; tint?: string; bold?: boolean }> = ({ text, size = 70, color = INK, seed = 3, tx = "white", tint, bold }) => {
  const w = 120 + text.length * size * (bold ? 0.56 : 0.5);
  return (
    <Sheet w={w} h={size * 1.8} tx={tx} seed={seed} tint={tint}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {bold ? (
          <Bold size={size} color={color}>
            {text}
          </Bold>
        ) : (
          <Hand size={size} color={color}>
            {text}
          </Hand>
        )}
      </div>
      <Tape x={w / 2} y={4} />
    </Sheet>
  );
};

/* ---------- visual templates (each one fills one sentence) ---------- */
type V =
  | { t: "title"; text: string; sub?: string; codes?: string[]; color?: string }
  | { t: "num"; n: string; label: string; code?: string; color?: string }
  | { t: "rule"; n: number; text: string; code: string; mark?: "check" | "cross" }
  | { t: "phase"; n: number; name: string; from: number; to: number; color: string }
  | { t: "days"; upTo: number; red?: number; label?: string }
  | { t: "curve" }
  | { t: "timer"; label: string; mins: number }
  | { t: "notes"; title: string; lines: number; code?: string }
  | { t: "recall" }
  | { t: "two"; a: [string, string]; b: [string, string] }
  | { t: "three"; items: [string, string, string]; colors?: [string, string, string]; title?: string }
  | { t: "mix" }
  | { t: "mirror" }
  | { t: "exam" }
  | { t: "errors" }
  | { t: "spaced" }
  | { t: "lastweek" }
  | { t: "balance" }
  | { t: "stickers"; codes: string[]; label?: string }
  | { t: "sheet" }
  | { t: "comment" }
  | { t: "share" }
  | { t: "subscribe" }
  | { t: "phone" }
  | { t: "sleep" };

const VIS: V[] = [
  /* hook */
  { t: "title", text: "الفصل الأول", sub: "يحدد مصير عامك كله", codes: ["1f3af"] },
  { t: "num", n: "↗", label: "بداية قوية = كل شيء أسهل", code: "1f680", color: GREEN },
  { t: "stickers", codes: ["1f3c3", "23f0", "1f625"], label: "تركض خلفه حتى نهاية السنة" },
  { t: "num", n: "60", label: "يومًا فقط", code: "1f4c6", color: RED },
  { t: "num", n: "14", label: "أو أكثر في الفصل الأول", code: "1f3c6", color: GREEN },
  { t: "days", upTo: 60, label: "بشرط: تكمل حتى اليوم 60" },
  { t: "sheet" },
  /* why */
  { t: "title", text: "لماذا 60 يومًا؟", codes: ["1f914"] },
  { t: "curve" },
  { t: "stickers", codes: ["1f62e-200d-1f4a8", "1f4da"], label: "الأيام الأولى صعبة" },
  { t: "stickers", codes: ["2615", "1f4d6"], label: "بعد شهر: عادة مثل الفطور" },
  { t: "days", upTo: 60, label: "من بداية الدراسة حتى الاختبارات" },
  { t: "title", text: "مصمم على مقاس", sub: "الفصل الأول", codes: ["1f4d0"] },
  /* rules */
  { t: "title", text: "5 قواعد", sub: "لا نقاش فيها", codes: ["1f4cc"], color: RED },
  { t: "rule", n: 1, text: "كل يوم، ولو 30 دقيقة", code: "1f4c5" },
  { t: "phone" },
  { t: "rule", n: 3, text: "راجع الدرس في اليوم نفسه", code: "1f4dd" },
  { t: "sleep" },
  { t: "days", upTo: 18, label: "لا تكسر السلسلة" },
  /* phase 1 */
  { t: "phase", n: 1, name: "الأساس", from: 1, to: 20, color: GREEN },
  { t: "two", a: ["ليس كثيرًا", "274c"], b: ["بناء العادة", "2705"] },
  { t: "three", items: ["بومودورو", "ملخص", "استرجاع"], title: "كل يوم 3 أشياء" },
  { t: "timer", label: "بومودورو", mins: 25 },
  { t: "notes", title: "ملخص اليوم", lines: 4, code: "270f" },
  { t: "recall" },
  { t: "stickers", codes: ["1f54c", "1f4d6", "1f60c"], label: "الجمعة: مراجعة ساعة ثم راحة" },
  /* phase 2 */
  { t: "phase", n: 2, name: "التسارع", from: 21, to: 40, color: GOLD },
  { t: "days", upTo: 21, label: "مبروك! العادة تتشكل" },
  { t: "two", a: ["ساعة دروس", "1f4d6"], b: ["ساعة تمارين", "270d"] },
  { t: "stickers", codes: ["2600", "1f9ee", "1f52c", "1f9ea"], label: "الصعب في الصباح" },
  { t: "three", items: ["سهل", "متوسط", "صعب"], colors: [GREEN, GOLD, RED], title: "3 تمارين لكل درس" },
  { t: "mix" },
  { t: "mirror" },
  /* phase 3 */
  { t: "phase", n: 3, name: "وضع الامتحان", from: 41, to: 60, color: RED },
  { t: "title", text: "المرحلة الأهم", codes: ["1f525"], color: RED },
  { t: "exam" },
  { t: "errors" },
  { t: "spaced" },
  { t: "lastweek" },
  /* average */
  { t: "num", n: "14", label: "كيف تحصل عليه؟", code: "1f914", color: PEN },
  { t: "num", n: "20", label: "لست بحاجة إليها في كل المواد", code: "274c", color: RED },
  { t: "balance" },
  { t: "stickers", codes: ["1f54c", "1f3db", "1f30d"], label: "نقاط مضمونة بالحفظ المنظم" },
  { t: "two", a: ["ارفع الكبيرة", "1f4c8"], b: ["اضمن الصغيرة", "2705"] },
  /* quit */
  { t: "stickers", codes: ["1f62b", "1faab"], label: "يوم التعب سيأتي" },
  { t: "stickers", codes: ["1f917"], label: "هذا طبيعي" },
  { t: "days", upTo: 30, red: 24, label: "لا تتوقف يومين متتاليين" },
  { t: "timer", label: "15 دقيقة تكفي", mins: 15 },
  { t: "title", text: "تذكّر لماذا بدأت", codes: ["1f4ad"] },
  { t: "stickers", codes: ["1f46a", "2764", "2b50"], label: "لوالديك… ولنفسك" },
  /* sheet */
  { t: "sheet" },
  { t: "days", upTo: 60, label: "60 خانة" },
  { t: "stickers", codes: ["1f5a8", "1f4cc"], label: "اطبعها وعلّقها" },
  /* cta */
  { t: "comment" },
  { t: "num", n: "60", label: "فيديو النتائج معكم", code: "1f3ac", color: GREEN },
  { t: "share" },
  { t: "subscribe" },
  { t: "num", n: "14+", label: "نلتقي في اليوم الستين", code: "1f91d", color: GREEN },
  { t: "title", text: "والسلام عليكم", codes: ["1f44b"] },
];

const CX = W / 2;
const CY = 430;

const Visual: React.FC<{ v: V; seed: number }> = ({ v, seed }) => {
  const frame = useCurrentFrame();
  switch (v.t) {
    case "title":
      return (
        <>
          <Pop x={CX} y={CY - 40} seed={seed} rot={-1.5} sound="paper_rustle" vol={0.2}>
            <Torn text={v.text} size={110} color={v.color ?? INK} seed={seed} bold />
          </Pop>
          {v.sub && (
            <Pop x={CX} y={CY + 140} at={6} seed={seed + 1} rot={1.5}>
              <Torn text={v.sub} size={64} color={PEN} seed={seed + 2} tx="kraft" />
            </Pop>
          )}
          {(v.codes ?? []).map((c, i) => (
            <Pop key={i} x={CX + (i % 2 ? -1 : 1) * (560 + i * 40)} y={CY - 160 + i * 120} at={8 + i * 4} seed={seed + 3 + i} rot={i % 2 ? -10 : 10} sound="pop" vol={0.12}>
              <Em code={c} size={190} />
            </Pop>
          ))}
        </>
      );
    case "num": {
      const isNum = /^\d+$/.test(v.n);
      const n = isNum ? Math.round(interpolate(frame, [4, 24], [0, Number(v.n)], { ...clamp, easing: Easing.out(Easing.cubic) })) : v.n;
      return (
        <>
          <Pop x={CX - 230} y={CY - 10} seed={seed} rot={-3}>
            <Sheet w={420} h={420} tx="kraft" seed={seed}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: String(v.n).length > 2 ? 190 : 250, color: v.color ?? INK }}>{n}</div>
              <Tape x={210} y={6} w={160} />
            </Sheet>
          </Pop>
          {isNum && frame >= 4 && frame < 24 && frame % 2 === 0 && <Sfx at={frame} name="tick" vol={0.06} />}
          <Pop x={CX + 330} y={CY + 30} at={6} seed={seed + 1} rot={2} sound="paper_rustle">
            <Torn text={v.label} size={62} seed={seed + 2} />
          </Pop>
          {v.code && (
            <Pop x={CX + 330} y={CY - 200} at={12} seed={seed + 3} rot={10} sound="pop" vol={0.12}>
              <Em code={v.code} size={170} />
            </Pop>
          )}
        </>
      );
    }
    case "rule":
      return (
        <>
          <Pop x={CX - 520} y={CY} seed={seed} rot={-6}>
            <Sheet w={260} h={260} tx="kraft" seed={seed}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 190, color: RED }}>{v.n}</div>
              <Tape x={130} y={6} w={110} />
            </Sheet>
          </Pop>
          <Pop x={CX + 120} y={CY - 40} at={5} seed={seed + 1} rot={1} sound="paper_rustle">
            <Torn text={v.text} size={72} seed={seed + 2} />
          </Pop>
          <Pop x={CX + 120} y={CY + 180} at={10} seed={seed + 3} sound="pop" vol={0.12}>
            <Em code={v.code} size={190} />
          </Pop>
        </>
      );
    case "phase": {
      const prog = ramp(frame, 10, 34);
      return (
        <>
          <Pop x={CX} y={CY - 150} seed={seed} rot={-1.5} sound="paper_rustle" vol={0.22}>
            <Sheet w={980} h={230} seed={seed}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
                <Bold size={100} color={v.color === GOLD ? "#C98A00" : v.color}>{`المرحلة ${v.n}`}</Bold>
                <Hand size={84}>{v.name}</Hand>
              </div>
              <Tape x={490} y={4} w={170} />
            </Sheet>
          </Pop>
          {/* 60-day track with this phase lit */}
          <div style={{ position: "absolute", left: CX - 760, top: CY + 90, width: 1520, height: 70, display: "flex", gap: 4, direction: "rtl", opacity: ramp(frame, 6, 14) }}>
            {Array.from({ length: 60 }, (_, i) => {
              const d = i + 1;
              const inPhase = d >= v.from && d <= v.to;
              const lit = inPhase && (d - v.from) / (v.to - v.from + 1) < prog;
              return <div key={i} style={{ flex: 1, borderRadius: 4, background: lit ? v.color : d < v.from ? "rgba(46,158,91,0.55)" : "rgba(255,248,234,0.7)", border: `2px solid ${inPhase ? INK : "rgba(0,0,0,0.15)"}` }} />;
            })}
          </div>
          <Pop x={CX} y={CY + 260} at={12} seed={seed + 2} sound={null}>
            <Bold size={72} color={INK}>{`اليوم ${v.from} ← اليوم ${v.to}`}</Bold>
          </Pop>
        </>
      );
    }
    case "days": {
      const n = Math.min(v.upTo, Math.floor(ramp(frame, 4, 40, Easing.out(Easing.quad)) * v.upTo));
      return (
        <>
          <Pop x={CX} y={CY - 40} seed={seed} rot={-1} sound="paper_fold">
            <Sheet w={1100} h={520} seed={seed}>
              <div style={{ position: "absolute", left: 50, right: 50, top: 50, bottom: 50, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10, direction: "rtl" }}>
                {Array.from({ length: 60 }, (_, i) => {
                  const d = i + 1;
                  const done = d <= n;
                  const red = v.red === d && done;
                  return (
                    <div key={i} style={{ position: "relative", border: `3px solid ${INK}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 30, color: "#8A7F6C", background: done ? (red ? "rgba(215,50,47,0.18)" : "rgba(46,158,91,0.16)") : "transparent" }}>
                      {d}
                      {done && <div style={{ position: "absolute", fontSize: 50, color: red ? RED : GREEN, fontFamily: FONT, lineHeight: 1 }}>{red ? "✗" : "✓"}</div>}
                    </div>
                  );
                })}
              </div>
              <Tape x={120} y={4} rot={-10} />
              <Tape x={980} y={4} rot={10} />
            </Sheet>
          </Pop>
          {frame >= 4 && frame < 40 && frame % 4 === 0 && <Sfx at={frame} name="tick" vol={0.05} />}
          {v.label && (
            <Pop x={CX} y={CY + 290} at={10} seed={seed + 1} rot={1.5} sound="paper_rustle">
              <Torn text={v.label} size={58} color={v.red ? RED : PEN} seed={seed + 2} tx="kraft" />
            </Pop>
          )}
        </>
      );
    }
    case "curve": {
      const p = ramp(frame, 6, 40);
      return (
        <Pop x={CX} y={CY} seed={seed} rot={-1}>
          <Sheet w={1100} h={600} seed={seed}>
            <svg width="1100" height="600" viewBox="0 0 110 60" style={{ position: "absolute", inset: 0 }}>
              <line x1="12" y1="50" x2="102" y2="50" stroke={INK} strokeWidth="0.8" />
              <line x1="12" y1="50" x2="12" y2="8" stroke={INK} strokeWidth="0.8" />
              <path d="M12 12 C 30 14, 40 40, 60 45 S 90 48, 102 48" stroke={RED} strokeWidth="1.6" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
              <line x1="57" y1="10" x2="57" y2="50" stroke={PEN} strokeWidth="0.5" strokeDasharray="1.5 1.5" opacity={ramp(frame, 30, 36)} />
            </svg>
            <div style={{ position: "absolute", right: 30, top: 20 }}>
              <Hand size={44} color={RED}>
                صعوبة العادة
              </Hand>
            </div>
            <div style={{ position: "absolute", left: 40, bottom: 4 }}>
              <Hand size={44}>الأيام</Hand>
            </div>
            <div style={{ position: "absolute", left: 470, top: 40, opacity: ramp(frame, 30, 36) }}>
              <Bold size={46} color={PEN}>
                شهران ← تلقائية
              </Bold>
            </div>
            <Tape x={550} y={4} w={160} />
          </Sheet>
        </Pop>
      );
    }
    case "timer": {
      const p = ramp(frame, 6, 70, Easing.linear);
      const left = Math.max(0, Math.round(v.mins * (1 - p * 0.2)));
      return (
        <>
          <Pop x={CX - 260} y={CY} seed={seed} rot={-3}>
            <div style={{ position: "relative", width: 420, height: 420 }}>
              <svg width="420" height="420" viewBox="0 0 100 100">
                <circle cx="50" cy="54" r="40" fill={TOMATO} stroke={INK} strokeWidth="2.5" />
                <path d="M50 14 L44 6 M50 14 L56 6 M50 14 L50 4" stroke="#3E9B3A" strokeWidth="4" strokeLinecap="round" />
                <circle cx="50" cy="54" r="30" fill="#FFF8EA" stroke={INK} strokeWidth="1.5" />
                <path d={`M50 54 L50 24 A30 30 0 ${p > 0.5 ? 1 : 0} 1 ${50 + 30 * Math.sin(p * 2 * Math.PI)} ${54 - 30 * Math.cos(p * 2 * Math.PI)} Z`} fill={TOMATO} opacity="0.35" />
                <line x1="50" y1="54" x2={50 + 24 * Math.sin(p * 2 * Math.PI)} y2={54 - 24 * Math.cos(p * 2 * Math.PI)} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </Pop>
          <Pop x={CX + 300} y={CY - 70} at={5} seed={seed + 1} sound={null}>
            <Bold size={170} color={INK}>{`${String(left).padStart(2, "0")}:00`}</Bold>
          </Pop>
          <Pop x={CX + 300} y={CY + 130} at={9} seed={seed + 2} rot={2} sound="paper_rustle">
            <Torn text={v.label} size={60} seed={seed + 3} tx="kraft" />
          </Pop>
          {frame >= 6 && frame < 70 && frame % 15 === 0 && <Sfx at={frame} name="tick" vol={0.07} />}
        </>
      );
    }
    case "notes":
      return (
        <>
          <Pop x={CX - 80} y={CY} seed={seed} rot={-2}>
            <div style={{ position: "relative", width: 760, height: 560, filter: "drop-shadow(0 14px 16px rgba(40,20,5,0.35))" }}>
              <Img src={tex("notebook")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...maskStyle(seed) }} />
              <div style={{ position: "absolute", top: 40, right: 60 }}>
                <Hand size={64} color={PEN}>
                  {v.title}
                </Hand>
              </div>
              {Array.from({ length: v.lines }, (_, i) => (
                <div key={i} style={{ position: "absolute", right: 70, top: 160 + i * 88, height: 10, borderRadius: 5, background: INK, opacity: 0.75, width: 560 * ramp(frame, 8 + i * 8, 16 + i * 8) * (i === v.lines - 1 ? 0.6 : 1) }} />
              ))}
              <Tape x={380} y={4} w={150} />
            </div>
          </Pop>
          {v.code && (
            <Pop x={CX + 420} y={CY + 120} at={8} seed={seed + 1} rot={-30} sound={null}>
              <Em code={v.code} size={170} style={{ transform: `translate(${Math.sin(frame / 2) * 6}px, ${Math.cos(frame / 3) * 4}px)` }} />
            </Pop>
          )}
        </>
      );
    case "recall":
      return (
        <>
          <Pop x={CX - 420} y={CY + 20} seed={seed} rot={-6}>
            <Em code="1f4d5" size={300} />
          </Pop>
          <Pop x={CX + 120} y={CY - 170} at={6} seed={seed + 1} sound="pop" vol={0.12}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 50, padding: "26px 50px", boxShadow: "0 12px 18px rgba(0,0,0,0.25)" }}>
              <Bold size={66} color={PEN}>
                ماذا فهمت اليوم؟
              </Bold>
              <div style={{ position: "absolute", left: 60, bottom: -30, width: 0, height: 0, borderTop: "34px solid #fff", borderRight: "30px solid transparent" }} />
            </div>
          </Pop>
          <Pop x={CX + 140} y={CY + 170} at={14} seed={seed + 2} rot={1}>
            <Sheet w={640} h={250} seed={seed + 3}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ position: "absolute", right: 50, top: 50 + i * 60, height: 9, borderRadius: 5, background: PEN, width: 520 * ramp(frame, 18 + i * 7, 26 + i * 7) }} />
              ))}
            </Sheet>
          </Pop>
          <Pop x={CX + 560} y={CY - 260} at={22} seed={seed + 4} sound={null}>
            <Em code="1f9e0" size={150} />
          </Pop>
        </>
      );
    case "two":
      return (
        <>
          {[v.a, v.b].map(([txt, code], i) => (
            <Pop key={i} x={CX + (i ? -380 : 380)} y={CY} at={i * 8} seed={seed + i} rot={i ? 3 : -3}>
              <Sheet w={560} h={460} seed={seed + i} tx={i ? "kraft" : "white"}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <Img src={icon(code)} style={{ width: 170, height: 170 }} />
                  <Bold size={64}>{txt}</Bold>
                </div>
                <Tape x={280} y={6} />
              </Sheet>
            </Pop>
          ))}
          <Pop x={CX} y={CY} at={12} seed={seed + 5} sound={null}>
            <Bold size={120} color={RED}>
              +
            </Bold>
          </Pop>
        </>
      );
    case "three":
      return (
        <>
          {v.title && (
            <Pop x={CX} y={CY - 280} seed={seed} sound="paper_rustle">
              <Torn text={v.title} size={60} seed={seed} tx="kraft" />
            </Pop>
          )}
          {v.items.map((txt, i) => (
            <Pop key={i} x={CX + (1 - i) * 520} y={CY + 60} at={4 + i * 6} seed={seed + i} rot={(i - 1) * 3}>
              <Sheet w={440} h={400} seed={seed + i}>
                <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center", fontFamily: FONT, fontSize: 130, color: v.colors?.[i] ?? PEN }}>{i + 1}</div>
                <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                  <Bold size={64} color={v.colors?.[i] ?? INK}>
                    {txt}
                  </Bold>
                </div>
                <Tape x={220} y={6} />
              </Sheet>
            </Pop>
          ))}
        </>
      );
    case "mix": {
      const cols = [PEN, GREEN, RED];
      const order = frame < 24 ? [0, 0, 0, 1, 1, 1, 2, 2, 2] : [0, 1, 2, 2, 0, 1, 1, 2, 0];
      return (
        <>
          <Pop x={CX} y={CY - 280} seed={seed} sound="paper_rustle">
            <Torn text={frame < 24 ? "نفس النوع ✗" : "اخلط كالامتحان ✓"} size={60} color={frame < 24 ? RED : GREEN} seed={seed} tx="kraft" />
          </Pop>
          {order.map((k, i) => {
            const x = CX + (4 - i) * 170;
            return (
              <div key={i} style={{ position: "absolute", left: x - 70, top: CY - 20, width: 140, height: 200, borderRadius: 14, background: "#FFF8EA", border: `6px solid ${cols[k]}`, boxShadow: "0 8px 10px rgba(0,0,0,0.25)", transform: `rotate(${jitter(frame, i, 3)}deg) translateY(${frame >= 24 && frame < 34 ? Math.sin(((frame - 24) / 10) * Math.PI) * -60 : 0}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 70, color: cols[k], opacity: ramp(frame, 2 + i, 6 + i) }}>
                {["أ", "ب", "ج"][k]}
              </div>
            );
          })}
          <Sfx at={24} name="paper_flip" vol={0.2} />
        </>
      );
    }
    case "mirror":
      return (
        <>
          <Pop x={CX + 300} y={CY} seed={seed} rot={2}>
            <div style={{ width: 380, height: 560, borderRadius: 190, background: "linear-gradient(135deg, #DDEEF5, #9CC3D4)", border: "16px solid #8A5A2B", boxShadow: "0 16px 22px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={icon("1f9d1-200d-1f3eb")} style={{ width: 220, height: 220, transform: "scaleX(-1)", opacity: 0.85 }} />
            </div>
          </Pop>
          <Pop x={CX - 300} y={CY + 40} at={5} seed={seed + 1}>
            <Em code="1f9d1-200d-1f3eb" size={280} />
          </Pop>
          <Pop x={CX - 300} y={CY - 260} at={10} seed={seed + 2} sound="paper_rustle">
            <Torn text="اشرح ببساطة" size={58} seed={seed + 3} />
          </Pop>
          <Pop x={CX + 620} y={CY - 260} at={22} seed={seed + 4} rot={10} sound="pop" vol={0.12}>
            <Em code="2753" size={130} />
          </Pop>
        </>
      );
    case "exam": {
      const p = ramp(frame, 6, 80, Easing.linear);
      return (
        <>
          <Pop x={CX - 160} y={CY} seed={seed} rot={-2}>
            <Sheet w={700} h={600} seed={seed}>
              <div style={{ position: "absolute", top: 34, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <Hand size={64} color={PEN}>
                  موضوع السنوات السابقة
                </Hand>
              </div>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ position: "absolute", right: 60, left: 60, top: 160 + i * 100, display: "flex", alignItems: "center", gap: 16, direction: "rtl" }}>
                  <Bold size={44} color={PEN}>{`${i + 1}.`}</Bold>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#CFC5B2" }} />
                  {frame >= 20 + i * 12 && <span style={{ fontFamily: FONT, fontSize: 52, color: GREEN }}>✓</span>}
                </div>
              ))}
              <Tape x={350} y={4} w={160} />
            </Sheet>
          </Pop>
          <Pop x={CX + 470} y={CY - 60} at={5} seed={seed + 1} rot={4}>
            <Sheet w={340} h={200} seed={seed + 2} tx="kraft">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 92, color: p > 0.8 ? RED : INK }}>{`${String(Math.floor(3 - p * 3)).padStart(2, "0")}:${String(Math.floor((1 - ((p * 3) % 1)) * 59)).padStart(2, "0")}`}</div>
            </Sheet>
          </Pop>
          <Pop x={CX + 470} y={CY + 170} at={9} seed={seed + 3} sound={null}>
            <Em code="23f0" size={150} />
          </Pop>
        </>
      );
    }
    case "errors":
      return (
        <>
          <Pop x={CX - 560} y={CY} seed={seed} rot={-8}>
            <div style={{ width: 300, height: 400, borderRadius: 18, background: RED, boxShadow: "0 14px 20px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", border: "6px solid #8E1E1C" }}>
              <div style={{ background: "#FFF8EA", padding: "16px 20px", borderRadius: 10, transform: "rotate(-3deg)" }}>
                <Hand size={50}>دفتر الأخطاء</Hand>
              </div>
            </div>
          </Pop>
          <Pop x={CX + 200} y={CY} at={6} seed={seed + 1} rot={1}>
            <Sheet w={900} h={460} seed={seed + 2}>
              <div style={{ position: "absolute", inset: 40, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, direction: "rtl" }}>
                {[
                  ["الخطأ", RED],
                  ["لماذا؟", GOLD],
                  ["التصحيح", GREEN],
                ].map(([h, c], i) => (
                  <div key={i} style={{ borderTop: `8px solid ${c}`, paddingTop: 14, opacity: ramp(frame, 10 + i * 8, 16 + i * 8) }}>
                    <Bold size={50} color={c as string}>
                      {h}
                    </Bold>
                    {[0, 1, 2].map((k) => (
                      <div key={k} style={{ marginTop: 34, height: 8, borderRadius: 4, background: "#CFC5B2", width: `${90 - k * 15}%` }} />
                    ))}
                  </div>
                ))}
              </div>
            </Sheet>
          </Pop>
        </>
      );
    case "spaced": {
      const days = [1, 3, 7];
      return (
        <>
          <Pop x={CX} y={CY - 260} seed={seed} sound="paper_rustle">
            <Torn text="التكرار المتباعد" size={64} seed={seed} tx="kraft" />
          </Pop>
          <svg width="1500" height="200" viewBox="0 0 150 20" style={{ position: "absolute", left: CX - 750, top: CY - 20 }}>
            <path d="M10 10 L140 10" stroke={INK} strokeWidth="0.8" strokeDasharray="2 2" pathLength={1} />
          </svg>
          {days.map((d, i) => (
            <Pop key={i} x={CX + 560 - i * 560} y={CY + 80} at={6 + i * 10} seed={seed + i} rot={(i - 1) * 3} sound="pop" vol={0.12}>
              <Sheet w={300} h={300} seed={seed + i} tx={i % 2 ? "kraft" : "white"}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Hand size={46} color={PEN}>
                    {i === 0 ? "اليوم" : "بعد"}
                  </Hand>
                  <Bold size={110}>{i === 0 ? "1" : String(d)}</Bold>
                  <Hand size={46}>{i === 0 ? "" : d === 7 ? "أسبوع" : "أيام"}</Hand>
                </div>
                <Tape x={150} y={6} w={110} />
              </Sheet>
            </Pop>
          ))}
        </>
      );
    }
    case "lastweek":
      return (
        <>
          <Pop x={CX} y={CY - 270} seed={seed} sound="paper_rustle">
            <Torn text="الأسبوع الأخير" size={64} seed={seed} color={RED} tx="kraft" />
          </Pop>
          {[
            ["دروس جديدة", "1f4d6", "cross"],
            ["مراجعة وتمارين", "1f4dd", "check"],
            ["نوم جيد", "1f634", "check"],
          ].map(([txt, code, mark], i) => (
            <React.Fragment key={i}>
              <Pop x={CX + (1 - i) * 520} y={CY + 60} at={4 + i * 8} seed={seed + i} rot={(i - 1) * 3}>
                <Sheet w={440} h={380} seed={seed + i}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                    <Img src={icon(code)} style={{ width: 150, height: 150 }} />
                    <Bold size={54}>{txt}</Bold>
                  </div>
                  <Tape x={220} y={6} />
                </Sheet>
              </Pop>
              <DrawMark kind={mark as "check" | "cross"} x={CX + (1 - i) * 520 + 150} y={CY - 70} size={130} at={14 + i * 8} />
            </React.Fragment>
          ))}
        </>
      );
    case "balance": {
      const tilt = interpolate(spring({ frame: frame - 14, fps: FPS, config: { damping: 7 } }), [0, 1], [0, -12]);
      return (
        <>
          <Pop x={CX} y={CY - 290} seed={seed} sound="paper_rustle">
            <Torn text="المعامل الكبير أولًا" size={60} seed={seed} tx="kraft" />
          </Pop>
          <div style={{ position: "absolute", left: CX - 20, top: CY - 60, width: 40, height: 400, background: "#8A5A2B", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: CX - 140, top: CY + 320, width: 280, height: 40, background: "#8A5A2B", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: CX - 600, top: CY - 80, width: 1200, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
            <div style={{ height: 26, background: "#6E4520", borderRadius: 13 }} />
            {[
              { x: 60, txt: "رياضيات ×5", c: RED, big: true },
              { x: 860, txt: "مواد ×2", c: PEN, big: false },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", left: s.x, top: 26, width: 280, transform: `rotate(${-tilt}deg)`, transformOrigin: "50% 0%" }}>
                <div style={{ width: 4, height: 120, background: INK, margin: "0 auto" }} />
                <Sheet w={280} h={s.big ? 200 : 150} seed={seed + i} tx={s.big ? "kraft" : "white"}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bold size={s.big ? 52 : 44} color={s.c}>
                      {s.txt}
                    </Bold>
                  </div>
                </Sheet>
              </div>
            ))}
          </div>
          <Sfx at={14} name="mj_hit" vol={0.12} />
        </>
      );
    }
    case "stickers":
      return (
        <>
          {v.codes.map((c, i) => {
            const nC = v.codes.length;
            const x = CX + (i - (nC - 1) / 2) * -360;
            return (
              <Pop key={i} x={x} y={CY - 60 + (i % 2) * 40} at={i * 5} seed={seed + i} rot={(i % 2 ? -1 : 1) * 8} sound="pop" vol={0.12}>
                <Em code={c} size={nC > 3 ? 220 : 260} />
              </Pop>
            );
          })}
          {v.label && (
            <Pop x={CX} y={CY + 250} at={8} seed={seed + 7} rot={-1.5} sound="paper_rustle">
              <Torn text={v.label} size={64} seed={seed + 2} />
            </Pop>
          )}
        </>
      );
    case "phone":
      return (
        <>
          <Pop x={CX - 360} y={CY} seed={seed} rot={-6}>
            <div style={{ position: "relative" }}>
              <Em code="1f4f1" size={300} style={{ transform: `translateX(${-ramp(frame, 20, 34, Easing.in(Easing.cubic)) * 900}px)` }} />
            </div>
          </Pop>
          <DrawMark kind="cross" x={CX - 360} y={CY} size={300} at={10} />
          <Pop x={CX + 280} y={CY - 80} at={4} seed={seed + 1} sound="paper_rustle">
            <Sheet w={720} h={170} seed={seed + 2} tx="kraft">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Bold size={110} color={RED}>
                  2
                </Bold>
                <Hand size={64}>الهاتف في غرفة أخرى</Hand>
              </div>
            </Sheet>
          </Pop>
          <Pop x={CX + 280} y={CY + 140} at={12} seed={seed + 3} sound={null}>
            <Em code="1f6aa" size={200} />
          </Pop>
          <Sfx at={20} name="paper_slide" vol={0.2} />
        </>
      );
    case "sleep":
      return (
        <>
          <Pop x={CX - 380} y={CY} seed={seed} rot={-6}>
            <Em code="1f634" size={280} />
          </Pop>
          {[0, 1, 2].map((k) => {
            const d = (frame + k * 12) % 36;
            return (
              <div key={k} style={{ position: "absolute", left: CX - 230 + d * 4, top: CY - 150 - d * 6, fontFamily: FONT, fontSize: 60 + k * 10, color: PEN, opacity: frame > 8 ? 1 - d / 36 : 0 }}>
                Z
              </div>
            );
          })}
          <Pop x={CX + 280} y={CY - 80} at={4} seed={seed + 1} sound="paper_rustle">
            <Sheet w={760} h={170} seed={seed + 2} tx="kraft">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Bold size={110} color={RED}>
                  4
                </Bold>
                <Hand size={64}>نوم 7 ساعات على الأقل</Hand>
              </div>
            </Sheet>
          </Pop>
          <Pop x={CX + 280} y={CY + 150} at={12} seed={seed + 3} sound={null}>
            <Em code="1f9e0" size={190} />
          </Pop>
        </>
      );
    case "sheet":
      return <ChallengeSheet />;
    case "comment":
      return (
        <Pop x={CX} y={CY} seed={seed}>
          <div style={{ width: 1200, background: "#fff", borderRadius: 30, padding: "30px 40px", boxShadow: "0 18px 26px rgba(0,0,0,0.3)", direction: "rtl" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Img src={icon("1f9d1-200d-1f393")} style={{ width: 110, height: 110 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 64, color: INK }}>
                  {"أنا معك في التحدي 💪 معدلي 11".slice(0, Math.max(0, Math.floor((frame - 6) / 1.4)))}
                  <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0, color: PEN }}>|</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 30, marginTop: 20, marginRight: 134, alignItems: "center" }}>
              <span style={{ fontSize: 44, transform: `scale(${frame > 52 ? 1 + 0.3 * Math.max(0, 1 - (frame - 52) / 8) : 1})`, color: frame > 52 ? RED : "#999" }}>{frame > 52 ? "❤" : "♡"}</span>
              <span style={{ fontFamily: FONT, fontSize: 36, color: "#888" }}>{frame > 52 ? "1.2K" : "0"}</span>
            </div>
          </div>
          {frame >= 6 && frame < 50 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.05} />}
          <Sfx at={52} name="pop" vol={0.15} />
        </Pop>
      );
    case "share":
      return <ShareFx />;
    case "subscribe":
      return <SubscribeFx />;
  }
};

/* the printable challenge sheet */
const ChallengeSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.floor(ramp(frame, 10, 60) * 60);
  const rows: [string, string, string][] = [
    ["الأساس", "1 ← 20", GREEN],
    ["التسارع", "21 ← 40", "#C98A00"],
    ["وضع الامتحان", "41 ← 60", RED],
  ];
  return (
    <Pop x={CX} y={CY + 20} rot={-1.5} seed={9}>
      <Sheet w={1300} h={760} seed={6}>
        <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 24, alignItems: "center" }}>
          <Bold size={66}>تحدي 60 يوم</Bold>
          <Hand size={52} color={PEN}>
            الفصل الأول – هدفي 14
          </Hand>
        </div>
        {rows.map(([name, range, c], r) => (
          <div key={r} style={{ position: "absolute", left: 50, right: 50, top: 150 + r * 190, direction: "rtl" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
              <Bold size={44} color={c}>{`المرحلة ${r + 1}: ${name}`}</Bold>
              <Hand size={40} color="#8A7F6C">
                {range}
              </Hand>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {Array.from({ length: 20 }, (_, i) => {
                const d = r * 20 + i + 1;
                return (
                  <div key={i} style={{ flex: 1, height: 52, border: `3px solid ${INK}`, borderRadius: 6, position: "relative", background: d <= n ? `${c}33` : "transparent" }}>
                    {d <= n && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 40, color: c }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ background: MARKER, padding: "2px 24px 8px" }}>
            <Hand size={44}>قاعدتي: لا أتوقف يومين متتاليين</Hand>
          </div>
        </div>
        <Tape x={110} y={4} w={170} rot={-14} />
        <Tape x={1190} y={4} w={170} rot={14} />
      </Sheet>
      {frame >= 10 && frame < 60 && frame % 3 === 0 && <Sfx at={frame} name="tick" vol={0.04} />}
    </Pop>
  );
};

const ShareFx: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 10;
  const cx = CX;
  const cy = CY;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const friends = [
    { code: "1f468-200d-1f393", x: cx - 620, y: cy - 220 },
    { code: "1f469-200d-1f393", x: cx - 640, y: cy + 200 },
    { code: "1f9d1-200d-1f393", x: cx + 620, y: cy - 220 },
    { code: "1f929", x: cx + 640, y: cy + 200 },
  ];
  return (
    <>
      <div style={{ position: "absolute", left: cx - 600, top: cy - 600, width: 1200, height: 1200, borderRadius: "50%", transform: `rotate(${frame * 0.7}deg)`, background: "repeating-conic-gradient(rgba(255,236,190,0.35) 0deg 9deg, rgba(0,0,0,0) 9deg 18deg)", WebkitMaskImage: "radial-gradient(circle, #000 12%, transparent 60%)", opacity: ramp(frame, tap, tap + 8) }} />
      {frame > tap &&
        [0, 1].map((k) => {
          const r = ((frame - tap + k * 10) % 20) / 20;
          return <div key={k} style={{ position: "absolute", left: cx - 140 - r * 120, top: cy - 140 - r * 120, width: 280 + r * 240, height: 280 + r * 240, borderRadius: "50%", border: `7px solid ${GOLD}`, opacity: (1 - r) * 0.7 }} />;
        })}
      <Pop x={cx} y={cy} seed={3} float={false}>
        <div style={{ transform: `scale(${frame > tap ? interpolate(press, [0, 0.4, 1], [1, 0.85, 1]) : 1})` }}>
          <Sheet w={280} h={280} tint={PEN} seed={3} style={{ borderRadius: 999 }}>
            <svg width="280" height="280" viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
              <path d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z" fill="white" stroke={INK} strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </Sheet>
        </div>
      </Pop>
      {frame < tap + 12 && <Em code="1f446" size={160} style={{ position: "absolute", left: interpolate(frame, [0, tap - 2], [cx + 400, cx - 20], { ...clamp, easing: Easing.out(Easing.cubic) }), top: interpolate(frame, [0, tap - 2], [cy + 500, cy + 60], { ...clamp, easing: Easing.out(Easing.cubic) }), transform: `rotate(-15deg) scale(${interpolate(frame - tap, [-2, 0, 3], [1, 0.82, 1], clamp)})` }} />}
      <Sfx at={tap} name="click" vol={0.35} />
      {friends.map((fr, i) => {
        const launch = tap + 4 + i * 3;
        const t = spring({ frame: onTwos(frame - launch), fps: FPS, config: { damping: 200 }, durationInFrames: 14 });
        const arrived = frame >= launch + 14;
        const px = interpolate(t, [0, 1], [cx, fr.x]);
        const py = interpolate(t, [0, 1], [cy, fr.y]) - Math.sin(t * Math.PI) * 120;
        const ang = (Math.atan2(fr.y - cy, fr.x - cx) * 180) / Math.PI + 45;
        return (
          <React.Fragment key={i}>
            {frame >= launch && !arrived && (
              <svg width="100" height="100" viewBox="0 0 24 24" style={{ position: "absolute", left: px - 50, top: py - 50, transform: `rotate(${ang}deg)` }}>
                <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke={INK} strokeWidth="0.8" strokeLinejoin="round" />
              </svg>
            )}
            {arrived && (
              <div style={{ position: "absolute", left: fr.x - 85, top: fr.y - 85, transform: `scale(${spring({ frame: frame - launch - 14, fps: FPS, config: { damping: 9 } })})` }}>
                <Em code={fr.code} size={170} />
                <div style={{ position: "absolute", right: -6, bottom: -6, width: 60, height: 60, borderRadius: 30, background: GREEN, border: "5px solid #fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900 }}>✓</div>
              </div>
            )}
            <Sfx at={launch} name="paper_slide" vol={0.1} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const SubscribeFx: React.FC = () => {
  const frame = useCurrentFrame();
  const tap = 16;
  const done = frame >= tap;
  const press = spring({ frame: frame - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  return (
    <>
      <Pop x={CX} y={CY - 20} seed={2} float={false}>
        <div style={{ width: 1100, borderRadius: 30, overflow: "hidden", background: "#0F0F0F", border: "10px solid #fff", boxShadow: "0 20px 30px rgba(0,0,0,0.4)" }}>
          <Img src={staticFile("promo/banner.png")} style={{ width: "100%", display: "block" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "20px 26px" }}>
            <Img src={staticFile("promo/avatar.png")} style={{ width: 110, height: 110, borderRadius: 55, border: "4px solid #fff" }} />
            <div style={{ flex: 1, fontFamily: "Roboto, Arial, sans-serif", color: "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 44 }}>Abdelwahab Mj</div>
              <div style={{ fontSize: 28, color: "#AAA" }}>@abdelwahab__mj</div>
            </div>
            <div style={{ height: 84, padding: "0 36px", borderRadius: 42, background: done ? "#272727" : "#FF0033", color: "#fff", display: "flex", alignItems: "center", gap: 12, fontFamily: "Roboto, Arial, sans-serif", fontWeight: 800, fontSize: 38, transform: `scale(${done ? interpolate(press, [0, 0.4, 1], [1, 0.88, 1]) : 1})` }}>
              {done && <span style={{ display: "inline-block", transform: `rotate(${frame > tap + 4 && frame < tap + 30 ? Math.sin(frame * 1.6) * 22 : 0}deg)` }}>🔔</span>}
              {done ? "Subscribed" : "Subscribe"}
            </div>
          </div>
        </div>
      </Pop>
      {frame > tap - 12 && frame < tap + 16 && <Em code="1f446" size={150} style={{ position: "absolute", left: interpolate(spring({ frame: frame - tap + 12, fps: FPS, config: { damping: 16 } }), [0, 1], [1700, CX + 360]), top: interpolate(spring({ frame: frame - tap + 12, fps: FPS, config: { damping: 16 } }), [0, 1], [1000, CY + 170]), transform: `rotate(-18deg) scale(${interpolate(frame - tap, [-2, 0, 3], [1, 0.82, 1], clamp)})` }} />}
      <Sfx at={tap} name="click" vol={0.35} />
      <Sfx at={tap + 4} name="ring" vol={0.12} />
    </>
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
    if ((cur.length >= 6 && /[،,:؛.]$/.test(w)) || cur.length >= 9) {
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
const CHUNKS: Chunk[] = LINES.flatMap((l) => splitLine(l.text, l.start, l.end));
const KEY = /^(60|ستين|ستون|14|أربعة|عشر|القاعدة|المرحلة|يوم|يومًا|العادة|التحدي|الفصل|المعامل|البومودورو|فاينمان|الأخطاء|المتباعد|الامتحان|صفر|السلسلة|مبروك)/;
const Subtitle: React.FC<{ c: Chunk; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const p = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 14, stiffness: 200 } });
  const words = c.text.split(" ");
  const per = (dur * 0.95) / words.length;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 905, display: "flex", justifyContent: "center" }}>
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
              <span key={i} style={{ fontFamily: FONT, fontSize: 54, lineHeight: 1.35, color: active ? PEN : INK, backgroundImage: hl ? `linear-gradient(transparent 45%, ${MARKER} 45%, ${MARKER} 92%, transparent 92%)` : "none", backgroundRepeat: "no-repeat", backgroundPosition: "right", backgroundSize: hl ? `${mk * 100}% 100%` : "auto" }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------- sections ---------- */
const SECTION_NAMES: Record<string, string> = {
  hook: "تحدي 60 يوم",
  why: "لماذا 60 يومًا؟",
  rules: "القواعد الخمس",
  p1: "المرحلة 1: الأساس",
  p2: "المرحلة 2: التسارع",
  p3: "المرحلة 3: الامتحان",
  avg: "معدل 14",
  quit: "يوم التعب",
  sheet: "ورقة التحدي",
  cta: "نلتقي في اليوم 60",
};
const BOUNDS: { t: number; section: string }[] = [];
for (let i = 1; i < LINES.length; i++) if (LINES[i].section !== LINES[i - 1].section) BOUNDS.push({ t: (LINES[i - 1].end + LINES[i].start) / 2, section: LINES[i].section });
const sectionAt = (t: number) => [{ t: -1, section: "hook" }, ...BOUNDS].filter((b) => b.t <= t).pop()!.section;

const Chip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const s = sectionAt(t);
  const since = frame - sec([{ t: 0, section: "hook" }, ...BOUNDS].filter((b) => b.section === s && b.t <= t).pop()!.t);
  const p = spring({ frame: onTwos(since - 8), fps: FPS, config: { damping: 12 } });
  return (
    <div style={{ position: "absolute", right: 40, top: 34, transformOrigin: "100% 0%", transform: `scale(${p}) rotate(2deg)`, opacity: t < LINES[0].start ? 0 : 1 }}>
      <Sheet w={60 + SECTION_NAMES[s].length * 26} h={84} tx="kraft" seed={s.length}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bold size={40}>{SECTION_NAMES[s]}</Bold>
        </div>
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
      <Pop x={CX} y={400} seed={1} sound="paper_rustle" vol={0.25}>
        <Sheet w={1100} h={300} seed={2}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Bold size={150} color={RED}>
              تحدي 60 يوم
            </Bold>
          </div>
          <Tape x={150} y={4} rot={-12} />
          <Tape x={950} y={4} rot={12} />
        </Sheet>
      </Pop>
      <Pop x={CX} y={650} at={10} seed={3}>
        <Torn text="الفصل الأول ← معدل 14" size={70} seed={4} tx="kraft" />
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
        <div style={{ fontFamily: FONT, fontSize: 44, color: GOLD, opacity: p, marginTop: 16 }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* visual windows: from 0.25 s before a line until 0.25 s before the next one */
const WINDOWS = LINES.map((l, i) => ({ from: l.start - LEAD, to: i < LINES.length - 1 ? LINES[i + 1].start - LEAD : END_AT }));
const PROMO_AT = (LINES.find((l) => l.start >= 60) ?? LINES[0]).start - 0.2;

const Fold: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const out = ramp(frame, dur - 7, dur, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${out * -40}px) scale(${1 - out * 0.05})` }}>{children}</AbsoluteFill>;
};

export const YT4: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#B98B5A" }}>
      <Desk />
      <Sequence durationInFrames={sec(LINES[0].start)} layout="none">
        <Intro />
      </Sequence>
      {WINDOWS.map((w, i) => (
        <Sequence key={i} from={sec(w.from)} durationInFrames={Math.max(8, sec(w.to - w.from))} layout="none">
          <Fold dur={Math.max(8, sec(w.to - w.from))}>
            <Visual v={VIS[i] ?? VIS[0]} seed={i * 3 + 1} />
          </Fold>
        </Sequence>
      ))}
      {CHUNKS.map((c, i) => (
        <Sequence key={i} from={sec(c.start - 0.1)} durationInFrames={Math.max(6, sec(c.end - c.start))} layout="none">
          <Subtitle c={c} idx={i} />
        </Sequence>
      ))}
      <Chip />
      <Sequence from={sec(PROMO_AT)} durationInFrames={240} layout="none">
        <MiniPromo />
      </Sequence>
      {BOUNDS.map((b, i) => (
        <Sequence key={i} from={sec(b.t) - 12} durationInFrames={24} layout="none">
          <MJWipe seed={i} />
        </Sequence>
      ))}
      <Sequence from={sec(END_AT)} layout="none">
        <EndCard />
      </Sequence>
      <Sequence from={sec(END_AT) - 12} durationInFrames={24} layout="none">
        <MJWipe seed={9} />
      </Sequence>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "rgba(0,0,0,0.2)" }}>
        <div style={{ height: "100%", width: `${(frame / YT4_FRAMES) * 100}%`, background: GOLD }} />
      </div>
      <div style={{ position: "absolute", left: 36, bottom: 30, fontFamily: FONT, fontSize: 48, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))", opacity: frame > sec(END_AT) ? 0 : 0.9 }}>MJ</div>
      <Sfx at={0} name="riser" vol={0.3} />
      <Audio src={staticFile("yt4/narration.wav")} />
      <Audio src={staticFile("yt2/music.wav")} loop volume={(f) => interpolate(f, [0, 20, YT4_FRAMES - 40, YT4_FRAMES], [0, 0.08, 0.08, 0], clamp)} />
    </AbsoluteFill>
  );
};

/* ---------- thumbnail ---------- */
export const YT4Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#B98B5A", overflow: "hidden" }}>
    <AbsoluteFill style={{ filter: "blur(2px)" }}>
      <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 300 - 900, top: 360 - 900, width: 1800, height: 1800, borderRadius: "50%", background: "repeating-conic-gradient(rgba(255,236,190,0.3) 0deg 9deg, rgba(0,0,0,0) 9deg 18deg)", WebkitMaskImage: "radial-gradient(circle, #000 15%, transparent 55%)" }} />
    {/* calendar */}
    <div style={{ position: "absolute", left: 70, top: 120, width: 470, height: 520, transform: "rotate(-5deg)", filter: "drop-shadow(0 16px 18px rgba(30,15,5,0.5))" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(2) }}>
        <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 130, background: RED, ...maskStyle(4) }} />
      <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 70, color: "#fff" }}>يوم</div>
      <div style={{ position: "absolute", top: 140, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 300, lineHeight: 1.1, color: INK }}>60</div>
      <Tape x={235} y={0} w={160} />
    </div>
    <div dir="rtl" style={{ position: "absolute", right: 50, top: 70, width: 680, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 120, lineHeight: 1.05, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", filter: "drop-shadow(0 8px 0 #000)" }}>تحدي</div>
      <div style={{ fontFamily: FONT, fontSize: 96, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", filter: "drop-shadow(0 8px 0 #000)" }}>الفصل الأول</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 20, marginTop: 30, background: "#fff", border: "6px solid #000", borderRadius: 24, padding: "0 30px", transform: "rotate(-3deg)" }}>
        <span style={{ fontFamily: FONT, fontSize: 64, color: INK }}>معدل</span>
        <span style={{ fontFamily: FONT, fontSize: 150, lineHeight: 1.1, color: GREEN, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>14</span>
      </div>
    </div>
    <Img src={icon("1f525")} style={{ position: "absolute", left: 470, top: 40, width: 150, height: 150, transform: "rotate(14deg)", filter: stickerFilter(7) }} />
    <Img src={icon("1f3c6")} style={{ position: "absolute", left: 470, top: 520, width: 160, height: 160, transform: "rotate(-10deg)", filter: stickerFilter(7) }} />
    <div style={{ position: "absolute", left: 30, top: 18, fontFamily: FONT, fontSize: 64, letterSpacing: -3, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>MJ</div>
  </AbsoluteFill>
);
