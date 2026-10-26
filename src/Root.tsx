import "./index.css";
import { Composition } from "remotion";
import { Montage, FPS, DURATION_SEC } from "./Montage";
import { Montage2 } from "./v2/Montage2";
import { DURATION2, FPS2 } from "./v2/script2";
import { Montage3 } from "./v3/Montage3";
import { DURATION3, FPS3 } from "./v3/script3";
import { Montage4 } from "./v4/Montage4";
import { DURATION4, FPS4 } from "./v4/script4";
import { Montage5 } from "./v5/Montage5";
import { DURATION5, FPS5 } from "./v5/script5";
import { Montage6 } from "./v6/Montage6";
import { DURATION6, FPS6 } from "./v6/script6";
import { Montage7 } from "./v7/Montage7";
import { DURATION7, FPS7 } from "./v7/script7";
import { YT1, YT1_FPS, YT1_FRAMES } from "./yt1/YT1";
import { YT1Thumb } from "./yt1/Thumb";
import { YT2, YT2Thumb, YT2_FPS, YT2_FRAMES } from "./yt2/YT2";
import { YT3, YT3Thumb, YT3_FPS, YT3_FRAMES } from "./yt3/YT3";
import { PROMO_FPS, PROMO_FRAMES, Promo } from "./promo/Promo";
import { V8, V8_FPS, V8_FRAMES } from "./v8/V8";
import { Thumb8 } from "./thumb8/Thumb8";
import { V9, V9_FPS, V9_FRAMES } from "./v9/V9";
import { V10, V10_FPS, V10_FRAMES } from "./v10/V10";
import { YT4, YT4Thumb, YT4_FPS, YT4_FRAMES } from "./yt4/YT4";
import { V12, V12_FPS, V12_FRAMES } from "./v12/V12";
import { V13, V13_FPS, V13_FRAMES } from "./v13/V13";
import { V14, V14_FPS, V14_FRAMES } from "./v14/V14";
import { YT5, YT5Thumb, YT5_FPS, YT5_FRAMES } from "./yt5/YT5";
import { V16, V16_FPS, V16_FRAMES } from "./v16/V16";
import { V17, V17_FPS, V17_FRAMES } from "./v17/V17";
import { PeepSlide } from "./peep/Peep";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Montage"
        component={Montage}
        durationInFrames={Math.round(DURATION_SEC * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="Montage2"
        component={Montage2}
        durationInFrames={Math.round(DURATION2 * FPS2)}
        fps={FPS2}
        width={1080}
        height={1920}
      />
      <Composition
        id="Montage3"
        component={Montage3}
        durationInFrames={Math.round(DURATION3 * FPS3)}
        fps={FPS3}
        width={1080}
        height={1920}
      />
      <Composition
        id="Montage4"
        component={Montage4}
        durationInFrames={Math.round(DURATION4 * FPS4)}
        fps={FPS4}
        width={1080}
        height={1920}
      />
      <Composition
        id="Montage5"
        component={Montage5}
        durationInFrames={Math.round(DURATION5 * FPS5)}
        fps={FPS5}
        width={1080}
        height={1920}
      />
      <Composition
        id="Montage6"
        component={Montage6}
        durationInFrames={Math.round(DURATION6 * FPS6)}
        fps={FPS6}
        width={1080}
        height={1920}
      />
      <Composition id="YT1" component={YT1} durationInFrames={YT1_FRAMES} fps={YT1_FPS} width={1920} height={1080} />
      <Composition id="YT1Thumb" component={YT1Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="YT2" component={YT2} durationInFrames={YT2_FRAMES} fps={YT2_FPS} width={1920} height={1080} />
      <Composition id="YT2Thumb" component={YT2Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Montage7" component={Montage7} durationInFrames={Math.round(DURATION7 * FPS7)} fps={FPS7} width={1080} height={1920} />
      <Composition id="YT3" component={YT3} durationInFrames={YT3_FRAMES} fps={YT3_FPS} width={1920} height={1080} />
      <Composition id="YT3Thumb" component={YT3Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Montage8" component={V8} durationInFrames={V8_FRAMES} fps={V8_FPS} width={1920} height={1080} />
      <Composition id="Thumb8" component={Thumb8} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Montage9" component={V9} durationInFrames={V9_FRAMES} fps={V9_FPS} width={1080} height={1920} />
      <Composition id="Montage10" component={V10} durationInFrames={V10_FRAMES} fps={V10_FPS} width={1080} height={1920} />
      <Composition id="YT4" component={YT4} durationInFrames={YT4_FRAMES} fps={YT4_FPS} width={1920} height={1080} />
      <Composition id="YT4Thumb" component={YT4Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Montage12" component={V12} durationInFrames={V12_FRAMES} fps={V12_FPS} width={1920} height={1080} />
      <Composition id="Montage13" component={V13} durationInFrames={V13_FRAMES} fps={V13_FPS} width={1080} height={1920} />
      <Composition id="Montage14" component={V14} durationInFrames={V14_FRAMES} fps={V14_FPS} width={1080} height={1920} />
      <Composition id="YT5" component={YT5} durationInFrames={YT5_FRAMES} fps={YT5_FPS} width={1920} height={1080} />
      <Composition id="YT5Thumb" component={YT5Thumb} durationInFrames={1} fps={30} width={1280} height={720} />
      <Composition id="Montage16" component={V16} durationInFrames={V16_FRAMES} fps={V16_FPS} width={1080} height={1920} />
      <Composition id="Montage17" component={V17} durationInFrames={V17_FRAMES} fps={V17_FPS} width={1080} height={1920} />
      <Composition id="PeepSlide" component={PeepSlide} durationInFrames={1} fps={30} width={1080} height={1350} defaultProps={{ i: 0 }} />
      <Composition id="Promo" component={Promo} durationInFrames={PROMO_FRAMES} fps={PROMO_FPS} width={1920} height={1080} />
    </>
  );
};
