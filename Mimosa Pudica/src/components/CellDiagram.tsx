import { useCurrentFrame, interpolate } from "remotion";
import { colors } from "../styles/theme";

/** Motor cell diagram for the pulvinus/turgor explanation */
export const CellDiagram = ({
  x = 0,
  y = 0,
  waterLevel = 1,
  label,
  scale = 1,
}: {
  x?: number;
  y?: number;
  waterLevel?: number;
  label?: string;
  scale?: number;
}) => {
  const f = useCurrentFrame();
  const wobble = Math.sin(f / 15 + x * 0.01) * 2;
  const cellWidth = 100;
  const cellHeight = 130;
  const waterH = cellHeight * waterLevel * 0.7;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Cell wall */}
      <rect
        x={-cellWidth / 2}
        y={-cellHeight / 2}
        width={cellWidth}
        height={cellHeight}
        rx={18}
        fill="none"
        stroke={colors.cellWall}
        strokeWidth={3}
      />
      {/* Cell membrane */}
      <rect
        x={-cellWidth / 2 + 5}
        y={-cellHeight / 2 + 5}
        width={cellWidth - 10}
        height={cellHeight - 10}
        rx={14}
        fill={`${colors.cream}60`}
        stroke={colors.leafGreen}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      {/* Water fill (vacuole) */}
      <rect
        x={-cellWidth / 2 + 8}
        y={cellHeight / 2 - 8 - waterH + wobble}
        width={cellWidth - 16}
        height={waterH}
        rx={10}
        fill={colors.water}
        opacity={0.35}
      />
      {/* Water surface line */}
      <path
        d={`M${-cellWidth / 2 + 10} ${cellHeight / 2 - 8 - waterH + wobble} Q${-cellWidth / 4} ${cellHeight / 2 - 12 - waterH + wobble * 1.5} 0 ${cellHeight / 2 - 8 - waterH + wobble} Q${cellWidth / 4} ${cellHeight / 2 - 4 - waterH + wobble * 0.5} ${cellWidth / 2 - 10} ${cellHeight / 2 - 8 - waterH + wobble}`}
        fill="none"
        stroke={colors.water}
        strokeWidth={1.5}
        opacity={0.6}
      />
      {/* Ion dots */}
      {waterLevel > 0.3 &&
        Array.from({ length: 4 }, (_, i) => (
          <circle
            key={i}
            cx={-20 + i * 14 + Math.sin(f / 10 + i * 2) * 4}
            cy={
              cellHeight / 2 -
              15 -
              waterH * 0.5 +
              Math.cos(f / 12 + i * 3) * 6
            }
            r={3}
            fill={colors.ion}
            opacity={0.7}
          />
        ))}
      {/* Label */}
      {label && (
        <text
          x={0}
          y={cellHeight / 2 + 24}
          textAnchor="middle"
          fontSize={20}
          fontWeight={600}
          fill={colors.paper}
        >
          {label}
        </text>
      )}
    </g>
  );
};
