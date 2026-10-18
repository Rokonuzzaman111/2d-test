import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { readFile, mkdir, access, writeFile } from "node:fs/promises";

const timing = JSON.parse(await readFile("src/data/timing.json", "utf8"));

if (!timing.ready)
  throw new Error("Run npm run voice to prepare the narration clips first.");

// Verify all audio files exist
for (const s of timing.scenes) {
  await access(`public/${s.audio}`);
  if (s.offset + s.durationSeconds > s.duration + 0.5)
    throw new Error(`${s.id}: narration exceeds scene duration.`);
}

// Verify required assets
for (const file of [
  "fonts/NotoSansBengali.ttf",
  "audio/music.wav",
  ...["forest", "touch", "fold", "electric", "water", "whoosh", "sparkle"].map(
    (s) => `audio/sfx/${s}.wav`,
  ),
])
  await access(`public/${file}`);

const totalFrames = timing.totalFrames;

await mkdir("out/frames", { recursive: true });

const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const inputProps = { music: !process.argv.includes("--no-music") };

const composition = await selectComposition({
  serveUrl,
  id: "MimosaFact",
  inputProps,
});

if (
  composition.fps !== 30 ||
  composition.width !== 1080 ||
  composition.height !== 1920
)
  throw new Error("Expected 1080x1920 at 30fps.");

// Render inspection stills
if (!process.argv.includes("--skip-stills")) {
  const stepSize = Math.floor(totalFrames / 12);
  const frames = [
    0,
    ...Array.from({ length: 11 }, (_, i) => stepSize * (i + 1)),
    totalFrames - 1,
  ];
  for (const frame of frames) {
    if (frame >= composition.durationInFrames) continue;
    await renderStill({
      serveUrl,
      composition,
      inputProps,
      frame,
      output: `out/frames/${frame}.png`,
    });
    console.log(`Inspected frame: ${frame}`);
  }
}

if (process.argv.includes("--stills")) process.exit(0);

// Full render
await mkdir("output", { recursive: true });
let last = -1;
await renderMedia({
  serveUrl,
  composition,
  inputProps,
  outputLocation: "output/lajjaboti_fact.mp4",
  codec: "h264",
  audioCodec: "aac",
  audioBitrate: "192k",
  crf: 18,
  pixelFormat: "yuv420p",
  concurrency: 3,
  onProgress: ({ progress }) => {
    const p = Math.floor((progress * 100) / 10) * 10;
    if (p !== last) {
      last = p;
      console.log(`Rendering ${p}%`);
    }
  },
});

await writeFile(
  "output/render-manifest.json",
  JSON.stringify(
    {
      composition: "MimosaFact",
      frames: totalFrames,
      fps: 30,
      width: 1080,
      height: 1920,
      music: inputProps.music,
      narration: timing.scenes.map((s) => ({
        id: s.id,
        start: s.start,
        duration: s.durationSeconds,
        rate: s.rate,
      })),
      output: "lajjaboti_fact.mp4",
    },
    null,
    2,
  ),
);

console.log(`Saved output/lajjaboti_fact.mp4 (${totalFrames} frames, ${(totalFrames / 30).toFixed(1)}s)`);
