// Video 6: paper-style version of video 5 (same clip, same transcript).
// The real room stays as the background. Only at key moments the room is
// replaced by a pop-up paper diorama (school, home, stage).
import type { Sfx } from "../script";
import { CAPTIONS5, FPS5, SCENES5, Scene5 } from "../v5/script5";

export const FPS6 = FPS5;
export const DURATION6 = 957 / 30;

// no illustration cutaways here: the dioramas replace them
export const SCENES6: Scene5[] = SCENES5.map((s) => (s.kind === "point1" ? { ...s, gfxStart: undefined } : s));

export type DioramaKind = "school" | "home" | "stage";
export const DIORAMAS: { kind: DioramaKind; start: number; end: number }[] = [
  { kind: "school", start: 12.6, end: 16.15 }, // "القراية تبدا من المسيد"
  { kind: "home", start: 18.4, end: 20.7 }, // "إلا إذا دعمتها في الدار"
  { kind: "stage", start: 29.5, end: DURATION6 }, // "17 معدل تشوفها قدام عينك"
];

// full-screen paper sheets sweep across at the big section changes
export const WIPES6 = [8.1, 12.6, 16.15, 20.7, 29.5];
export const WIPE_FRAMES = 24; // MJ sheet: in 9, hold 6, out 9; scene cut at frame 12

const f = (frames: number) => frames / FPS6;
const wipeAt = (t: number) => t - f(12);

export const SFX6: Sfx[] = [
  // opening riser + a page flip as the first sticker unfolds
  { at: 0, file: "v5/riser", volume: 0.45 },
  { at: f(2), file: "v6/paper_flip", volume: 0.7 },
  // paper sheet transitions
  ...WIPES6.flatMap((t) => [
    { at: wipeAt(t), file: "v6/mj_whoosh", volume: 0.9 },
    { at: wipeAt(t) + f(2), file: "v6/paper_flip", volume: 0.55 },
    { at: wipeAt(t) + f(10), file: "v6/mj_hit", volume: 0.75 },
  ]),
  // other scene cuts: a soft paper slide
  ...SCENES6.slice(1)
    .filter((s) => !WIPES6.some((w) => Math.abs(w - s.start) < 0.2))
    .map((s) => ({ at: s.start - 0.04, file: "v6/paper_slide", volume: 0.8 })),
  // dioramas: layers pop up one by one, then fold down
  ...DIORAMAS.flatMap((d) => [
    { at: d.start, file: "v6/paper_flip", volume: 0.8 },
    ...[0, 1, 2, 3, 4].map((i) => ({ at: d.start + f(3 + i * 3), file: "v6/paper_fold", volume: 0.55 })),
    ...(d.end < DURATION6 - 0.2 ? [{ at: d.end - f(10), file: "v6/paper_slide", volume: 0.8 }] : []),
  ]),
  // every scene: stickers unfold, labels are taped on
  ...SCENES6.flatMap((s) => {
    const t0 = s.gfxStart ?? s.start;
    return [
      { at: t0 + f(3), file: "v6/paper_fold", volume: 0.7 },
      { at: t0 + f(7), file: "v6/paper_rustle", volume: 0.6 },
      { at: t0 + f(12), file: "v6/paper_fold", volume: 0.5 },
    ];
  }),
  // scenes fold closed at their end
  ...SCENES6.map((s) => ({ at: s.end - f(6), file: "v6/paper_rustle", volume: 0.45 })),
  // "nobody tells you" and "alone gives you nothing": crumple
  { at: 3.6 + f(10), file: "v6/paper_crumple", volume: 0.6 },
  { at: 18.4 + f(1), file: "v6/paper_crumple", volume: 0.45 },
  // share: planes fly out
  ...[0, 1, 2, 3].map((i) => ({ at: 8.1 + f(16 + i * 3), file: "v6/paper_slide", volume: 0.45 })),
  // final grade: red pen circle + soft impact + confetti rustle
  { at: 29.5 + f(20), file: "boom", volume: 0.35 },
  { at: 29.5 + f(24), file: "v6/paper_rustle", volume: 0.7 },
  { at: 29.5 + f(30), file: "v6/paper_crumple", volume: 0.4 },
  // caption strips: a very soft rustle each line
  ...CAPTIONS5.slice(1).map((c) => ({ at: c.start, file: "v6/paper_rustle", volume: 0.25 })),
];
