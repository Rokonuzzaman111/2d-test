import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import timing from "../data/timing.json";
import { BanglaCaption } from "./BanglaCaption";
export const Narration = ({ scene }: { scene: number }) => {
  const { fps } = useVideoConfig();
  const s = timing.scenes[scene];
  if (!timing.ready) return null;
  return (
    <>
      <Audio
        src={staticFile(s.audio)}
        volume={1}
        startFrom={Math.round(s.offset * fps)}
      />
      <BanglaCaption captions={s.captions} />
    </>
  );
};
