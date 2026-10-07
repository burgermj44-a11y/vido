# Video montage house style (Abdelwahab / @abdelwahab__mj)

The owner sends raw vertical talking-head clips (Algerian Darija, education
topics). For every new video, produce a montage in exactly this style without
being asked again. Each video lives in its own folder with its own composition: video 1 is
`src/Montage.tsx` + `src/script.ts`, video 2 is `src/v2/` (`Montage2`,
assets in `public/v2/`), video 3 is the MJ Burger ad (`src/v3/`), video 4 is
series episode 1 (`src/v4/`), video 5 is a standalone video (`src/v5/`). For a new talking-head video, copy the latest
folder (`src/v4`) to `src/vN`, register it in `src/Root.tsx`, and only change
the content.

Not every video is a series episode. When he says a video is NOT part of the
series, use no series intro, logo, badge or "الحلقة" wording (copy `src/v5`).
Always trim app outros (e.g. a CapCut logo on black) from the end of clips.

## Series "الطريقة الصحيحة للدراسة" (keep it in every episode)

- Reusable intro + logo: `src/series/SeriesSting.tsx` (`SeriesSting`,
  `SeriesLogo`, 2.2 s). Play it full-screen when he announces the series /
  episode, with title "الطريقة الصحيحة للدراسة", subtitle "سلسلة مع عبد
  الوهاب" and the episode number. Hide captions while it plays. Sounds:
  whoosh_in before, boom + sparkle on the logo, whoosh_out on exit.
- After the intro a small series badge (logo + "الحلقة N") sits at the
  bottom centre (y≈1770). Add an episode card ("الحلقة N") when he says
  which episode it is, a name lower-third for "أنا عبد الوهاب", and the
  follow card when he says "أبوني".
- Every video starts with the riser (`scripts/make_riser.py` →
  `public/vN/riser.wav`, volume ~0.55) whose impact lands on the first
  punch-in (~2 s).

## Editing rules

1. **Cut dead air and filler.** Remove silences longer than ~0.3 s, false
   starts, repeated words and fillers (e.g. "eeh", "ya3ni" when not needed).
   Do this on your own whenever the clip needs it. Keep the speech natural:
   leave ~0.08 s of padding around each kept segment. Do cuts with ffmpeg
   before building the montage, then re-transcribe the cut file for timings.
2. **Captions** (latest style: `CaptionLegend` in `src/v2/Montage2.tsx`):
   Darija text, 2–5 words per line, Cairo Black ~80 px, white with thick
   black stroke and drop shadow. Since video 4 captions are smaller:
   64 px (key words 70 px, single-word lines 116 px). The line rises in from a blur; the word
   being spoken glows in the accent colour (karaoke); key words sit on a
   gradient badge with a moving shine; a one-word line ("100%") is shown
   huge. Accent colour is picked to match the clip (video 1: rose `#E63E62`
   on a pink wall; video 2: gold `#FFC233`→`#FF8A00` on a beige wall).
   Captions sit at y≈1330 (chest area).
3. **Punch-in zooms** on every new idea (scale 1.0 ↔ 1.14 ↔ 1.22), slow drift
   inside each scene, short white flash on each cut.
4. **Depth layering:** graphics are drawn *between* the speaker and the wall.
   Run `scripts/segment.py` (rembg `u2net_human_seg.onnx`) on every frame,
   smooth the mattes (3-frame temporal average, soft threshold, 1.2 px blur)
   and save to `public/matte/NNNN.jpg`. Text labels stay in front.
5. **Topic graphics** above the head for each idea: Twemoji stickers
   (`@twemoji/svg`), pop + float animations, coloured label pills.
6. **B-roll cutaways:** full-screen unDraw illustrations (npm `undraw-svg`,
   MIT) recoloured to the video palette, with a tag pill, swipe in/out,
   Ken Burns. Use one whenever the speaker names a concrete thing
   (studying, goal, result...).
7. **Instagram follow animation** whenever he says subscribe/follow:
   card with the real profile screenshot `public/profile_shot.png`, a blue
   "Follow" button, hand taps it → "Following ✓", ripple and hearts.
7b. **Share animation** whenever he says share / partager (incl. "story"):
   `ShareScene` in `src/v2/Montage2.tsx`, drawn behind the speaker: a big
   share button with pulse rings is tapped, paper planes fly to friend
   avatars that pop with a check mark; the story variant uses an Instagram
   story ring around a phone.
8. **Sound effects on every change** (`scripts/make_sfx.py` → `public/sfx`):
   whoosh on zooms, swipe on B-roll, pop on stickers, pop2 on labels, tick on
   each caption line, click + ding on follow, boom on warnings, blips on
   counters. Effects are mixed well under the voice (`SFX_GAIN` 0.22 since
   video 4 v2; caption ticks 0.1). He asked twice for quieter effects.
9. **Voice first, clean and clear:** voice track processed with
   `highpass=f=85,afftdn=nr=18:nf=-40:tn=1,agate=threshold=0.012:ratio=4:range=0.12:attack=3:release=120,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.0:g=3.5,equalizer=f=9000:t=h:w=0.7:g=1.5,deesser=i=0.35,acompressor=threshold=-22dB:ratio=3.5:attack=4:release=70:makeup=2.5,loudnorm=I=-11.5:TP=-1.0:LRA=7` (he wants the voice loud)
   (denoise, gate, presence EQ, de-ess, compression); the video's own audio
   is muted. After rendering, apply
   `alimiter=limit=0.89:attack=3:release=50:level=false` (copy video stream).
10. Soft vignette, slight saturation/contrast boost, progress bar on top in
    the accent colour. Output 1080×1920, same fps as the source.

## Environment notes (cloud container)

- Only PyPI, npm and GitHub are reachable. Hugging Face, Pexels, Pixabay,
  Unsplash and Wikimedia are blocked.
- Transcription: sherpa-onnx Whisper models from GitHub releases
  (`k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-large-v3.tar.bz2`),
  `pip install sherpa-onnx`, run `scripts/transcribe.py <model_dir> <wav16k> <cut,points>`.
  Use silence detection (`ffmpeg silencedetect=noise=-30dB:d=0.12`) to split
  phrases; Whisper is unreliable on Darija, so cross-check several splits.
- Segmentation model: `github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx`.
- Render with the Playwright headless shell:
  `npx remotion render Montage out/x.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --codec=h264 --crf=18 --audio-bitrate=256k`
- `npm run lint` must pass before rendering.
- Files sent to the user must be under 30 MB: if the render is larger,
  make a 2-pass x264 copy at ~6 Mbps (`-b:v 6200k -maxrate 8000k
  -bufsize 12000k`, audio copied) and send that.
