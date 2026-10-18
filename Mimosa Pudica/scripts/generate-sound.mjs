import { mkdir, writeFile } from "node:fs/promises";

const sr = 44100;
await mkdir("public/audio/sfx", { recursive: true });

function wav(seconds, fn) {
  const n = Math.ceil(seconds * sr),
    b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = fn(i / sr, i);
    b.writeInt16LE(
      Math.round(Math.max(-0.95, Math.min(0.95, v)) * 32767),
      44 + i * 2,
    );
  }
  return b;
}

const sine = (f, t) => Math.sin(2 * Math.PI * f * t);
let state = 49;
const noise = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 2147483648 - 1;
};

const effects = {
  // Forest ambience: layered low noise
  forest: [
    2.5,
    (t) =>
      0.12 *
      (noise() * 0.15 +
        sine(120 + 40 * Math.sin(t * 0.3), t) * 0.05 +
        sine(85, t) * 0.03) *
      Math.min(t / 0.5, 1) *
      Math.min((2.5 - t) / 0.8, 1),
  ],
  // Gentle touch: soft high-frequency tap
  touch: [
    0.3,
    (t) =>
      0.4 *
      Math.sin(2 * Math.PI * (800 * t - 1200 * t * t)) *
      Math.exp(-t * 18) *
      Math.min(t / 0.003, 1),
  ],
  // Leaf fold: gentle rustling downward sweep
  fold: [
    0.6,
    (t) =>
      0.2 *
      (noise() * 0.4 + sine(300 - 200 * t, t) * 0.6) *
      Math.exp(-t * 5) *
      Math.min(t / 0.02, 1),
  ],
  // Electrical signal: short zap
  electric: [
    0.5,
    (t) =>
      0.18 *
      (sine(2200 * Math.exp(-t * 8), t) * 0.7 + noise() * 0.3) *
      Math.exp(-t * 12) *
      Math.min(t / 0.005, 1),
  ],
  // Water movement: liquid gurgle
  water: [
    0.7,
    (t) =>
      0.18 *
      Math.sin(2 * Math.PI * (380 * t + 500 * t * t)) *
      Math.exp(-t * 6) *
      Math.min(t / 0.02, 1),
  ],
  // Whoosh: transition sweep
  whoosh: [
    0.6,
    (t) =>
      0.2 *
      (noise() * 0.5 + sine(900 + 600 * t, t) * 0.5) *
      Math.pow(Math.sin((Math.PI * t) / 0.6), 2),
  ],
  // Sparkle: bright tonal accent
  sparkle: [
    1.0,
    (t) =>
      0.15 *
      (sine(1046, t) + 0.5 * sine(1568, t) + 0.3 * sine(2093, t)) *
      Math.exp(-t * 4) *
      Math.min(t / 0.01, 1),
  ],
};

for (const [name, [duration, fn]] of Object.entries(effects))
  await writeFile(`public/audio/sfx/${name}.wav`, wav(duration, fn));

// Ambient forest score: ~80 seconds
const musicDuration = 80;
const chords = [
  // Nature-inspired minor/suspended chords
  [130.81, 155.56, 196, 261.63], // Cm
  [110, 146.83, 174.61, 220],    // Am-like
  [98, 130.81, 164.81, 196],     // Gsus
  [116.54, 146.83, 196, 233.08], // Bb
];

await writeFile(
  "public/audio/music.wav",
  wav(musicDuration, (t) => {
    let v = 0;
    // Pad layers
    for (let j = 0; j < 12; j++) {
      const q = t - j * 7;
      if (q < 0 || q > 8.5) continue;
      const env = Math.min(q / 1.2, 1) * Math.min((8.5 - q) / 1.5, 1);
      v +=
        chords[j % 4].reduce(
          (sum, h) => sum + sine(h, t) + 0.12 * sine(h * 2, t),
          0,
        ) *
        0.025 *
        env;
    }
    // Gentle melodic motif
    const notes = [392, 440, 523.25, 392, 349.23, 440, 523.25, 587.33];
    const q = t % 2;
    v +=
      0.025 *
      sine(notes[Math.floor(t / 2) % 8], t) *
      Math.exp(-q * 4) *
      Math.min(q / 0.03, 1);
    // Overall fade
    v *= Math.min(t / 2, 1) * Math.min((musicDuration - t) / 3, 1);
    return v;
  }),
);

await writeFile(
  "public/audio/SOUND-LICENSE.txt",
  "Sound effects and forest ambient score are original procedural synthesis created for this project. No external samples or recordings. Generator: scripts/generate-sound.mjs.",
);

console.log(
  `Created ${Object.keys(effects).length} original effects and ${musicDuration}-second ambient forest score.`,
);
