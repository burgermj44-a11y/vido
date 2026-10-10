// Video 7: "how to build your own study program" – paper style.
// The real room stays as the background; three full-screen paper cut-aways
// (3-4 s each, speaker hidden) at the key moments.
import type { Caption, Sfx } from "../script";

export const FPS7 = 30;
export const DURATION7 = 1084 / 30; // 36.13 s

export const CAPTIONS7: Caption[] = [
  { start: 0.0, end: 1.5, text: "شفت هاد البروغرام", hl: ["البروغرام"] },
  { start: 1.5, end: 3.1, text: "اللي عطيناهولك؟" },
  { start: 3.36, end: 4.7, text: "راح تدي 16", hl: ["16"] },
  { start: 4.7, end: 6.4, text: "ما تنساش تبارطاجي الفيديو", hl: ["تبارطاجي"] },
  { start: 6.54, end: 7.8, text: "لصحابك", hl: ["لصحابك"] },
  { start: 7.8, end: 9.5, text: "وفي هاد الفيديو" },
  { start: 9.5, end: 11.05, text: "ما جيتش نعطيك بروغرام", hl: ["بروغرام"] },
  { start: 11.34, end: 12.6, text: "جيت نعلمك كيفاش تصنع" },
  { start: 12.6, end: 13.8, text: "بروغرام يليق بيك انتايا", hl: ["بيك"] },
  { start: 13.8, end: 15.6, text: "أول حاجة لازم تديرها", hl: ["أول"] },
  { start: 15.76, end: 17.3, text: "دير بروغرام على حساب المواد", hl: ["المواد"] },
  { start: 17.3, end: 18.83, text: "اللي عندك" },
  { start: 18.95, end: 20.26, text: "تمارين وتعلّمات", hl: ["تمارين"] },
  { start: 20.39, end: 21.6, text: "وثاني حاجة", hl: ["ثاني"] },
  { start: 21.6, end: 23.2, text: "المواد الصعيبة", hl: ["الصعيبة"] },
  { start: 23.2, end: 24.6, text: "ديرها في بداية النهار", hl: ["بداية"] },
  { start: 24.6, end: 26.25, text: "مثلا الماط والفيزيك والعلوم", hl: ["الماط"] },
  { start: 26.44, end: 27.59, text: "وثالث حاجة", hl: ["ثالث"] },
  { start: 27.72, end: 29.5, text: "كون واقعي في البروغرام", hl: ["واقعي"] },
  { start: 29.5, end: 31.3, text: "ماشي تحط مجهود", hl: ["مجهود"] },
  { start: 31.3, end: 33.2, text: "يعجّزك سوايع في النهار", hl: ["سوايع"] },
  { start: 33.32, end: 36.1, text: "بصح كي تقرا يومين ولا ثلاث أيام", hl: ["يومين"] },
];

export type SceneKind7 = "program" | "sixteen" | "share" | "noready" | "point1" | "exercises" | "subjects" | "point3" | "hours";
export type Scene7 = { start: number; end: number; kind: SceneKind7; zoom: number };

// speaker scenes (the cut-aways cover 11.2-15.0, 20.3-24.0 and 33.2-end)
export const SCENES7: Scene7[] = [
  { start: 0.0, end: 3.25, kind: "program", zoom: 1.0 },
  { start: 3.25, end: 6.45, kind: "sixteen", zoom: 1.2 },
  { start: 6.45, end: 9.5, kind: "share", zoom: 1.0 },
  { start: 9.5, end: 11.2, kind: "noready", zoom: 1.14 },
  { start: 11.2, end: 15.0, kind: "noready", zoom: 1.0 },
  { start: 15.0, end: 18.9, kind: "point1", zoom: 1.0 },
  { start: 18.9, end: 20.3, kind: "exercises", zoom: 1.14 },
  { start: 20.3, end: 24.0, kind: "exercises", zoom: 1.0 },
  { start: 24.0, end: 26.4, kind: "subjects", zoom: 1.14 },
  { start: 26.4, end: 29.5, kind: "point3", zoom: 1.0 },
  { start: 29.5, end: 33.2, kind: "hours", zoom: 1.2 },
  { start: 33.2, end: DURATION7, kind: "hours", zoom: 1.0 },
];

export type CutKind = "planner" | "morning" | "quit";
export const CUTAWAYS: { kind: CutKind; start: number; end: number }[] = [
  { kind: "planner", start: 11.2, end: 15.0 }, // "كيفاش تصنع بروغرام يليق بيك"
  { kind: "morning", start: 20.3, end: 24.0 }, // "المواد الصعيبة في بداية النهار"
  { kind: "quit", start: 33.2, end: DURATION7 }, // "كي تقرا يومين ولا ثلاث أيام"
];

// MJ wipe into each cut-away; a page tear on the way out
export const WIPES7 = CUTAWAYS.map((c) => c.start);
export const WIPE_FRAMES = 24;
export const TEARS7 = CUTAWAYS.filter((c) => c.end < DURATION7 - 0.2).map((c) => c.end);

const f = (frames: number) => frames / FPS7;
const visibleScenes = SCENES7.filter((s) => !CUTAWAYS.some((c) => s.start >= c.start - 0.01 && s.start < c.end));

export const SFX7: Sfx[] = [
  { at: 0, file: "v7/riser", volume: 0.45 },
  ...WIPES7.flatMap((t) => [
    { at: t - f(12), file: "v6/mj_whoosh", volume: 0.9 },
    { at: t - f(10), file: "v6/paper_flip", volume: 0.55 },
    { at: t - f(2), file: "v6/mj_hit", volume: 0.75 },
  ]),
  ...TEARS7.flatMap((t) => [
    { at: t - f(8), file: "v6/paper_tear", volume: 0.8 },
    { at: t - f(2), file: "v6/paper_slide", volume: 0.5 },
  ]),
  // speaker scenes: zoom whoosh + stickers unfold + labels taped
  ...visibleScenes.slice(1).map((s, i) => ({ at: s.start - 0.04, file: i % 2 ? "whoosh_out" : "whoosh_in", volume: 0.35 })),
  ...visibleScenes.flatMap((s) => [
    { at: s.start + f(3), file: "v6/paper_fold", volume: 0.7 },
    { at: s.start + f(7), file: "v6/paper_rustle", volume: 0.6 },
    { at: s.start + f(12), file: "v6/paper_fold", volume: 0.5 },
  ]),
  // cut-aways: layers pop up one by one
  ...CUTAWAYS.flatMap((c) => [0, 1, 2, 3, 4, 5].map((i) => ({ at: c.start + f(6 + i * 5), file: "v6/paper_fold", volume: 0.5 }))),
  // 16 counter + impact
  ...Array.from({ length: 8 }, (_, k) => ({ at: 3.25 + f(2 + k * 2), file: "blip", volume: 0.12 })),
  { at: 3.25 + f(20), file: "boom", volume: 0.4 },
  { at: 3.25 + f(21), file: "sparkle", volume: 0.3 },
  // share: planes fly out
  { at: 6.45 + f(12), file: "click", volume: 0.5 },
  ...[0, 1, 2, 3].map((i) => ({ at: 6.45 + f(16 + i * 3), file: "v6/paper_slide", volume: 0.45 })),
  // "not a ready-made program": red cross
  { at: 9.5 + f(14), file: "v6/paper_crumple", volume: 0.5 },
  // numbered points
  { at: 15.0 + f(1), file: "boom", volume: 0.35 },
  { at: 26.4 + f(1), file: "boom", volume: 0.35 },
  // hours: 10 h crossed, 2 h ticked
  { at: 29.5 + f(18), file: "v6/paper_crumple", volume: 0.5 },
  { at: 29.5 + f(40), file: "ding", volume: 0.3 },
  // soft rustle on each caption strip
  ...CAPTIONS7.slice(1).map((c) => ({ at: c.start, file: "v6/paper_rustle", volume: 0.22 })),
];
