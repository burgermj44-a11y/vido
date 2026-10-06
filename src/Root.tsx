import "./index.css";
import { Composition } from "remotion";
import { Montage, FPS, DURATION_SEC } from "./Montage";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Montage"
      component={Montage}
      durationInFrames={Math.round(DURATION_SEC * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
