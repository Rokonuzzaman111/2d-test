
import { useCurrentFrame, interpolate } from "remotion";
import { WaterFilters, wobble, nrand, DewBead } from "./Realism";

const P = "cd";

/**
 * Photoreal motor-cell cross-section: translucent wall, streaming
 * cytoplasm with organelles, turgid/flaccid vacuole animation,
 * caustic water shimmer and ion particles crossing the membrane.
 */
export const CellDiagram = ({
  x = 0,
  y = 0,
  turgor = 1, // 1 = turgid (full of water), 0 = flaccid (collapsed)
  scale = 1,
}: {
  x?: number;
  y?: number;
  turgor?: number;
  scale?: number;
}) => {
  const f = useCurrentFrame();
  const collapse = 1 - turgor;

  // Cell outline bulges when turgid, wrinkles when flaccid
  const bulge = 60 + turgor * 14;
  const wrinkleAmp = collapse * 5;
  const wallPts = [...Array(28)].map((_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const rX = bulge * 1.35 + Math.sin(a * 6 + f / 40) * wrinkleAmp;
    const rY = bulge + Math.cos(a * 5 - f / 50) * wrinkleAmp;
    return `${Math.cos(a) * rX},${Math.sin(a) * rY}`;
  });

  // Vacuule shrinks & becomes irregular as water leaves
  const vR = 34 * (0.45 + turgor * 0.55);
  const vPts = [...Array(20)].map((_, i) => {
    const a = (i / 20) * Math.PI * 2;
    const wob = wobble(f * 0.3 + i * 9, 0.8, i) * (2 + collapse * 5);
    return `${Math.cos(a) * (vR * 1.3 + wob)},${Math.sin(a) * (vR + wob * 0.7)}`;
  });

  // Cytoplasmic streaming — organelles orbit slowly along the periphery
  const organelles = [...Array(9)].map((_, i) => {
    const orbit = 0.72 + nrand(`org${i}`) * 0.16;
    const speed = 0.0035 + nrand(`ospd${i}`) * 0.003;
    const a = f * speed + nrand(`oph${i}`) * Math.PI * 2;
    const rr = bulge * orbit;
    return {
      cx: Math.cos(a) * rr * 1.25,
      cy: Math.sin(a) * rr * 0.92,
      rx: 4 + nrand(`ors${i}`) * 5,
      ry: 2.5 + nrand(`ory${i}`) * 3,
      rot: (a * 180) / Math.PI + 90,
      kind: i % 3,
    };
  });

  // Ions (K+) rushing OUT of the cell when flaccid
  const ionCount = 12;
  const ions = [...Array(ionCount)].map((_, i) => {
    const a = nrand(`ion${i}`) * Math.PI * 2;
    const phase = ((f * (0.6 + nrand(`iv${i}`))) % 120) / 120;
    const r = interpolate(phase, [0, 1], [vR * 1.1, bulge * 1.5]);
    return { cx: Math.cos(a + phase * 0.6) * r, cy: Math.sin(a + phase * 0.6) * r * 0.85, o: collapse * (1 - phase) };
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <WaterFilters idPrefix={P} />

      {/* Soft glow behind the whole cell */}
      <ellipse cx={0} cy={0} rx={bulge * 1.7} ry={bulge * 1.4} fill="#0E3A2A" opacity={0.5} style={{ filter: "blur(18px)" }} />

      {/* Cellulose wall — double contour, amber-tinted, with microfibril hatching */}
      <polygon points={wallPts.join(" ")} fill="#123524" stroke="#4E7A5C" strokeWidth={7} strokeLinejoin="round" opacity={0.95} />
      <polygon points={wallPts.join(" ")} fill="none" stroke="#8FBF9C" strokeWidth={1.2} strokeDasharray="3 5" opacity={0.4} />

      {/* Plasma membrane — thin, follows wall when turgid, pulls away when flaccid */}
      <g transform={`scale(${1 - collapse * 0.12})`}>
        <polygon points={wallPts.map((p) => { const [px, py] = p.split(","); return `${+px * 0.9},${+py * 0.9}`; }).join(" ")} fill="#1D5B3D" stroke="#7CF7D8" strokeWidth={1.6} opacity={0.85} />

        {/* Cytoplasm ground glass */}
        <polygon points={wallPts.map((p) => { const [px, py] = p.split(","); return `${+px * 0.84},${+py * 0.84}`; }).join(" ")} fill="#2A7A50" opacity={0.55} />

        {/* Central vacuole — glistening water sac that deflates */}
        <polygon points={vPts.join(" ")} fill={`url(#${P}-vacuole)`} stroke="#BDEBFF" strokeWidth={1} strokeOpacity={0.6} filter={`url(#${P}-caustic)`} opacity={0.9} />
        {/* Vacuole specular arc */}
        <path d={`M${-vR * 0.8},${-vR * 0.4} Q0,${-vR * 1.05} ${vR * 0.8},${-vR * 0.4}`} fill="none" stroke="#EAFFFF" strokeWidth={2.4} opacity={0.5 + turgor * 0.3} strokeLinecap="round" />
        <DewBead cx={vR * 0.3} cy={vR * 0.2} r={3.4} idPrefix={P} shimmerSeed="vac" />

        {/* Nucleus with nucleolus and pore dots */}
        <g transform={`translate(${bulge * 0.45} ${bulge * 0.2})`}>
          <circle r={13} fill="#3E9463" stroke="#8FDCAE" strokeWidth={1.2} opacity={0.95} />
          <circle r={13} fill="none" stroke="#0B2417" strokeWidth={2.6} strokeDasharray="1.4 3.4" opacity={0.5} />
          <circle cx={3} cy={-2} r={4.4} fill="#1B4A30" />
          <circle cx={-4} cy={4} r={2.2} fill="#63C68F" opacity={0.7} />
          <ellipse cx={-4} cy={-5} rx={5} ry={2.6} fill="#EAFFF4" opacity={0.35} />
        </g>

        {/* Streaming organelles: chloroplasts (green discs), mitochondria (amber beans) */}
        {organelles.map((o, i) => (
          <g key={i} transform={`translate(${o.cx} ${o.cy}) rotate(${o.rot})`} style={{ filter: "blur(0.4px)" }}>
            {o.kind === 0 ? (
              <>
                <ellipse rx={o.rx} ry={o.ry} fill="#3FA35F" stroke="#1B4A30" strokeWidth={0.6} />
                <line x1={-o.rx * 0.6} y1={0} x2={o.rx * 0.6} y2={0} stroke="#8FE0A8" strokeWidth={0.8} opacity={0.8} />
                <line x1={-o.rx * 0.4} y1={-1.4} x2={o.rx * 0.4} y2={-1.4} stroke="#8FE0A8" strokeWidth={0.5} opacity={0.5} />
              </>
            ) : o.kind === 1 ? (
              <>
                <ellipse rx={o.rx * 0.8} ry={o.ry * 0.9} fill="#C98A4B" opacity={0.9} />
                <path d={`M${-o.rx * 0.5},0 q${o.rx * 0.3},${-2.4} ${o.rx * 0.6},0 q${o.rx * 0.3},${2.4} ${o.rx * 0.5},0`} stroke="#7A4A22" strokeWidth={0.6} fill="none" />
              </>
            ) : (
              <circle r={o.ry * 0.8} fill="#BDEBFF" opacity={0.55} stroke="#7FD3F0" strokeWidth={0.4} />
            )}
          </g>
        ))}
      </g>

      {/* K+ / Cl- ions leaving through channels during water loss */}
      {collapse > 0.05 &&
        ions.map((ion, i) => (
          <g key={i} opacity={ion.o}>
            <circle cx={ion.cx} cy={ion.cy} r={2.2} fill="#C77DFF" />
            <circle cx={ion.cx} cy={ion.cy} r={4.4} fill="none" stroke="#C77DFF" strokeWidth={0.6} opacity={0.4} />
            <text x={ion.cx + 4} y={ion.cy - 3} fontSize={6} fill="#E6CCFF" fontFamily="monospace">K⁺</text>
          </g>
        ))}

      {/* Water arrows out of the cell when flaccid */}
      {collapse > 0.1 &&
        [0, 1, 2].map((i) => {
          const a = -0.5 + i * 0.9;
          const len = bulge * 1.5 + ((f * 1.2 + i * 30) % 40);
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * bulge * 1.1},${Math.sin(a) * bulge * 0.9} L${Math.cos(a) * len},${Math.sin(a) * len * 0.8}`}
              stroke="#7FD3F0"
              strokeWidth={1.4}
              opacity={collapse * 0.5}
              markerEnd="none"
              strokeDasharray="4 4"
            />
          );
        })}

      {/* Rim light top-left, terminator shadow bottom-right for volume */}
      <ellipse cx={-bulge * 0.5} cy={-bulge * 0.6} rx={bulge * 0.7} ry={bulge * 0.32} fill="#EAFFF4" opacity={0.1} style={{ filter: "blur(10px)" }} />
      <ellipse cx={bulge * 0.4} cy={bulge * 0.6} rx={bulge * 0.8} ry={bulge * 0.4} fill="#02100A" opacity={0.3} style={{ filter: "blur(12px)" }} />
    </g>
  );
};
