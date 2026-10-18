import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { ReactNode } from "react";
export const SceneTransition = ({ children }: { children: ReactNode }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // eased-in content with a gentle settle (no robotic linear fade)
  const opacity = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const rise = spring({ frame: f, fps, config: { damping: 200, stiffness: 90 } });
  const scale = interpolate(rise, [0, 1], [1.035, 1]);
  // a warm light sweep crosses the frame during the first ~14 frames
  const sweep = interpolate(f, [0, 14], [-0.4, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sweepOpacity = interpolate(f, [0, 4, 10, 14], [0, 0.5, 0.35, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          transform: `translateY(${interpolate(rise, [0, 1], [34, 0])}px) scale(${scale})`,
        }}
      >
        {children}
      </div>
      {/* cinematic entrance sweep + vignette pulse */}
      {f < 16 && (
        <>
          <div
            style={{
              position: "absolute",
              top: "-30%",
              left: `${sweep * 140 - 30}%`,
              width: "34%",
              height: "160%",
              transform: "skewX(-14deg)",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,238,200,0.28) 50%, rgba(255,255,255,0) 100%)",
              opacity: sweepOpacity,
              filter: "blur(6px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: `inset 0 0 ${interpolate(f, [0, 14], [220, 0])}px rgba(0,0,0,${interpolate(f, [0, 14], [0.55, 0])})`,
            }}
          />
        </>
      )}
    </div>
  );
};
