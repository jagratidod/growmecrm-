export function OrangeDots({ className = '', count = 3, size = 'md' }) {
  const dotSizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${dotSizes[size]} rounded-full bg-primary`} />
      ))}
    </div>
  );
}

export function SquigglyLine({ className = '', color = 'primary' }) {
  const colors = { primary: 'var(--gm-accent)', black: 'var(--gm-ink)', gray: 'var(--gm-muted)' };
  return (
    <svg className={className} width="80" height="12" viewBox="0 0 80 12" fill="none">
      <path
        d="M2 6C10 2 14 10 22 6C30 2 34 10 42 6C50 2 54 10 62 6C70 2 74 10 78 6"
        stroke={colors[color]}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StarShape({ className = '', size = 20, color = 'var(--gm-accent)' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
    </svg>
  );
}

export function CodeBrackets({ className = '', size = 48 }) {
  return (
    <div className={`font-display font-bold text-primary select-none ${className}`} style={{ fontSize: size }}>
      {'</>'}
    </div>
  );
}

export function ArrowDoodle({ className = '', direction = 'right' }) {
  const rotations = { right: 0, down: 90, left: 180, up: 270 };
  return (
    <svg
      className={className}
      width="40"
      height="20"
      viewBox="0 0 40 20"
      fill="none"
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
    >
      <path d="M2 10H34M34 10L26 3M34 10L26 17" stroke="var(--gm-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Barcode({ className = '' }) {
  return (
    <div className={`flex gap-[2px] items-end ${className}`}>
      {[12, 18, 8, 20, 14, 6, 18, 10, 22, 14, 8, 16, 20, 10, 14].map((h, i) => (
        <div key={i} className="w-[3px] bg-black rounded-sm" style={{ height: h }} />
      ))}
    </div>
  );
}
