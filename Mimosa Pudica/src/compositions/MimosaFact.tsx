import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, useVideoConfig, staticFile } from "remotion";
import { MysteryScene } from "../scenes/MysteryScene";
import { MeetScene } from "../scenes/MeetScene";
import { SignalScene } from "../scenes/SignalScene";
import { PulvinusScene } from "../scenes/PulvinusScene";
import { TurgorScene } from "../scenes/TurgorScene";
import { MythScene } from "../scenes/MythScene";
import { OutroScene } from "../scenes/OutroScene";
import { Narration } from "../components/Narration";
import { SoundEffectTrack } from "../components/SoundEffectTrack";
import { font } from "../styles/theme";

export type VideoProps = { music: boolean };

export const MimosaFact = ({ music = true }: VideoProps) => {
  const { fps } = useVideoConfig();

  // Scene timings synced with natural-speed narration
  const scenes = [
    { name: "01 Mystery", start: 0, dur: 17, Scene: MysteryScene, idx: 0 },
    { name: "02 Meet the plant", start: 17, dur: 21, Scene: MeetScene, idx: 1 },
    { name: "03 Signal detection", start: 38, dur: 18, Scene: SignalScene, idx: 2 },
    { name: "04 Pulvinus", start: 56, dur: 15, Scene: PulvinusScene, idx: 3 },
    { name: "05 Turgor pressure", start: 71, dur: 25, Scene: TurgorScene, idx: 4 },
    { name: "06 Myth vs Science", start: 96, dur: 15, Scene: MythScene, idx: 5 },
    { name: "07 Outro & CTA", start: 111, dur: 23, Scene: OutroScene, idx: 6 },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: font }}>
      {scenes.map(({ name, start, dur, Scene, idx }) => (
        <Sequence
          key={name}
          name={name}
          from={Math.round(start * fps)}
          durationInFrames={Math.round(dur * fps)}
          premountFor={fps}
        >
          <Scene />
          <Narration scene={idx} />
        </Sequence>
      ))}
      <SoundEffectTrack music={music} />
    </AbsoluteFill>
  );
};
