import timing from "../data/timing.json";
export const cue = (scene: number, phrase: number, fallback: number) =>
  timing.ready
    ? Math.round(
        ((timing.scenes[scene].captions[phrase]?.startMs ?? fallback * 1000) /
          1000) *
          30,
      )
    : fallback * 30;
