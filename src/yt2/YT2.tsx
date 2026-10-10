/*
 * YouTube video 2 (16:9, ~7 min): the Pomodoro technique.
 * A paper study-room setup that the camera travels through, a paper cut-out of
 * the host (stills from his own clips, swapped per sentence), MSA narration,
 * torn-strip subtitles, MJ transitions, tomato timer everywhere.
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { ENV, ENV_FPS } from "./env";
import {
  Bold,
  Card,
  DrawMark,
  FPS,
  GOLD,
  GREEN,
  H,
  Hand,
  INK,
  Label,
  MARKER,
  MJ_GOLD,
  NumberBadge,
  PEN,
  RED,
  Sfx,
  Sheet,
  Stamp,
  Sticker,
  TOMATO,
  Tape,
  Unfold,
  W,
  clamp,
  icon,
  jitter,
  loadHand,
  maskStyle,
  onTwos,
  ramp,
  sec,
  stickerFilter,
  tex,
} from "./kit";
import { Room, TomatoTimer, WORLD_H, WORLD_W } from "./Setup";
import { LINES, YT2_DURATION } from "./timing";

loadFonts();
loadHand();

export const YT2_FPS = FPS;
export const YT2_FRAMES = Math.round(YT2_DURATION * FPS);

const L = (i: number) => LINES[i];
// frame, relative to a scene starting at `from` s, when line i reaches `frac` of its length
const at = (from: number, i: number, frac = 0) => sec(L(i).start + (L(i).end - L(i).start) * frac - from);
// frame when a word/phrase of line i is spoken (estimated by character position)
const word = (from: number, i: number, w: string) => {
  const t = L(i).text;
  const k = t.indexOf(w);
  return at(from, i, k < 0 ? 0 : k / t.length);
};

// content area (the host stands at the bottom-left)
const CX = 1180;
const CY = 470;

type SceneProps = { from: number };

/* ======================= scenes ======================= */

const S_Hours: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame, [6, at(from, 0, 0.6)], [0, 3], clamp);
  return (
    <AbsoluteFill>
      <Unfold x={CX - 260} y={CY} delay={4} seed={3}>
        <Sheet w={460} h={460} seed={3}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Img src={icon("23f1")} style={{ width: 170, height: 170, transform: `rotate(${jitter(frame, 2, 4)}deg)` }} />
            <Bold size={90}>{h.toFixed(1)} ساعة</Bold>
          </div>
        </Sheet>
      </Unfold>
      <Unfold x={CX + 280} y={CY} delay={at(from, 0, 0.62)} seed={4}>
        <Sheet w={460} h={460} seed={4}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Img src={icon("1f62b")} style={{ width: 170, height: 170 }} />
            <Bold size={74} color={RED}>
              0 إنجاز
            </Bold>
          </div>
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

const S_Phone: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const ph = word(from, 1, "الهاتف");
  const notes = ["رسالة جديدة 💬", "إعجاب ❤️", "فيديو جديد ▶️", "إشعار 🔔"];
  return (
    <AbsoluteFill>
      <Sticker code="1f4d6" x={CX - 380} y={CY} size={240} delay={2} rot={-8} seed={5} />
      <Unfold x={CX + 80} y={CY + 20} delay={ph} seed={6} sound="click">
        <div style={{ width: 300, height: 560, borderRadius: 44, background: "#1C1C22", border: "8px solid #fff", boxShadow: "0 20px 30px rgba(0,0,0,0.35)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 14, borderRadius: 30, background: "linear-gradient(180deg,#4a5bd0,#9b5de5)" }} />
          {notes.map((n, i) => {
            const t = ph + 8 + i * 7;
            const p = spring({ frame: frame - t, fps: FPS, config: { damping: 12 } });
            return frame >= t ? (
              <div key={i} dir="rtl" style={{ position: "absolute", left: 24, right: 24, top: 60 + i * 96, height: 80, borderRadius: 18, background: "rgba(255,255,255,0.92)", transform: `translateY(${(1 - p) * -40}px)`, opacity: p, fontFamily: FONT, fontSize: 26, display: "flex", alignItems: "center", padding: "0 16px", color: INK }}>
                {n}
              </div>
            ) : null;
          })}
        </div>
      </Unfold>
      {notes.map((_, i) => (
        <Sfx key={i} at={ph + 8 + i * 7} name="click" vol={0.15} />
      ))}
      <Label text="سأبدأ بعد قليل..." x={CX + 420} y={CY + 290} delay={word(from, 1, "سأبدأ")} size={52} tx="kraft" rot={3} />
      <Sticker code="1f605" x={CX + 470} y={CY - 150} size={170} delay={word(from, 1, "سأبدأ") + 6} rot={10} seed={7} />
    </AbsoluteFill>
  );
};

const S_Title: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 2, "اسمها");
  const p = spring({ frame: onTwos(frame - t0), fps: FPS, config: { damping: 10, stiffness: 140 } });
  const mins = interpolate(frame, [t0, t0 + 40], [0, 25], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Sfx at={t0} name="windup" vol={0.3} />
      <Sfx at={t0 + 6} name="sparkle" vol={0.18} />
      <div style={{ position: "absolute", left: CX - 470, top: CY - 230, transform: `scale(${p}) rotate(${(1 - p) * -40}deg)` }}>
        <TomatoTimer size={420} minutes={mins} />
      </div>
      <Unfold x={CX + 280} y={CY - 40} delay={t0 + 8} seed={8} sound="paper_slide">
        <div style={{ textAlign: "center", background: "rgba(255,252,244,0.95)", padding: "20px 50px 30px", borderRadius: 8, boxShadow: "0 14px 20px rgba(60,40,20,0.3)" }}>
          <Hand size={56} color="#555">
            طريقة
          </Hand>
          <Hand size={130} color={TOMATO} style={{ lineHeight: 1.1 }}>
            البومودورو
          </Hand>
          <div style={{ margin: "8px auto 0", width: 520 * ramp(frame, t0 + 16, t0 + 30), height: 20, background: MARKER, borderRadius: 10 }} />
        </div>
      </Unfold>
    </AbsoluteFill>
  );
};

const S_Teaser: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t17 = word(from, 3, "سبعة");
  const t18 = word(from, 3, "ثمانية");
  const n = frame < t18 ? interpolate(frame, [t17 - 10, t17 + 6], [10, 17], clamp) : interpolate(frame, [t18, t18 + 8], [17, 18], clamp);
  const arrow = ramp(frame, at(from, 4, 0), at(from, 4, 0.6));
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY - 20} delay={4} seed={9}>
        <Sheet w={620} h={480} seed={9}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Hand size={52}>المعدل</Hand>
            <div style={{ fontFamily: FONT, fontSize: 200, lineHeight: 1, color: n >= 17 ? GREEN : INK }}>
              {Math.round(n)}
              <span style={{ fontSize: 90, color: "#888" }}>/20</span>
            </div>
          </div>
          <Tape x={310} y={6} />
        </Sheet>
      </Unfold>
      <Sfx at={t17} name="mj_hit" vol={0.2} />
      <Sfx at={t18} name="sparkle" vol={0.2} />
      <Stamp text="في منتصف الفيديو" x={CX + 330} y={CY + 230} delay={word(from, 3, "منتصف")} color={PEN} rot={-8} size={56} />
      {/* arrow pointing at the middle of the progress bar */}
      {arrow > 0 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={`M${CX + 330} ${CY + 300} C ${CX + 200} 900, 1000 940, 960 1050`} fill="none" stroke={TOMATO} strokeWidth="10" strokeLinecap="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - arrow} />
          {arrow > 0.95 && <polygon points="960,1062 940,1030 984,1036" fill={TOMATO} />}
        </svg>
      )}
    </AbsoluteFill>
  );
};

const S_Italy: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Stamp text="نهاية الثمانينات" x={CX - 320} y={CY - 230} delay={6} color={INK} rot={-6} size={56} />
    <Sticker code="1f1ee-1f1f9" x={CX + 330} y={CY - 120} size={230} delay={word(from, 5, "إيطاليا")} rot={8} seed={10} />
    <Card x={CX - 120} y={CY + 80} delay={word(from, 5, "طالب")} title="فرانشيسكو" sub="طالب جامعي" code="1f468-200d-1f393" seed={11} w={440} h={420} />
  </AbsoluteFill>
);

const S_WeakFocus: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const lvl = interpolate(frame, [word(from, 6, "لكن"), at(from, 6, 1)], [0.8, 0.15], clamp);
  return (
    <AbsoluteFill>
      <Sticker code="1f4da" x={CX - 380} y={CY - 40} size={230} delay={word(from, 6, "يدرس")} rot={-8} seed={12} />
      <Unfold x={CX + 180} y={CY} delay={word(from, 6, "لكن")} seed={13}>
        <Sheet w={560} h={330} seed={13}>
          <div style={{ position: "absolute", top: 30, right: 40 }}>
            <Hand size={52}>التركيز</Hand>
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 150, height: 90, border: `7px solid ${INK}`, borderRadius: 20 }}>
            <div style={{ position: "absolute", right: 6, top: 6, bottom: 6, width: `calc(${lvl * 100}% - 12px)`, borderRadius: 12, background: lvl < 0.35 ? RED : GOLD }} />
          </div>
        </Sheet>
      </Unfold>
      <Sticker code="1f634" x={CX + 470} y={CY - 200} size={150} delay={at(from, 6, 0.85)} rot={10} seed={14} />
    </AbsoluteFill>
  );
};

const S_Kitchen: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t10 = word(from, 7, "عشر");
  const t25 = word(from, 8, "خمسا");
  const mins = frame < t25 ? interpolate(frame, [t10 - 8, t10 + 14], [0, 10], { ...clamp, easing: Easing.out(Easing.cubic) }) : interpolate(frame, [t25 - 4, t25 + 22], [10, 25], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Sfx at={t10 - 8} name="windup" vol={0.3} />
      <Sfx at={t25 - 4} name="windup" vol={0.3} />
      <Unfold x={CX - 180} y={CY} delay={word(from, 7, "ساعة")} seed={15} sound="paper_slide">
        <TomatoTimer size={440} minutes={mins} />
      </Unfold>
      <Unfold x={CX + 360} y={CY - 60} delay={t10 - 8} seed={16}>
        <Sheet w={360} h={220} tx="kraft" seed={16}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bold size={84} color={frame >= t25 ? TOMATO : INK}>
              {Math.round(mins)} د
            </Bold>
          </div>
        </Sheet>
      </Unfold>
      <DrawMark kind="check" x={CX + 360} y={CY + 140} size={140} at={at(from, 8, 0.3)} />
      <Sticker code="1f37d" x={CX - 470} y={CY - 250} size={120} delay={word(from, 7, "مطبخ")} rot={-12} seed={17} />
    </AbsoluteFill>
  );
};

const S_Dictionary: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Unfold x={CX} y={CY} delay={4} seed={18}>
      <Sheet w={900} h={420} seed={18}>
        <div style={{ position: "absolute", top: 40, left: 60, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 76, color: INK }}>pomodoro</div>
        <div style={{ position: "absolute", top: 140, left: 60, fontFamily: "Georgia, serif", fontSize: 34, color: "#777" }}>(italiano) · /po·mo·dò·ro/</div>
        <div style={{ position: "absolute", bottom: 50, right: 60, display: "flex", alignItems: "center", gap: 20 }}>
          <Hand size={90} color={TOMATO}>
            = طماطم
          </Hand>
        </div>
        <Tape x={450} y={6} />
      </Sheet>
    </Unfold>
    <Sticker code="1f345" x={CX - 330} y={CY + 130} size={190} delay={word(from, 11, "معناها")} rot={-10} seed={19} />
  </AbsoluteFill>
);

const S_Millions: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 12, "ملايين");
  return (
    <AbsoluteFill>
      <Sticker code="1f30d" x={CX} y={CY - 40} size={330} delay={2} seed={20} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const d = t0 + i * 2;
        return frame >= d ? (
          <Img
            key={i}
            src={icon(i % 2 ? "1f468-200d-1f393" : "1f9d1-200d-1f393")}
            style={{ position: "absolute", left: CX + Math.cos(a) * 330 - 50, top: CY - 40 + Math.sin(a) * 260 - 50, width: 100, height: 100, transform: `scale(${spring({ frame: frame - d, fps: FPS, config: { damping: 9 } })})`, filter: stickerFilter(4) }}
          />
        ) : null;
      })}
      <Sfx at={t0} name="sparkle" vol={0.2} />
    </AbsoluteFill>
  );
};

const S_Reasons: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="لماذا تنجح؟" x={CX} y={CY - 250} delay={2} size={70} />
    {[0, 1, 2].map((i) => (
      <NumberBadge key={i} n={i + 1} x={CX + 330 - i * 330} y={CY + 80} delay={word(from, 13, "لثلاثة") + i * 5} size={230} seed={i + 1} />
    ))}
  </AbsoluteFill>
);

const S_Battery: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const drain = interpolate(frame, [word(from, 14, "يفرغ"), word(from, 14, "ويحتاج")], [1, 0.12], clamp);
  const charge = interpolate(frame, [at(from, 15, 0.2), at(from, 15, 0.95)], [0, 0.88], clamp);
  const lvl = drain + charge;
  const charging = frame > at(from, 15, 0.2);
  return (
    <AbsoluteFill>
      <NumberBadge n={1} x={CX + 500} y={CY - 250} delay={0} size={130} seed={4} />
      <Unfold x={CX - 40} y={CY} delay={4} seed={21}>
        <div style={{ position: "relative", width: 620, height: 300 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 580, height: 300, borderRadius: 40, border: `14px solid ${INK}`, background: "#fff" }} />
          <div style={{ position: "absolute", left: 590, top: 100, width: 40, height: 100, borderRadius: 10, background: INK }} />
          <div style={{ position: "absolute", left: 26, top: 26, height: 248, width: 528 * lvl, borderRadius: 22, background: lvl < 0.3 ? RED : lvl < 0.6 ? GOLD : GREEN }} />
          {charging && <div style={{ position: "absolute", left: 230, top: 40, fontSize: 180, lineHeight: 1, filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.3))" }}>⚡</div>}
        </div>
      </Unfold>
      <Label text="التركيز = بطارية" x={CX - 40} y={CY - 260} delay={word(from, 14, "التركيز")} size={56} tx="kraft" />
      <Card x={CX + 30} y={CY + 330} delay={at(from, 15, 0.1)} title="استراحة = شحن" code="2615" seed={22} w={460} h={200} />
    </AbsoluteFill>
  );
};

const S_Deadline: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 16, "محدود");
  const left = interpolate(frame, [t0, at(from, 17, 0.8)], [25, 0.2], clamp);
  const mm = Math.floor(left);
  const ss = Math.floor((left - mm) * 60);
  return (
    <AbsoluteFill>
      <NumberBadge n={2} x={CX + 500} y={CY - 250} delay={0} size={130} seed={5} />
      <Unfold x={CX - 120} y={CY - 20} delay={4} seed={23}>
        <Sheet w={640} h={360} seed={23}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 170, color: left < 5 ? RED : INK }}>
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </div>
        </Sheet>
      </Unfold>
      {frame > t0 && frame < at(from, 17, 0.8) && <Sfx at={t0} name="ticktock" vol={0.15} />}
      <Sticker code="1f525" x={CX + 330} y={CY + 230} size={150} delay={word(from, 16, "بجدية")} rot={10} seed={24} />
      <Stamp text="لا تأجيل" x={CX - 120} y={CY + 260} delay={word(from, 17, "فلا")} />
    </AbsoluteFill>
  );
};

const S_EasyStart: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <NumberBadge n={3} x={CX + 500} y={CY - 250} delay={0} size={130} seed={6} />
    <Label text="البداية تصبح سهلة" x={CX} y={CY - 250} delay={word(from, 18, "البداية")} size={56} tx="kraft" />
    <Card x={CX + 230} y={CY + 60} delay={word(from, 19, "أربع")} title="4 ساعات" code="1f92f" seed={25} w={420} h={400} color={RED} />
    <Stamp text="مخيف" x={CX + 230} y={CY + 290} delay={word(from, 19, "يخيفك")} rot={-8} size={60} />
    <Card x={CX - 260} y={CY + 60} delay={word(from, 20, "خمسا")} title="25 دقيقة" code="1f60e" seed={26} w={420} h={400} color={GREEN} />
    <Stamp text="سهل ✓" x={CX - 260} y={CY + 290} delay={word(from, 20, "سهل")} color={GREEN} rot={6} size={60} />
  </AbsoluteFill>
);

/* ---- steps ---- */
const StepHeader: React.FC<{ n: number; text: string; delay?: number }> = ({ n, text, delay = 0 }) => (
  <Unfold x={CX} y={150} delay={delay} seed={n + 30} sound="paper_slide">
    <Sheet w={980} h={130} seed={n + 30}>
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 26, padding: "0 40px" }}>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: TOMATO, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Hand size={62} color="#fff">
            {n}
          </Hand>
        </div>
        <Hand size={54}>{text}</Hand>
      </div>
    </Sheet>
  </Unfold>
);

const S_StepsIntro: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="خطوة بخطوة" x={CX} y={CY - 200} delay={4} size={80} />
    {[0, 1, 2, 3, 4].map((i) => (
      <React.Fragment key={i}>
        <Sticker code="1f345" x={CX + 440 - i * 220} y={CY + 120} size={150} delay={at(from, 22, 0.35) + i * 4} seed={i + 40} sound={i === 0 ? "paper_fold" : null} />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

const S_Step1: React.FC<SceneProps> = ({ from }) => {
  const cross = word(from, 24, "بل");
  return (
    <AbsoluteFill>
      <StepHeader n={1} text="حدد مهمة واحدة واضحة" />
      <Card x={CX + 250} y={CY + 120} delay={word(from, 24, "سأدرس")} title="سأدرس الرياضيات" code="1f4d0" seed={41} w={460} h={380} />
      <DrawMark kind="cross" x={CX + 250} y={CY + 120} size={300} at={cross} />
      <Card x={CX - 270} y={CY + 120} delay={cross + 6} title="أحل 3 تمارين في الدوال" code="1f3af" seed={42} w={460} h={380} color={GREEN} />
      <DrawMark kind="check" x={CX - 100} y={CY + 280} size={120} at={at(from, 24, 0.95)} />
    </AbsoluteFill>
  );
};

const S_Step2: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 25, "اضبط");
  const mins = interpolate(frame, [t0, t0 + 30], [0, 25], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  return (
    <AbsoluteFill>
      <StepHeader n={2} text="اضبط المؤقت على 25 دقيقة" />
      <Sfx at={t0} name="windup" vol={0.32} />
      <Unfold x={CX} y={CY + 110} delay={4} seed={43} sound={null}>
        <TomatoTimer size={480} minutes={mins} />
      </Unfold>
      <Unfold x={CX + 420} y={CY + 110} delay={t0 + 20} seed={44}>
        <Sheet w={260} h={160} tx="kraft" seed={44}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bold size={70}>25:00</Bold>
          </div>
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

const S_Step3: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const mins = interpolate(frame, [0, at(from, 29, 1)], [25, 17], clamp);
  const tPhone = word(from, 28, "الهاتف");
  const tPaper = word(from, 29, "اكتبه");
  const items = ["أرسل رسالة لصديقي", "أبحث عن فيلم", "أشتري قلمًا"];
  return (
    <AbsoluteFill>
      <StepHeader n={3} text="اعمل بتركيز كامل" />
      <Sfx at={4} name="ticktock" vol={0.12} />
      <Unfold x={CX - 360} y={CY + 120} delay={4} seed={45} sound={null}>
        <TomatoTimer size={330} minutes={mins} />
      </Unfold>
      {/* phone banned */}
      {frame < tPaper - 4 && (
        <>
          <Sticker code="1f4f5" x={CX + 120} y={CY + 120} size={220} delay={tPhone} seed={46} />
          <Sticker code="1f515" x={CX + 420} y={CY + 120} size={180} delay={word(from, 28, "والإشعارات")} seed={47} rot={8} />
        </>
      )}
      {frame >= tPaper - 4 && (
        <Unfold x={CX + 250} y={CY + 140} delay={tPaper - 4} seed={48}>
          <Sheet w={560} h={420} seed={48}>
            <div style={{ position: "absolute", top: 26, right: 36 }}>
              <Hand size={46} color={PEN}>
                ورقة جانبية: لاحقًا
              </Hand>
            </div>
            {items.map((t, i) => (
              <div key={i} style={{ position: "absolute", right: 40, top: 120 + i * 90, opacity: ramp(frame, tPaper + i * 10, tPaper + i * 10 + 8), clipPath: `inset(0 0 0 ${100 - ramp(frame, tPaper + i * 10, tPaper + i * 10 + 14) * 100}%)` }}>
                <Hand size={44}>• {t}</Hand>
              </div>
            ))}
          </Sheet>
        </Unfold>
      )}
    </AbsoluteFill>
  );
};

const S_Step4: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const ring = word(from, 31, "يرن");
  const shake = frame >= ring && frame < ring + 40 ? 1 : 0;
  const tBreak = word(from, 31, "وخذ");
  return (
    <AbsoluteFill>
      <StepHeader n={4} text="توقف، واستراحة 5 دقائق" />
      <Sfx at={ring} name="ring" vol={0.28} />
      <Unfold x={CX - 330} y={CY + 120} delay={2} seed={49} sound={null}>
        <TomatoTimer size={340} minutes={0} shake={shake} />
      </Unfold>
      {shake > 0 &&
        [0, 1, 2].map((k) => (
          <div key={k} style={{ position: "absolute", left: CX - 330 - 200 - k * 30, top: CY + 120 - 200 - k * 30, width: 400 + k * 60, height: 400 + k * 60, borderRadius: "50%", border: `6px solid ${TOMATO}`, opacity: 0.6 - k * 0.18 - ((frame - ring) % 12) / 30 }} />
        ))}
      <Card x={CX + 230} y={CY + 60} delay={tBreak} title="5 دقائق راحة" code="2615" seed={50} w={420} h={300} color={GREEN} />
      {["1f4a7", "1f6b6", "1f9d8"].map((c, i) => (
        <Sticker key={c} code={c} x={CX + 60 + i * 170} y={CY + 330} size={130} delay={at(from, 32, 0.1 + i * 0.3)} seed={51 + i} rot={i * 6 - 6} />
      ))}
    </AbsoluteFill>
  );
};

const CycleBar: React.FC<{ start: number; dur: number; show: number }> = ({ start, dur, show }) => {
  const frame = useCurrentFrame();
  const segs: { kind: "work" | "short" | "long"; w: number }[] = [];
  for (let k = 0; k < 4; k++) {
    segs.push({ kind: "work", w: 25 });
    if (k < 3) segs.push({ kind: "short", w: 5 });
  }
  segs.push({ kind: "long", w: 25 });
  const total = segs.reduce((a, s) => a + s.w, 0);
  const scale = 1260 / total;
  const prog = interpolate(frame, [start, start + dur], [0, total], clamp);
  let acc = 0;
  return (
    <div dir="rtl" style={{ position: "absolute", left: CX - 630, top: CY + 40, width: 1260, height: 180, display: "flex", gap: 0 }}>
      {segs.map((s, i) => {
        const a = acc;
        acc += s.w;
        const vis = i < show;
        const fill = Math.max(0, Math.min(1, (prog - a) / s.w));
        const col = s.kind === "work" ? TOMATO : s.kind === "short" ? GREEN : PEN;
        return (
          <div key={i} style={{ width: s.w * scale, height: 180, position: "relative", opacity: vis ? 1 : 0, transform: `translateY(${vis ? 0 : 20}px)` }}>
            <div style={{ position: "absolute", inset: 6, borderRadius: 16, background: "#fff", border: `5px solid ${col}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: col, opacity: 0.35 }} />
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {s.kind === "work" ? <Img src={icon("1f345")} style={{ width: 70, height: 70 }} /> : s.kind === "short" ? <Img src={icon("2615")} style={{ width: 44, height: 44 }} /> : <Img src={icon("1f6cb")} style={{ width: 80, height: 80 }} />}
              <div style={{ fontFamily: FONT, fontSize: s.kind === "short" ? 24 : 32, color: col }}>{s.kind === "work" ? "25" : s.kind === "short" ? "5" : "15-30"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const S_Step5: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t4 = word(from, 33, "أربع");
  const tLong = word(from, 33, "طويلة");
  const show = frame < t4 ? 0 : frame < tLong ? Math.min(7, Math.floor((frame - t4) / 4) + 1) : 8;
  return (
    <AbsoluteFill>
      <StepHeader n={5} text="بعد 4 جلسات: استراحة طويلة" />
      <CycleBar start={at(from, 34, 0.05)} dur={at(from, 34, 0.95) - at(from, 34, 0.05)} show={show} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Sfx key={i} at={t4 + i * 4} name="paper_fold" vol={0.12} />
      ))}
      <Sfx at={tLong} name="sparkle" vol={0.18} />
      <Label text="هذه هي الدورة الكاملة" x={CX} y={CY + 340} delay={at(from, 34, 0)} size={52} tx="kraft" />
    </AbsoluteFill>
  );
};

/* ---- the 17 section ---- */
const S_17Q: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = word(from, 35, "سبعة");
  const p = spring({ frame: frame - t, fps: FPS, config: { damping: 7, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <Sfx at={t} name="mj_hit" vol={0.28} />
      <Sfx at={t + 2} name="sparkle" vol={0.22} />
      <Label text="كيف تصل إلى" x={CX} y={130} delay={2} size={60} />
      <div style={{ position: "absolute", left: CX - 330, top: CY - 300, width: 660, height: 600, borderRadius: "50%", background: "radial-gradient(circle, #1d1d22 0%, #1d1d22 55%, rgba(29,29,34,0) 72%)", transform: `scale(${p})` }} />
      <div style={{ position: "absolute", left: CX - 300, top: CY - 220, width: 600, textAlign: "center", fontFamily: FONT, fontSize: 340, lineHeight: 1.1, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", transform: `scale(${p})`, filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.4))" }}>
        17
      </div>
      {p > 0.5 &&
        Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = interpolate(frame - t, [0, 20], [100, 360], clamp);
          return <div key={i} style={{ position: "absolute", left: CX + Math.cos(a) * r, top: CY + Math.sin(a) * r * 0.7, width: 16, height: 16, borderRadius: 4, background: [TOMATO, GOLD, GREEN, PEN][i % 4], opacity: interpolate(frame - t, [10, 30], [1, 0], clamp), transform: `rotate(${i * 30}deg)` }} />;
        })}
      <Sticker code="1f345" x={CX + 380} y={CY + 230} size={160} delay={word(from, 35, "بهذه")} rot={12} seed={60} />
    </AbsoluteFill>
  );
};

const S_Secret: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="السر" x={CX} y={CY - 260} delay={2} size={72} />
    <Card x={CX + 250} y={CY + 60} delay={word(from, 36, "عدد")} title="عدد الساعات" code="23f0" seed={61} w={440} h={380} />
    <DrawMark kind="cross" x={CX + 250} y={CY + 60} size={260} at={word(from, 36, "بل")} />
    <Card x={CX - 260} y={CY + 60} delay={word(from, 36, "بل")} title="الجلسات المركزة" code="1f345" seed={62} w={440} h={380} color={GREEN} />
    <DrawMark kind="check" x={CX - 90} y={CY + 220} size={120} at={at(from, 36, 0.95)} />
  </AbsoluteFill>
);

const S_SixSessions: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t6 = word(from, 37, "ست");
  const tCompare = at(from, 38, 0.05);
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY - 140} delay={2} seed={63}>
        <Sheet w={1100} h={260} seed={63}>
          <div dir="rtl" style={{ position: "absolute", top: 20, right: 40 }}>
            <Hand size={44}>6 جلسات = ساعتان ونصف تركيز حقيقي</Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, bottom: 30, display: "flex", gap: 30, justifyContent: "center" }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Img key={i} src={icon("1f345")} style={{ width: 110, height: 110, transform: `scale(${spring({ frame: frame - (t6 + i * 4), fps: FPS, config: { damping: 9 } })})` }} />
            ))}
          </div>
        </Sheet>
      </Unfold>
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} at={t6 + i * 4} name="click" vol={0.15} />
      ))}
      <Unfold x={CX} y={CY + 250} delay={tCompare} seed={64}>
        <Sheet w={1100} h={240} seed={64}>
          <div dir="rtl" style={{ position: "absolute", top: 20, right: 40 }}>
            <Hand size={44} color={RED}>
              6 ساعات مع الهاتف كل 5 دقائق
            </Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, bottom: 30, display: "flex", gap: 14, justifyContent: "center" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Img key={i} src={icon(i % 2 ? "1f4f1" : "1f4d6")} style={{ width: 70, height: 70, opacity: frame > tCompare + i * 2 ? 1 : 0 }} />
            ))}
          </div>
        </Sheet>
      </Unfold>
      <Stamp text="أضعف" x={CX + 420} y={CY + 300} delay={word(from, 38, "وأنت") + 6} size={60} />
    </AbsoluteFill>
  );
};

const S_Week: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 39, "ستة");
  const days = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const filled = Math.max(0, Math.floor((frame - t0) / 1.6));
  const tTotal = word(from, 39, "ستا");
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 10} delay={2} seed={65}>
        <Sheet w={1160} h={700} seed={65}>
          {days.map((d, r) => (
            <div key={r} dir="rtl" style={{ position: "absolute", right: 40, top: 40 + r * 102, display: "flex", alignItems: "center", gap: 16 }}>
              <Hand size={38} style={{ width: 180 }}>
                {d}
              </Hand>
              {Array.from({ length: 6 }, (_, c) => {
                const k = r * 6 + c;
                return (
                  <div key={c} style={{ width: 84, height: 84, borderRadius: 14, border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", background: k < filled ? "#FFE3DF" : "transparent" }}>
                    {k < filled && <Img src={icon("1f345")} style={{ width: 62, height: 62 }} />}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ position: "absolute", left: 50, top: 230, textAlign: "center", opacity: ramp(frame, tTotal, tTotal + 8) }}>
            <div style={{ fontFamily: FONT, fontSize: 150, color: TOMATO, lineHeight: 1 }}>36</div>
            <Hand size={40}>جلسة / أسبوع</Hand>
          </div>
        </Sheet>
      </Unfold>
      {Array.from({ length: 12 }, (_, i) => (
        <Sfx key={i} at={t0 + i * 5} name="click" vol={0.1} />
      ))}
      <Sfx at={tTotal} name="mj_hit" vol={0.2} />
    </AbsoluteFill>
  );
};

const S_Coef: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const subs: [string, number, string][] = [
    ["المادة الأساسية", 6, TOMATO],
    ["المادة الثانية", 5, "#F28C28"],
    ["المادة الثالثة", 3, GOLD],
    ["مادة أخرى", 2, GREEN],
  ];
  const t0 = word(from, 40, "حسب");
  return (
    <AbsoluteFill>
      <Label text="حسب المعامل" x={CX} y={CY - 280} delay={2} size={60} tx="kraft" />
      <Unfold x={CX} y={CY + 80} delay={4} seed={66}>
        <Sheet w={1160} h={560} seed={66}>
          {subs.map(([name, n, col], i) => (
            <div key={i} dir="rtl" style={{ position: "absolute", right: 40, top: 40 + i * 125, display: "flex", alignItems: "center", gap: 18 }}>
              <Hand size={40} style={{ width: 300 }}>
                {name}
              </Hand>
              <div style={{ height: 90, width: 120 * n * ramp(frame, t0 + i * 6, t0 + i * 6 + 16), background: col, borderRadius: 14, display: "flex", alignItems: "center", gap: 6, padding: "0 10px", overflow: "hidden" }}>
                {Array.from({ length: n }, (_, k) => (
                  <Img key={k} src={icon("1f345")} style={{ width: 66, height: 66, flexShrink: 0 }} />
                ))}
              </div>
            </div>
          ))}
        </Sheet>
      </Unfold>
      <Stamp text="معامل كبير = جلسات أكثر" x={CX - 220} y={CY + 380} delay={word(from, 40, "تأخذ")} color={PEN} rot={-4} size={46} />
    </AbsoluteFill>
  );
};

const S_Pair: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Card x={CX + 260} y={CY - 30} delay={word(from, 42, "الأولى")} title="الجلسة 1: الفهم" code="1f4d6" seed={67} w={480} h={400} />
    <Sticker code="2795" x={CX} y={CY - 30} size={90} delay={word(from, 42, "والثانية") - 4} seed={68} sound={null} />
    <Card x={CX - 260} y={CY - 30} delay={word(from, 42, "والثانية")} title="الجلسة 2: اختبر نفسك" code="1f9e0" seed={69} w={480} h={400} color={PEN} />
    <Label text="حل تمارين ✏️" x={CX + 230} y={CY + 330} delay={word(from, 43, "حل")} size={48} />
    <Label text="اكتب من الذاكرة 📝" x={CX - 260} y={CY + 330} delay={word(from, 43, "اكتب")} size={48} tx="kraft" />
  </AbsoluteFill>
);

const S_Tracker: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 44, "ارسم");
  const t1 = at(from, 45, 0.1);
  const marks = frame < t0 ? 0 : Math.min(42, Math.floor((frame - t0) / 3) + (frame > t1 ? Math.floor((frame - t1) / 1.5) : 0));
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 20} delay={2} seed={70}>
        <Sheet w={1100} h={640} seed={70}>
          <div style={{ position: "absolute", top: 26, right: 40 }}>
            <Hand size={52}>جدول جلساتي</Hand>
          </div>
          <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 120, display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 10 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <div key={i} style={{ height: 120, border: `4px solid ${INK}`, borderRadius: 10, position: "relative" }}>
                {i < marks && (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    <path d="M20 55 L42 78 L84 18" fill="none" stroke={TOMATO} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </Sheet>
      </Unfold>
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} at={t0 + i * 3} name="paper_rustle" vol={0.08} />
      ))}
      <Sticker code="1f525" x={CX + 470} y={CY + 340} size={150} delay={t1} seed={71} rot={8} />
      <Sticker code="2764" x={CX + 330} y={CY + 360} size={110} delay={word(from, 45, "ستحب")} seed={72} rot={-8} />
    </AbsoluteFill>
  );
};

const S_GradeChart: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at(from, 46, 0.1), at(from, 46, 0.95)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pts = [10.5, 11.8, 12.6, 13.9, 15.1, 16.2, 17.4];
  const X = (i: number) => 120 + i * 150;
  const Y = (g: number) => 560 - (g - 9) * 52;
  const shown = pts.slice(0, Math.max(1, Math.ceil(p * pts.length)));
  const last = Math.min(pts.length - 1, Math.floor(p * (pts.length - 1)));
  const g = interpolate(p, [0, 1], [10.5, 17.4]);
  const big = at(from, 46, 0.95);
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY} delay={2} seed={73}>
        <Sheet w={1160} h={700} seed={73}>
          <div style={{ position: "absolute", top: 24, right: 40 }}>
            <Hand size={50}>معدلك شهرًا بعد شهر</Hand>
          </div>
          <svg width={1160} height={700} style={{ position: "absolute", inset: 0 }}>
            <path d={`M80 100 V 580 H 1100`} stroke={INK} strokeWidth="5" fill="none" />
            {[10, 12, 14, 16, 18].map((v) => (
              <g key={v}>
                <line x1={72} x2={1100} y1={Y(v)} y2={Y(v)} stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
                <text x={60} y={Y(v) + 10} textAnchor="end" fontFamily="sans-serif" fontWeight="700" fontSize="26" fill={INK}>
                  {v}
                </text>
              </g>
            ))}
            <polyline points={shown.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={GREEN} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            {shown.map((v, i) => (
              <circle key={i} cx={X(i)} cy={Y(v)} r={i === last ? 16 : 11} fill={i === last ? TOMATO : GREEN} stroke="#fff" strokeWidth="4" />
            ))}
          </svg>
          <div style={{ position: "absolute", left: 160, top: 110, fontFamily: FONT, fontSize: 110, color: g >= 17 ? GREEN : INK }}>{g.toFixed(1)}</div>
        </Sheet>
      </Unfold>
      <Sfx at={big} name="sparkle" vol={0.25} />
      <Stamp text="17+" x={CX + 400} y={CY - 200} delay={big} color={GREEN} rot={-10} size={100} />
    </AbsoluteFill>
  );
};

const S_NotGenius: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const eq = at(from, 49, 0.1);
  return (
    <AbsoluteFill>
      <Card x={CX} y={CY - 70} delay={2} title="17 و 18" code="1f3c6" seed={74} w={480} h={380} />
      <Stamp text="ليسوا عباقرة" x={CX} y={CY + 100} delay={word(from, 48, "ليسوا")} size={74} />
      {frame >= eq && (
        <Unfold x={CX} y={CY + 330} delay={eq} seed={75} sound="paper_slide">
          <Sheet w={1100} h={150} tx="kraft" seed={75}>
            <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
              <Hand size={58}>تركيز</Hand>
              <Hand size={58} color={TOMATO}>
                +
              </Hand>
              <Hand size={58}>استمرار</Hand>
              <Hand size={58} color={TOMATO}>
                =
              </Hand>
              <div style={{ fontFamily: FONT, fontSize: 70, color: GREEN }}>17</div>
            </div>
          </Sheet>
        </Unfold>
      )}
    </AbsoluteFill>
  );
};

/* ---- mistakes ---- */
const MistakeHead: React.FC<{ n: number }> = ({ n }) => (
  <Unfold x={CX} y={150} delay={0} seed={n + 80} sound="paper_slide">
    <Sheet w={560} h={120} tx="kraft" seed={n + 80}>
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <Img src={icon("26a0")} style={{ width: 70, height: 70 }} />
        <Hand size={56} color={RED}>
          الخطأ {["الأول", "الثاني", "الثالث"][n - 1]}
        </Hand>
      </div>
    </Sheet>
  </Unfold>
);

const S_MistakesIntro: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Sticker code="26a0" x={CX} y={CY - 60} size={320} delay={4} seed={81} />
    <Label text="احذر من هذه الأخطاء" x={CX} y={CY + 230} delay={10} size={64} color={RED} />
  </AbsoluteFill>
);

const S_M1: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 61, "تصبح");
  const mins = interpolate(frame, [t0 - 10, t0 + 20], [5, 60], clamp);
  return (
    <AbsoluteFill>
      <MistakeHead n={1} />
      <Card x={CX + 270} y={CY + 120} delay={word(from, 60, "الاستراحة")} title="الاستراحة على الهاتف" code="1f4f1" seed={82} w={460} h={380} />
      <DrawMark kind="cross" x={CX + 270} y={CY + 120} size={280} at={at(from, 60, 0.9)} />
      <Unfold x={CX - 270} y={CY + 120} delay={at(from, 61, 0)} seed={83}>
        <Sheet w={440} h={380} seed={83}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Img src={icon("23f0")} style={{ width: 140, height: 140, transform: `rotate(${frame > t0 - 10 && frame < t0 + 20 ? Math.sin(frame) * 8 : 0}deg)` }} />
            <Bold size={90} color={mins > 10 ? RED : INK}>
              {Math.round(mins)} د
            </Bold>
          </div>
        </Sheet>
      </Unfold>
      <Sfx at={t0 - 10} name="ticktock" vol={0.15} />
    </AbsoluteFill>
  );
};

const S_M2: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const lvl = interpolate(frame, [at(from, 63, 0), at(from, 63, 0.7)], [0.9, 0.05], clamp);
  return (
    <AbsoluteFill>
      <MistakeHead n={2} />
      <Card x={CX + 270} y={CY + 120} delay={word(from, 62, "تتجاهل")} title="بدون استراحة" sub="لأنك متحمس" code="1f525" seed={84} w={460} h={380} />
      <Unfold x={CX - 270} y={CY + 120} delay={at(from, 63, 0)} seed={85}>
        <div style={{ position: "relative", width: 420, height: 220 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 390, height: 220, borderRadius: 30, border: `12px solid ${INK}`, background: "#fff" }} />
          <div style={{ position: "absolute", left: 398, top: 70, width: 26, height: 80, borderRadius: 8, background: INK }} />
          <div style={{ position: "absolute", left: 22, top: 22, height: 176, width: 346 * lvl, borderRadius: 16, background: lvl < 0.3 ? RED : GOLD }} />
        </div>
      </Unfold>
      <Sticker code="1f62b" x={CX - 270} y={CY + 340} size={130} delay={at(from, 63, 0.6)} seed={86} />
    </AbsoluteFill>
  );
};

const S_M3: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const split = word(from, 65, "إلى");
  const s = ramp(frame, split, split + 14, Easing.out(Easing.back(1.4)));
  return (
    <AbsoluteFill>
      <MistakeHead n={3} />
      {/* one big block that breaks into four */}
      <Unfold x={CX} y={CY + 140} delay={word(from, 64, "مهمة")} seed={87}>
        <div style={{ position: "relative", width: 700, height: 400 }}>
          {[0, 1, 2, 3].map((k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                left: (k % 2) * 350 + (k % 2 ? 1 : -1) * s * 50,
                top: Math.floor(k / 2) * 200 + (k > 1 ? 1 : -1) * s * 30,
                width: 350,
                height: 200,
                transform: `rotate(${s * (k - 1.5) * 4}deg)`,
              }}
            >
              <Sheet w={340} h={190} tx={k % 2 ? "kraft" : "white"} seed={88 + k}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  {s > 0.3 ? (
                    <>
                      <Img src={icon("1f345")} style={{ width: 70, height: 70 }} />
                      <Hand size={44}>جزء {k + 1}</Hand>
                    </>
                  ) : k === 0 ? (
                    <Hand size={44}>الدرس كاملًا</Hand>
                  ) : null}
                </div>
              </Sheet>
            </div>
          ))}
        </div>
      </Unfold>
      <Sfx at={split} name="paper_tear" vol={0.3} />
    </AbsoluteFill>
  );
};

/* ---- tips ---- */
const S_TipsIntro: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Sticker code="1f4a1" x={CX} y={CY - 60} size={300} delay={4} seed={90} />
    <Label text="نصائح إضافية" x={CX} y={CY + 230} delay={10} size={64} />
  </AbsoluteFill>
);

const S_Prepare: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="حضّر كل شيء قبل البداية" x={CX} y={CY - 250} delay={2} size={54} tx="kraft" />
    {(
      [
        ["1f4da", "الكتاب", "الكتاب"],
        ["270f", "الأقلام", "والأقلام"],
        ["1f9f4", "الماء", "وقارورة"],
      ] as const
    ).map(([c, t, w], i) => (
      <React.Fragment key={c}>
        <Card x={CX + 380 - i * 380} y={CY + 80} delay={word(from, 67, w)} title={t} code={c === "1f9f4" ? "1f4a7" : c} seed={91 + i} w={330} h={330} />
        <DrawMark kind="check" x={CX + 470 - i * 380} y={CY + 220} size={100} at={word(from, 67, w) + 10} />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

const S_PhoneAway: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 68, "غرفة");
  const go = ramp(frame, t0, t0 + 20, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill>
      <Sticker code="1f6aa" x={CX + 400} y={CY} size={300} delay={2} seed={94} />
      <Img src={icon("1f4f1")} style={{ position: "absolute", left: CX - 300 + go * 680, top: CY - 80, width: 160, height: 160, opacity: 1 - go * 0.9, transform: `rotate(${go * 40}deg) scale(${1 - go * 0.6})`, filter: stickerFilter(5) }} />
      <Sfx at={t0} name="paper_slide" vol={0.25} />
      <Card x={CX - 260} y={CY + 280} delay={word(from, 68, "واستعمل")} title="مؤقت بسيط" code="23f2" seed={95} w={380} h={240} />
    </AbsoluteFill>
  );
};

const S_5010: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 71, "خمسين");
  const mins = interpolate(frame, [t0 - 6, t0 + 30], [25, 50], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Sfx at={t0 - 6} name="windup" vol={0.3} />
      <Unfold x={CX - 260} y={CY - 20} delay={2} seed={96} sound={null}>
        <TomatoTimer size={380} minutes={mins} />
      </Unfold>
      <Unfold x={CX + 300} y={CY - 40} delay={t0} seed={97}>
        <Sheet w={460} h={300} tx="kraft" seed={97}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Bold size={70}>50 + 10</Bold>
            <Hand size={40}>للمتقدمين</Hand>
          </div>
        </Sheet>
      </Unfold>
      <Unfold x={CX} y={CY + 320} delay={at(from, 72, 0.1)} seed={98} sound="paper_slide">
        <Sheet w={1000} h={140} seed={98}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            <Hand size={52}>تركيز كامل</Hand>
            <Hand size={52} color={TOMATO}>
              ←
            </Hand>
            <Hand size={52} color={GREEN}>
              راحة حقيقية
            </Hand>
          </div>
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

/* ---- recap ---- */
const S_Recap: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const items: [string, string, number][] = [
    ["حدد مهمة واحدة", "1f3af", 82],
    ["25 دقيقة بتركيز كامل", "1f345", 83],
    ["5 دقائق راحة، وراحة طويلة بعد 4", "2615", 84],
    ["سجّل جلساتك كل يوم", "1f4dd", 85],
  ];
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 30} delay={2} seed={99}>
        <Sheet w={1160} h={760} seed={99}>
          <div style={{ position: "absolute", top: 26, right: 60 }}>
            <Hand size={70}>الخلاصة</Hand>
          </div>
          {items.map(([t, c, li], i) => {
            const ap = at(from, li, 0.02);
            const chk = ramp(frame, ap + 14, ap + 26);
            return frame >= ap ? (
              <div key={i} dir="rtl" style={{ position: "absolute", right: 60, top: 160 + i * 140, display: "flex", alignItems: "center", gap: 26, opacity: ramp(frame, ap, ap + 6) }}>
                <div style={{ width: 84, height: 84, border: `6px solid ${INK}`, borderRadius: 12, position: "relative" }}>
                  <svg width="84" height="84" viewBox="0 0 90 90" style={{ position: "absolute", left: -4, top: -10 }}>
                    <path d="M14 48 L38 72 L84 14" fill="none" stroke={GREEN} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - chk} />
                  </svg>
                </div>
                <Img src={icon(c)} style={{ width: 80, height: 80 }} />
                <Hand size={54}>{t}</Hand>
              </div>
            ) : null;
          })}
        </Sheet>
      </Unfold>
      {items.map(([, , li], i) => (
        <Sfx key={i} at={at(from, li, 0.02) + 14} name="paper_rustle" vol={0.2} />
      ))}
    </AbsoluteFill>
  );
};

/* ---- call to action ---- */
const S_TryNow: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const press = word(from, 86, "الآن");
  const pressed = frame >= press;
  const mins = interpolate(frame, [press, press + 200], [25, 24.2], clamp);
  return (
    <AbsoluteFill>
      <Unfold x={CX - 250} y={CY - 20} delay={2} seed={100} sound={null}>
        <TomatoTimer size={380} minutes={mins} />
      </Unfold>
      <Unfold x={CX + 300} y={CY - 20} delay={6} seed={101}>
        <div style={{ width: 440, height: 160, borderRadius: 80, background: pressed ? GREEN : TOMATO, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 0 rgba(0,0,0,0.25)", transform: `translateY(${pressed && frame < press + 6 ? 10 : 0}px)` }}>
          <Bold size={64} color="#fff">
            {pressed ? "بدأت ✓" : "ابدأ الآن ▶"}
          </Bold>
        </div>
      </Unfold>
      <Sfx at={press} name="click" vol={0.3} />
      <Sfx at={press + 2} name="windup" vol={0.25} />
      <Img src={icon("1f446")} style={{ position: "absolute", left: interpolate(frame, [press - 14, press], [CX + 600, CX + 330], clamp), top: interpolate(frame, [press - 14, press], [CY + 300, CY + 20], clamp), width: 130, height: 130, opacity: frame > press - 16 ? 1 : 0 }} />
      <Unfold x={CX} y={CY + 330} delay={at(from, 90, 0.05)} seed={102} sound="paper_slide">
        <div dir="rtl" style={{ background: "#fff", borderRadius: 26, padding: "18px 30px", boxShadow: "0 12px 16px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 18, border: `4px solid ${INK}` }}>
          <Img src={icon("1f4ac")} style={{ width: 70, height: 70 }} />
          <Hand size={48}>كم جلسة أنجزت؟</Hand>
          <span style={{ fontFamily: FONT, fontSize: 48, color: TOMATO }}>{frame > at(from, 90, 0.8) ? "🍅🍅🍅" : ""}</span>
        </div>
      </Unfold>
    </AbsoluteFill>
  );
};

const S_Subscribe: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const tap = word(from, 91, "اشترك") + 10;
  const sub = frame >= tap;
  const bell = word(from, 91, "القناة") + 6;
  const share = word(from, 91, "وشارك");
  return (
    <AbsoluteFill>
      <Sfx at={tap} name="click" vol={0.3} />
      <Sfx at={bell} name="ring" vol={0.12} />
      <Unfold x={CX} y={CY - 80} delay={2} seed={103}>
        <div style={{ width: 980, background: "#fff", borderRadius: 30, padding: 30, boxShadow: "0 18px 30px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 26 }}>
          <Img src={staticFile("yt2/host/p00.png")} style={{ width: 140, height: 140, borderRadius: 70, objectFit: "cover", objectPosition: "50% 0%", background: "#9cc5f0" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT, fontSize: 44, color: INK }}>Abdelwahab MJ</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 28, color: "#666" }}>@abdelwahab__mj</div>
          </div>
          <div style={{ height: 96, padding: "0 40px", borderRadius: 48, background: sub ? "#E5E5E5" : "#0F0F0F", color: sub ? INK : "#fff", display: "flex", alignItems: "center", gap: 14, fontFamily: '-apple-system, "Segoe UI", Roboto, Arial, sans-serif', fontWeight: 700, fontSize: 38, transform: `scale(${sub && frame < tap + 6 ? 0.92 : 1})` }}>
            {sub && <span style={{ display: "inline-block", transform: `rotate(${frame >= bell && frame < bell + 20 ? Math.sin(frame * 1.6) * 20 : 0}deg)` }}>🔔</span>}
            {sub ? "Subscribed" : "Subscribe"}
          </div>
        </div>
      </Unfold>
      <Img src={icon("1f446")} style={{ position: "absolute", left: interpolate(frame, [tap - 14, tap], [CX + 700, CX + 330], clamp), top: interpolate(frame, [tap - 14, tap], [CY + 300, CY - 70], clamp), width: 130, height: 130, opacity: frame > tap - 16 && frame < share ? 1 : 0 }} />
      {sub &&
        [0, 1, 2, 3, 4].map((k) => {
          const t = frame - tap - k * 3;
          return t > 0 ? <Img key={k} src={icon("2764")} style={{ position: "absolute", left: CX + 300 + k * 40 - 40, top: CY - 120 - t * 5, width: 50, height: 50, opacity: interpolate(t, [0, 30], [1, 0], clamp) }} /> : null;
        })}
      <Sticker code="1f465" x={CX - 300} y={CY + 280} size={170} delay={share} seed={104} />
      <Label text="شارك الفيديو مع أصدقائك" x={CX + 150} y={CY + 290} delay={share + 4} size={50} tx="kraft" />
    </AbsoluteFill>
  );
};


/* ---- added for the 8-minute version ---- */
const S_Insight: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Card x={CX + 260} y={CY} delay={word(from, 9, "يركز")} title="وقت قصير = تركيز" code="23f1" seed={110} w={460} h={400} />
    <Card x={CX - 260} y={CY} delay={word(from, 10, "الراحة")} title="راحة = عودة أقوى" code="1f4aa" seed={111} w={460} h={400} color={GREEN} />
  </AbsoluteFill>
);

const S_Achieve: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 21, "أنهيت");
  return (
    <AbsoluteFill>
      <Sticker code="1f3c6" x={CX + 330} y={CY - 40} size={260} delay={word(from, 21, "بالإنجاز")} seed={112} />
      <Unfold x={CX - 200} y={CY - 20} delay={t0} seed={113}>
        <Sheet w={560} h={260} seed={113}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "relative", width: 100, height: 100 }}>
                <Img src={icon("1f345")} style={{ width: 100, height: 100, opacity: frame > t0 + 10 + i * 8 ? 1 : 0.25 }} />
                <DrawMark kind="check" x={70} y={70} size={70} at={t0 + 10 + i * 8} />
              </div>
            ))}
          </div>
        </Sheet>
      </Unfold>
      <Label text="دافع للجلسة التالية 🔥" x={CX - 200} y={CY + 260} delay={word(from, 21, "دافعًا")} size={52} tx="kraft" />
    </AbsoluteFill>
  );
};

const DAY: { li: number; time: string; text: string; code: string; kind: "work" | "rest" | "sleep" }[] = [
  { li: 51, time: "16:30", text: "راحة وأكل خفيف", code: "1f37d", kind: "rest" },
  { li: 52, time: "17:00", text: "🍅 1: درس الرياضيات", code: "1f4d0", kind: "work" },
  { li: 53, time: "17:30", text: "🍅 2: تمارين نفس الدرس", code: "270f", kind: "work" },
  { li: 54, time: "18:00", text: "🍅 3: مراجعة الفيزياء", code: "1f9ea", kind: "work" },
  { li: 55, time: "18:30", text: "🍅 4: ملخص من الذاكرة", code: "1f4dd", kind: "work" },
  { li: 56, time: "20:30", text: "🍅 5-6: اللغات والحفظ", code: "1f4da", kind: "work" },
  { li: 57, time: "22:00", text: "نوم مبكر", code: "1f634", kind: "sleep" },
];

const S_DayPlan: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 30} delay={2} seed={114}>
        <Sheet w={1180} h={800} seed={114}>
          <div style={{ position: "absolute", top: 22, right: 50 }}>
            <Hand size={58}>يوم دراسي بالبومودورو</Hand>
          </div>
          {DAY.map((d, i) => {
            const ap = at(from, d.li, d.li === 57 ? 0.5 : 0.08);
            const col = d.kind === "work" ? TOMATO : d.kind === "rest" ? GREEN : PEN;
            return frame >= ap ? (
              <div key={i} dir="rtl" style={{ position: "absolute", right: 50, left: 50, top: 120 + i * 92, height: 80, display: "flex", alignItems: "center", gap: 22, opacity: ramp(frame, ap, ap + 6), transform: `translateX(${(1 - ramp(frame, ap, ap + 8)) * -40}px)` }}>
                <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 40, color: col, width: 130 }}>{d.time}</div>
                <div style={{ flex: 1, height: 70, borderRadius: 14, background: col, opacity: 0.16, position: "absolute", right: 150, left: 0 }} />
                <Img src={icon(d.code)} style={{ width: 62, height: 62, position: "relative" }} />
                <div style={{ fontFamily: FONT, fontSize: 40, color: INK, position: "relative" }}>{d.text}</div>
              </div>
            ) : null;
          })}
        </Sheet>
      </Unfold>
      {DAY.map((d, i) => (
        <Sfx key={i} at={at(from, d.li, d.li === 57 ? 0.5 : 0.08)} name="paper_slide" vol={0.14} />
      ))}
    </AbsoluteFill>
  );
};

const S_Sleep: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 58, "يثبت");
  return (
    <AbsoluteFill>
      <Sticker code="1f319" x={CX + 330} y={CY - 120} size={230} delay={2} seed={115} />
      <Sticker code="1f6cc" x={CX + 260} y={CY + 170} size={250} delay={6} seed={116} />
      <Sticker code="1f9e0" x={CX - 280} y={CY} size={260} delay={t0 - 6} seed={117} />
      {frame > t0 &&
        [0, 1, 2].map((k) => (
          <div key={k} style={{ position: "absolute", left: CX - 280 - 60 + k * 50, top: CY - 220 - ((frame - t0 + k * 10) % 40) * 2, fontFamily: FONT, fontSize: 60, color: PEN, opacity: 1 - ((frame - t0 + k * 10) % 40) / 40 }}>
            z
          </div>
        ))}
      <Label text="النوم يثبت ما درسته" x={CX - 260} y={CY + 280} delay={t0} size={52} tx="kraft" />
    </AbsoluteFill>
  );
};

const S_Place: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="مكان مرتب وهادئ" x={CX} y={CY - 250} delay={2} size={58} tx="kraft" />
    <Card x={CX + 380} y={CY + 70} delay={word(from, 69, "مرتبًا")} title="مرتب" code="1f9f9" seed={118} w={330} h={330} />
    <Card x={CX} y={CY + 70} delay={word(from, 69, "وهادئًا")} title="هادئ" code="1f92b" seed={119} w={330} h={330} />
    <Card x={CX - 380} y={CY + 70} delay={word(from, 69, "إضاءة")} title="إضاءة جيدة" code="1f4a1" seed={120} w={330} h={330} />
  </AbsoluteFill>
);

const S_Switch: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 70, "غيّر");
  const sw = ramp(frame, t0, t0 + 16, Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill>
      <Sticker code="1f971" x={CX + 400} y={CY - 140} size={170} delay={2} seed={121} />
      {[0, 1].map((i) => (
        <Img key={i} src={icon("1f345")} style={{ position: "absolute", left: CX + 160 - i * 150, top: CY - 220, width: 120, height: 120 }} />
      ))}
      <div style={{ position: "absolute", left: CX - 380, top: CY - 40, width: 760, height: 300, perspective: 1200 }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateY(${sw * 180}deg)`, transformStyle: "preserve-3d" }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
            <Sheet w={760} h={300} seed={122}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Img src={icon("1f4d0")} style={{ width: 120, height: 120 }} />
                <Hand size={70}>الرياضيات</Hand>
              </div>
            </Sheet>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <Sheet w={760} h={300} seed={123} tx="kraft">
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
                <Img src={icon("1f4d6")} style={{ width: 120, height: 120 }} />
                <Hand size={70}>اللغة العربية</Hand>
              </div>
            </Sheet>
          </div>
        </div>
      </div>
      <Sfx at={t0} name="paper_flip" vol={0.3} />
    </AbsoluteFill>
  );
};

const FaqScene = (q: number, qText: string, aText: string, aCode: string): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => (
    <AbsoluteFill>
      <Sticker code="2753" x={CX + 520} y={CY - 230} size={150} delay={2} seed={124 + q} />
      <Unfold x={CX + 80} y={CY - 150} delay={4} seed={125 + q} sound="paper_slide">
        <div dir="rtl" style={{ maxWidth: 900, background: "#fff", borderRadius: 30, padding: "24px 40px", border: `5px solid ${INK}`, boxShadow: "0 12px 16px rgba(0,0,0,0.25)" }}>
          <Hand size={52}>{qText}</Hand>
        </div>
      </Unfold>
      <Unfold x={CX - 80} y={CY + 170} delay={at(from, q + 1, 0.05)} seed={126 + q}>
        <div dir="rtl" style={{ maxWidth: 900, background: "#E8F6EC", borderRadius: 30, padding: "24px 40px", border: `5px solid ${GREEN}`, boxShadow: "0 12px 16px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 20 }}>
          <Img src={icon(aCode)} style={{ width: 90, height: 90 }} />
          <Hand size={50} color="#1E6B3D">
            {aText}
          </Hand>
        </div>
      </Unfold>
    </AbsoluteFill>
  );
  return C;
};
const S_Faq1 = FaqScene(73, "قاطعني أحد أثناء الجلسة؟", "سأكلمك بعد 10 دقائق، وأكمل", "1f64b");
const S_Faq2 = FaqScene(75, "لا أستطيع التركيز 25 دقيقة؟", "ابدأ بـ 15 دقيقة، وزد كل أسبوع", "1f4c8");
const S_Faq3 = FaqScene(77, "هل تصلح للحفظ؟", "احفظ في جلسة، واكتب من الذاكرة في التالية", "1f4dd");

const S_Faq4 = FaqScene(79, "ماذا أفعل في الاستراحة الطويلة؟", "امشِ، كُل صحيًا، تحدث مع عائلتك، بدون شاشات", "1f6b6");

const S_Motivation: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const steps = [0, 1, 2, 3, 4];
  const t0 = word(from, 89, "جلسة");
  const tC = at(from, 90, 0.05);
  return (
    <AbsoluteFill>
      {frame < tC ? (
        <>
          <Label text="عادات صغيرة كل يوم" x={CX} y={CY - 280} delay={word(from, 88, "عادات")} size={58} tx="kraft" />
          {steps.map((i) => {
            const d = t0 + i * 8;
            const p = spring({ frame: frame - d, fps: FPS, config: { damping: 12 } });
            return frame >= d ? (
              <div key={i} style={{ position: "absolute", left: CX - 520 + i * 210, top: CY + 260 - i * 90, width: 200, height: 90 + i * 90, transform: `scaleY(${p})`, transformOrigin: "50% 100%" }}>
                <Sheet w={200} h={90 + i * 90} tx={i % 2 ? "kraft" : "white"} seed={130 + i}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 10, display: "flex", justifyContent: "center" }}>
                    <Img src={icon("1f345")} style={{ width: 70, height: 70 }} />
                  </div>
                </Sheet>
              </div>
            ) : null;
          })}
          {steps.map((i) => (
            <Sfx key={i} at={t0 + i * 8} name="click" vol={0.15} />
          ))}
          <Sticker code="1f3c6" x={CX + 520} y={CY - 140} size={200} delay={word(from, 89, "مختلفًا")} seed={136} />
        </>
      ) : (
        <Unfold x={CX} y={CY} delay={tC} seed={137} sound="paper_slide">
          <div dir="rtl" style={{ background: "#fff", borderRadius: 30, padding: "26px 44px", boxShadow: "0 14px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 22, border: `5px solid ${INK}` }}>
            <Img src={icon("1f4ac")} style={{ width: 100, height: 100 }} />
            <Hand size={64} style={{ whiteSpace: "nowrap" }}>كم جلسة أنجزت؟</Hand>
            <span style={{ fontFamily: FONT, fontSize: 60, whiteSpace: "nowrap" }}>{frame > at(from, 90, 0.7) ? "🍅🍅🍅" : ""}</span>
          </div>
        </Unfold>
      )}
    </AbsoluteFill>
  );
};

/* ======================= host (paper cut-out) ======================= */
const POSES = ["p00", "p01", "p02", "p03", "p04", "p05", "p06", "p07", "p08", "p09", "p10", "p11", "p13"];
const THINK = "p13";
const THUMB = "p11";
const poseFor = (i: number) => {
  const l = LINES[i];
  if (/[؟]/.test(l.text)) return THINK;
  if (/سبعة عشر|ثمانية عشر|نجحت|سهل|أراك/.test(l.text)) return THUMB;
  if (/الأول|الخطوة الأولى|أولًا/.test(l.text)) return "p00";
  if (/الهاتف/.test(l.text)) return "p01";
  return ["p03", "p04", "p06", "p09", "p10", "p02", "p05", "p07", "p08", "p12"].filter((p) => POSES.includes(p))[i % 9];
};

const Host: React.FC<{ hidden: (t: number) => boolean }> = ({ hidden }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let idx = 0;
  for (let i = 0; i < LINES.length; i++) if (LINES[i].start - 0.15 <= t) idx = i;
  const pose = poseFor(idx);
  const since = frame - sec(LINES[idx].start - 0.15);
  const flip = interpolate(since, [0, 3, 6], [0.2, 1.06, 1], clamp);
  const e = ENV[Math.min(ENV.length - 1, Math.floor(t * ENV_FPS))] ?? 0;
  const hide = hidden(t);
  const vis = interpolate(frame, [sec(LINES[0].start) - 8, sec(LINES[0].start) + 4], [0, 1], clamp);
  const y = (hide ? 700 : 0) + (1 - vis) * 700 - e * 10;
  return (
    <div style={{ position: "absolute", left: 10, bottom: 0, width: 520, height: 600, transform: `translateY(${y}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, transformOrigin: "50% 100%", transform: `scaleX(${flip}) rotate(${jitter(frame, idx, 0.6)}deg) scale(${1 + Math.sin(frame / 25) * 0.006})` }}>
        <Img
          src={staticFile(`yt2/host/${pose}.png`)}
          style={{ width: 500, display: "block", margin: "0 auto", filter: "drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 10px 14px rgba(40,25,10,0.45))" }}
        />
      </div>
    </div>
  );
};

/* ======================= camera through the setup ======================= */
type Station = { x: number; y: number; s: number };
const ST: Record<string, Station> = {
  wide: { x: 1920, y: 1080, s: 0.5 },
  desk: { x: 2050, y: 1250, s: 0.82 },
  board: { x: 3030, y: 660, s: 1.0 },
  timer: { x: 2720, y: 1380, s: 1.15 },
  window: { x: 700, y: 700, s: 0.95 },
  shelf: { x: 1700, y: 560, s: 1.05 },
  phone: { x: 3300, y: 1750, s: 1.1 },
  notebook: { x: 2000, y: 1720, s: 1.0 },
  monitor: { x: 1920, y: 1130, s: 1.05 },
  books: { x: 1100, y: 1350, s: 0.95 },
};
const SECTION_STATION: Record<string, keyof typeof ST> = {
  hook: "desk",
  story: "window",
  why: "shelf",
  steps: "books",
  seventeen: "board",
  mistakes: "phone",
  tips: "notebook",
  day: "window",
  faq: "shelf",
  recap: "desk",
  cta: "wide",
};

const SECTION_NAMES: Record<string, string> = {
  hook: "المقدمة",
  story: "قصة الطريقة",
  why: "لماذا تنجح؟",
  steps: "الخطوات الخمس",
  seventeen: "كيف تصل إلى 17؟",
  mistakes: "أخطاء شائعة",
  tips: "نصائح",
  day: "يوم دراسي كامل",
  faq: "أسئلة شائعة",
  recap: "الخلاصة",
  cta: "جرّبها الآن",
};

// boundaries between sections (midpoint of the pause)
type Boundary = { t: number; section: string; prev: string };
const BOUNDS: Boundary[] = [];
for (let i = 1; i < LINES.length; i++) {
  if (LINES[i].section !== LINES[i - 1].section) BOUNDS.push({ t: (LINES[i - 1].end + LINES[i].start) / 2, section: LINES[i].section, prev: LINES[i - 1].section });
}
const MJ_SECTIONS = new Set(["steps", "seventeen", "recap"]);
const END_AT = LINES[LINES.length - 1].end + 0.5;

const cameraAt = (t: number): Station => {
  // intro: wide, then glide to the desk while the hook starts
  let cur: Station = ST.wide;
  let target: Station = ST[SECTION_STATION.hook];
  let t0 = LINES[0].start - 0.6;
  let dur = 2.2;
  for (const b of BOUNDS) {
    if (t >= b.t - 0.4) {
      cur = ST[SECTION_STATION[b.prev]];
      target = ST[SECTION_STATION[b.section]];
      t0 = b.t - 0.4;
      dur = MJ_SECTIONS.has(b.section) ? 0.05 : 1.4;
    }
  }
  if (t >= END_AT - 0.6) {
    cur = ST[SECTION_STATION.cta];
    target = { x: 1920, y: 1080, s: 0.5 };
  }
  const p = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, (t - t0) / dur)));
  const drift = Math.sin(t / 3) * 14;
  return { x: cur.x + (target.x - cur.x) * p + drift, y: cur.y + (target.y - cur.y) * p, s: cur.s + (target.s - cur.s) * p + Math.sin(t / 5) * 0.01 };
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = cameraAt(t);
  // the setup's own timer runs during the steps and the cta
  const stepsStart = BOUNDS.find((b) => b.section === "steps")?.t ?? 0;
  const screenMinutes = t < stepsStart ? 25 : Math.max(0, 25 - (t - stepsStart) / 12);
  const s17 = BOUNDS.find((b) => b.section === "seventeen")?.t ?? 0;
  const goal = t > s17 + 1 && t < s17 + 4 ? Math.sin(((t - s17 - 1) / 3) * Math.PI) : 0;
  // a clean "whip" blur while travelling
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#EED9B6" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: WORLD_H, transformOrigin: "0 0", transform: `translate(${W / 2 - c.x * c.s}px, ${H / 2 - c.y * c.s}px) scale(${c.s})` }}>
        <Room screenMinutes={screenMinutes} goal17={goal} />
      </div>
    </AbsoluteFill>
  );
};

/* ======================= overlays ======================= */
const MJWipe: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const sheetX = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [2000, 0, 0, -2150], { ...clamp, easing: ease });
  const tilt = (lag: number) => interpolate(frame - lag, [0, 9, 15, 24], [5, 0, 0, -4], clamp);
  const mj = ramp(frame, 7, 12);
  const line = ramp(frame, 10, 15);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Sfx at={0} name="mj_whoosh" vol={0.3} />
      <Sfx at={2} name="paper_flip" vol={0.18} />
      <Sfx at={10} name="mj_hit" vol={0.24} />
      <div style={{ position: "absolute", left: sheetX(-2) - 160, top: -200, transform: `rotate(${tilt(-2)}deg)` }}>
        <div style={{ position: "relative", width: 2300, height: 1500, filter: "drop-shadow(-18px 0 30px rgba(0,0,0,0.35))" }}>
          <div style={{ position: "absolute", inset: 0, background: GOLD, overflow: "hidden", ...maskStyle(seed) }}>
            <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.9 }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: sheetX(1) - 80, top: -200, transform: `rotate(${tilt(1)}deg)` }}>
        <div style={{ position: "relative", width: 2200, height: 1500, filter: "drop-shadow(-24px 0 40px rgba(0,0,0,0.5))" }}>
          <div style={{ position: "absolute", inset: 0, background: "#151515", overflow: "hidden", ...maskStyle(seed + 3) }}>
            <Img src={tex("kraft")} style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.5 }} />
          </div>
          <div style={{ position: "absolute", left: 80, top: 200, width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 300, lineHeight: 1, letterSpacing: interpolate(mj, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))", opacity: mj, transform: `scale(${interpolate(mj, [0, 1], [1.1, 1])})` }}>
              MJ
            </div>
            <div style={{ width: 300 * line, height: 6, borderRadius: 3, background: GOLD, marginTop: 8 }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const KEYS = new Set([
  "البومودورو", "بومودورو", "طماطم", "سبعة", "ثمانية", "عشر", "خمسا", "وعشرين", "وعشرون", "خمس", "دقيقة", "دقائق", "التركيز", "بتركيز", "الشحن", "واحدة", "المؤقت",
  "الهاتف", "استراحة", "الاستراحة", "طويلة", "أربع", "جلسات", "الجلسات", "المركزة", "ست", "ستا", "المعاملات", "لاختبار", "علامة", "عباقرة", "يركزون", "ويستمرون",
  "أخطاء", "الأخطاء", "صغيرة", "خمسين", "اشترك", "وشارك", "جلسة",
]);
const clean = (w: string) => w.replace(/[،.؟:!]/g, "");

type Chunk = { text: string; start: number; end: number; last: boolean };
const chunks: Chunk[] = LINES.flatMap((l) => {
  const words = l.text.split(" ");
  const groups: string[][] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 6 || (/[،.؟:]$/.test(w) && cur.length >= 3)) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  const total = l.text.length;
  let acc = 0;
  return groups.map((g, gi) => {
    const t = g.join(" ");
    const s = l.start + ((l.end - l.start) * acc) / total;
    acc += t.length + 1;
    const e = l.start + ((l.end - l.start) * Math.min(acc, total)) / total;
    return { text: t, start: s, end: e, last: gi === groups.length - 1 };
  });
});

const Subtitle: React.FC<{ c: Chunk; idx: number }> = ({ c, idx }) => {
  const frame = useCurrentFrame();
  const dur = sec(c.end - c.start);
  const inP = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const out = c.last ? interpolate(frame, [dur - 3, dur], [1, 0], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: 520, right: 30, top: 940, display: "flex", justifyContent: "center", opacity: Math.min(inP, out) }}>
      <div style={{ position: "relative", transform: `rotate(${idx % 2 ? 0.6 : -0.6}deg) translateY(${(1 - inP) * 10}px)`, filter: "drop-shadow(0 8px 10px rgba(40,30,20,0.35))" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...maskStyle(idx) }}>
          <Img src={tex("white")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div dir="rtl" style={{ position: "relative", padding: "8px 40px 14px", display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 1300 }}>
          {c.text.split(" ").map((w, i) => {
            const k = KEYS.has(clean(w));
            return (
              <span key={i} style={{ fontFamily: FONT, fontSize: 46, lineHeight: 1.35, color: INK, backgroundImage: k ? `linear-gradient(transparent 42%, ${MARKER} 42%, ${MARKER} 92%, transparent 92%)` : "none", padding: k ? "0 4px" : 0 }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ section: string }> = ({ section }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - 4), fps: FPS, config: { damping: 14, stiffness: 160 } });
  const name = SECTION_NAMES[section];
  const w = 120 + name.length * 26;
  return (
    <div style={{ position: "absolute", right: 50, top: 34, perspective: 800 }}>
      <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - p) * -90}deg) rotate(1deg)` }}>
        <Sheet w={w} h={84} tx="kraft" seed={5}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Img src={icon("1f345")} style={{ width: 44, height: 44 }} />
            <Hand size={42}>{name}</Hand>
          </div>
        </Sheet>
      </div>
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({ frame: onTwos(frame - 4), fps: FPS, config: { damping: 12, stiffness: 140 } });
  const mins = interpolate(frame, [6, 50], [0, 25], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <Sfx at={0} name="riser" vol={0.35} />
      <Sfx at={6} name="windup" vol={0.3} />
      <div style={{ position: "absolute", left: W / 2 - 620, top: 250, transform: `scale(${p})` }}>
        <TomatoTimer size={460} minutes={mins} />
      </div>
      <div style={{ position: "absolute", left: W / 2 - 80, top: 300, perspective: 1200 }}>
        <div style={{ transformOrigin: "50% 100%", transform: `rotateX(${(1 - p) * 90}deg) rotate(-1.5deg)` }}>
          <Sheet w={760} h={380} seed={4}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Hand size={60} color="#555">
                طريقة
              </Hand>
              <Hand size={140} color={TOMATO} style={{ lineHeight: 1.05 }}>
                البومودورو
              </Hand>
              <div dir="rtl" style={{ fontFamily: FONT, fontSize: 38, color: INK, backgroundImage: `linear-gradient(transparent 40%, ${MARKER} 40%, ${MARKER} 92%, transparent 92%)`, padding: "0 10px" }}>
                25 دقيقة تغيّر دراستك
              </div>
            </div>
            <Tape x={90} y={16} rot={-24} />
            <Tape x={670} y={16} rot={22} />
          </Sheet>
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
        <div style={{ fontFamily: FONT, fontSize: 300, lineHeight: 1, letterSpacing: interpolate(p, [0, 1], [50, -4]), background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", opacity: p, filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.55))" }}>MJ</div>
        <div style={{ width: 340 * p, height: 6, background: GOLD, borderRadius: 3 }} />
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 52, color: "#fff", marginTop: 20, opacity: p }}>
          اشترك لمزيد من طرق الدراسة 🍅
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, color: GOLD, opacity: p }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const mid = BOUNDS.find((b) => b.section === "seventeen")?.t ?? 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "rgba(0,0,0,0.15)" }}>
      <div style={{ height: "100%", width: `${(frame / YT2_FRAMES) * 100}%`, background: TOMATO }} />
      {BOUNDS.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 4, left: `${(b.t / YT2_DURATION) * 100}%`, background: INK, opacity: 0.35 }} />
      ))}
      <div style={{ position: "absolute", top: -34, left: `calc(${(mid / YT2_DURATION) * 100}% - 22px)`, fontSize: 36 }}>🍅</div>
    </div>
  );
};

const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 44, top: 30, fontFamily: FONT, fontSize: 54, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>MJ</div>
);

/* ======================= timeline ======================= */
type SceneDef = { first: number; C: React.FC<SceneProps> };
const SCENES: SceneDef[] = [
  { first: 0, C: S_Hours },
  { first: 1, C: S_Phone },
  { first: 2, C: S_Title },
  { first: 3, C: S_Teaser },
  { first: 5, C: S_Italy },
  { first: 6, C: S_WeakFocus },
  { first: 7, C: S_Kitchen },
  { first: 9, C: S_Insight },
  { first: 11, C: S_Dictionary },
  { first: 12, C: S_Millions },
  { first: 13, C: S_Reasons },
  { first: 14, C: S_Battery },
  { first: 16, C: S_Deadline },
  { first: 18, C: S_EasyStart },
  { first: 21, C: S_Achieve },
  { first: 22, C: S_StepsIntro },
  { first: 23, C: S_Step1 },
  { first: 25, C: S_Step2 },
  { first: 27, C: S_Step3 },
  { first: 31, C: S_Step4 },
  { first: 33, C: S_Step5 },
  { first: 35, C: S_17Q },
  { first: 36, C: S_Secret },
  { first: 37, C: S_SixSessions },
  { first: 39, C: S_Week },
  { first: 40, C: S_Coef },
  { first: 42, C: S_Pair },
  { first: 44, C: S_Tracker },
  { first: 46, C: S_GradeChart },
  { first: 48, C: S_NotGenius },
  { first: 50, C: S_DayPlan },
  { first: 58, C: S_Sleep },
  { first: 59, C: S_MistakesIntro },
  { first: 60, C: S_M1 },
  { first: 62, C: S_M2 },
  { first: 64, C: S_M3 },
  { first: 66, C: S_TipsIntro },
  { first: 67, C: S_Prepare },
  { first: 68, C: S_PhoneAway },
  { first: 69, C: S_Place },
  { first: 70, C: S_Switch },
  { first: 71, C: S_5010 },
  { first: 73, C: S_Faq1 },
  { first: 75, C: S_Faq2 },
  { first: 77, C: S_Faq3 },
  { first: 79, C: S_Faq4 },
  { first: 81, C: S_Recap },
  { first: 86, C: S_TryNow },
  { first: 88, C: S_Motivation },
  { first: 91, C: S_Subscribe },
];

const sceneFrom = (first: number) => {
  if (first === 0) return LINES[0].start - 0.3;
  const l = LINES[first];
  if (LINES[first - 1].section !== l.section) return (LINES[first - 1].end + l.start) / 2 + 0.2;
  return Math.max(LINES[first - 1].end + 0.05, l.start - 0.25);
};

const SceneFold: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(onTwos(frame), [dur - 6, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ perspective: 2000 }}>
      <AbsoluteFill style={{ transformOrigin: "50% 15%", transform: `rotateX(${o * 80}deg)`, opacity: 1 - o * 0.7 }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const hostHidden = (t: number) => t < LINES[0].start - 0.2 || t > END_AT - 0.3;

export const YT2: React.FC = () => {
  const introEnd = sec(LINES[0].start - 0.3);
  return (
    <AbsoluteFill style={{ background: "#EED9B6" }}>
      <World />
      {/* soft scrim so the cards read well over the room */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 45%, rgba(255,248,235,0.55) 0%, rgba(255,248,235,0.25) 55%, rgba(0,0,0,0) 80%)" }} />
      <Sequence durationInFrames={introEnd + 10} layout="none">
        <Intro />
      </Sequence>
      {SCENES.map((s, k) => {
        const from = sceneFrom(s.first);
        const to = k + 1 < SCENES.length ? sceneFrom(SCENES[k + 1].first) : END_AT;
        const dur = sec(to) - sec(from);
        return (
          <Sequence key={k} from={sec(from)} durationInFrames={dur} layout="none">
            <SceneFold dur={dur}>
              <s.C from={from} />
            </SceneFold>
            <Sfx at={0} name="paper_slide" vol={0.1} />
          </Sequence>
        );
      })}
      <Host hidden={hostHidden} />
      {[{ t: LINES[0].start - 0.3, section: "hook" }, ...BOUNDS].map((b, i, arr) => {
        const next = arr[i + 1]?.t ?? END_AT;
        return (
          <Sequence key={`h${i}`} from={sec(b.t)} durationInFrames={sec(next) - sec(b.t)} layout="none">
            <Header section={b.section} />
          </Sequence>
        );
      })}
      {chunks.map((c, i) => (
        <Sequence key={`c${i}`} from={sec(c.start)} durationInFrames={Math.max(2, sec(c.end) - sec(c.start))} layout="none">
          <Subtitle c={c} idx={i} />
        </Sequence>
      ))}
      <Watermark />
      <Sequence from={sec(END_AT)} layout="none">
        <EndCard />
      </Sequence>
      {/* camera travel whoosh on normal section changes, MJ wipe on the big ones */}
      {BOUNDS.map((b, i) =>
        MJ_SECTIONS.has(b.section) ? (
          <Sequence key={`w${i}`} from={sec(b.t) - 12} durationInFrames={24} layout="none">
            <MJWipe seed={i} />
          </Sequence>
        ) : (
          <Sfx key={`w${i}`} at={sec(b.t - 0.45)} name="mj_whoosh" vol={0.22} />
        ),
      )}
      <Sequence from={sec(END_AT) - 12} durationInFrames={24} layout="none">
        <MJWipe seed={9} />
      </Sequence>
      <Audio src={staticFile("yt2/narration.wav")} />
      <Audio
        src={staticFile("yt2/music.wav")}
        volume={(f) =>
          interpolate(f, [0, sec(LINES[0].start), sec(LINES[0].start) + 15, sec(END_AT) - 10, sec(END_AT), YT2_FRAMES - 20, YT2_FRAMES], [0.3, 0.3, 0.08, 0.08, 0.3, 0.3, 0], clamp)
        }
      />
      <Progress />
    </AbsoluteFill>
  );
};

export const YT2Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#EED9B6", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: WORLD_H, transformOrigin: "0 0", transform: `translate(${640 - 2700 * 0.62}px, ${360 - 1250 * 0.62}px) scale(0.62)`, filter: "blur(3px)" }}>
      <Room screenMinutes={25} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,15,10,0.0) 30%, rgba(20,15,10,0.55) 100%)" }} />
    <Img src={staticFile("yt2/host/p11.png")} style={{ position: "absolute", left: -20, bottom: 0, width: 520, filter: "drop-shadow(8px 0 0 #fff) drop-shadow(-8px 0 0 #fff) drop-shadow(0 -8px 0 #fff) drop-shadow(0 12px 16px rgba(0,0,0,0.5))" }} />
    <div style={{ position: "absolute", left: 420, top: 330 }}>
      <TomatoTimer size={260} minutes={25} />
    </div>
    <div dir="rtl" style={{ position: "absolute", right: 40, top: 60, width: 640, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 92, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000" }}>طريقة</div>
      <div style={{ fontFamily: FONT, fontSize: 112, lineHeight: 1.1, color: TOMATO, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000" }}>البومودورو</div>
      <div style={{ display: "inline-block", marginTop: 20, fontFamily: FONT, fontSize: 76, color: INK, background: GOLD, padding: "0 30px 10px", borderRadius: 18, transform: "rotate(-3deg)", border: "5px solid #000" }}>معدل 17 ✓</div>
    </div>
    <div style={{ position: "absolute", left: 30, top: 20, fontFamily: FONT, fontSize: 70, letterSpacing: -3, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>MJ</div>
  </AbsoluteFill>
);
