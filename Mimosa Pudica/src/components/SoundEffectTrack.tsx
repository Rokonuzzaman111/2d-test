import { Audio } from "@remotion/media";
import {
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import timing from "../data/timing.json";

// Scene frame starts: 0, 17*30=510, 38*30=1140, 56*30=1680, 71*30=2130, 96*30=2880, 111*30=3330
const SCENE_FRAMES = [0, 510, 1140, 1680, 2130, 2880, 3330];

export const soundEvents = [
  // Mystery: atmospheric intro
  { frame: 1, sound: "forest", volume: 0.15 },
  { frame: 100, sound: "whoosh", volume: 0.12 },
  // Touch moment
  { frame: 280, sound: "touch", volume: 0.25 },
  { frame: 300, sound: "fold", volume: 0.2 },
  // Meet: botanical reveal
  { frame: SCENE_FRAMES[1] + 20, sound: "sparkle", volume: 0.15 },
  { frame: SCENE_FRAMES[1] + 300, sound: "fold", volume: 0.12 },
  // Signal: electrical visualization
  { frame: SCENE_FRAMES[2] + 50, sound: "electric", volume: 0.18 },
  { frame: SCENE_FRAMES[2] + 200, sound: "electric", volume: 0.12 },
  // Pulvinus: science zoom
  { frame: SCENE_FRAMES[3] + 30, sound: "whoosh", volume: 0.14 },
  { frame: SCENE_FRAMES[3] + 150, sound: "sparkle", volume: 0.1 },
  // Turgor: water movement
  { frame: SCENE_FRAMES[4] + 80, sound: "water", volume: 0.18 },
  { frame: SCENE_FRAMES[4] + 250, sound: "water", volume: 0.12 },
  { frame: SCENE_FRAMES[4] + 450, sound: "fold", volume: 0.15 },
  // Myth vs Science
  { frame: SCENE_FRAMES[5] + 40, sound: "sparkle", volume: 0.14 },
  { frame: SCENE_FRAMES[5] + 280, sound: "sparkle", volume: 0.12 },
  // Outro
  { frame: SCENE_FRAMES[6] + 20, sound: "whoosh", volume: 0.12 },
  { frame: SCENE_FRAMES[6] + 400, sound: "sparkle", volume: 0.15 },
];

export const SoundEffectTrack = ({ music = true }: { music?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  // Duck music under voiceover
  let duck = 1;
  if (timing.ready) {
    for (const s of timing.scenes) {
      const aStart = s.start + s.offset;
      const aEnd = s.start + s.offset + s.durationSeconds;
      if (t >= aStart - 0.3 && t <= aEnd + 0.3) {
        const env = Math.min(
          Math.max(0, (t - aStart + 0.3) / 0.3),
          Math.max(0, (aEnd + 0.3 - t) / 0.3),
          1,
        );
        duck = Math.min(duck, 1 - 0.65 * env);
      }
    }
  }

  const totalFrames = timing.totalFrames;
  const fade = interpolate(
    f,
    [0, 45, totalFrames - 120, totalFrames - 1],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" },
  );

  return (
    <>
      {music ? (
        <Audio
          name="Forest ambient score (ducked)"
          src={staticFile("audio/music.wav")}
          volume={0.16 * duck * fade}
          premountFor={fps}
        />
      ) : null}
      {soundEvents.map((e, i) => (
        <Audio
          key={i}
          name={`${e.sound} ${i + 1}`}
          from={e.frame}
          src={staticFile(`audio/sfx/${e.sound}.wav`)}
          volume={e.volume}
          premountFor={fps}
        />
      ))}
    </>
  );
};
