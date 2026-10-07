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
    </>
  );
};
