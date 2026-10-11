// Video 8: voice-only clip (Darija) — his photo in the centre, words around him,
// animated kraft paper background. Times snapped to the pauses in his voice.
export const FPS8 = 30;
export const DURATION8 = 63.57 + 2.5; // voice + end card

export type Cap8 = { start: number; end: number; text: string; hl?: string[]; side: "L" | "R"; code?: string };

export const CAPTIONS8: Cap8[] = [
  { start: 0.0, end: 2.6, text: "على بالي بلي راك مش حاب تقرا", hl: ["تقرا"], side: "R", code: "1f629" },
  { start: 2.6, end: 5.34, text: "وراك تحوّس على حل باش ترجع تقرا", hl: ["حل"], side: "L", code: "1f50d" },
  { start: 5.67, end: 7.0, text: "وتدي 16 في المعدل", hl: ["16"], side: "R", code: "1f3af" },
  { start: 7.0, end: 8.25, text: "في هاد الفيديو، عبد الوهاب MJ", hl: ["MJ"], side: "L" },
  { start: 8.57, end: 10.4, text: "جبتلك الحل", hl: ["الحل"], side: "R", code: "1f4a1" },
  { start: 10.4, end: 13.4, text: "ما تنساش تبارطاجي هاد الفيديو لصحابك", hl: ["تبارطاجي"], side: "L" },
  { start: 13.6, end: 15.6, text: "يفيدك ويفيد صحابك", hl: ["يفيدك"], side: "R" },
  { start: 15.6, end: 18.7, text: "جبتلك 5 طرق يعاونوك كطالب", hl: ["5"], side: "L", code: "270d" },
  { start: 18.97, end: 22.1, text: "سواء عندك البيام، الباك، ولا الفصل الأول", hl: ["البيام", "الباك"], side: "R", code: "1f4da" },
  { start: 22.37, end: 26.61, text: "بزاف الناس يعتمدو على هاد الطرق", hl: ["الطرق"], side: "L", code: "1f465" },
  { start: 26.93, end: 30.26, text: "إذا اعتمدتهم حرفيا راح تدي 16 ولا 17", hl: ["16", "17"], side: "R", code: "1f3c6" },
  { start: 30.52, end: 32.6, text: "وتفرّح والديك", hl: ["والديك"], side: "L", code: "2764" },
  { start: 32.6, end: 35.56, text: "وبإذن الله أنا راني واقف معاكم", hl: ["معاكم"], side: "R", code: "1f91d" },
  { start: 35.85, end: 39.2, text: "وهادو 5 طرق من أجمل الطرق", hl: ["أجمل"], side: "L", code: "2b50" },
  { start: 39.54, end: 42.52, text: "نخليكم خوتي مع الشرح", hl: ["الشرح"], side: "R", code: "1f4d6" },
  { start: 42.88, end: 45.6, text: "على بالي خوتي طوّلت عليكم", side: "L", code: "23f3" },
  { start: 45.6, end: 48.44, text: "ما نغيبش عليكم، وبغيت نشكركم بزاف", hl: ["نشكركم"], side: "R", code: "1f64f" },
  { start: 48.74, end: 49.88, text: "ربي يحفظكم", side: "L", code: "1f932" },
  { start: 50.13, end: 53.06, text: "على بالي بلي راكم واقفين معايا", hl: ["معايا"], side: "R", code: "1f4aa" },
  { start: 53.36, end: 55.95, text: "كمّلو تفرجو الفيديو وما تنساوش", side: "L", code: "1f440" },
  { start: 56.22, end: 58.72, text: "تبونيو للكونت تاعي", hl: ["تبونيو"], side: "R" },
  { start: 59.0, end: 61.26, text: "إن شاء الله يعجبكم الفيديو", hl: ["يعجبكم"], side: "L", code: "1f60a" },
  { start: 61.58, end: 63.57, text: "نتلاقاو خوتي", side: "R", code: "1f44b" },
];

// special moments (start time = the word)
export const SHARE_AT = 10.9; // "تبارطاجي"
export const FOLLOW_AT = 56.3; // "تبونيو"
// MJ paper wipes on the big turns
export const WIPES8 = [13.5, 35.7, 42.7];
