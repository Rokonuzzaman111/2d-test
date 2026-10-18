import { useCurrentFrame, interpolate } from "remotion";

/** A stylized human finger reaching toward the plant */
export const TouchingFinger = ({
  x = 800,
  y = 500,
  progress = 0,
}: {
  x?: number;
  y?: number;
  progress?: number;
}) => {
  const f = useCurrentFrame();
  // Finger slides from right toward the leaf
  const offsetX = interpolate(progress, [0, 1], [150, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(progress, [0, 0.2, 0.9, 1], [0, 1, 1, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <g
      transform={`translate(${x + offsetX} ${y})`}
      opacity={opacity}
    >
      {/* Forearm hint */}
      <rect
        x={30}
        y={-14}
        width={120}
        height={28}
        rx={14}
        fill="#D4A574"
        opacity={0.6}
      />
      {/* Hand/palm */}
      <ellipse cx={35} cy={0} rx={28} ry={20} fill="#D4A574" />
      {/* Index finger */}
      <rect
        x={-50}
        y={-10}
        width={85}
        height={20}
        rx={10}
        fill="#D4A574"
      />
      {/* Fingertip */}
      <ellipse cx={-50} cy={0} rx={12} ry={11} fill="#DEBC9C" />
      {/* Fingernail */}
      <ellipse
        cx={-56}
        cy={-3}
        rx={7}
        ry={6}
        fill="#E8D5C0"
        opacity={0.8}
      />
      {/* Touch ripple when contact */}
      {progress > 0.85 && (
        <>
          <circle
            cx={-62}
            cy={0}
            r={15 + (f % 30) * 0.8}
            fill="none"
            stroke="#06D6A0"
            strokeWidth={1.5}
            opacity={Math.max(0, 0.5 - (f % 30) * 0.017)}
          />
          <circle
            cx={-62}
            cy={0}
            r={8 + ((f + 15) % 30) * 0.8}
            fill="none"
            stroke="#06D6A0"
            strokeWidth={1}
            opacity={Math.max(0, 0.3 - ((f + 15) % 30) * 0.01)}
          />
        </>
      )}
    </g>
  );
};
