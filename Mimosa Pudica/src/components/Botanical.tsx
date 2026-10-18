import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { colors } from "../styles/theme";

/* ------------------------------------------------------------------ */
/*  Small math helpers                                                 */
/* ------------------------------------------------------------------ */
const RAD = Math.PI / 180;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
    const c = clamp01(t);
    return c * c * (3 - 2 * c);
};
/** deterministic pseudo random (Remotion needs frame-pure rendering) */
export const rnd = (n: number) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
};
const r2 = (n: number) => Math.round(n * 100) / 100;

const P = {
    leafLightA: "#6fcf55",
    leafLightB: "#b9f08a",
    leafDarkA: "#26803d",
    leafDarkB: "#5db853",
    rib: "#1f5a2c",
    pin: "#4f8a35",
    petiole: "#6c9a3a",
};

/* ------------------------------------------------------------------ */
/*  Texture helpers — deterministic, frame-pure noise fields           */
/* ------------------------------------------------------------------ */
/** hash-based value noise in 0..1 (stable for a given seed) */
export const vnoise = (seed: number) => {
    const s = Math.sin(seed * 78.233 + 12.161) * 43758.5453;
    return s - Math.floor(s);
};
/** speckle overlay: tiny translucent dots that fake surface micro-texture */
export const Speckles = ({
    count,
    w,
    h,
    color = "#000",
    maxOpacity = 0.16,
    rMax = 1.6,
    seed = 0,
}: {
    count: number;
    w: number;
    h: number;
    color?: string;
    maxOpacity?: number;
    rMax?: number;
    seed?: number;
}) => (
    <g>
        {Array.from({ length: count }, (_, i) => (
            <circle
                key={i}
                cx={(vnoise(i * 1.31 + seed) - 0.5) * w}
                cy={(vnoise(i * 2.71 + seed + 17) - 0.5) * h}
                r={0.4 + vnoise(i * 3.17 + seed + 41) * rMax}
                fill={color}
                opacity={maxOpacity * vnoise(i * 5.13 + seed + 83)}
            />
        ))}
    </g>
);

/* ------------------------------------------------------------------ */
/*  Gradient definitions shared by plant parts                         */
/* ------------------------------------------------------------------ */
export const LeafDefs = ({ p }: { p: string }) => (
    <defs>
        <linearGradient id={`${p}-lu`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor={P.leafLightA} />
            <stop offset="1" stopColor={P.leafLightB} />
        </linearGradient>
        <linearGradient id={`${p}-ld`} x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor={P.leafDarkA} />
            <stop offset="1" stopColor={P.leafDarkB} />
        </linearGradient>
        <linearGradient id={`${p}-stem`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f3320" />
            <stop offset="0.42" stopColor="#9a8650" />
            <stop offset="1" stopColor="#40612c" />
        </linearGradient>
        <radialGradient id={`${p}-pom`} cx="0.4" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#ffe3f1" />
            <stop offset="0.6" stopColor="#f59ccb" />
            <stop offset="1" stopColor="#d6428f" />
        </radialGradient>
        <radialGradient id={`${p}-glow`}>
            <stop offset="0" stopColor={colors.glow} stopOpacity={0.55} />
            <stop offset="1" stopColor={colors.glow} stopOpacity={0} />
        </radialGradient>
    </defs>
);

/* ------------------------------------------------------------------ */
/*  Leaflet / pinna                                                    */
/* ------------------------------------------------------------------ */
const leafPath = (L: number) => {
    const w = L * 0.27;
    return `M0,0 C${r2(L * 0.18)},${r2(-w * 1.2)} ${r2(L * 0.7)},${r2(-w * 1.2)} ${r2(L)},0 C${r2(L * 0.7)},${r2(w * 1.2)} ${r2(L * 0.18)},${r2(w * 1.2)} 0,0Z`;
};

/** One leaflet: lanceolate blade with midrib, pinnate lateral veins,
 *  a translucent edge rim-light and a soft specular sheen */
const Leaflet = ({
    L,
    up,
    p,
    seed,
}: {
    L: number;
    /** true = upper (lighter) leaflet of the pair */
    up: boolean;
    p: string;
    seed: number;
}) => {
    const w = L * 0.27;
    const veinN = Math.max(3, Math.round(L / 6));
    return (
        <g>
            <path
                d={leafPath(L)}
                fill={`url(#${up ? p + "-lu" : p + "-ld"})`}
                stroke={P.rib}
                strokeOpacity={0.35}
                strokeWidth={0.6}
            />
            {/* midrib — slightly curved, tapered */}
            <path
                d={`M0,0 Q${r2(L * 0.5)},${r2(up ? -0.8 : 0.8)} ${r2(L * 0.92)},0`}
                stroke={P.rib}
                strokeOpacity={0.5}
                strokeWidth={0.7}
                fill="none"
            />
            {/* lateral veins branching off the midrib at realistic angles */}
            {Array.from({ length: veinN }, (_, j) => {
                const vt = 0.12 + (j / veinN) * 0.78;
                const vx = L * vt;
                const spread = Math.sin(vt * Math.PI) * w * 0.85;
                const jitter = (vnoise(j + seed) - 0.5) * 2;
                return (
                    <g key={j} opacity={0.32}>
                        <line
                            x1={vx}
                            y1={0}
                            x2={r2(vx + L * 0.09)}
                            y2={r2(-spread + jitter)}
                            stroke={P.rib}
                            strokeWidth={0.42}
                        />
                        <line
                            x1={vx}
                            y1={0}
                            x2={r2(vx + L * 0.09)}
                            y2={r2(spread + jitter)}
                            stroke={P.rib}
                            strokeWidth={0.42}
                        />
                    </g>
                );
            })}
            {/* rim light along one edge (backlit look) */}
            <path
                d={`M${r2(L * 0.06)},${r2(-w * 0.9)} Q${r2(L * 0.55)},${r2(-w * 1.12)} ${r2(L * 0.9)},${r2(-w * 0.25)}`}
                stroke="#eafff0"
                strokeOpacity={up ? 0.35 : 0.2}
                strokeWidth={0.7}
                fill="none"
            />
            {/* specular sheen blob */}
            <ellipse
                cx={L * 0.42}
                cy={-w * 0.28}
                rx={L * 0.2}
                ry={w * 0.22}
                fill="#ffffff"
                opacity={up ? 0.1 : 0.06}
            />
        </g>
    );
};

/** One pinna: a thin stalk with pairs of leaflets that really fold forward */
export const Pinna = ({
    len,
    n,
    fold,
    p,
    sway = 0,
}: {
    len: number;
    n: number;
    fold: number;
    p: string;
    sway?: number;
}) => {
    const a = lerp(74, 8, fold);
    const items: ReactNode[] = [];
    for (let i = 0; i < n; i++) {
        const t = (i + 0.6) / (n + 0.1);
        const L = 21 * (1 - 0.45 * t) + 2;
        items.push(
            <g key={i} transform={`translate(${r2(t * len)} 0)`}>
                <g transform={`rotate(${r2(a)})`}>
                    <Leaflet L={L} up={false} p={p} seed={i * 7 + 3} />
                </g>
                <g transform={`rotate(${r2(-a)})`}>
                    <Leaflet L={L} up p={p} seed={i * 7} />
                </g>
            </g>,
        );
    }
    return (
        <g transform={`rotate(${r2(sway)})`}>
            {/* rachis with a lighter highlight line on top */}
            <path
                d={`M0,0 Q${r2(len / 2)},-2 ${r2(len)},1`}
                stroke={P.pin}
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
            />
            <path
                d={`M2,-0.8 Q${r2(len / 2)},-2.8 ${r2(len - 2)},0.2`}
                stroke="#a9d17e"
                strokeWidth={0.7}
                strokeOpacity={0.5}
                fill="none"
                strokeLinecap="round"
            />
            {items}
            <g transform={`translate(${r2(len - 1)} 0)`}>
                <Leaflet L={14} up p={p} seed={n * 13 + 5} />
            </g>
        </g>
    );
};

const OPEN_OFF = [-58, -20, 18, 56];
const SHUT_OFF = [-13, -4.5, 4.5, 13];
const LEN_K = [0.78, 1, 1, 0.8];

/** A fan of four pinnae – use it as a small single leaf (pointing along +x) */
export const LeafSprig = ({
    fold = 0,
    scale = 1,
    p = "sp",
    sway = 0,
}: {
    fold?: number;
    scale?: number;
    p?: string;
    sway?: number;
}) => (
    <g transform={`scale(${scale})`}>
        <LeafDefs p={p} />
        {OPEN_OFF.map((o, k) => (
            <g key={k} transform={`rotate(${r2(lerp(o, SHUT_OFF[k], fold))})`}>
                <Pinna len={80 * LEN_K[k]} n={7} fold={fold} p={p} sway={sway} />
            </g>
        ))}
    </g>
);

/* ------------------------------------------------------------------ */
/*  Mimosa plant geometry                                              */
/* ------------------------------------------------------------------ */
export const MIMOSA_H = 430;
export const stemX = (h: number) =>
    Math.sin((h / MIMOSA_H) * Math.PI * 1.6) * 9;

type BranchDef = { h: number; side: 1 | -1; lp: number; pin: number; n: number };
export const BRANCHES: BranchDef[] = [
    { h: 392, side: 1, lp: 62, pin: 78, n: 7 },
    { h: 352, side: -1, lp: 66, pin: 84, n: 7 },
    { h: 300, side: 1, lp: 76, pin: 92, n: 8 },
    { h: 252, side: -1, lp: 80, pin: 94, n: 8 },
    { h: 202, side: 1, lp: 84, pin: 94, n: 8 },
    { h: 158, side: -1, lp: 86, pin: 92, n: 8 },
];
const openAngle = (i: number) => -40 + i * 7;
/** lower branches droop less so folded leaves never sink into the soil */
const shutAngle = (i: number) => 72 - i * 5;

const FLOWERS = [
    { x: -6, y: -488, r: 17, sx: -8.6, sy: -430 },
    { x: -32, y: -468, r: 13, sx: -8.6, sy: -420 },
];

export const mimosaTip = (x: number, y: number, s: number, bi = 0, k = 1) => {
    const b = BRANCHES[bi];
    const th = openAngle(bi) * RAD;
    const ex = stemX(b.h) + b.side * b.lp * Math.cos(th);
    const ey = -b.h + b.lp * Math.sin(th);
    const a2 = th + OPEN_OFF[k] * RAD;
    const L = b.pin * LEN_K[k] + 8;
    return {
        x: x + (ex + b.side * L * Math.cos(a2)) * s,
        y: y + (ey + L * Math.sin(a2)) * s,
    };
};
export const mimosaAttach = (x: number, y: number, s: number, bi: number) => {
    const b = BRANCHES[bi];
    return { x: x + stemX(b.h) * s, y: y - b.h * s };
};
export const mimosaStemPoint = (x: number, y: number, s: number, h: number) => ({
    x: x + stemX(h) * s,
    y: y - h * s,
});
export const mimosaFlower = (x: number, y: number, s: number, i = 0) => ({
    x: x + FLOWERS[i].x * s,
    y: y + FLOWERS[i].y * s,
});
/** Path of an electrical signal: touched leaflet → petiole → down the stem */
export const mimosaRoute = (x: number, y: number, s: number) => {
    const b = BRANCHES[0];
    const tip = mimosaTip(x, y, s, 0, 1);
    const th = openAngle(0) * RAD;
    const ex = x + (stemX(b.h) + b.side * b.lp * Math.cos(th)) * s;
    const ey = y + (-b.h + b.lp * Math.sin(th)) * s;
    let d = `M${r2(tip.x)},${r2(tip.y)} L${r2(ex)},${r2(ey)}`;
    for (let h = b.h; h >= 0; h -= 24) {
        d += ` L${r2(x + stemX(h) * s)},${r2(y - h * s)}`;
    }
    return d;
};

/* stem silhouette (tapered) */
const STEM_PATH = (() => {
    const left: string[] = [];
    const right: string[] = [];
    for (let h = 0; h <= MIMOSA_H; h += 14) {
        const w = lerp(13, 4, h / MIMOSA_H) / 2;
        left.push(`${r2(stemX(h) - w)},${-h}`);
        right.push(`${r2(stemX(h) + w)},${-h}`);
    }
    return `M${left.join(" L")} L${right.reverse().join(" L")}Z`;
})();

const PomPom = ({
    cx,
    cy,
    r,
    f,
    seed,
    p,
}: {
    cx: number;
    cy: number;
    r: number;
    f: number;
    seed: number;
    p: string;
}) => {
    const rays = 42;
    return (
        <g transform={`translate(${cx} ${cy}) rotate(${r2(Math.sin(f / 50 + seed) * 3)})`}>
            {/* soft bloom around the flower head */}
            <circle r={r * 2.1} fill="#ff9bd0" opacity={0.07} />
            <circle r={r * 1.35} fill="#ff9bd0" opacity={0.12} />
            {/* dark centre mass so depth reads correctly */}
            <circle r={r * 0.86} fill="#b93576" opacity={0.55} />
            <circle r={r * 0.82} fill={`url(#${p}-pom)`} />
            {Array.from({ length: rays }, (_, i) => {
                const a = (i / rays) * Math.PI * 2 + seed;
                const len = r * (0.95 + 0.3 * rnd(i + seed * 9));
                const c = Math.cos(a);
                const s = Math.sin(a);
                return (
                    <g key={i}>
                        {/* stalk with slight curvature for a thread-like look */}
                        <path
                            d={`M${r2(c * r * 0.3)},${r2(s * r * 0.3)} Q${r2(c * len * 0.6 - s * 2)},${r2(s * len * 0.6 + c * 2)} ${r2(c * len)},${r2(s * len)}`}
                            stroke="#f8aad5"
                            strokeWidth={1.25}
                            strokeLinecap="round"
                            fill="none"
                            opacity={0.9}
                        />
                        <path
                            d={`M${r2(c * len * 0.55)},${r2(s * len * 0.55)} L${r2(c * len)},${r2(s * len)}`}
                            stroke="#ffd6ec"
                            strokeWidth={0.6}
                            strokeLinecap="round"
                            opacity={0.7}
                        />
                        {/* stamen tip + anther dot */}
                        <circle cx={c * len} cy={s * len} r={1.7} fill="#ffe9a8" />
                        <circle cx={c * (len + 1.4)} cy={s * (len + 1.4)} r={0.7} fill="#fff8e2" opacity={0.9} />
                    </g>
                );
            })}
            {/* top highlight */}
            <ellipse cx={-r * 0.28} cy={-r * 0.4} rx={r * 0.34} ry={r * 0.18} fill="#fff" opacity={0.22} />
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Mimosa pudica                                                      */
/* ------------------------------------------------------------------ */
export const RealMimosa = ({
    x,
    y,
    scale = 1,
    foldProgress = 0,
    showGlow = false,
    cascade = false,
    flowers = true,
    idPrefix = "mp",
    opacity = 1,
}: {
    x: number;
    y: number;
    scale?: number;
    foldProgress?: number;
    showGlow?: boolean;
    /** when true leaves fold one after the other, starting from the top */
    cascade?: boolean;
    flowers?: boolean;
    idPrefix?: string;
    opacity?: number;
}) => {
    const f = useCurrentFrame();
    const p = idPrefix;
    const N = BRANCHES.length;
    const foldFor = (i: number) => {
        if (!cascade) return smooth(foldProgress);
        const d = 0.1;
        return smooth(clamp01(foldProgress * (1 + d * (N - 1)) - i * d));
    };
    const globalFold = smooth(foldProgress);
    const plantSway = Math.sin(f / 55) * 0.5 * (1 - globalFold);

    const order = BRANCHES.map((_, i) => i).reverse();

    return (
        <g
            transform={`translate(${x} ${y}) rotate(${r2(plantSway)}) scale(${scale})`}
            opacity={opacity}
        >
            <LeafDefs p={p} />

            {showGlow && (
                <circle
                    cx={0}
                    cy={-300}
                    r={280}
                    fill={`url(#${p}-glow)`}
                    opacity={0.55 + 0.25 * Math.sin(f / 5)}
                />
            )}

            {/* stem: silhouette + bark highlight, shadow groove and speckles */}
            <path d={STEM_PATH} fill={`url(#${p}-stem)`} />
            <path
                d={(() => {
                    const pts: string[] = [];
                    for (let h = 6; h <= MIMOSA_H - 10; h += 14) {
                        pts.push(`${r2(stemX(h) - lerp(13, 4, h / MIMOSA_H) * 0.22)},${-h}`);
                    }
                    return `M${pts.join(" L")}`;
                })()}
                stroke="#e8d9a8"
                strokeOpacity={0.28}
                strokeWidth={1.6}
                fill="none"
                strokeLinecap="round"
            />
            <path
                d={(() => {
                    const pts: string[] = [];
                    for (let h = 6; h <= MIMOSA_H - 10; h += 14) {
                        pts.push(`${r2(stemX(h) + lerp(13, 4, h / MIMOSA_H) * 0.3)},${-h}`);
                    }
                    return `M${pts.join(" L")}`;
                })()}
                stroke="#1c1206"
                strokeOpacity={0.3}
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
            />
            <g opacity={0.5}>
                <Speckles count={46} w={16} h={MIMOSA_H} color="#241708" maxOpacity={0.35} rMax={1.1} seed={9} />
            </g>
            {/* fine hairs along the stem edges (Mimosa pudica is prickly-hairy) */}
            {Array.from({ length: 22 }, (_, i) => {
                const h = 18 + i * 19;
                const s = i % 2 === 0 ? 1 : -1;
                const half = lerp(13, 4, h / MIMOSA_H) / 2;
                const len = 3.5 + vnoise(i * 3.3) * 3;
                return (
                    <line
                        key={`hair-${i}`}
                        x1={r2(stemX(h) + s * half)}
                        y1={-h}
                        x2={r2(stemX(h) + s * (half + len))}
                        y2={r2(-h - len * 0.7)}
                        stroke="#cbb37a"
                        strokeWidth={0.7}
                        strokeOpacity={0.55}
                        strokeLinecap="round"
                    />
                );
            })}
            {/* thorns — paired, shaded, with sharp tips */}
            {Array.from({ length: 9 }, (_, i) => {
                const h = 45 + i * 42;
                const s = i % 2 === 0 ? 1 : -1;
                const sx = stemX(h);
                return (
                    <g key={i}>
                        <path
                            d={`M${r2(sx)},${-h} L${r2(sx + s * 9)},${r2(-h + 4.5)} L${r2(sx)},${-h + 4}Z`}
                            fill="#c8ab60"
                        />
                        <path
                            d={`M${r2(sx)},${-h} L${r2(sx + s * 9)},${r2(-h + 4.5)} L${r2(sx + s * 4)},${r2(-h + 3.2)}Z`}
                            fill="#8a6f38"
                            opacity={0.8}
                        />
                        <path
                            d={`M${r2(sx)},${r2(-h - 3)} L${r2(sx + s * 7)},${r2(-h - 6)} L${r2(sx)},${r2(-h - 1)}Z`}
                            fill="#b79e55"
                            opacity={0.85}
                        />
                    </g>
                );
            })}

            {/* branches (lower first so upper leaves overlap) */}
            {order.map((i) => {
                const b = BRANCHES[i];
                const fo = foldFor(i);
                const sway = Math.sin(f / 42 + i * 1.7) * 2.2 * (1 - fo);
                const th = lerp(openAngle(i), shutAngle(i), fo) + sway;
                return (
                    <g key={i}>
                        <circle cx={stemX(b.h)} cy={-b.h} r={4.2} fill="#8a7a45" />
                        <g
                            transform={`translate(${r2(stemX(b.h))} ${-b.h}) scale(${b.side} 1) rotate(${r2(th)})`}
                        >
                            <path
                                d={`M0,0 Q${r2(b.lp * 0.5)},${r2(-6 + fo * 14)} ${b.lp},0`}
                                stroke={P.petiole}
                                strokeWidth={4.4}
                                strokeLinecap="round"
                                fill="none"
                            />
                            <g transform={`translate(${b.lp} 0)`}>
                                {OPEN_OFF.map((o, k) => (
                                    <g key={k} transform={`rotate(${r2(lerp(o, SHUT_OFF[k], fo))})`}>
                                        <Pinna
                                            len={b.pin * LEN_K[k]}
                                            n={b.n}
                                            fold={fo}
                                            p={p}
                                            sway={Math.sin(f / 33 + i + k) * 1.4 * (1 - fo)}
                                        />
                                    </g>
                                ))}
                            </g>
                        </g>
                    </g>
                );
            })}

            {/* flowers */}
            {flowers &&
                FLOWERS.map((fl, i) => (
                    <g key={i}>
                        <path
                            d={`M${fl.sx},${fl.sy} Q${r2((fl.sx + fl.x) / 2 - 4)},${r2((fl.sy + fl.y) / 2)} ${fl.x},${fl.y + fl.r * 0.6}`}
                            stroke="#7aa44a"
                            strokeWidth={2.2}
                            fill="none"
                            strokeLinecap="round"
                        />
                        <PomPom cx={fl.x} cy={fl.y} r={fl.r} f={f} seed={i + 1} p={p} />
                    </g>
                ))}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Ground, grass, light and ambience                                  */
/* ------------------------------------------------------------------ */
export const Ground = ({
    x,
    y,
    w = 700,
    layer = "back",
    id = "gr",
}: {
    x: number;
    y: number;
    w?: number;
    layer?: "back" | "front";
    id?: string;
}) => {
    const f = useCurrentFrame();
    const greens = ["#2a7a3a", "#3f9a46", "#6cc152", "#1f6a36"];
    const count = layer === "back" ? 26 : 34;
    return (
        <g transform={`translate(${x} ${y})`}>
            {layer === "back" && (
                <>
                    <defs>
                        <radialGradient id={`${id}-soil`} cx="0.5" cy="0.35" r="0.7">
                            <stop offset="0" stopColor="#4a3524" />
                            <stop offset="1" stopColor="#150f0a" />
                        </radialGradient>
                        <linearGradient id={`${id}-moss`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#3f7a3c" stopOpacity={0.5} />
                            <stop offset="1" stopColor="#1c3d22" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <ellipse cx={0} cy={14} rx={w / 2} ry={34} fill={`url(#${id}-soil)`} />
                    {/* mossy sheen along the top of the soil mound */}
                    <ellipse cx={-w * 0.12} cy={-2} rx={w * 0.3} ry={9} fill={`url(#${id}-moss)`} />
                    <ellipse cx={0} cy={4} rx={70} ry={11} fill="#000" opacity={0.35} />
                    {/* contact shadow — tighter and darker right under the stem */}
                    <ellipse cx={2} cy={2} rx={26} ry={5.5} fill="#000" opacity={0.45} />
                    {/* soil clumps with their own mini highlight */}
                    {Array.from({ length: 14 }, (_, i) => {
                        const px = (rnd(i + 3) - 0.5) * w * 0.8;
                        const py = 8 + rnd(i + 30) * 24;
                        const rx = 4 + rnd(i + 60) * 6;
                        const ry = 2.5 + rnd(i + 80) * 3;
                        return (
                            <g key={i}>
                                <ellipse cx={px} cy={py} rx={rx} ry={ry} fill="#6b5a44" opacity={0.55} />
                                <ellipse
                                    cx={px - rx * 0.25}
                                    cy={py - ry * 0.4}
                                    rx={rx * 0.5}
                                    ry={ry * 0.35}
                                    fill="#8a7458"
                                    opacity={0.4}
                                />
                            </g>
                        );
                    })}
                    {/* small pebbles catching light */}
                    {Array.from({ length: 6 }, (_, i) => {
                        const px = (rnd(i + 140) - 0.5) * w * 0.7;
                        const py = 16 + rnd(i + 160) * 18;
                        const pr = 2.5 + rnd(i + 180) * 3;
                        return (
                            <g key={`pebble-${i}`}>
                                <ellipse cx={px} cy={py} rx={pr} ry={pr * 0.72} fill="#7d7365" opacity={0.75} />
                                <ellipse cx={px - pr * 0.3} cy={py - pr * 0.3} rx={pr * 0.4} ry={pr * 0.22} fill="#fff" opacity={0.18} />
                            </g>
                        );
                    })}
                    {/* dry leaf litter at the edges of the mound */}
                    {Array.from({ length: 4 }, (_, i) => {
                        const px = (rnd(i + 210) - 0.5) * w * 0.85;
                        const py = 20 + rnd(i + 230) * 12;
                        const rot = (rnd(i + 250) - 0.5) * 60;
                        return (
                            <path
                                key={`lit-${i}`}
                                d="M0,0 Q7,-4 15,0 Q7,4 0,0Z"
                                transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(rot)}) scale(${0.8 + rnd(i + 270) * 0.6})`}
                                fill="#7a5c33"
                                opacity={0.5}
                            />
                        );
                    })}
                </>
            )}
            {Array.from({ length: count }, (_, i) => {
                const bx = (rnd(i + (layer === "back" ? 100 : 200)) - 0.5) * w * 0.94;
                const h = (layer === "back" ? 34 : 22) + rnd(i + 50) * 48;
                const lean = (rnd(i + 9) - 0.5) * 30;
                const sw = Math.sin(f / 32 + i * 0.7) * 5;
                const by = layer === "back" ? 4 : 14 + rnd(i + 5) * 10;
                const tipX = bx + lean + sw;
                const tipY = by - h;
                return (
                    <g key={i}>
                        <path
                            d={`M${r2(bx - 2.2)},${by} Q${r2(bx - 1 + lean * 0.3 + sw * 0.4)},${r2(by - h * 0.55)} ${r2(tipX)},${r2(tipY)} Q${r2(bx + 2 + lean * 0.3 + sw * 0.4)},${r2(by - h * 0.5)} ${r2(bx + 2.2)},${by}Z`}
                            fill={greens[i % greens.length]}
                            opacity={layer === "back" ? 0.85 : 1}
                        />
                        {/* centre fold line for depth */}
                        <path
                            d={`M${r2(bx)},${r2(by - 1)} Q${r2(bx + lean * 0.35 + sw * 0.3)},${r2(by - h * 0.55)} ${r2(tipX)},${r2(tipY + 2)}`}
                            stroke="#0e2a16"
                            strokeOpacity={0.25}
                            strokeWidth={0.8}
                            fill="none"
                        />
                        {/* sunlit edge on one side of the blade */}
                        <path
                            d={`M${r2(bx + 1.6)},${r2(by - 2)} Q${r2(bx + 1.2 + lean * 0.3 + sw * 0.4)},${r2(by - h * 0.55)} ${r2(tipX)},${r2(tipY + 1)}`}
                            stroke="#a5e07a"
                            strokeOpacity={0.35}
                            strokeWidth={0.9}
                            fill="none"
                        />
                    </g>
                );
            })}
        </g>
    );
};

export const Fireflies = ({
    count = 14,
    w = 1080,
    h = 900,
    seed = 1,
    color = colors.sunlight,
}: {
    count?: number;
    w?: number;
    h?: number;
    seed?: number;
    color?: string;
}) => {
    const f = useCurrentFrame();
    return (
        <g>
            {Array.from({ length: count }, (_, i) => {
                const bx = rnd(i * 3 + seed) * w;
                const by = rnd(i * 5 + seed + 7) * h;
                // two-frequency wander = organic, non-repetitive flight path
                const x =
                    bx +
                    Math.sin(f / 70 + i * 1.9) * 30 +
                    Math.sin(f / 31 + i) * 8 +
                    Math.cos(f / 123 + i * 0.6) * 14;
                const y =
                    by +
                    Math.cos(f / 90 + i * 2.3) * 24 +
                    Math.sin(f / 47 + i * 1.1) * 6;
                // flicker with a soft double pulse so blinks feel insect-like
                const tw =
                    clamp01(
                        0.3 +
                            0.7 * Math.max(0, Math.sin(f / 18 + i * 1.7)) * (0.6 + 0.4 * Math.sin(f / 5 + i)),
                    ) *
                    (0.5 + 0.5 * Math.sin(f / 61 + i * 2));
                const glowR = 13 + 3 * Math.sin(f / 12 + i);
                return (
                    <g key={i} opacity={tw}>
                        {/* layered bloom */}
                        <circle cx={x} cy={y} r={glowR * 1.7} fill={color} opacity={0.06} />
                        <circle cx={x} cy={y} r={glowR} fill={color} opacity={0.16} />
                        <circle cx={x} cy={y} r={5} fill="#fff6c8" opacity={0.35} />
                        <circle cx={x} cy={y} r={2.6} fill="#fffbe0" />
                        {/* tiny cross flare on the brightest blink */}
                        {tw > 0.85 && (
                            <g stroke="#fff6c8" strokeWidth={0.8} opacity={0.6} strokeLinecap="round">
                                <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
                                <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
                            </g>
                        )}
                    </g>
                );
            })}
        </g>
    );
};

export const LightRays = ({
    opacity = 0.4,
    h = 900,
}: {
    opacity?: number;
    h?: number;
}) => {
    const f = useCurrentFrame();
    const rays = [
        { x: 900, wd: 90, a: 0.9 },
        { x: 760, wd: 50, a: 0.6 },
        { x: 1020, wd: 120, a: 0.7 },
        { x: 640, wd: 36, a: 0.45 },
        { x: 840, wd: 24, a: 0.35 },
    ];
    return (
        <g opacity={opacity}>
            <defs>
                <linearGradient id="rayG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={colors.sunlight} stopOpacity={0.35} />
                    <stop offset="1" stopColor={colors.sunlight} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rayCore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#fff3cf" stopOpacity={0.3} />
                    <stop offset="1" stopColor="#fff3cf" stopOpacity={0} />
                </linearGradient>
            </defs>
            {rays.map((r, i) => {
                // slow independent breathing per shaft + slight lateral drift
                const sh = Math.sin(f / 90 + i * 2) * 0.25 + 0.75;
                const dx = Math.sin(f / 210 + i * 1.3) * 10;
                return (
                    <g key={i}>
                        <polygon
                            points={`${r.x + dx},0 ${r.x + r.wd + dx},0 ${r.x + r.wd - 480},${h} ${r.x - r.wd * 0.2 - 480},${h}`}
                            fill="url(#rayG)"
                            opacity={r.a * sh}
                        />
                        {/* brighter narrow core inside each shaft */}
                        <polygon
                            points={`${r.x + dx + r.wd * 0.35},0 ${r.x + dx + r.wd * 0.6},0 ${r.x + r.wd * 0.1 - 480},${h} ${r.x - r.wd * 0.05 - 480},${h}`}
                            fill="url(#rayCore)"
                            opacity={r.a * sh * 0.5}
                        />
                    </g>
                );
            })}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Hand with extended index finger (tip is at 0,0 when progress = 1)  */
/* ------------------------------------------------------------------ */
export const Hand = ({
    x,
    y,
    progress,
    pulse = 0,
}: {
    x: number;
    y: number;
    progress: number;
    /** 0..1 touch ripple */
    pulse?: number;
}) => {
    const f = useCurrentFrame();
    const e = smooth(progress);
    const dx = (1 - e) * 360;
    const dy = (1 - e) * 130;
    const tremor = Math.sin(f / 4) * (1 - e) * 1.6 + Math.sin(f / 9) * 0.6;
    const vis = clamp01(progress * 6);
    return (
        <g>
            {pulse > 0 && pulse < 1 && (
                <g>
                    <circle cx={x} cy={y} r={8 + pulse * 70} fill="none" stroke={colors.glow} strokeWidth={3 * (1 - pulse)} opacity={1 - pulse} />
                    <circle cx={x} cy={y} r={4 + pulse * 40} fill="none" stroke="#fff" strokeWidth={2 * (1 - pulse)} opacity={0.7 * (1 - pulse)} />
                </g>
            )}
            <g
                opacity={vis}
                transform={`translate(${r2(x + dx)} ${r2(y + dy + tremor)}) rotate(${r2(-4 + (1 - e) * 6)})`}
            >
                <defs>
                    <linearGradient id="hand-skin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#f8d7b8" />
                        <stop offset="0.55" stopColor="#e3a982" />
                        <stop offset="1" stopColor="#c98760" />
                    </linearGradient>
                    <linearGradient id="hand-skin-dark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#d99b74" />
                        <stop offset="1" stopColor="#a96a45" />
                    </linearGradient>
                    <linearGradient id="hand-sleeve" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#2e5573" />
                        <stop offset="1" stopColor="#1d3a52" />
                    </linearGradient>
                    <radialGradient id="hand-tip" cx="0.35" cy="0.4" r="0.8">
                        <stop offset="0" stopColor="#ffdcc0" />
                        <stop offset="0.7" stopColor="#e8ab84" />
                        <stop offset="1" stopColor="#c47f58" />
                    </radialGradient>
                </defs>
                {/* soft shadow */}
                <ellipse cx={230} cy={96} rx={230} ry={16} fill="#000" opacity={0.18} />
                {/* sleeve + cuff with fold lines */}
                <path d="M440,-76 L760,-110 L760,130 L440,100 Q418,12 440,-76Z" fill="url(#hand-sleeve)" />
                <path d="M470,-70 Q462,10 472,92" stroke="#152b3d" strokeWidth={3} strokeOpacity={0.5} fill="none" />
                <path d="M520,-80 Q514,8 524,104" stroke="#152b3d" strokeWidth={2.4} strokeOpacity={0.4} fill="none" />
                <path d="M580,-88 Q576,6 586,112" stroke="#41688a" strokeWidth={2} strokeOpacity={0.35} fill="none" />
                <path d="M430,-72 Q410,12 430,96 L450,98 Q430,12 450,-74Z" fill="#e8eef2" opacity={0.9} />
                <path d="M436,-60 Q420,12 436,84" stroke="#b9c6cf" strokeWidth={1.4} fill="none" opacity={0.7} />
                {/* wrist / forearm with tendon hints */}
                <path d="M240,-44 Q340,-58 440,-68 L440,92 Q340,84 240,68Z" fill="url(#hand-skin)" />
                <path d="M300,-30 Q380,-40 430,-48" stroke="#b97a52" strokeWidth={1.6} strokeOpacity={0.3} fill="none" />
                <path d="M300,52 Q380,60 430,66" stroke="#b97a52" strokeWidth={1.6} strokeOpacity={0.3} fill="none" />
                {/* palm */}
                <ellipse cx={235} cy={14} rx={96} ry={62} fill="url(#hand-skin)" />
                {/* palm crease lines */}
                <path d="M180,-20 Q230,-4 292,4" stroke="#a5673f" strokeWidth={1.6} strokeOpacity={0.35} fill="none" />
                <path d="M176,10 Q238,26 306,22" stroke="#a5673f" strokeWidth={1.4} strokeOpacity={0.3} fill="none" />
                {/* curled fingers — darker gradient, knuckle wrinkle + shadow between them */}
                {[0, 1, 2].map((i) => (
                    <g key={i}>
                        <rect x={104 + i * 6} y={18 + i * 22} width={104 - i * 8} height={26} rx={13} fill="url(#hand-skin-dark)" />
                        <rect x={104 + i * 6} y={18 + i * 22} width={104 - i * 8} height={12} rx={6} fill="url(#hand-skin)" opacity={0.75} />
                        <path
                            d={`M${118 + i * 6},${24 + i * 22} Q${112 + i * 6},${31 + i * 22} ${118 + i * 6},${38 + i * 22}`}
                            stroke="#8a5233"
                            strokeOpacity={0.4}
                            strokeWidth={1.4}
                            fill="none"
                        />
                        {/* knuckle wrinkle */}
                        <path
                            d={`M${170 + i * 6},${22 + i * 22} q-3,7 0,14 M${178 + i * 6},${22 + i * 22} q-3,7 0,14`}
                            stroke="#8a5233"
                            strokeOpacity={0.3}
                            strokeWidth={1}
                            fill="none"
                        />
                    </g>
                ))}
                {/* thumb with joint crease */}
                <ellipse cx={176} cy={-22} rx={52} ry={17} fill="url(#hand-skin)" transform="rotate(14 176 -22)" />
                <path d="M150,-34 q4,10 2,22" stroke="#a5673f" strokeWidth={1.2} strokeOpacity={0.35} fill="none" />
                {/* index finger — slightly tapered path instead of a plain rect */}
                <path d="M230,-14 L26,-12 Q0,-12 0,0 Q0,12 26,12 L230,14Z" fill="url(#hand-skin)" />
                {/* underside shadow of the finger */}
                <path d="M230,10 L28,9 Q10,8 8,2 L230,6Z" fill="#a9613c" opacity={0.35} />
                {/* top highlight strip */}
                <path d="M228,-10 L30,-8 Q16,-7 14,-3 L228,-6Z" fill="#fff" opacity={0.16} />
                {/* skin pores / micro texture on the finger */}
                <g opacity={0.35}>
                    {Array.from({ length: 14 }, (_, i) => (
                        <circle
                            key={i}
                            cx={40 + i * 13 + vnoise(i * 2.1) * 6}
                            cy={-6 + vnoise(i * 3.7) * 12}
                            r={0.6 + vnoise(i * 5.3) * 0.5}
                            fill="#8a5233"
                        />
                    ))}
                </g>
                {/* distal & middle joint wrinkles */}
                <path d="M92,-8 Q97,0 92,8" stroke="#8a5233" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
                <path d="M148,-8 Q153,0 148,8" stroke="#8a5233" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
                {/* fingertip pad */}
                <ellipse cx={8} cy={1} rx={11} ry={11} fill="url(#hand-tip)" />
                {/* nail with lunula, free edge and glossy reflection */}
                <rect x={4} y={-13} width={26} height={9} rx={4.5} fill="#f9e1d4" stroke="#d9a58a" strokeWidth={0.8} />
                <path d="M7,-11 q4,3 0,6" stroke="#e8b7a0" strokeWidth={1.2} fill="none" opacity={0.7} />
                <rect x={6} y={-12} width={9} height={3} rx={1.5} fill="#fff" opacity={0.5} />
                <rect x={20} y={-10} width={120} height={4} rx={2} fill="#fff" opacity={0.18} />
            </g>
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Electric signal                                                    */
/* ------------------------------------------------------------------ */
export const GlowFilter = ({ id = "sigGlow" }: { id?: string }) => (
    <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
);

const pathCache = new Map<string, SVGPathElement>();
export const pointOnPath = (d: string, t: number) => {
    let el = pathCache.get(d);
    if (!el) {
        el = document.createElementNS("http://www.w3.org/2000/svg", "path");
        el.setAttribute("d", d);
        pathCache.set(d, el);
    }
    const L = el.getTotalLength();
    const pt = el.getPointAtLength(clamp01(t) * L);
    return { x: pt.x, y: pt.y };
};

export const SignalStream = ({
    d,
    progress,
    color,
    width = 3,
    filterId = "sigGlow",
}: {
    d: string;
    progress: number;
    color: string;
    width?: number;
    filterId?: string;
}) => {
    const f = useCurrentFrame();
    const head = pointOnPath(d, progress);
    const sparks = [0.035, 0.075, 0.12].map((k) => pointOnPath(d, progress - k));
    // trailing wave pulse that slides along the drawn portion of the path
    const waveT = (f / 26) % 1;
    const wave = pointOnPath(d, clamp01(progress * waveT));
    return (
        <g>
            {/* faint full route so the viewer sees where the signal will travel */}
            <path d={d} fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={width + 9} strokeLinecap="round" strokeLinejoin="round" />
            <path d={d} fill="none" stroke={color} strokeOpacity={0.14} strokeWidth={width + 5} strokeLinecap="round" strokeLinejoin="round" />
            {progress > 0.002 && (
                <>
                    {/* energised membrane just behind the travelling front */}
                    <path
                        d={d}
                        pathLength={1}
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity={0.35}
                        strokeWidth={width * 0.5}
                        strokeLinecap="round"
                        strokeDasharray={`0.02 2`}
                        strokeDashoffset={-progress + 0.001}
                        filter={`url(#${filterId})`}
                    />
                    <path
                        d={d}
                        pathLength={1}
                        fill="none"
                        stroke={color}
                        strokeWidth={width}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={`${progress} 2`}
                        filter={`url(#${filterId})`}
                    />
                    {/* sliding bright pulse */}
                    <circle cx={wave.x} cy={wave.y} r={7} fill="#fff" opacity={0.28} filter={`url(#${filterId})`} />
                </>
            )}
            {progress > 0.002 && progress < 0.999 && (
                <>
                    {sparks.map((s, i) => (
                        <circle key={i} cx={s.x} cy={s.y} r={4 - i} fill={color} opacity={0.55 - i * 0.15} />
                    ))}
                    {/* layered charge halo around the head */}
                    <circle cx={head.x} cy={head.y} r={19 + Math.sin(f / 3) * 3} fill={color} opacity={0.12} />
                    <circle cx={head.x} cy={head.y} r={13 + Math.sin(f / 3) * 2} fill={color} opacity={0.25} />
                    <circle cx={head.x} cy={head.y} r={7} fill={color} opacity={0.6} />
                    <circle cx={head.x} cy={head.y} r={5.5} fill="#ffffff" />
                    {/* tiny electric arc flicks at the front */}
                    {[0, 1, 2].map((k) => {
                        const ang = (f / 2 + k * 120) * 0.0174533;
                        const rr = 10 + ((f * 2 + k * 7) % 12);
                        return (
                            <line
                                key={k}
                                x1={head.x + Math.cos(ang) * 6}
                                y1={head.y + Math.sin(ang) * 6}
                                x2={head.x + Math.cos(ang) * rr}
                                y2={head.y + Math.sin(ang) * rr}
                                stroke="#fffbe8"
                                strokeWidth={1.2}
                                strokeLinecap="round"
                                opacity={0.5}
                            />
                        );
                    })}
                </>
            )}
        </g>
    );
};

/* ------------------------------------------------------------------ */
/*  Plant cell (turgor)                                                */
/* ------------------------------------------------------------------ */
const superPts = (a: number, b: number, n: number, wob: number, seed: number) => {
    const pts: string[] = [];
    const N = 72;
    const e = 2 / n;
    for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        const c = Math.cos(t);
        const s = Math.sin(t);
        const rx = Math.sign(c) * Math.pow(Math.abs(c), e);
        const ry = Math.sign(s) * Math.pow(Math.abs(s), e);
        const k = wob * Math.sin(t * 7 + seed);
        pts.push(`${r2((a + k) * rx)},${r2((b + k) * ry)}`);
    }
    return `M${pts.join(" L")}Z`;
};

export const PlantCell = ({
    x,
    y,
    scale = 1,
    waterLevel,
    ionFlow = 0,
    id = "cell",
}: {
    x: number;
    y: number;
    scale?: number;
    waterLevel: number;
    /** 0..1 – ions drifting out of the vacuole */
    ionFlow?: number;
    id?: string;
}) => {
    const f = useCurrentFrame();
    const w = clamp01(waterLevel);
    const a = lerp(74, 100, w);
    const b = lerp(98, 120, w);
    const wob = (1 - w) * 8;
    const va = (a - 14) * (0.3 + 0.62 * w);
    const vb = (b - 14) * (0.3 + 0.62 * w);
    const rcx = (a - 9 + va) / 2;
    const rcy = (b - 9 + vb) / 2;

    const dirs = [
        [1, 0], [-1, 0], [0, 1], [0, -1], [0.78, 0.78], [-0.78, 0.78], [0.78, -0.78], [-0.78, -0.78],
    ];
    const pressure = clamp01((w - 0.5) * 2.2);

    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`}>
            <defs>
                <radialGradient id={`${id}-cyto`} cx="0.5" cy="0.4" r="0.8">
                    <stop offset="0" stopColor="#2f6a45" />
                    <stop offset="1" stopColor="#173a28" />
                </radialGradient>
                <radialGradient id={`${id}-vac`} cx="0.4" cy="0.35" r="0.85">
                    <stop offset="0" stopColor="#a8e6ff" stopOpacity={0.9} />
                    <stop offset="1" stopColor="#2f8fd0" stopOpacity={0.85} />
                </radialGradient>
            </defs>

            {/* pressure arrows */}
            {pressure > 0 &&
                dirs.map(([dx, dy], i) => {
                    const px = dx * (a + 6);
                    const py = dy * (b + 6);
                    const ang = Math.atan2(dy, dx) / RAD;
                    const len = 16 + 10 * Math.sin(f / 7 + i);
                    return (
                        <g key={i} transform={`translate(${r2(px)} ${r2(py)}) rotate(${r2(ang)})`} opacity={pressure * 0.9}>
                            <line x1={0} y1={0} x2={len} y2={0} stroke={colors.sunlight} strokeWidth={3.5} strokeLinecap="round" />
                            <polygon points={`${len + 9},0 ${len - 2},-7 ${len - 2},7`} fill={colors.sunlight} />
                        </g>
                    );
                })}

            {/* cell wall + cytoplasm — double wall, middle lamella, ER network */}
            <path d={superPts(a, b, 4, wob, 1)} fill="#5faa4a" opacity={0.95} />
            <path
                d={superPts(a - 2.5, b - 2.5, 4, wob, 1)}
                fill="none"
                stroke="#8fd06a"
                strokeWidth={1.4}
                strokeOpacity={0.5}
            />
            <path d={superPts(a - 8, b - 8, 4, wob, 1)} fill={`url(#${id}-cyto)`} />
            {/* faint endoplasmic reticulum strands in the cytoplasm */}
            {Array.from({ length: 5 }, (_, i) => {
                const t = (i / 5) * Math.PI * 2 + 0.7;
                const x0 = Math.cos(t) * (a - 10);
                const y0 = Math.sin(t) * (b - 10);
                const x1 = Math.cos(t + 1.9) * (a - 12);
                const y1 = Math.sin(t + 1.9) * (b - 12);
                return (
                    <path
                        key={`er-${i}`}
                        d={`M${r2(x0)},${r2(y0)} Q0,0 ${r2(x1)},${r2(y1)}`}
                        stroke="#7fd6a0"
                        strokeWidth={0.9}
                        strokeOpacity={0.18}
                        fill="none"
                    />
                );
            })}

            {/* chloroplasts — drifting slowly, with grana stacks inside */}
            {Array.from({ length: 9 }, (_, i) => {
                const t = (i / 9) * Math.PI * 2 + 0.4 + Math.sin(f / 140 + i) * 0.08;
                const rr = 0.9 + 0.06 * Math.sin(f / 90 + i * 2.3);
                const cx = Math.cos(t) * rcx * rr;
                const cy = Math.sin(t) * rcy * rr;
                return (
                    <g key={i} transform={`translate(${r2(cx)} ${r2(cy)}) rotate(${r2(t / RAD + 90 + Math.sin(f / 110 + i) * 8)})`}>
                        <ellipse rx={10} ry={5.6} fill="#34b04e" stroke="#1d7a35" strokeWidth={1} />
                        <ellipse rx={10} ry={5.6} fill="none" stroke="#7fe08a" strokeWidth={0.6} strokeOpacity={0.5} />
                        {/* grana thylakoid stacks */}
                        {[-5, -1.7, 1.7, 5].map((gx, j) => (
                            <line key={j} x1={gx} y1={-3.4} x2={gx} y2={3.4} stroke="#1d7a35" strokeWidth={1.4} strokeOpacity={0.8} />
                        ))}
                        <ellipse cx={-3} cy={-2} rx={4} ry={1.2} fill="#c9f5b8" opacity={0.35} />
                    </g>
                );
            })}

            {/* nucleus with nucleolus and nuclear envelope pores */}
            <g transform={`translate(${r2(-rcx * 0.7)} ${r2(-rcy * 0.72)})`}>
                <circle r={13} fill="#7a52ba" opacity={0.35} />
                <circle r={11} fill="#8a63c9" opacity={0.9} />
                <circle r={11} fill="none" stroke="#c9aef0" strokeWidth={1} strokeOpacity={0.6} strokeDasharray="2 2.4" />
                <circle cx={-2} cy={-2} r={4.4} fill="#c9aef0" />
                <circle cx={-3.2} cy={-3.2} r={1.6} fill="#efe2ff" />
            </g>

            {/* vacuole — tonoplast with a subtle breathing pulse */}
            <path
                d={superPts(va, vb, 2.6, wob * 0.5, 2)}
                fill={`url(#${id}-vac)`}
                stroke="#d3f2ff"
                strokeOpacity={0.6 + 0.2 * Math.sin(f / 20)}
                strokeWidth={1.6}
            />
            <ellipse cx={-va * 0.3} cy={-vb * 0.45} rx={va * 0.35} ry={vb * 0.12} fill="#fff" opacity={0.28} />
            <ellipse cx={va * 0.25} cy={vb * 0.3} rx={va * 0.2} ry={vb * 0.08} fill="#fff" opacity={0.12} />

            {/* bubbles rising through the vacuole sap */}
            {w > 0.4 &&
                Array.from({ length: 8 }, (_, i) => {
                    const ph = (f / 70 + i / 8) % 1;
                    const bx = (rnd(i + 11) - 0.5) * va * 1.0 + Math.sin(f / 30 + i * 2) * 2;
                    return (
                        <g key={i} opacity={0.55 * Math.sin(ph * Math.PI)}>
                            <circle cx={bx} cy={vb * 0.5 - ph * vb * 1.0} r={2 + rnd(i + 4) * 3} fill="none" stroke="#e8f9ff" strokeWidth={0.8} />
                            <circle cx={bx - 1} cy={vb * 0.5 - ph * vb * 1.0 - 1} r={0.9} fill="#ffffff" />
                        </g>
                    );
                })}

            {/* ions — K⁺ / Cl⁻ with glow halos, flowing out during ionFlow */}
            {Array.from({ length: 10 }, (_, i) => {
                const t = (i / 10) * Math.PI * 2 + 0.2;
                const ph = (f / 50 + i / 10) % 1;
                const moving = ionFlow > 0.01;
                const rr = moving ? lerp(0.25, 1.15, ph) : 0.55 + 0.05 * Math.sin(f / 12 + i);
                const op = moving ? Math.sin(ph * Math.PI) : 0.7;
                const isK = i % 2 === 0;
                const ix = Math.cos(t) * a * rr * 0.9;
                const iy = Math.sin(t) * b * rr * 0.9;
                return (
                    <g key={i} opacity={op}>
                        <circle cx={ix} cy={iy} r={8.5} fill={isK ? colors.ion : "#4fa3d8"} opacity={0.25} />
                        <circle cx={ix} cy={iy} r={5} fill={isK ? colors.ion : "#3b82b8"} stroke="#e6d2ff" strokeWidth={0.6} strokeOpacity={0.5} />
                        <text x={ix} y={iy + 3} textAnchor="middle" fontSize={8} fontWeight={800} fill="#f4ecff">
                            {isK ? "+" : "–"}
                        </text>
                    </g>
                );
            })}
        </g>
    );
};

/** compact rectangular cell used in magnified tissue views */
export const MiniCell = ({
    x,
    y,
    w,
    h,
    level,
}: {
    x: number;
    y: number;
    w: number;
    h: number;
    level: number;
}) => {
    const f = useCurrentFrame();
    const lv = 0.35 + 0.6 * clamp01(level);
    const vw = (w - 10) * lv;
    const vh = (h - 10) * lv;
    return (
        <g transform={`translate(${x} ${y})`}>
            {/* outer wall + inner wall line */}
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#1b4430" stroke="#5faa4a" strokeWidth={2.6} />
            <rect x={-w / 2 + 3.4} y={-h / 2 + 3.4} width={w - 6.8} height={h - 6.8} rx={7} fill="none" stroke="#8fd06a" strokeWidth={0.8} strokeOpacity={0.45} />
            {/* vacuole with meniscus highlight and a slow shimmer */}
            <rect x={-vw / 2} y={-vh / 2} width={vw} height={vh} rx={8} fill={colors.water} opacity={0.8} />
            <rect x={-vw / 2 + 4} y={-vh / 2 + 3} width={vw * 0.45} height={4} rx={2} fill="#fff" opacity={0.35} />
            <rect x={-vw / 2 + 2} y={vh / 2 - 5} width={vw - 4} height={2} rx={1} fill="#bfe9ff" opacity={0.3 + 0.15 * Math.sin(f / 14 + x)} />
            {/* two tiny chloroplasts pressed against the cytoplasm */}
            <ellipse cx={-w * 0.28} cy={-h * 0.3} rx={4.5} ry={2.4} fill="#3fbf58" opacity={0.85} />
            <ellipse cx={w * 0.3} cy={h * 0.3} rx={4} ry={2.2} fill="#37a84d" opacity={0.8} transform={`rotate(18 ${r2(w * 0.3)} ${r2(h * 0.3)})`} />
        </g>
    );
};