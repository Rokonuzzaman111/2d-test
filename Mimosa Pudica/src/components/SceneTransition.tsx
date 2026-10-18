import { interpolate, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";
export const SceneTransition = ({ children }: { children: ReactNode }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: interpolate(f, [0, 8], [0, 1], {
          extrapolateRight: "clamp",
        }),
        translate: `0 ${interpolate(f, [0, 12], [30, 0], { extrapolateRight: "clamp" })}px`,
      }}
    >
      {children}
    </div>
  );
};
