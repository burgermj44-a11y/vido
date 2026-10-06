import "./index.css";
import { Composition } from "remotion";
import { Montage, FPS, DURATION_SEC } from "./Montage";
import { Montage2 } from "./v2/Montage2";
import { DURATION2, FPS2 } from "./v2/script2";

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
    </>
  );
};
