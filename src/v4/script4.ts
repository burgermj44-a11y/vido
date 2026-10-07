// Video 4: series "الطريقة الصحيحة للدراسة" – episode 1 (Algerian Darija).
// The 0.38 s pause at 19.6 s was shortened; times are on the cut timeline.
import type { Broll, Caption, Sfx } from "../script";

export const FPS4 = 30;
export const DURATION4 = 1138 / 30; // 37.93 s

export const SERIES = { title: "الطريقة الصحيحة للدراسة", subtitle: "سلسلة مع عبد الوهاب", episode: 1 };
// the series intro plays when he says "...قدرت نصنعلكم سلسلة"
export const STING_AT4 = 10.9;

export const CAPTIONS4: Caption[] = [
  { start: 0.0, end: 1.5, text: "أي طريقة تقرا بيها غالطة", hl: ["غالطة"] },
  { start: 1.5, end: 2.98, text: "ما كش راح تنجح", hl: ["تنجح"] },
  { start: 3.15, end: 4.9, text: "وإذا فهمت علاش" },
  { start: 4.9, end: 6.65, text: "لازم تبارطاجي هاد الفيديو", hl: ["تبارطاجي"] },
  { start: 6.94, end: 9.07, text: "وتدّي معاهم الأجر", hl: ["الأجر"] },
  { start: 9.17, end: 10.5, text: "أنا عبد الوهاب", hl: ["عبد", "الوهاب"] },
  { start: 10.5, end: 11.9, text: "قدرت نصنعلكم سلسلة", hl: ["سلسلة"] },
  { start: 11.9, end: 14.15, text: "واللي هي الطريقة الصحيحة للدراسة", hl: ["الصحيحة"] },
  { start: 14.49, end: 16.0, text: "وفي هاذ السلسلة" },
  { start: 16.0, end: 17.61, text: "راح نعطيكم قاع الأخطاء", hl: ["الأخطاء"] },
  { start: 17.72, end: 18.6, text: "باش تصححوهم", hl: ["تصححوهم"] },
  { start: 18.6, end: 19.59, text: "باش تضمنو المعدل", hl: ["المعدل"] },
  { start: 19.74, end: 21.07, text: "واليوم الحلقة الأولى", hl: ["الأولى"] },
  { start: 21.07, end: 22.37, text: "والحلقة الأولى تقول" },
  { start: 22.37, end: 23.27, text: "الدرس اللي" },
  { start: 23.27, end: 24.37, text: "ما تفهموش في القسم", hl: ["القسم"] },
  { start: 24.37, end: 26.08, text: "وراك باغي تفهمو برا" },
  { start: 26.22, end: 27.62, text: "الدرس تفهمو مع الأستاذ", hl: ["الأستاذ"] },
  { start: 27.8, end: 28.67, text: "وإذا ما فهمتش" },
  { start: 28.67, end: 29.45, text: "قول للأستاذ يعاود", hl: ["يعاود"] },
  { start: 29.7, end: 30.77, text: "وما تحشمش", hl: ["تحشمش"] },
  { start: 30.77, end: 31.67, text: "بصح شارك مع الأستاذ", hl: ["شارك"] },
  { start: 31.67, end: 32.77, text: "هاذي نقطة مهمة", hl: ["مهمة"] },
  { start: 32.77, end: 34.47, text: "تخليك تفهم مليح" },
  { start: 34.64, end: 36.07, text: "وهاذي كانت الحلقة الأولى" },
  { start: 36.07, end: 37.93, text: "ملا أبوني وقارع الحلقات", hl: ["أبوني"] },
];

export type SceneKind4 =
  | "wrong"
  | "fail"
  | "why"
  | "share"
  | "reward"
  | "name"
  | "right"
  | "mistakes"
  | "fix"
  | "episode"
  | "class"
  | "teacher"
  | "ask"
  | "brave"
  | "important"
  | "done"
  | "follow";

export type Scene4 = { start: number; end: number; kind: SceneKind4; zoom: number; gfxStart?: number };

export const SCENES4: Scene4[] = [
  { start: 0.0, end: 2.0, kind: "wrong", zoom: 1.0 },
  { start: 2.0, end: 3.1, kind: "fail", zoom: 1.24 },
  { start: 3.1, end: 4.9, kind: "why", zoom: 1.1 },
  { start: 4.9, end: 6.9, kind: "share", zoom: 1.0 },
  { start: 6.9, end: 9.12, kind: "reward", zoom: 1.14 },
  { start: 9.12, end: 10.9, kind: "name", zoom: 1.0 },
  { start: 10.9, end: 14.45, kind: "right", zoom: 1.14, gfxStart: 13.1 },
  { start: 14.45, end: 17.66, kind: "mistakes", zoom: 1.0 },
  { start: 17.66, end: 19.66, kind: "fix", zoom: 1.14 },
  { start: 19.66, end: 22.37, kind: "episode", zoom: 1.0 },
  { start: 22.37, end: 26.15, kind: "class", zoom: 1.12, gfxStart: 24.3 },
  { start: 26.15, end: 27.7, kind: "teacher", zoom: 1.0 },
  { start: 27.7, end: 29.6, kind: "ask", zoom: 1.12, gfxStart: 29.45 },
  { start: 29.6, end: 31.67, kind: "brave", zoom: 1.22 },
  { start: 31.67, end: 34.55, kind: "important", zoom: 1.0 },
  { start: 34.55, end: 36.05, kind: "done", zoom: 1.12 },
  { start: 36.05, end: 37.94, kind: "follow", zoom: 1.0 },
];

export const BROLLS4: Broll[] = [
  { start: 22.37, end: 24.3, img: "teacher", tag: "🏫 الدرس في القسم" },
  { start: 27.7, end: 29.45, img: "question-answered", tag: "🙋 قول للأستاذ يعاود" },
];

const f = (frames: number) => frames / FPS4;
const zoomCuts = SCENES4.slice(1).filter(
  (s) => !BROLLS4.some((b) => Math.abs(b.start - s.start) < 0.2) && Math.abs(s.start - STING_AT4) > 0.2,
);

export const SFX4: Sfx[] = [
  // opening riser (impact lands at 2.0 s on the "you won't succeed" punch-in)
  { at: 0, file: "v4/riser", volume: 0.55 },
  ...zoomCuts.map((s, i) => ({
    at: Math.max(0.05, s.start - 0.05),
    file: s.zoom > (SCENES4[SCENES4.indexOf(s) - 1]?.zoom ?? 1) ? "whoosh_in" : "whoosh_out",
    volume: i % 2 ? 0.4 : 0.45,
  })),
  ...BROLLS4.flatMap((b) => [
    { at: b.start, file: "swipe", volume: 0.5 },
    { at: b.start + f(5), file: "pop2", volume: 0.35 },
    { at: b.end - 0.25, file: "whoosh_out", volume: 0.35 },
  ]),
  // wrong / fail
  { at: f(4), file: "pop", volume: 0.4 },
  { at: f(10), file: "pop2", volume: 0.35 },
  { at: 2.0 + f(2), file: "boom", volume: 0.45 },
  // why
  { at: 3.1 + f(3), file: "pop", volume: 0.4 },
  { at: 3.1 + f(14), file: "sparkle", volume: 0.3 },
  // share
  { at: 4.9 + f(2), file: "pop", volume: 0.45 },
  { at: 4.9 + f(5), file: "pop2", volume: 0.35 },
  { at: 4.9 + f(12), file: "click", volume: 0.5 },
  ...[0, 1, 2, 3].flatMap((i) => [
    { at: 4.9 + f(14 + i * 3), file: "swipe", volume: 0.18 },
    { at: 4.9 + f(26 + i * 3), file: "pop", volume: 0.25 },
  ]),
  // reward
  { at: 6.9 + f(3), file: "sparkle", volume: 0.35 },
  { at: 6.9 + f(6), file: "pop2", volume: 0.35 },
  // name card
  { at: 9.12 + f(3), file: "swipe", volume: 0.35 },
  { at: 9.12 + f(8), file: "pop2", volume: 0.35 },
  // series intro: big whoosh, impact, sparkle, exit flash
  { at: STING_AT4 - 0.15, file: "whoosh_in", volume: 0.55 },
  { at: STING_AT4 + f(5), file: "boom", volume: 0.5 },
  { at: STING_AT4 + f(12), file: "sparkle", volume: 0.45 },
  { at: STING_AT4 + f(22), file: "pop2", volume: 0.35 },
  { at: STING_AT4 + 2.2 - f(6), file: "whoosh_out", volume: 0.5 },
  // right way
  { at: 13.1 + f(3), file: "pop2", volume: 0.35 },
  // mistakes: three X stamps
  ...[0, 1, 2].map((i) => ({ at: 14.45 + f(6 + i * 7), file: "pop", volume: 0.35 })),
  { at: 14.45 + f(4), file: "pop2", volume: 0.35 },
  // fix
  { at: 17.66 + f(3), file: "ding", volume: 0.3 },
  { at: 17.66 + f(6), file: "pop2", volume: 0.35 },
  // episode card
  { at: 19.66 + f(2), file: "swipe", volume: 0.4 },
  { at: 19.66 + f(8), file: "sparkle", volume: 0.35 },
  // class / teacher / ask / brave / important / done
  { at: 24.3 + f(3), file: "pop", volume: 0.4 },
  { at: 24.3 + f(6), file: "pop2", volume: 0.35 },
  { at: 26.15 + f(3), file: "pop", volume: 0.4 },
  { at: 26.15 + f(6), file: "pop2", volume: 0.35 },
  { at: 29.6 + f(3), file: "pop", volume: 0.4 },
  { at: 29.6 + f(6), file: "pop2", volume: 0.35 },
  { at: 31.67 + f(3), file: "sparkle", volume: 0.35 },
  { at: 31.67 + f(6), file: "pop2", volume: 0.35 },
  { at: 34.55 + f(3), file: "ding", volume: 0.3 },
  { at: 34.55 + f(6), file: "pop2", volume: 0.35 },
  // follow card
  { at: 36.05 + f(2), file: "pop", volume: 0.4 },
  { at: 36.05 + f(8), file: "swipe", volume: 0.25 },
  { at: 36.05 + f(24), file: "click", volume: 0.6 },
  { at: 36.05 + f(25), file: "ding", volume: 0.3 },
  // a soft tick for each new caption line (not under the series intro)
  ...CAPTIONS4.slice(1)
    .filter((c) => c.start < STING_AT4 || c.start > STING_AT4 + 2.2)
    .map((c) => ({ at: c.start, file: "tick", volume: 0.1 })),
];
