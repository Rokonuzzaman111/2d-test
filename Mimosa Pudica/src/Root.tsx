import { Composition, Folder } from "remotion";
import { MimosaFact } from "./compositions/MimosaFact";
import { MysteryScene } from "./scenes/MysteryScene";
import { MeetScene } from "./scenes/MeetScene";
import { SignalScene } from "./scenes/SignalScene";
import { PulvinusScene } from "./scenes/PulvinusScene";
import { TurgorScene } from "./scenes/TurgorScene";
import { MythScene } from "./scenes/MythScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot = () => (
  <>
    <Composition
      id="MimosaFact"
      component={MimosaFact}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={4020}
      defaultProps={{ music: true }}
    />
    <Folder name="Scenes">
      <Composition
        id="Mystery"
        component={MysteryScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={510}
      />
      <Composition
        id="Meet"
        component={MeetScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={630}
      />
      <Composition
        id="Signal"
        component={SignalScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={540}
      />
      <Composition
        id="Pulvinus"
        component={PulvinusScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={450}
      />
      <Composition
        id="Turgor"
        component={TurgorScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={750}
      />
      <Composition
        id="Myth"
        component={MythScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={450}
      />
      <Composition
        id="Outro"
        component={OutroScene}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={690}
      />
    </Folder>
  </>
);
