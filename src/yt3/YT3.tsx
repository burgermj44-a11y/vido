/*
 * YouTube video 3 (16:9): five study methods, from the hardest to the easiest.
 * Same paper study-room setup and host cut-out as video 2 (shared kit in ../yt2).
 */
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, getInputProps, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { FONT, loadFonts } from "../fonts";
import { ENV, ENV_FPS } from "./env";
import {
  Card,
  DrawMark,
  FPS,
  GOLD,
  GREEN,
  H,
  HAND,
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
  tex,
} from "../yt2/kit";
import { Room, TomatoTimer, WORLD_H, WORLD_W } from "../yt2/Setup";
import { LINES, YT3_DURATION } from "./timing";

loadFonts();
loadHand();

export const YT3_FPS = FPS;
export const YT3_FRAMES = Math.round(YT3_DURATION * FPS);

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

const LEVEL_COLORS = ["#2E9E5B", "#7BBF3A", "#F2B705", "#F28C28", "#D7322F"];
const METHODS = [
  { name: "تقنية فاينمان", code: "1f9d1-200d-1f52c", level: 5 },
  { name: "الاسترجاع الفعّال", code: "1f9e0", level: 4 },
  { name: "الخلط بين التمارين", code: "1f500", level: 3 },
  { name: "التكرار المتباعد", code: "1f4c5", level: 2 },
  { name: "الخريطة الذهنية", code: "1f5fa", level: 1 },
];

/* difficulty meter: 5 bars, filled up to `level` */
const Meter: React.FC<{ level: number; delay: number; w?: number }> = ({ level, delay, w = 360 }) => {
  const frame = useCurrentFrame();
  const col = LEVEL_COLORS[level - 1];
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map((k) => {
        const p = ramp(frame, delay + k * 4, delay + k * 4 + 8, Easing.out(Easing.back(1.6)));
        return <div key={k} style={{ width: w / 5 - 10, height: 24 + k * 16, borderRadius: 8, border: `4px solid ${INK}`, background: k <= level && p > 0 ? col : "#fff", transform: `scaleY(${k <= level ? 0.4 + p * 0.6 : 1})`, transformOrigin: "50% 100%" }} />;
      })}
    </div>
  );
};

/* big title card for each method */
const MethodTitle: React.FC<{ n: number }> = ({ n }) => {
  const frame = useCurrentFrame();
  const m = METHODS[n - 1];
  const line = ramp(frame, 18, 32);
  return (
    <AbsoluteFill>
      <NumberBadge n={n} x={CX + 480} y={CY - 40} delay={2} size={260} seed={n} />
      <Unfold x={CX - 80} y={CY - 90} delay={8} seed={n + 40} sound="paper_slide">
        <div style={{ textAlign: "center" }}>
          <Hand size={52} color="#555">
            الطريقة {["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة"][n - 1]}
          </Hand>
          <Hand size={112} style={{ lineHeight: 1.15 }}>
            {m.name}
          </Hand>
          <div style={{ margin: "6px auto 0", width: 640 * line, height: 18, background: MARKER, borderRadius: 9 }} />
        </div>
      </Unfold>
      <Unfold x={CX - 80} y={CY + 230} delay={20} seed={n + 50}>
        <Sheet w={620} h={170} tx="kraft" seed={n + 50}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <Hand size={44}>الصعوبة:</Hand>
            <Meter level={m.level} delay={22} />
          </div>
        </Sheet>
      </Unfold>
      <Sticker code={m.code} x={CX + 470} y={CY + 230} size={170} delay={26} rot={8} seed={n + 60} />
      {[1, 2, 3, 4, 5].map((k) => (k <= m.level ? <Sfx key={k} at={22 + k * 4} name="click" vol={0.12} /> : null))}
    </AbsoluteFill>
  );
};

const S_Balance: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [word(from, 0, "أهم") - 4, word(from, 0, "أهم") + 14], [0, -12], { ...clamp, easing: Easing.out(Easing.back(1.5)) });
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`${CX - 50},${CY + 320} ${CX + 50},${CY + 320} ${CX},${CY + 170}`} fill={INK} />
      </svg>
      <div style={{ position: "absolute", left: CX - 520, top: CY + 150, width: 1040, height: 20, background: INK, borderRadius: 10, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: -10, bottom: 10, transform: `rotate(${-tilt}deg)`, transformOrigin: "50% 100%" }}>
          <Card x={170} y={-160} delay={4} title="طريقة الدراسة" code="1f9e0" seed={1} w={340} h={300} color={GREEN} />
        </div>
        <div style={{ position: "absolute", right: -10, bottom: 10, transform: `rotate(${-tilt}deg)`, transformOrigin: "50% 100%" }}>
          <Card x={-170} y={-160} delay={10} title="عدد الساعات" code="23f0" seed={2} w={340} h={300} />
        </div>
      </div>
      <Sfx at={word(from, 0, "أهم")} name="mj_hit" vol={0.18} />
    </AbsoluteFill>
  );
};

/* staircase: 5 steps from hard (top) to easy (bottom) */
const Stairs: React.FC<{ from: number; revealNames?: number[]; showArrow?: number }> = ({ revealNames = [], showArrow }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const d = 4 + i * 5;
        const p = spring({ frame: onTwos(frame - d), fps: FPS, config: { damping: 12, stiffness: 170 } });
        const m = METHODS[i];
        const shown = revealNames[i] !== undefined && frame >= revealNames[i];
        return frame >= d ? (
          <div key={i} style={{ position: "absolute", left: CX - 560 + i * 230, top: CY - 260 + i * 120, width: 300, transform: `scale(${p})`, transformOrigin: "50% 100%" }}>
            <Sheet w={300} h={150} tx={shown ? "white" : "kraft"} seed={i + 3}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: LEVEL_COLORS[m.level - 1] }} />
              <div style={{ position: "absolute", inset: "16px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {shown ? (
                  <>
                    <Img src={icon(m.code)} style={{ width: 56, height: 56 }} />
                    <Hand size={30}>{m.name}</Hand>
                  </>
                ) : (
                  <Hand size={64}>{i + 1}</Hand>
                )}
              </div>
            </Sheet>
          </div>
        ) : null;
      })}
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} at={4 + i * 5} name="paper_fold" vol={0.12} />
      ))}
      {showArrow !== undefined && frame >= showArrow && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={`M${CX + 520} ${CY + 300} L${CX - 420} ${CY - 180}`} stroke={GREEN} strokeWidth="12" strokeLinecap="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - ramp(frame, showArrow, showArrow + 20)} fill="none" />
        </svg>
      )}
    </>
  );
};

const S_Stairs: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Stairs from={from} />
    <Label text="الأصعب" x={CX - 440} y={CY - 360} delay={word(from, 2, "الأصعب")} size={50} color={RED} />
    <Label text="الأسهل" x={CX + 520} y={CY + 400} delay={word(from, 2, "الأسهل")} size={50} color={GREEN} rot={2} />
    <Stamp text="نتائج قوية 💪" x={CX - 300} y={CY + 230} delay={word(from, 3, "نتائج")} color={RED} rot={-6} size={46} />
    <Stamp text="بداية سهلة 🙂" x={CX + 160} y={CY - 300} delay={word(from, 3, "تساعدك")} color={GREEN} rot={5} size={46} />
  </AbsoluteFill>
);

const S_Choose: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Sticker code="1f914" x={CX - 280} y={CY - 20} size={260} delay={2} seed={9} />
    <Sticker code="1f680" x={CX + 280} y={CY - 20} size={260} delay={word(from, 4, "وابدأ")} seed={10} rot={10} />
    <Label text="اختر ما يناسبك وابدأ اليوم" x={CX} y={CY + 280} delay={6} size={56} tx="kraft" />
  </AbsoluteFill>
);

/* ---- 1: Feynman ---- */
const S_Quote: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Sticker code="1f9d1-200d-1f52c" x={CX + 470} y={CY - 120} size={230} delay={2} seed={11} />
    <Label text="ريتشارد فاينمان · فيزيائي" x={CX + 400} y={CY + 140} delay={8} size={38} tx="kraft" />
    <Unfold x={CX - 180} y={CY + 30} delay={word(from, 7, "كان")} seed={12} sound="paper_slide">
      <Sheet w={760} h={420} seed={12}>
        <div style={{ position: "absolute", left: 30, top: -10, fontFamily: "Georgia, serif", fontSize: 200, color: MARKER, lineHeight: 1 }}>”</div>
        <div dir="rtl" style={{ position: "absolute", inset: "70px 50px 40px 50px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <Hand size={56}>إذا لم تستطع أن تشرحها ببساطة، فأنت لم تفهمها</Hand>
        </div>
        <Tape x={380} y={6} />
      </Sheet>
    </Unfold>
  </AbsoluteFill>
);

const FStep: React.FC<{ n: number; text: string; delay?: number }> = ({ n, text, delay = 0 }) => (
  <Unfold x={CX} y={150} delay={delay} seed={n + 70} sound="paper_slide">
    <Sheet w={980} h={124} seed={n + 70}>
      <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 24, padding: "0 40px" }}>
        <div style={{ width: 86, height: 86, borderRadius: 43, background: RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Hand size={56} color="#fff">
            {n}
          </Hand>
        </div>
        <Hand size={50}>{text}</Hand>
      </div>
    </Sheet>
  </Unfold>
);

const S_FWrite: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const w = ramp(frame, word(from, 8, "اكتب"), word(from, 8, "أعلى") + 10);
  return (
    <AbsoluteFill>
      <FStep n={1} text="اكتب اسم الدرس" />
      <Unfold x={CX} y={CY + 140} delay={4} seed={13}>
        <Sheet w={700} h={520} seed={13}>
          <div dir="rtl" style={{ position: "absolute", top: 40, right: 50, clipPath: `inset(0 0 0 ${(1 - w) * 100}%)` }}>
            <Hand size={60} color={PEN}>
              الدرس: الدوال الأسية
            </Hand>
          </div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 130, height: 4, background: "rgba(43,89,195,0.4)" }} />
        </Sheet>
      </Unfold>
      <Sticker code="270d" x={CX + 330} y={CY + 340} size={140} delay={word(from, 8, "اكتب")} seed={14} rot={10} />
    </AbsoluteFill>
  );
};

const S_FChild: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <FStep n={2} text="اشرحه كأنك تشرحه لطفل" />
    <Sticker code="1f9d2" x={CX + 330} y={CY + 140} size={280} delay={word(from, 9, "لطفل")} seed={15} />
    <Unfold x={CX - 220} y={CY + 80} delay={word(from, 9, "اشرحه")} seed={16} sound="paper_slide">
      <div dir="rtl" style={{ maxWidth: 620, background: "#fff", border: `5px solid ${INK}`, borderRadius: 34, padding: "26px 36px", boxShadow: "0 12px 16px rgba(0,0,0,0.25)" }}>
        <Hand size={46}>شوف، الدالة الأسية كي تكبر x، تكبر بسرعة بزاف...</Hand>
      </div>
    </Unfold>
    <Label text="بكلماتك أنت" x={CX - 220} y={CY + 330} delay={word(from, 9, "بكلماتك")} size={46} tx="kraft" />
  </AbsoluteFill>
);

const S_FGap: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const c = ramp(frame, word(from, 10, "فهذه"), word(from, 10, "فهذه") + 14);
  const t9 = at(from, 11, 0);
  return (
    <AbsoluteFill>
      <FStep n={3} text="أين توقفت؟ هنا لم تفهم" />
      <Unfold x={CX - 100} y={CY + 140} delay={4} seed={17}>
        <Sheet w={760} h={460} seed={17}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{ position: "absolute", right: 50, top: 60 + k * 70, height: 10, borderRadius: 5, background: k === 2 ? "transparent" : "rgba(31,31,36,0.5)", width: `${80 - (k % 2) * 15}%` }} />
          ))}
          <div style={{ position: "absolute", right: 220, top: 170, fontFamily: HAND, fontWeight: 700, fontSize: 90, color: RED }}>؟؟</div>
          <svg width="760" height="460" style={{ position: "absolute", inset: 0 }}>
            <ellipse cx="420" cy="220" rx="150" ry="70" fill="none" stroke={RED} strokeWidth="8" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - c} transform="rotate(-5 420 220)" />
          </svg>
          {frame >= t9 && (
            <div style={{ position: "absolute", right: 200, top: 190, padding: "4px 18px", background: "#E7F6EC", border: `4px solid ${GREEN}`, borderRadius: 12, opacity: ramp(frame, t9 + 10, t9 + 20) }}>
              <Hand size={44} color={GREEN}>
                فهمتها ✓
              </Hand>
            </div>
          )}
        </Sheet>
      </Unfold>
      <Sticker code="1f630" x={CX + 420} y={CY + 60} size={170} delay={word(from, 10, "تتوقف")} seed={18} />
      <Sticker code="1f4d6" x={CX + 420} y={CY + 300} size={150} delay={t9} seed={19} rot={-8} />
      <Sfx at={word(from, 10, "فهذه")} name="paper_crumple" vol={0.2} />
    </AbsoluteFill>
  );
};

const S_FWhy: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Sticker code="1f50d" x={CX - 280} y={CY - 20} size={280} delay={2} seed={20} rot={-10} />
    <Card x={CX + 250} y={CY - 20} delay={word(from, 12, "تكشف")} title="تكشف ما لا تعرفه" code="1f648" seed={21} w={440} h={360} />
    <Stamp text="أقوى فهم 💯" x={CX} y={CY + 300} delay={word(from, 12, "أقوى")} color={GREEN} rot={-4} size={60} />
  </AbsoluteFill>
);

/* ---- 2: active recall ---- */
const S_Close: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Card x={CX + 280} y={CY} delay={word(from, 20, "تعيد")} title="إعادة القراءة" code="1f4d6" seed={22} w={400} h={360} />
    <DrawMark kind="cross" x={CX + 280} y={CY} size={260} at={word(from, 20, "أغلق")} />
    <Sticker code="1f4d5" x={CX - 230} y={CY - 60} size={220} delay={word(from, 20, "أغلق")} seed={23} />
    <Unfold x={CX - 230} y={CY + 220} delay={word(from, 20, "واسأل")} seed={24} sound="paper_slide">
      <div dir="rtl" style={{ background: "#fff", border: `5px solid ${INK}`, borderRadius: 30, padding: "16px 34px" }}>
        <Hand size={56}>ماذا أتذكر؟ 🤔</Hand>
      </div>
    </Unfold>
  </AbsoluteFill>
);

const S_WriteFix: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 21, "اكتب");
  const tFix = word(from, 21, "وصحح");
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 30} delay={2} seed={25}>
        <Sheet w={820} h={600} seed={25}>
          <div dir="rtl" style={{ position: "absolute", top: 26, right: 40 }}>
            <Hand size={44} color={PEN}>
              ما أتذكره:
            </Hand>
          </div>
          {Array.from({ length: 7 }, (_, k) => {
            const w = Math.max(0, Math.min(1, (frame - t0 - k * 6) / 8));
            const wrong = k === 2 || k === 5;
            return (
              <React.Fragment key={k}>
                <div style={{ position: "absolute", right: 40, top: 110 + k * 66, height: 10, borderRadius: 5, background: PEN, opacity: 0.7, width: `${w * (76 - (k % 3) * 12)}%` }} />
                {wrong && frame > tFix + k * 3 && (
                  <>
                    <div style={{ position: "absolute", right: 40, top: 108 + k * 66, height: 4, background: RED, width: `${ramp(frame, tFix + k * 3, tFix + k * 3 + 8) * 60}%` }} />
                    <div style={{ position: "absolute", left: 40, top: 92 + k * 66, opacity: ramp(frame, tFix + k * 3 + 6, tFix + k * 3 + 12) }}>
                      <Hand size={36} color={GREEN}>
                        ✓ تصحيح
                      </Hand>
                    </div>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Sheet>
      </Unfold>
      <Sticker code="1f58a" x={CX + 470} y={CY + 280} size={150} delay={tFix} seed={26} rot={20} />
    </AbsoluteFill>
  );
};

const S_QCards: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    {[0, 1, 2].map((i) => (
      <Card key={i} x={CX + 330 - i * 330} y={CY - 20} delay={word(from, 22, "أسئلة") + i * 5} title={`سؤال ${i + 1} ؟`} code="2753" seed={27 + i} w={300} h={320} color={PEN} />
    ))}
    <Label text="📅 أجب بعد يوم" x={CX} y={CY + 290} delay={word(from, 22, "بعد")} size={56} tx="kraft" />
  </AbsoluteFill>
);

const S_Effort: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Sticker code="1f9e0" x={CX - 260} y={CY - 20} size={280} delay={2} seed={30} />
    <Sticker code="1f4aa" x={CX + 260} y={CY - 20} size={240} delay={word(from, 23, "التعب")} seed={31} rot={8} />
    <Label text="تعب التذكر = تثبيت المعلومة" x={CX} y={CY + 280} delay={word(from, 23, "يثبت")} size={54} />
  </AbsoluteFill>
);

/* ---- 3: interleaving ---- */
const BLOCKS = [
  { t: "الدوال", c: "#D7322F" },
  { t: "المتتاليات", c: "#2B59C3" },
  { t: "الهندسة", c: "#2E9E5B" },
];
const Blocks: React.FC<{ mixAt: number; label?: boolean }> = ({ mixAt }) => {
  const frame = useCurrentFrame();
  const m = ramp(frame, mixAt, mixAt + 24, Easing.inOut(Easing.cubic));
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const kind = Math.floor(i / 3);
        const blockedX = CX + 420 - i * 105;
        const mixedIdx = (i % 3) * 3 + kind;
        const mixedX = CX + 420 - mixedIdx * 105;
        const y = CY + 30 - Math.sin(m * Math.PI) * (i % 2 ? 80 : -80);
        const d = 4 + i * 2;
        const p = spring({ frame: frame - d, fps: FPS, config: { damping: 12 } });
        return frame >= d ? (
          <div key={i} style={{ position: "absolute", left: blockedX + (mixedX - blockedX) * m - 48, top: y - 70, width: 96, height: 140, borderRadius: 14, background: BLOCKS[kind].c, transform: `scale(${p}) rotate(${(i % 2 ? 3 : -3) * (1 - m)}deg)`, boxShadow: "0 8px 10px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 30, color: "#fff", writingMode: "vertical-rl" }}>{BLOCKS[kind].t}</div>
          </div>
        ) : null;
      })}
    </>
  );
};

const S_Blocked: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="10 تمارين من نفس النوع" x={CX} y={CY - 250} delay={word(from, 31, "عشرة")} size={54} tx="kraft" />
    <Blocks mixAt={99999} />
    <Unfold x={CX} y={CY + 300} delay={at(from, 32, 0.1)} seed={32} sound="paper_slide">
      <div dir="rtl" style={{ background: "#fff", border: `5px solid ${RED}`, borderRadius: 24, padding: "12px 30px" }}>
        <Hand size={50} color={RED}>
          في الامتحان: ما هو نوع التمرين؟ 🤷
        </Hand>
      </div>
    </Unfold>
  </AbsoluteFill>
);

const S_Mix: React.FC<SceneProps> = ({ from }) => {
  const mixAt = word(from, 33, "اخلط");
  return (
    <AbsoluteFill>
      <Label text="اخلط!" x={CX} y={CY - 250} delay={mixAt} size={70} color={GREEN} />
      <Blocks mixAt={mixAt} />
      <Sfx at={mixAt} name="mj_whoosh" vol={0.2} />
      <Sticker code="1f9e0" x={CX - 420} y={CY + 300} size={150} delay={at(from, 34, 0.05)} seed={33} />
      <Label text="عقلك يختار الطريقة المناسبة" x={CX + 80} y={CY + 300} delay={at(from, 34, 0.1)} size={46} />
    </AbsoluteFill>
  );
};

const S_Result: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, word(from, 35, "أصعب"), word(from, 35, "أصعب") + 16);
  const b = ramp(frame, word(from, 35, "نتيجتك"), word(from, 35, "نتيجتك") + 20);
  const bars = [
    { t: "تمارين بنفس النوع", ex: 0.75, exam: 0.4, c: "#999" },
    { t: "تمارين مخلوطة", ex: 0.55, exam: 0.85, c: GREEN },
  ];
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 30} delay={2} seed={34}>
        <Sheet w={1040} h={600} seed={34}>
          <div dir="rtl" style={{ position: "absolute", inset: "30px 60px", display: "flex", gap: 80, alignItems: "flex-end", justifyContent: "center" }}>
            {bars.map((x, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end", height: 360 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 110, height: 340 * x.ex * a, background: "#F2B705", borderRadius: "12px 12px 0 0" }} />
                    <Hand size={30}>التمرين</Hand>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 110, height: 340 * x.exam * b, background: x.c, borderRadius: "12px 12px 0 0" }} />
                    <Hand size={30}>الامتحان</Hand>
                  </div>
                </div>
                <Hand size={40}>{x.t}</Hand>
              </div>
            ))}
          </div>
        </Sheet>
      </Unfold>
      <Stamp text="أفضل في الامتحان" x={CX - 260} y={CY - 250} delay={word(from, 35, "أفضل")} color={GREEN} rot={-6} size={52} />
    </AbsoluteFill>
  );
};

/* ---- 4: spaced repetition ---- */
const S_Curve: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const red = ramp(frame, word(from, 43, "ينسى"), word(from, 43, "لكن"));
  const green = ramp(frame, word(from, 43, "كل"), at(from, 43, 1));
  const X = (d: number) => 120 + Math.sqrt(d / 30) * 860;
  const Y = (r: number) => 480 - r * 360;
  const redPts = Array.from({ length: 61 }, (_, i) => `${X(i / 2).toFixed(1)},${Y(0.2 + 0.8 * Math.exp(-(i / 2) / 1.2)).toFixed(1)}`).join(" ");
  const rv = [0, 1, 3, 7, 30];
  const gp: string[] = [];
  for (let r = 0; r < rv.length - 1; r++) {
    const tau = 1.2 * Math.pow(2.6, r);
    for (let s = 0; s <= 12; s++) {
      const d = rv[r] + ((rv[r + 1] - rv[r]) * s) / 12;
      gp.push(`${X(d).toFixed(1)},${Y(0.25 + 0.75 * Math.exp(-(d - rv[r]) / tau)).toFixed(1)}`);
    }
  }
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 20} delay={2} seed={35}>
        <Sheet w={1100} h={620} seed={35}>
          <div style={{ position: "absolute", top: 20, right: 50 }}>
            <Hand size={48}>كم تتذكر؟</Hand>
          </div>
          <svg width={1100} height={620} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(0 50)">
              <path d="M120 90 V480 H1010" stroke={INK} strokeWidth="5" fill="none" />
              <polyline points={redPts} fill="none" stroke={RED} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - red} />
              {green > 0 && <polyline points={gp.join(" ")} fill="none" stroke={GREEN} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - green} />}
            </g>
          </svg>
          <div dir="rtl" style={{ position: "absolute", right: 60, top: 260 }}>
            <Hand size={34} color={RED} style={{ opacity: red > 0 ? 1 : 0 }}>
              ● بدون مراجعة
            </Hand>
            <Hand size={34} color={GREEN} style={{ opacity: green > 0 ? 1 : 0 }}>
              ● مع مراجعات متباعدة
            </Hand>
          </div>
        </Sheet>
      </Unfold>
    </AbsoluteFill>
  );
};

const S_Dates: React.FC<SceneProps> = ({ from }) => {
  const marks: [string, string][] = [
    ["يوم", "يوم"],
    ["3 أيام", "ثلاثة"],
    ["أسبوع", "أسبوع"],
    ["شهر", "شهر"],
  ];
  return (
    <AbsoluteFill>
      {marks.map(([t, w], i) => (
        <Unfold key={i} x={CX + 450 - i * 300} y={CY} delay={word(from, 44, w)} seed={36 + i} rot={i % 2 ? 3 : -3}>
          <Sheet w={250} h={250} tx={i === 3 ? "kraft" : "white"} seed={36 + i}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Img src={icon("1f4c5")} style={{ width: 90, height: 90 }} />
              <Hand size={50}>{t}</Hand>
            </div>
            <Tape x={125} y={6} w={100} />
          </Sheet>
        </Unfold>
      ))}
      <Label text="راجع في هذه المواعيد" x={CX} y={CY + 290} delay={word(from, 44, "راجع")} size={54} tx="kraft" />
    </AbsoluteFill>
  );
};

const S_Table: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const rows = ["الدوال", "الأعداد المركبة", "الوراثة", "الفلسفة"];
  const t0 = word(from, 45, "اكتب");
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY - 20} delay={2} seed={40}>
        <Sheet w={1040} h={520} seed={40}>
          <div style={{ position: "absolute", top: 20, right: 50 }}>
            <Hand size={48}>جدول المراجعة</Hand>
          </div>
          {rows.map((r, i) => (
            <div key={i} dir="rtl" style={{ position: "absolute", right: 50, left: 50, top: 110 + i * 92, display: "flex", alignItems: "center", gap: 16, borderBottom: "3px dashed rgba(43,89,195,0.35)", paddingBottom: 8 }}>
              <Hand size={40} style={{ width: 300 }}>
                {r}
              </Hand>
              {[0, 1, 2, 3].map((k) => (
                <div key={k} style={{ width: 120, height: 60, border: `4px solid ${INK}`, borderRadius: 10, position: "relative", background: frame > t0 + (i * 4 + k) * 3 ? "#E7F6EC" : "#fff" }}>
                  {frame > t0 + (i * 4 + k) * 3 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, color: GREEN, fontWeight: 900 }}>✓</div>}
                </div>
              ))}
            </div>
          ))}
        </Sheet>
      </Unfold>
      <Stamp text="سهلة: تنظيم + التزام" x={CX} y={CY + 320} delay={word(from, 46, "سهلة")} color={GREEN} rot={-3} size={54} />
    </AbsoluteFill>
  );
};

/* ---- 5: mind map ---- */
const S_MindMap: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const tC = word(from, 54, "عنوان");
  const tB = word(from, 55, "فروعًا");
  const tS = word(from, 55, "أصغر");
  const tCol = at(from, 56, 0.05);
  const tAll = at(from, 57, 0.05);
  const tFast = at(from, 58, 0.1);
  const branches = [
    { a: -150, t: "التعريف", code: "1f4d6", c: RED },
    { a: -30, t: "الخصائص", code: "2728", c: PEN },
    { a: 30, t: "التمارين", code: "270f", c: GREEN },
    { a: 150, t: "الأخطاء", code: "26a0", c: "#F28C28" },
  ];
  const zoom = interpolate(frame, [tAll, tAll + 20], [1, 0.86], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ring = ramp(frame, tC, tC + 16);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${CX}px ${CY}px` }}>
        <Unfold x={CX} y={CY + 20} delay={2} seed={41} sound={null}>
          <Sheet w={1200} h={760} seed={41}>
            <svg width={1200} height={760} style={{ position: "absolute", inset: 0 }}>
              {branches.map((b, i) => {
                const rad = (b.a * Math.PI) / 180;
                const x2 = 600 + Math.cos(rad) * 380;
                const y2 = 380 + Math.sin(rad) * 250;
                const p = ramp(frame, tB + i * 6, tB + i * 6 + 14);
                const col = frame > tCol ? b.c : INK;
                return (
                  <g key={i}>
                    <path d={`M600 380 Q ${(600 + x2) / 2} ${y2 - 40} ${x2} ${y2}`} stroke={col} strokeWidth={frame > tCol ? 14 : 8} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
                    {[0, 1].map((k) => {
                      const sp = ramp(frame, tS + i * 4 + k * 3, tS + i * 4 + k * 3 + 10);
                      const x3 = x2 + Math.cos(rad + (k ? 0.5 : -0.5)) * 130;
                      const y3 = y2 + Math.sin(rad + (k ? 0.5 : -0.5)) * 90;
                      return <path key={k} d={`M${x2} ${y2} L${x3} ${y3}`} stroke={col} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - sp} />;
                    })}
                  </g>
                );
              })}
              <ellipse cx="600" cy="380" rx="190" ry="90" fill="#fff" stroke={INK} strokeWidth="7" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ring} />
            </svg>
            <div style={{ position: "absolute", left: 410, top: 340, width: 380, textAlign: "center", opacity: ring }}>
              <Hand size={52}>عنوان الدرس</Hand>
            </div>
            {branches.map((b, i) => {
              const rad = (b.a * Math.PI) / 180;
              const x2 = 600 + Math.cos(rad) * 380;
              const y2 = 380 + Math.sin(rad) * 250;
              const v = ramp(frame, tB + i * 6 + 10, tB + i * 6 + 18);
              return (
                <div key={i} dir="rtl" style={{ position: "absolute", left: x2 - 110, top: y2 - 40, width: 220, textAlign: "center", opacity: v, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", borderRadius: 14, border: `4px solid ${frame > tCol ? b.c : INK}`, padding: "4px 6px" }}>
                  {frame > tCol && <Img src={icon(b.code)} style={{ width: 46, height: 46 }} />}
                  <Hand size={36}>{b.t}</Hand>
                </div>
              );
            })}
          </Sheet>
        </Unfold>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} at={tB + i * 6} name="paper_rustle" vol={0.14} />
      ))}
      <Sticker code="1f3a8" x={CX + 520} y={CY - 260} size={140} delay={tCol} seed={42} />
      <Label text="الدرس كامل في صفحة واحدة" x={CX} y={CY + 400} delay={tAll} size={50} tx="kraft" />
      <Stamp text="مراجعة سريعة ⚡" x={CX - 380} y={CY - 260} delay={tFast} color={PEN} rot={-8} size={54} />
    </AbsoluteFill>
  );
};

/* ---- recap & cta ---- */
const S_RecapStairs: React.FC<SceneProps> = ({ from }) => {
  const names = ["فاينمان", "الاسترجاع", "الخلط", "التكرار", "الخريطة"];
  const reveal = names.map((n) => word(from, 84, n));
  return (
    <AbsoluteFill>
      <Stairs from={from} revealNames={reveal} showArrow={at(from, 85, 0.2)} />
      <Label text="ابدأ بالسهلة ← وأضف طريقة كل أسبوع" x={CX} y={CY + 400} delay={at(from, 85, 0.1)} size={46} tx="kraft" />
      <Sticker code="1f4c8" x={CX - 470} y={CY + 240} size={170} delay={at(from, 86, 0.3)} seed={43} />
      <Stamp text="الفرق في معدلك" x={CX - 380} y={CY - 360} delay={word(from, 86, "الفرق")} color={GREEN} rot={-5} size={50} />
    </AbsoluteFill>
  );
};

const S_Comment: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const opts = ["فاينمان", "الاسترجاع", "الخلط", "التكرار", "الخريطة"];
  const pick = at(from, 87, 0.7);
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY - 150} delay={2} seed={44} sound="paper_slide">
        <div dir="rtl" style={{ background: "#fff", borderRadius: 30, padding: "20px 40px", boxShadow: "0 14px 20px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 20, border: `5px solid ${INK}` }}>
          <Img src={icon("1f4ac")} style={{ width: 90, height: 90 }} />
          <Hand size={58} style={{ whiteSpace: "nowrap" }}>
            أي طريقة ستجرب أولًا؟
          </Hand>
        </div>
      </Unfold>
      <div dir="rtl" style={{ position: "absolute", left: CX - 600, width: 1200, top: CY + 80, display: "flex", gap: 16, justifyContent: "center" }}>
        {opts.map((o, i) => {
          const d = 10 + i * 4;
          const sel = i === 4 && frame > pick;
          return frame >= d ? (
            <div key={i} style={{ padding: "10px 22px", borderRadius: 999, background: sel ? GREEN : "#fff", border: `4px solid ${sel ? GREEN : INK}`, transform: `scale(${spring({ frame: frame - d, fps: FPS, config: { damping: 10 } }) * (sel ? 1.1 : 1)})` }}>
              <Hand size={40} color={sel ? "#fff" : INK}>
                {i + 1}. {o}
              </Hand>
            </div>
          ) : null;
        })}
      </div>
      <Sfx at={pick} name="click" vol={0.3} />
    </AbsoluteFill>
  );
};

const S_Subscribe: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const tap = word(from, 88, "اشترك") + 8;
  const sub = frame >= tap;
  const bell = word(from, 88, "القناة") + 6;
  const share = word(from, 88, "وشارك");
  return (
    <AbsoluteFill>
      <Sfx at={tap} name="click" vol={0.3} />
      <Sfx at={bell} name="ring" vol={0.12} />
      <Unfold x={CX} y={CY - 80} delay={2} seed={45}>
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
      <Sticker code="1f465" x={CX - 300} y={CY + 280} size={170} delay={share} seed={46} />
      <Label text="شارك الفيديو مع أصدقائك" x={CX + 150} y={CY + 290} delay={share + 4} size={50} tx="kraft" />
    </AbsoluteFill>
  );
};


/* ---- generic scenes for the 8-minute version ---- */
const S_Wrong: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const h = interpolate(frame, [4, at(from, 1, 0.5)], [0, 6], clamp);
  return (
    <AbsoluteFill>
      <Unfold x={CX + 250} y={CY - 20} delay={2} seed={50}>
        <Sheet w={420} h={380} seed={50}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Img src={icon("23f0")} style={{ width: 150, height: 150, transform: `rotate(${jitter(frame, 3, 5)}deg)` }} />
            <Hand size={70}>{Math.round(h)} ساعات</Hand>
          </div>
        </Sheet>
      </Unfold>
      <Card x={CX - 250} y={CY - 20} delay={word(from, 1, "فلا")} title="0 تذكّر" code="1f635" seed={51} w={420} h={380} color={RED} />
      <Stamp text="طريقة خاطئة" x={CX} y={CY + 280} delay={word(from, 1, "خاطئة")} size={60} />
    </AbsoluteFill>
  );
};

const S_PlanTeaser: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Sticker code="1f5d3" x={CX} y={CY - 40} size={300} delay={2} seed={52} />
    <Stamp text="خطة أسبوعية في الآخر 🎁" x={CX} y={CY + 250} delay={word(from, 5, "خطة")} color={PEN} rot={-4} size={56} />
  </AbsoluteFill>
);

type Bullet = [string, string];
const ExampleScene = (li: number, subject: string, code: string, bullets: Bullet[], tail?: { li: number; text: string; code: string }): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => {
    const frame = useCurrentFrame();
    return (
      <AbsoluteFill>
        <Unfold x={CX - 60} y={CY + 10} delay={2} seed={li}>
          <Sheet w={900} h={560} seed={li}>
            <div dir="rtl" style={{ position: "absolute", top: 24, right: 40, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: MARKER, padding: "0 18px 6px", borderRadius: 8 }}>
                <Hand size={50}>مثال</Hand>
              </div>
              <Hand size={50} color={PEN}>
                {subject}
              </Hand>
            </div>
            {bullets.map(([t, w], i) => {
              const d = word(from, li, w);
              return frame >= d ? (
                <div key={i} dir="rtl" style={{ position: "absolute", right: 50, top: 140 + i * 100, display: "flex", alignItems: "center", gap: 14, opacity: ramp(frame, d, d + 6), transform: `translateX(${(1 - ramp(frame, d, d + 8)) * -30}px)` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: TOMATO }} />
                  <Hand size={46}>{t}</Hand>
                </div>
              ) : null;
            })}
          </Sheet>
        </Unfold>
        <Sticker code={code} x={CX + 480} y={CY - 200} size={170} delay={6} rot={8} seed={li + 1} />
        {bullets.map(([, w], i) => (
          <Sfx key={i} at={word(from, li, w)} name="paper_rustle" vol={0.14} />
        ))}
        {tail && <Label text={tail.text} x={CX - 60} y={CY + 360} delay={at(from, tail.li, 0.05)} size={48} tx="kraft" />}
        {tail && <Sticker code={tail.code} x={CX + 470} y={CY + 300} size={150} delay={at(from, tail.li, 0.1)} seed={li + 2} />}
      </AbsoluteFill>
    );
  };
  return C;
};

const MistakeScene = (li: number, wrong: string, fixLi: number, fix: string, code: string): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => (
    <AbsoluteFill>
      <Unfold x={CX} y={150} delay={0} seed={li + 3} sound="paper_slide">
        <Sheet w={560} h={120} tx="kraft" seed={li + 3}>
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Img src={icon("26a0")} style={{ width: 70, height: 70 }} />
            <Hand size={54} color={RED}>
              الخطأ الشائع
            </Hand>
          </div>
        </Sheet>
      </Unfold>
      <Card x={CX + 260} y={CY + 110} delay={at(from, li, 0.15)} title={wrong} code={code} seed={li + 4} w={460} h={380} />
      <DrawMark kind="cross" x={CX + 260} y={CY + 110} size={260} at={at(from, li, 0.8)} />
      <Card x={CX - 260} y={CY + 110} delay={at(from, fixLi, 0.05)} title={fix} code="2705" seed={li + 5} w={460} h={380} color={GREEN} />
    </AbsoluteFill>
  );
  return C;
};

const WhenScene = (li: number, chips: Bullet[]): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => {
    const frame = useCurrentFrame();
    return (
      <AbsoluteFill>
        <Sticker code="1f552" x={CX + 420} y={CY - 140} size={200} delay={2} seed={li} />
        <Label text="متى تستعملها؟" x={CX - 80} y={CY - 200} delay={2} size={72} />
        <div dir="rtl" style={{ position: "absolute", left: CX - 640, width: 1280, top: CY + 60, display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap" }}>
          {chips.map(([t, w], i) => {
            const d = word(from, li, w);
            return frame >= d ? (
              <div key={i} style={{ padding: "14px 34px", borderRadius: 999, background: "#fff", border: `5px solid ${LEVEL_COLORS[i % 5]}`, transform: `scale(${spring({ frame: frame - d, fps: FPS, config: { damping: 10 } })}) rotate(${i % 2 ? 2 : -2}deg)`, boxShadow: "0 8px 10px rgba(0,0,0,0.2)" }}>
                <Hand size={50}>{t}</Hand>
              </div>
            ) : null;
          })}
        </div>
        {chips.map(([, w], i) => (
          <Sfx key={i} at={word(from, li, w)} name="click" vol={0.14} />
        ))}
      </AbsoluteFill>
    );
  };
  return C;
};

const ExtraScene = (li: number, items: { code: string; w: string; label: string }[]): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => (
    <AbsoluteFill>
      {items.map((it, i) => {
        const x = CX + (items.length === 1 ? 0 : 280 - i * (560 / (items.length - 1)));
        return (
          <React.Fragment key={i}>
            <Sticker code={it.code} x={x} y={CY - 40} size={240} delay={word(from, li, it.w)} seed={li + i} rot={i % 2 ? 8 : -8} />
            <Label text={it.label} x={x} y={CY + 200} delay={word(from, li, it.w) + 6} size={46} tx={i % 2 ? "kraft" : "white"} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
  return C;
};

const S_FlashFlip: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 26, "سؤال");
  const flip = ramp(frame, word(from, 26, "والجواب"), word(from, 26, "والجواب") + 14, Easing.inOut(Easing.cubic));
  const back = flip > 0.5;
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY} delay={t0 - 4} seed={60}>
        <div style={{ perspective: 1400 }}>
          <div style={{ transform: `rotateY(${flip * 180}deg)` }}>
            <div style={{ transform: back ? "rotateY(180deg)" : "none" }}>
              <Sheet w={760} h={440} seed={back ? 61 : 60} tint={back ? "#E9F7EE" : undefined}>
                <div style={{ position: "absolute", left: 30, right: 30, top: 80, height: 4, background: "rgba(215,50,47,0.45)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Hand size={44} color="#555">
                    {back ? "الظهر" : "الوجه"}
                  </Hand>
                  <Hand size={96} color={back ? GREEN : PEN}>
                    {back ? "الجواب ✓" : "سؤال ؟"}
                  </Hand>
                </div>
              </Sheet>
            </div>
          </div>
        </div>
      </Unfold>
      <Sfx at={word(from, 26, "والجواب")} name="paper_flip" vol={0.3} />
      <Sticker code="1f4c7" x={CX - 470} y={CY + 200} size={170} delay={t0} seed={62} />
    </AbsoluteFill>
  );
};

const S_SpacedExample: React.FC<SceneProps> = ({ from }) => {
  const days: Bullet[] = [
    ["السبت: درس", "السبت"],
    ["الأحد", "الأحد"],
    ["الثلاثاء", "الثلاثاء"],
    ["السبت القادم", "القادم"],
  ];
  return (
    <AbsoluteFill>
      <Label text="مثال: درس الدوال" x={CX} y={CY - 260} delay={2} size={56} tx="kraft" />
      {days.map(([t, w], i) => (
        <Unfold key={i} x={CX + 450 - i * 300} y={CY + 30} delay={word(from, 47, w)} seed={63 + i} rot={i % 2 ? 3 : -3}>
          <Sheet w={260} h={260} tx={i === 0 ? "kraft" : "white"} seed={63 + i}>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Img src={icon(i === 0 ? "1f4d6" : "1f504")} style={{ width: 90, height: 90 }} />
              <Hand size={44}>{t}</Hand>
            </div>
            <Tape x={130} y={6} w={100} />
          </Sheet>
        </Unfold>
      ))}
    </AbsoluteFill>
  );
};

const S_MiniMap: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  const t0 = word(from, 59, "الإشكالية");
  const t1 = word(from, 59, "والمواقف");
  const br = ["الموقف 1", "الموقف 2", "النقد", "التركيب"];
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 20} delay={2} seed={67}>
        <Sheet w={1100} h={640} seed={67}>
          <svg width={1100} height={640} style={{ position: "absolute", inset: 0 }}>
            {br.map((_, i) => {
              const a = (-150 + i * 100) * (Math.PI / 180);
              const p = ramp(frame, t1 + i * 5, t1 + i * 5 + 12);
              return <line key={i} x1={550} y1={320} x2={550 + Math.cos(a) * 340 * p} y2={320 + Math.sin(a) * 220 * p} stroke={LEVEL_COLORS[i]} strokeWidth="10" strokeLinecap="round" />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 370, top: 270, width: 360, height: 100, borderRadius: 50, background: "#fff", border: `6px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: ramp(frame, t0, t0 + 8) }}>
            <Hand size={44}>الإشكالية</Hand>
          </div>
          {br.map((b, i) => {
            const a = (-150 + i * 100) * (Math.PI / 180);
            return (
              <div key={i} style={{ position: "absolute", left: 550 + Math.cos(a) * 340 - 100, top: 320 + Math.sin(a) * 220 - 34, width: 200, textAlign: "center", background: "#fff", border: `4px solid ${LEVEL_COLORS[i]}`, borderRadius: 14, opacity: ramp(frame, t1 + i * 5 + 10, t1 + i * 5 + 16) }}>
                <Hand size={38}>{b}</Hand>
              </div>
            );
          })}
        </Sheet>
      </Unfold>
      <Sticker code="1f914" x={CX + 520} y={CY - 260} size={150} delay={6} seed={68} />
    </AbsoluteFill>
  );
};

const PLAN_ROWS: { li: number; day: string; text: string; code: string; col: string }[] = [
  { li: 66, day: "يوم الدرس", text: "فاينمان + خريطة ذهنية", code: "1f9d1-200d-1f52c", col: RED },
  { li: 67, day: "اليوم التالي", text: "الاسترجاع الفعّال", code: "1f9e0", col: "#F28C28" },
  { li: 68, day: "خلال الأسبوع", text: "التكرار المتباعد", code: "1f4c5", col: "#F2B705" },
  { li: 69, day: "نهاية الأسبوع", text: "تمارين مخلوطة", code: "1f500", col: GREEN },
];
const S_Plan: React.FC<SceneProps> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Unfold x={CX} y={CY + 20} delay={2} seed={70}>
        <Sheet w={1160} h={700} seed={70}>
          <div style={{ position: "absolute", top: 24, right: 50 }}>
            <Hand size={60}>خطة الأسبوع 🗓️</Hand>
          </div>
          {PLAN_ROWS.map((r, i) => {
            const d = at(from, r.li, 0.05);
            return frame >= d ? (
              <div key={i} dir="rtl" style={{ position: "absolute", right: 50, left: 50, top: 140 + i * 125, height: 100, borderRadius: 18, background: r.col, display: "flex", alignItems: "center", gap: 24, padding: "0 30px", transform: `scaleX(${ramp(frame, d, d + 12, Easing.out(Easing.back(1.2)))})`, transformOrigin: "100% 50%" }}>
                <Hand size={42} color="#fff" style={{ width: 280 }}>
                  {r.day}
                </Hand>
                <Img src={icon(r.code)} style={{ width: 70, height: 70 }} />
                <div style={{ fontFamily: FONT, fontSize: 42, color: "#fff" }}>{r.text}</div>
              </div>
            ) : null;
          })}
        </Sheet>
      </Unfold>
      {PLAN_ROWS.map((r, i) => (
        <Sfx key={i} at={at(from, r.li, 0.05)} name="paper_slide" vol={0.18} />
      ))}
      <Stamp text="كل طريقة تقوي الأخرى 💪" x={CX} y={CY + 400} delay={at(from, 70, 0.2)} color={GREEN} rot={-3} size={50} />
    </AbsoluteFill>
  );
};

const FaqScene3 = (q: number, qText: string, aText: string, aCode: string): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = ({ from }) => (
    <AbsoluteFill>
      <Sticker code="2753" x={CX + 520} y={CY - 230} size={150} delay={2} seed={124 + q} />
      <Unfold x={CX + 80} y={CY - 150} delay={4} seed={125 + q} sound="paper_slide">
        <div dir="rtl" style={{ maxWidth: 900, background: "#fff", borderRadius: 30, padding: "24px 40px", border: `5px solid ${INK}`, boxShadow: "0 12px 16px rgba(0,0,0,0.25)" }}>
          <Hand size={52} style={{ whiteSpace: "normal" }}>
            {qText}
          </Hand>
        </div>
      </Unfold>
      <Unfold x={CX - 80} y={CY + 170} delay={at(from, q + 1, 0.05)} seed={126 + q}>
        <div dir="rtl" style={{ maxWidth: 900, background: "#E8F6EC", borderRadius: 30, padding: "24px 40px", border: `5px solid ${GREEN}`, boxShadow: "0 12px 16px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 20 }}>
          <Img src={icon(aCode)} style={{ width: 90, height: 90 }} />
          <Hand size={48} color="#1E6B3D">
            {aText}
          </Hand>
        </div>
      </Unfold>
    </AbsoluteFill>
  );
  return C;
};

const TIPS: { li: number; code: string; text: string }[] = [
  { li: 78, code: "1f634", text: "نم جيدًا" },
  { li: 79, code: "1f4f5", text: "أبعد الهاتف" },
  { li: 80, code: "1f345", text: "جلسات قصيرة" },
];
const S_Tips: React.FC<SceneProps> = ({ from }) => (
  <AbsoluteFill>
    <Label text="3 نصائح ذهبية" x={CX} y={CY - 280} delay={2} size={64} tx="kraft" />
    {TIPS.map((t, i) => (
      <Card key={i} x={CX + 380 - i * 380} y={CY + 60} delay={at(from, t.li, 0.05)} title={`${i + 1}. ${t.text}`} code={t.code} seed={80 + i} w={340} h={360} />
    ))}
    <Stamp text="فيديو البومودورو 🍅" x={CX - 380} y={CY + 330} delay={word(from, 81, "البومودورو")} color={RED} rot={-6} size={46} />
    <Stamp text="ستلاحظ الفرق ✓" x={CX + 300} y={CY + 330} delay={word(from, 82, "وستلاحظ")} color={GREEN} rot={4} size={46} />
  </AbsoluteFill>
);

const TitleScene = (n: number): React.FC<SceneProps> => {
  const C: React.FC<SceneProps> = () => <MethodTitle n={n} />;
  return C;
};


/* ======================= silent subscribe reminder (around 1:00) ======================= */
export const MiniPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({ frame: onTwos(frame), fps: FPS, config: { damping: 13, stiffness: 160 } });
  const exit = ramp(frame, 228, 240, Easing.in(Easing.cubic));
  const stage = frame < 90 ? 0 : frame < 150 ? 1 : 2;
  const stageStart = [0, 90, 150][stage];
  const local = frame - stageStart;
  const tap = 34;
  const tapped = local >= tap;
  const pop = spring({ frame: local, fps: FPS, config: { damping: 12, stiffness: 180 } });
  const press = spring({ frame: local - tap, fps: FPS, config: { damping: 9, stiffness: 320 } });
  const btnScale = tapped ? interpolate(press, [0, 0.4, 1], [1, 0.88, 1]) : 1;
  const handIn = spring({ frame: local - (tap - 10), fps: FPS, config: { damping: 16, stiffness: 180 } });
  return (
    <div style={{ position: "absolute", left: 40, top: 96, width: 560, transformOrigin: "0% 0%", transform: `scale(${enter * (1 - exit)}) rotate(${-1.5 + jitter(frame, 5, 0.4)}deg)` }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 26, padding: 14, boxShadow: "0 18px 26px rgba(40,25,10,0.35)", border: "6px solid #fff" }}>
        <div style={{ transform: `scale(${0.9 + pop * 0.1})`, opacity: Math.min(1, pop * 1.5) }}>
          {stage === 0 && (
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#0F0F0F" }}>
              <Img src={staticFile("promo/banner.png")} style={{ width: "100%", display: "block" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px" }}>
                <Img src={staticFile("promo/avatar.png")} style={{ width: 70, height: 70, borderRadius: 35, border: "3px solid #fff", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, fontFamily: "Roboto, Arial, sans-serif", color: "#fff" }}>
                  <div style={{ fontWeight: 800, fontSize: 24, whiteSpace: "nowrap" }}>Abdelwahab Mj</div>
                  <div style={{ fontSize: 18, color: "#AAA" }}>160K subscribers</div>
                </div>
                <div style={{ flexShrink: 0, height: 52, padding: "0 20px", borderRadius: 26, background: tapped ? "#272727" : "#FF0033", color: "#fff", display: "flex", alignItems: "center", gap: 8, fontFamily: "Roboto, Arial, sans-serif", fontWeight: 700, fontSize: 22, transform: `scale(${btnScale})` }}>
                  {tapped && <span style={{ display: "inline-block", transform: `rotate(${local > tap + 8 && local < tap + 30 ? Math.sin(local * 1.6) * 20 : 0}deg)` }}>🔔</span>}
                  {tapped ? "Subscribed" : "Subscribe"}
                </div>
              </div>
            </div>
          )}
          {stage === 1 && (
            <div style={{ height: 200, borderRadius: 16, background: "#F3E9D8", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 40, top: 30, width: 140, height: 140, borderRadius: 70, background: "#C99A63", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${btnScale})`, boxShadow: "0 8px 10px rgba(0,0,0,0.2)" }}>
                <svg width="110" height="110" viewBox="0 0 24 24">
                  <path d="M13.5 6.5 19.5 11.5 13.5 16.5V13.6C9.5 13.6 6.8 14.8 4.8 18 5.6 13.4 8.3 10 13.5 9.3Z" fill="white" stroke={INK} strokeWidth="0.7" strokeLinejoin="round" />
                </svg>
              </div>
              {["1f468-200d-1f393", "1f469-200d-1f393", "1f929"].map((c, i) => {
                const t = ramp(local, tap + 2 + i * 3, tap + 14 + i * 3);
                const tx = 230 + i * 100;
                const ty = 50 + (i % 2) * 60;
                return (
                  <React.Fragment key={c}>
                    {t > 0 && t < 1 && (
                      <svg width="44" height="44" viewBox="0 0 24 24" style={{ position: "absolute", left: 110 + (tx - 110) * t - 22, top: 100 + (ty - 100) * t - 22 - Math.sin(t * Math.PI) * 40 }}>
                        <path d="M2 11.5 22 3 15.5 21 11.5 13.2Z" fill="white" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
                      </svg>
                    )}
                    {t >= 1 && <Img src={icon(c)} style={{ position: "absolute", left: tx - 40, top: ty - 10, width: 80, height: 80 }} />}
                  </React.Fragment>
                );
              })}
              <div style={{ position: "absolute", left: 200, bottom: 10, right: 10, textAlign: "center" }}>
                <Hand size={30}>شارك مع صحابك</Hand>
              </div>
            </div>
          )}
          {stage === 2 && (
            <div style={{ borderRadius: 16, overflow: "hidden", background: "#0F1116", padding: 10 }}>
              <Img src={staticFile("promo/profile_shot.png")} style={{ width: "100%", display: "block", borderRadius: 10 }} />
              <div style={{ marginTop: 8, height: 50, borderRadius: 12, background: tapped ? "#363636" : "#0095F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Roboto, Arial, sans-serif", fontWeight: 700, fontSize: 24, transform: `scale(${btnScale})` }}>
                {tapped ? "Following ✓" : "Follow"}
              </div>
            </div>
          )}
        </div>
        <Tape x={70} y={-6} w={110} rot={-20} />
        <Tape x={490} y={-6} w={110} rot={18} />
        {/* tapping hand */}
        {local > tap - 12 && local < tap + 16 && (
          <Img
            src={icon("1f446")}
            style={{
              position: "absolute",
              left: interpolate(handIn, [0, 1], [620, stage === 0 ? 430 : stage === 1 ? 100 : 260]),
              top: interpolate(handIn, [0, 1], [380, stage === 0 ? 175 : stage === 1 ? 90 : 185]),
              width: 90,
              height: 90,
              transform: `rotate(-20deg) scale(${interpolate(local - tap, [-3, 0, 3], [1, 0.82, 1], clamp)})`,
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.4))",
            }}
          />
        )}
      </div>
      {[0, 90, 150].map((s0, i) => (
        <React.Fragment key={i}>
          <Sfx at={s0} name="paper_fold" vol={0.18} />
          <Sfx at={s0 + tap} name="click" vol={0.3} />
        </React.Fragment>
      ))}
      <Sfx at={tap + 8} name="ring" vol={0.1} />
      <Sfx at={150 + tap + 2} name="sparkle" vol={0.16} />
    </div>
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
  m1: "board",
  m2: "notebook",
  m3: "books",
  m4: "window",
  m5: "shelf",
  plan: "board",
  faq: "monitor",
  tips: "notebook",
  recap: "desk",
  cta: "wide",
};

const SECTION_NAMES: Record<string, string> = {
  hook: "5 طرق للدراسة",
  m1: "1 · تقنية فاينمان",
  m2: "2 · الاسترجاع الفعّال",
  m3: "3 · الخلط بين التمارين",
  m4: "4 · التكرار المتباعد",
  m5: "5 · الخريطة الذهنية",
  plan: "خطة أسبوعية",
  faq: "أسئلة شائعة",
  tips: "نصائح ذهبية",
  recap: "الخلاصة",
  cta: "دورك الآن",
};

// boundaries between sections (midpoint of the pause)
type Boundary = { t: number; section: string; prev: string };
const BOUNDS: Boundary[] = [];
for (let i = 1; i < LINES.length; i++) {
  if (LINES[i].section !== LINES[i - 1].section) BOUNDS.push({ t: (LINES[i - 1].end + LINES[i].start) / 2, section: LINES[i].section, prev: LINES[i - 1].section });
}
const MJ_SECTIONS = new Set(["m1", "m2", "m3", "m4", "m5", "plan"]);
const END_AT = LINES[LINES.length - 1].end + 0.5;
// silent subscribe reminder: at the first sentence start after one minute
const PROMO_AT = (LINES.find((l) => l.start >= 60) ?? LINES[0]).start - 0.2;

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

/* simple style: a softly blurred sheet of paper instead of the study room.
   The kraft version is animated: drifting light, slow parallax, floating paper flecks. */
const PaperBackdrop: React.FC<{ kind: "white" | "kraft" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const kraft = kind === "kraft";
  const lx = 50 + Math.sin(frame / 140) * 22;
  const ly = 40 + Math.cos(frame / 170) * 14;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: kraft ? "#B98B5A" : "#F4EFE6" }}>
      <AbsoluteFill style={{ transform: `scale(${1.1 + Math.sin(frame / 90) * 0.012}) translate(${Math.sin(frame / 200) * 12}px, ${Math.cos(frame / 230) * 8}px)`, filter: kraft ? "blur(4px) saturate(1.1)" : "blur(5px)" }}>
        <Img src={tex(kind)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {kraft && (
        <>
          {/* warm drifting light */}
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${lx}% ${ly}%, rgba(255,226,170,0.55) 0%, rgba(255,210,150,0.18) 35%, rgba(0,0,0,0) 65%)`, mixBlendMode: "soft-light" }} />
          {/* soft folds / creases */}
          {[0.22, 0.58, 0.81].map((x, i) => (
            <div key={i} style={{ position: "absolute", top: -100, bottom: -100, left: `${x * 100}%`, width: 120, background: "linear-gradient(90deg, rgba(0,0,0,0), rgba(70,40,15,0.10), rgba(255,240,210,0.10), rgba(0,0,0,0))", transform: `rotate(${4 - i * 3}deg) translateX(${Math.sin(frame / (160 + i * 40)) * 10}px)`, filter: "blur(6px)" }} />
          ))}
          {/* floating paper flecks */}
          {Array.from({ length: 22 }, (_, i) => {
            const sp = 0.25 + ((i * 37) % 10) / 20;
            const x = ((i * 173) % 1920 + frame * sp * (i % 2 ? 1 : -1) * 0.6 + 4000) % 1980 - 30;
            const y = ((i * 97) % 1080) + Math.sin(frame / (40 + i * 3) + i) * 18;
            const s = 6 + (i % 5) * 4;
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 0.7, borderRadius: 2, background: i % 3 ? "rgba(255,240,215,0.55)" : "rgba(90,55,25,0.35)", transform: `rotate(${frame * (i % 2 ? 0.6 : -0.4) + i * 30}deg)`, filter: "blur(0.6px)" }} />;
          })}
        </>
      )}
      <AbsoluteFill style={{ background: kraft ? "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(50,25,8,0.38) 100%)" : "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 55%, rgba(60,40,20,0.22) 100%)" }} />
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = cameraAt(t);
  // the setup's own timer runs during the steps and the cta
  const stepsStart = BOUNDS.find((b) => b.section === "m1")?.t ?? 0;
  const screenMinutes = t < stepsStart ? 25 : Math.max(0, 25 - (t - stepsStart) / 12);
  const s17 = -100;
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
              <Hand size={150} color={TOMATO} style={{ lineHeight: 1.05 }}>
                5 طرق
              </Hand>
              <Hand size={70}>للدراسة</Hand>
              <div dir="rtl" style={{ fontFamily: FONT, fontSize: 38, color: INK, backgroundImage: `linear-gradient(transparent 40%, ${MARKER} 40%, ${MARKER} 92%, transparent 92%)`, padding: "0 10px" }}>
                من الأصعب إلى الأسهل
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
          اشترك لمزيد من طرق الدراسة 📚
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, color: GOLD, opacity: p }}>@abdelwahab__mj</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "rgba(0,0,0,0.15)" }}>
      <div style={{ height: "100%", width: `${(frame / YT3_FRAMES) * 100}%`, background: TOMATO }} />
      {BOUNDS.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 0, width: 4, left: `${(b.t / YT3_DURATION) * 100}%`, background: INK, opacity: 0.35 }} />
      ))}
    </div>
  );
};

const Watermark: React.FC = () => (
  <div style={{ position: "absolute", left: 44, top: 30, fontFamily: FONT, fontSize: 54, letterSpacing: -2, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}>MJ</div>
);

/* ======================= timeline ======================= */
type SceneDef = { first: number; C: React.FC<SceneProps> };
const SCENES: SceneDef[] = [
  { first: 0, C: S_Balance },
  { first: 1, C: S_Wrong },
  { first: 2, C: S_Stairs },
  { first: 4, C: S_Choose },
  { first: 5, C: S_PlanTeaser },
  { first: 6, C: TitleScene(1) },
  { first: 7, C: S_Quote },
  { first: 8, C: S_FWrite },
  { first: 9, C: S_FChild },
  { first: 10, C: S_FGap },
  { first: 12, C: S_FWhy },
  { first: 13, C: ExampleScene(13, "درس الوراثة", "1f9ec", [["اشرحه لأخيك الصغير", "حاول"], ["كيف تنتقل الصفات؟", "كيف"]], { li: 14, text: "لم أفهم؟ ← بسّط أكثر", code: "1f9d2" }) },
  { first: 15, C: ExtraScene(15, [{ code: "1fa9e", w: "المرآة", label: "اشرح أمام المرآة" }, { code: "1f399", w: "سجل", label: "سجّل صوتك" }]) },
  { first: 16, C: MistakeScene(16, "حفظ كلمات الكتاب", 17, "أمثلة من حياتك + رسومات", "1f99c") },
  { first: 18, C: WhenScene(18, [["الدروس النظرية", "النظرية"], ["العلوم", "العلوم"], ["الفلسفة", "والفلسفة"], ["الفيزياء", "والفيزياء"]]) },
  { first: 19, C: TitleScene(2) },
  { first: 20, C: S_Close },
  { first: 21, C: S_WriteFix },
  { first: 22, C: S_QCards },
  { first: 23, C: S_Effort },
  { first: 24, C: ExampleScene(24, "درس التاريخ", "1f4dc", [["أغلق الكتاب", "أغلق"], ["اكتب التواريخ والأحداث", "واكتب"]], { li: 25, text: "نسيت أشياء؟ هذا طبيعي 🙂", code: "1f60c" }) },
  { first: 26, C: S_FlashFlip },
  { first: 27, C: MistakeScene(27, "تنظر إلى الجواب بسرعة", 28, "حاول دقيقتين على الأقل", "1f440") },
  { first: 29, C: WhenScene(29, [["بعد كل درس", "بعد"], ["في كل مراجعة", "وفي"]]) },
  { first: 30, C: TitleScene(3) },
  { first: 31, C: S_Blocked },
  { first: 33, C: S_Mix },
  { first: 35, C: S_Result },
  { first: 36, C: ExampleScene(36, "الفيزياء", "26a1", [["الميكانيك ⚙️", "الميكانيك"], ["الكهرباء ⚡", "الكهرباء"], ["الموجات 🌊", "الموجات"]], { li: 37, text: "ما نوع هذا التمرين؟ 🤔", code: "1f914" }) },
  { first: 38, C: ExtraScene(38, [{ code: "1f4d0", w: "الرياضيات", label: "لا مفاجآت في الامتحان" }]) },
  { first: 39, C: MistakeScene(39, "خلط دروس لم تفهمها", 40, "افهم كل درس وحده أولًا", "1f635") },
  { first: 41, C: WhenScene(41, [["تحضير الامتحانات", "تحضر"], ["المراجعة العامة", "المراجعة"]]) },
  { first: 42, C: TitleScene(4) },
  { first: 43, C: S_Curve },
  { first: 44, C: S_Dates },
  { first: 45, C: S_Table },
  { first: 47, C: S_SpacedExample },
  { first: 48, C: ExtraScene(48, [{ code: "1f9e0", w: "اختبر", label: "اختبر نفسك" }, { code: "1f4f1", w: "تطبيقًا", label: "تطبيق يذكّرك 🔔" }]) },
  { first: 50, C: MistakeScene(50, "كل شيء في الليلة الأخيرة", 51, "مراجعة موزعة على أيام", "1f319") },
  { first: 52, C: WhenScene(52, [["طوال السنة", "طوال"], ["كل المواد", "كل"]]) },
  { first: 53, C: TitleScene(5) },
  { first: 54, C: S_MindMap },
  { first: 59, C: S_MiniMap },
  { first: 60, C: ExtraScene(60, [{ code: "1f4cc", w: "تعلق", label: "علّقها على الحائط" }]) },
  { first: 61, C: ExtraScene(61, [{ code: "270d", w: "رسمتها", label: "ارسمها بيدك" }]) },
  { first: 62, C: MistakeScene(62, "جمل طويلة", 63, "كلمات مفتاحية + ألوان", "1f4dc") },
  { first: 64, C: WhenScene(64, [["الملخصات", "الملخصات"], ["قبل الامتحان بأيام", "وقبل"]]) },
  { first: 65, C: S_Plan },
  { first: 71, C: FaqScene3(71, "هل أستعمل الطرق الخمس كلها؟", "ابدأ بطريقة أو اثنتين، ثم أضف", "1f44c") },
  { first: 73, C: FaqScene3(73, "كم من الوقت تحتاج؟", "أطول قليلًا في البداية، وأقل في المراجعة", "23f3") },
  { first: 75, C: FaqScene3(75, "هل تصلح للمواد الأدبية؟", "نعم: فاينمان والخرائط للفلسفة والتاريخ", "1f4da") },
  { first: 77, C: S_Tips },
  { first: 83, C: S_RecapStairs },
  { first: 87, C: S_Comment },
  { first: 88, C: S_Subscribe },
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

export const YT3: React.FC = () => {
  const introEnd = sec(LINES[0].start - 0.3);
  return (
    <AbsoluteFill style={{ background: "#EED9B6" }}>
      {getInputProps().bg === "white" || getInputProps().bg === "kraft" ? <PaperBackdrop kind={getInputProps().bg as "white" | "kraft"} /> : <World />}
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
      <Sequence from={sec(PROMO_AT)} durationInFrames={240} layout="none">
        <MiniPromo />
      </Sequence>
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
      {getInputProps().voice !== false && <Audio src={staticFile("yt3/narration.wav")} />}
      {getInputProps().music !== false && (
      <Audio
        src={staticFile("yt3/music.wav")}
        volume={(f) =>
          interpolate(f, [0, sec(LINES[0].start), sec(LINES[0].start) + 15, sec(END_AT) - 10, sec(END_AT), YT3_FRAMES - 20, YT3_FRAMES], [0.3, 0.3, 0.08, 0.08, 0.3, 0.3, 0], clamp)
        }
      />
      )}
      <Progress />
    </AbsoluteFill>
  );
};

export const YT3Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#EED9B6", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: WORLD_W, height: WORLD_H, transformOrigin: "0 0", transform: `translate(${640 - 2700 * 0.62}px, ${360 - 1250 * 0.62}px) scale(0.62)`, filter: "blur(3px)" }}>
      <Room screenMinutes={25} />
    </div>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(20,15,10,0.0) 30%, rgba(20,15,10,0.55) 100%)" }} />
    <Img src={staticFile("yt2/host/p11.png")} style={{ position: "absolute", left: -20, bottom: 0, width: 520, filter: "drop-shadow(8px 0 0 #fff) drop-shadow(-8px 0 0 #fff) drop-shadow(0 -8px 0 #fff) drop-shadow(0 12px 16px rgba(0,0,0,0.5))" }} />
    <Img src={icon("1f9e0")} style={{ position: "absolute", left: 430, top: 360, width: 230, height: 230, transform: "rotate(-8deg)", filter: "drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(0 10px 12px rgba(0,0,0,0.4))" }} />
    <div dir="rtl" style={{ position: "absolute", right: 40, top: 60, width: 640, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 92, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000" }}>5 طرق</div>
      <div style={{ fontFamily: FONT, fontSize: 112, lineHeight: 1.1, color: TOMATO, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000" }}>للدراسة</div>
      <div style={{ display: "inline-block", marginTop: 20, fontFamily: FONT, fontSize: 58, whiteSpace: "nowrap", color: INK, background: GOLD, padding: "0 30px 10px", borderRadius: 18, transform: "rotate(-3deg)", border: "5px solid #000" }}>من الأصعب للأسهل</div>
    </div>
    <div style={{ position: "absolute", left: 30, top: 20, fontFamily: FONT, fontSize: 70, letterSpacing: -3, background: MJ_GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.6))" }}>MJ</div>
  </AbsoluteFill>
);
