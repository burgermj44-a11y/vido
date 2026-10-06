# Video montage house style (Abdelwahab / @abdelwahab__mj)

The owner sends raw vertical talking-head clips (Algerian Darija, education
topics). For every new video, produce a montage in exactly this style without
being asked again. Each video lives in its own folder with its own composition: video 1 is
`src/Montage.tsx` + `src/script.ts`, video 2 is `src/v2/` (`Montage2`,
assets in `public/v2/`). For a new video, copy the latest folder (`src/v2`)
to `src/vN`, register it in `src/Root.tsx`, and only change the content.

## Editing rules

1. **Cut dead air and filler.** Remove silences longer than ~0.3 s, false
   starts, repeated words and fillers (e.g. "eeh", "ya3ni" when not needed).
   Do this on your own whenever the clip needs it. Keep the speech natural:
   leave ~0.08 s of padding around each kept segment. Do cuts with ffmpeg
   before building the montage, then re-transcribe the cut file for timings.
2. **Captions** (latest style: `CaptionLegend` in `src/v2/Montage2.tsx`):
   Darija text, 2–5 words per line, Cairo Black ~80 px, white with thick
   black stroke and drop shadow. The line rises in from a blur; the word
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
   counters. Effects are mixed under the voice (`SFX_GAIN` 0.6).
9. **Voice first:** voice track processed to `public/voice.wav` with
   highpass 80 Hz + compressor + loudnorm I=-14 LUFS; the video's own audio
   is muted. After rendering, apply
   `alimiter=limit=0.84:attack=3:release=50:level=false` (copy video stream).
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
