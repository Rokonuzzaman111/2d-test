import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import { colors } from "../styles/theme";
const highlights =
  /(লজ্জাবতী|Mimosa pudica|Sensitive Plant|পুলভিনাস|Pulvinus|টার্গর চাপ|Turgor Pressure|বৈদ্যুতিক সংকেত|জৈবিক প্রতিক্রিয়া|আয়ন|পানি|ফলো করুন)/g;
export const BanglaCaption = ({ captions }: { captions: Caption[] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = captions.find(
    (c) => (f / fps) * 1000 >= c.startMs && (f / fps) * 1000 < c.endMs,
  );
  return c ? (
    <div
      data-caption
      data-safe-text
      style={{
        position: "absolute",
        top: 1620,
        left: 70,
        right: 70,
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: 44,
        fontWeight: 600,
        lineHeight: 1.55,
        color: colors.paper,
        padding: "16px 28px",
        background: "rgba(10, 31, 20, 0.85)",
        border: `1px solid ${colors.leafGreen}40`,
        borderRadius: 22,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span>
        {c.text.split(highlights).map((s, i) => (
          <span
            key={i}
            style={{
              color: i % 2 ? colors.signal : undefined,
              fontWeight: i % 2 ? 800 : 600,
            }}
          >
            {s}
          </span>
        ))}
      </span>
    </div>
  ) : null;
};
