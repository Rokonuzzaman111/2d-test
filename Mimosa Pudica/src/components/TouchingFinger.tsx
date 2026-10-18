import { useCurrentFrame, interpolate } from "remotion";
import { SkinFilters, wobble, microTremor, nrand } from "./Realism";

/**
 * Photoreal human index finger reaching toward the plant.
 * - anatomically shaped hand silhouette with knuckle creases
 * - fractal-noise skin pores + subsurface warm glow at the tip
 * - keratin fingernail with lunula, free-edge and specular streak
 * - fine hairs on the dorsum, wrinkle lines at the joints
 * - organic approach motion: ease + micro-tremor of real muscle
 * - contact ripples, pressure blush and shadow cast onto leaves
 */
export const TouchingFinger = ({
  x = 800,
  y = 500,
  progress = 0,
  scale = 1,
}: {
  x?: number;
  y?: number;
  progress?: number;
  scale?: number;
}) => {
  const f = useCurrentFrame();
  const P = "tf"; // filter id prefix

  // Approach: slow-in, careful deceleration near contact (human caution)
  const offsetX = interpolate(progress, [0, 0.55, 0.8, 1], [210, 70, 14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(progress, [0, 0.15, 0.95, 1], [0, 1, 1, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Muscle micro-tremor — vertical drift + tiny rotation
  const tremY = microTremor(f, 0.9, "fingerY");
  const tremR = microTremor(f, 0.35, "fingerR");
  // Press-in squash once contact happens
  const press = interpolate(progress, [0.86, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breath = wobble(f, 0.4, 2) * 1.2;

  const skinHl = "#F3CBA8";
  const skinMid = "#DDA07B";
  const skinShade = "#A96C4C";
  const crease = "#8A5238";

  return (
    <g
      transform={`translate(${x + offsetX} ${y + tremY + breath}) rotate(${tremR}) scale(${scale})`}
      opacity={opacity}
    >
      <SkinFilters idPrefix={P} />

      {/* Cast shadow of the hand falling onto the foliage below */}
      <ellipse cx={-20} cy={26 + press * 4} rx={78} ry={16} fill="#03120a" opacity={0.28} style={{ filter: "blur(7px)" }} />

      {/* Forearm fading out of frame with hair strands */}
      <path
        d="M158,-26 Q120,-30 92,-24 L92,24 Q120,30 158,27 Z"
        fill={`url(#${P}-skinBase)`}
      />
      {[...Array(9)].map((_, i) => {
        const hx = 100 + nrand(`hair${i}`) * 52;
        const hy = -18 + nrand(`hairY${i}`) * 36;
        return (
          <path
            key={i}
            d={`M${hx},${hy} q4,${2 + (i % 3)} 9,${1 + (i % 2)}`}
            stroke="#5d3b26"
            strokeWidth={0.7}
            fill="none"
            opacity={0.35}
          />
        );
      })}

      {/* Palm / back of hand mass */}
      <path
        d={`M92,-24 Q60,-34 34,-26 Q6,-18 -2,-6 L-2,10 Q8,24 34,28 Q62,32 92,24 Z`}
        fill={`url(#${P}-skinBase)`}
        filter={`url(#${P}-pores)`}
      />
      {/* Knuckle shading bumps */}
      <ellipse cx={40} cy={-20} rx={13} ry={7} fill={skinHl} opacity={0.35} style={{ filter: "blur(4px)" }} />
      <ellipse cx={62} cy={-23} rx={12} ry={6} fill={skinHl} opacity={0.3} style={{ filter: "blur(4px)" }} />
      <ellipse cx={48} cy={24} rx={16} ry={7} fill={skinShade} opacity={0.4} style={{ filter: "blur(5px)" }} />

      {/* Folded middle/ring/pinky fingers peeking under the index */}
      <path d="M6,12 Q-16,16 -30,24 Q-18,32 2,28 Z" fill={skinShade} opacity={0.9} filter={`url(#${P}-pores)`} />
      <path d="M14,18 Q-4,24 -16,32 Q-4,38 12,32 Z" fill="#9A5F42" opacity={0.85} />
      {/* crease lines between folded fingers */}
      <path d="M-2,20 q10,3 20,2 M2,26 q9,3 18,2" stroke={crease} strokeWidth={0.8} fill="none" opacity={0.5} />

      {/* Thumb edge hint */}
      <path d="M30,-24 Q14,-30 4,-22 Q10,-12 28,-14 Z" fill={skinMid} filter={`url(#${P}-pores)`} />

      {/* INDEX FINGER — elongated tapered shape with 3 segments */}
      <g transform={`scale(1 ${1 - press * 0.06})`}>
        {/* proximal + middle + distal phalanx silhouette */}
        <path
          d={`M34,-16 Q6,-18 -14,-14 Q-34,-11 -48,-8
              Q-58,-5 -58,0 Q-58,5 -48,8
              Q-34,11 -14,14 Q6,18 34,16 Z`}
          fill={`url(#${P}-skinTip)`}
          filter={`url(#${P}-pores)`}
        />
        {/* top-lit highlight along the finger */}
        <path
          d="M30,-12 Q0,-14 -30,-8 Q-10,-15 30,-12 Z"
          fill={skinHl}
          opacity={0.55}
          style={{ filter: "blur(2.5px)" }}
        />
        {/* underside terminator shadow */}
        <path
          d="M32,14 Q-2,17 -40,10 Q-2,19 34,17 Z"
          fill="#7c4a31"
          opacity={0.5}
          style={{ filter: "blur(3px)" }}
        />
        {/* DIP joint crease ring */}
        <path d="M-33,-9 q-3,9 0,18" stroke={crease} strokeWidth={1} fill="none" opacity={0.55} />
        <path d="M-36,-8 q-3,8 0,16" stroke={crease} strokeWidth={0.6} fill="none" opacity={0.35} />
        {/* PIP joint creases */}
        <path d="M2,-15 q-2,15 0,30 M7,-15 q-1,13 1,28" stroke={crease} strokeWidth={0.8} fill="none" opacity={0.4} />
        {/* fingerprint pad — concentric ridge arcs at the very tip */}
        {[...Array(5)].map((_, i) => (
          <path
            key={i}
            d={`M${-50 + i},${-4 + i * 0.6} q${-6 + i},4 0,${8 - i * 0.8}`}
            stroke="#B97A57"
            strokeWidth={0.5}
            fill="none"
            opacity={0.4 - i * 0.05}
          />
        ))}
        {/* FINGERNAIL */}
        <g transform="translate(-46,-4) rotate(-8)">
          <path
            d="M-9,-6 Q-2,-11 8,-8 Q12,-3 9,5 Q2,9 -7,6 Q-11,0 -9,-6 Z"
            fill={`url(#${P}-nail)`}
            stroke="#C9A184"
            strokeWidth={0.5}
          />
          {/* lunula crescent */}
          <path d="M-6,3 Q0,7 7,4 Q1,8 -6,3 Z" fill="#FFFFFF" opacity={0.5} />
          {/* longitudinal nail ridges */}
          <path d="M-7,-3 Q0,-6 8,-4 M-8,0 Q0,-3 9,-1" stroke="#E4C6AE" strokeWidth={0.4} fill="none" opacity={0.6} />
          {/* sharp specular streak that shifts with light angle */}
          <ellipse
            cx={-1 + Math.sin(f / 90) * 2}
            cy={-2}
            rx={5}
            ry={1.6}
            fill="#FFF6EC"
            opacity={0.75}
            style={{ filter: "blur(0.8px)" }}
          />
        </g>
        {/* subsurface warmth where flesh presses leaf */}
        <ellipse cx={-54} cy={2} rx={9} ry={7} fill={`url(#${P}-subsurface)`} opacity={press * 0.9} />
        {/* pressure blush ring at contact */}
        <ellipse cx={-58} cy={0} rx={4 + press * 3} ry={3 + press * 2} fill="#FF8A66" opacity={press * 0.35} style={{ filter: "blur(2px)" }} />
      </g>

      {/* Touch ripple + spark particles when contact occurs */}
      {progress > 0.8 && (
        <g opacity={interpolate(progress, [0.8, 0.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          {[0, 1, 2].map((i) => {
            const cyc = (f * 1.4 + i * 12) % 36;
            return (
              <circle
                key={i}
                cx={-64}
                cy={0}
                r={6 + cyc * 1.5}
                fill="none"
                stroke="#7CF7D8"
                strokeWidth={1.6 - cyc * 0.03}
                opacity={Math.max(0, 0.55 - cyc * 0.015)}
              />
            );
          })}
          {[...Array(7)].map((_, i) => {
            const a = nrand(`spk${i}`) * Math.PI * 2;
            const d = 8 + ((f * 0.9 + i * 7) % 26);
            const o = Math.max(0, 0.8 - d / 34);
            return (
              <circle
                key={i}
                cx={-64 + Math.cos(a) * d}
                cy={Math.sin(a) * d * 0.6}
                r={1.1}
                fill="#BFFFF0"
                opacity={o}
              />
            );
          })}
        </g>
      )}
    </g>
  );
};
