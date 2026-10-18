import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import timing from "../data/timing.json";
import { BanglaCaption } from "./BanglaCaption";
export const Narration = ({ scene }: { scene: number }) => {
  const s = timing.scenes[scene];
  if (!timing.ready) return null;
  return (
    <>
      <Audio
        src={staticFile(s.audio)}
        volume={1}
        trimBefore={s.offset}
      />
      <BanglaCaption captions={s.captions} />
    </>
  );
};
