// ---------------------------------------------------------------------------
// LoadingOrb — animated wireframe sphere shown while globe loads.
// Pure CSS + SVG. Uses .og-orb-* classes from tokens.css.
// ---------------------------------------------------------------------------

interface LoadingOrbProps {
  size?: number;
}

export function LoadingOrb({ size = 240 }: LoadingOrbProps) {
  const r = size / 2;
  const outerR = r - 2;

  const ellipses: { rx: number; ry: number; rotate: number }[] = [];
  ellipses.push({ rx: outerR, ry: outerR * 0.15, rotate: 0 });
  for (const offset of [0.35, 0.65]) {
    const latR = outerR * Math.cos(Math.asin(offset));
    ellipses.push({ rx: latR, ry: latR * 0.15, rotate: 0 });
  }
  for (const angle of [0, 45, 90, 135]) {
    ellipses.push({ rx: outerR, ry: outerR, rotate: angle });
  }

  return (
    <div className="og-orb" data-og="loading-orb" aria-label="Loading globe…" role="status">
      <div className="og-orb-wrapper" style={{ width: size, height: size }}>
        <div className="og-orb-glow" />
        <svg
          className="og-orb-wireframe"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
        >
          <circle cx={r} cy={r} r={outerR} strokeWidth="1" opacity="0.3" />
          {ellipses.map((e, i) => (
            <ellipse
              key={i}
              cx={r}
              cy={r}
              rx={e.rx}
              ry={e.ry}
              transform={`rotate(${e.rotate} ${r} ${r})`}
              strokeWidth="0.8"
              opacity="0.25"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
