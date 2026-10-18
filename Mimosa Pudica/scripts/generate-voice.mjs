import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseFile } from "music-metadata";

if (existsSync(".env")) process.loadEnvFile(".env");

const key = process.env.ELEVENLABS_API_KEY;
const voice =
  process.env.ELEVENLABS_NARRATOR_VOICE_ID ||
  process.env.ELEVENLABS_VOICE_ID ||
  "pFZP5JQG7iQjIQuC4Bku"; // Lily
const model = process.env.ELEVENLABS_MODEL_ID || "eleven_v3";

const scenes = JSON.parse(
  (await readFile("src/data/script.json", "utf8")).replace(/^\uFEFF/, ""),
);

// Use bundled ffmpeg from Remotion
const ffmpeg = process.platform === "win32"
  ? "node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe"
  : "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg";

async function api(path, body) {
  const r = await fetch(`https://api.elevenlabs.io/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok)
    throw new Error(
      `ElevenLabs ${r.status}: ${(await r.text()).slice(0, 600)}`,
    );
  return r.json();
}

try {
  await mkdir(".cache/elevenlabs", { recursive: true });
  await mkdir("public/audio/scenes", { recursive: true });

  if (process.argv.includes("--voices")) {
    if (!key) throw new Error("Set ELEVENLABS_API_KEY.");
    const r = await api("voices");
    console.log(r.voices.map((v) => ({ id: v.voice_id, name: v.name })));
    process.exit(0);
  }

  let verified = false;
  const result = [];
  let totalDuration = 0;

  for (const scene of scenes) {
    const text = scene.phrases.join(" ");
    const payload = {
      text,
      model_id: model,
      language_code: "bn",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      seed: 42,
    };

    const hash = createHash("sha256")
      .update(JSON.stringify({ voice, payload }))
      .digest("hex")
      .slice(0, 20);
    const cache = `.cache/elevenlabs/${scene.id}-${hash}.json`;

    let r;
    if (existsSync(cache) && !process.argv.includes("--force"))
      r = JSON.parse(await readFile(cache, "utf8"));
    else {
      if (!key)
        throw new Error(
          `Missing ELEVENLABS_API_KEY for uncached scene ${scene.id}. Set it in environment or private .env.`,
        );
      if (!verified) {
        try {
          const models = await api("models");
          if (
            !models
              .find((m) => m.model_id === model)
              ?.languages.some((l) => l.language_id === "bn")
          )
            throw new Error(`${model} does not support Bengali.`);
        } catch (e) {
          if (!(model === "eleven_v3" && e.message.includes("models_read")))
            throw e;
          console.log(
            "Bengali v3 support verified in official docs: https://elevenlabs.io/docs/overview/models",
          );
        }
        verified = true;
      }

      console.log(`Generating voice for scene: ${scene.id}...`);
      r = await api(
        `text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`,
        payload,
      );
      if (!r.audio_base64 || !r.alignment)
        throw new Error(`${scene.id}: missing audio or alignment.`);
      await writeFile(cache, JSON.stringify(r));
    }

    const original = `public/audio/scenes/${scene.id}-original.mp3`;
    const bytes = Buffer.from(r.audio_base64, "base64");
    if (bytes.length < 1000) throw new Error("Invalid audio response.");
    await writeFile(original, bytes);

    const meta = await parseFile(original);
    const duration = meta.format.duration;
    if (!duration) throw new Error("Audio duration unavailable.");

    const offset = 0.2;
    const rate = Math.max(1, duration / (scene.duration - offset - 0.25));
    if (rate > 1.15)
      console.warn(
        `Warning: ${scene.id} narration ${duration.toFixed(2)}s is tight for ${scene.duration}s slot (rate ${rate.toFixed(3)}).`,
      );

    const output = `public/audio/scenes/${scene.id}.wav`;
    execFileSync(ffmpeg, [
      "-y",
      "-v",
      "error",
      "-i",
      original,
      "-af",
      `atempo=${rate},loudnorm=I=-18:TP=-3:LRA=8`,
      "-ar",
      "44100",
      "-ac",
      "1",
      output,
    ]);

    const finalDuration = (await parseFile(output)).format.duration;
    totalDuration += scene.duration;

    const a = r.alignment;
    const joined = a.characters.join("");
    let cursor = 0;
    const captions = scene.phrases.map((text) => {
      const index = joined.indexOf(text, cursor);
      if (index < 0) throw new Error(`${scene.id}: alignment mismatch.`);
      const end = index + text.length - 1;
      cursor = end + 1;
      return {
        text,
        startMs:
          (offset + a.character_start_times_seconds[index] / rate) * 1000,
        endMs: (offset + a.character_end_times_seconds[end] / rate) * 1000,
        timestampMs: null,
        confidence: null,
      };
    });

    result.push({
      ...scene,
      sourceDuration: duration,
      durationSeconds: finalDuration,
      rate,
      offset,
      audio: `audio/scenes/${scene.id}.wav`,
      captions,
    });

    console.log(
      `${scene.id}: ${finalDuration.toFixed(2)}s / ${scene.duration}s; rate ${rate.toFixed(3)}; ${captions.length} aligned phrases`,
    );
  }

  const totalFrames = Math.round(totalDuration * 30);

  await writeFile(
    "src/data/timing.json",
    JSON.stringify(
      {
        ready: true,
        voice,
        model,
        totalFrames,
        audioDuration: totalDuration,
        scenes: result,
      },
      null,
      2,
    ),
  );

  console.log(
    `All ${scenes.length} scenes ready. Total duration: ${totalDuration}s (${totalFrames} frames).`,
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
