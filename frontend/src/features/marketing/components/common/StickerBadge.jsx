export default function StickerBadge({
  text,
  color = 'orange',
  rotate = 0,
  size = 'md',
  className = '',
}) {
  const colors = {
    orange: 'bg-primary text-white',
    violet: 'bg-violet text-white',
    yellow: 'bg-yellow-sticker text-black',
    white: 'bg-white text-black',
    black: 'bg-black text-white',
    blue: 'bg-tag-blue text-black',
  };

  const sizes = {
    sm: 'px-3 py-1 text-[11px]',
    md: 'px-4 py-1.5 text-xs',
    lg: 'px-5 py-2 text-sm',
  };

  return (
    <span
      className={`inline-block rounded-full border border-line font-display font-bold uppercase tracking-wider shadow-brutal-sm ${colors[color]} ${sizes[size]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {text}
    </span>
  );
}
