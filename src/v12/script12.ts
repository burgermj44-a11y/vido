// Video 12: voice-only promo for the 60-day challenge (Darija) — his photo in the
// centre, words around him, animated kraft background. Times snapped to his pauses.
export const DURATION12 = 64.34 + 2.5;

export type Cap12 = { start: number; end: number; text: string; hl?: string[]; side: "L" | "R"; code?: string };

export const CAPTIONS12: Cap12[] = [
  { start: 0.3, end: 1.3, text: "شفت هاد التحدي؟", hl: ["التحدي؟"], side: "R", code: "1f440" },
  { start: 1.6, end: 3.46, text: "حرفيا يدّيك لـ17", hl: ["لـ17"], side: "L", code: "1f3af" },
  { start: 3.68, end: 4.33, text: "في الفصل الأول", side: "R" },
  { start: 4.65, end: 7.3, text: "شوفو خوتي جبتلكم", hl: ["جبتلكم"], side: "L", code: "1f381" },
  { start: 7.3, end: 10.02, text: "أفضل تحدي تقدرو تديروه", hl: ["تحدي"], side: "R", code: "1f525" },
  { start: 10.39, end: 12.46, text: "خوتي، نقراو", side: "L", code: "1f4da" },
  { start: 12.77, end: 14.78, text: "غير 60 يوم برك", hl: ["60"], side: "R", code: "1f4c6" },
  { start: 15.0, end: 17.2, text: "حرفيا راح تستفادو", hl: ["تستفادو"], side: "L", code: "1f4a1" },
  { start: 17.53, end: 19.14, text: "وبإذن الله تجيبو", side: "R" },
  { start: 19.39, end: 21.28, text: "14 ولا 15 ولا حتى 16", hl: ["14", "15", "16"], side: "L", code: "1f3c6" },
  { start: 21.57, end: 24.24, text: "وانتوما تستفادو", side: "R", code: "1f393" },
  { start: 24.45, end: 28.45, text: "وأنا نستفاد معاكم", side: "L", code: "1f91d" },
  { start: 28.78, end: 33.99, text: "نحبكم في الله خوتي", hl: ["نحبكم"], side: "R", code: "2764" },
  { start: 34.17, end: 37.3, text: "دير أبوني للقناة على يوتيوب", hl: ["أبوني"], side: "L" },
  { start: 37.3, end: 41.0, text: "حرفيا راح تستفاد منها بزاف", hl: ["بزاف"], side: "R" },
  { start: 41.0, end: 44.4, text: "وإذا بغيت تجي للإنستغرام", hl: ["للإنستغرام"], side: "L" },
  { start: 44.4, end: 48.17, text: "كونتاكتيني في أي حاجة", hl: ["كونتاكتيني"], side: "R" },
  { start: 48.45, end: 50.73, text: "وأنا نبغي نوصل للمليون", hl: ["للمليون"], side: "L" },
  { start: 51.05, end: 53.12, text: "بإذن الله، غير أبوني", hl: ["أبوني"], side: "R" },
  { start: 53.37, end: 57.0, text: "ونبقى نصنعلكم فيديوهات", hl: ["فيديوهات"], side: "L", code: "1f3ac" },
  { start: 58.48, end: 61.6, text: "بالستايل الورقي", hl: ["الورقي"], side: "R", code: "1f4c4" },
  { start: 61.85, end: 64.34, text: "ربي يوفقكم خوتي", hl: ["يوفقكم"], side: "L", code: "1f932" },
];

export const SUB_AT = 34.4; // "أبوني للقناة على يوتيوب"
export const FOLLOW_AT = 41.3; // "تجي للإنستغرام"
export const MILLION_AT = 48.6; // "نوصل للمليون"
export const WIPES12 = [14.9, 33.9];
