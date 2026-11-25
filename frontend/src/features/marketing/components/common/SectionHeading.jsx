export default function SectionHeading({
  children,
  as: Tag = 'h2',
  size = 'lg',
  className = '',
}) {
  const sizes = {
    xl: 'text-5xl md:text-6xl lg:text-display-xl',
    lg: 'text-4xl md:text-5xl lg:text-display-lg',
    md: 'text-3xl md:text-4xl lg:text-display-md',
    sm: 'text-2xl md:text-3xl lg:text-display-sm',
  };

  return (
    <Tag className={`font-display font-bold leading-tight tracking-tight text-black ${sizes[size]} ${className}`}>
      {children}
    </Tag>
  );
}
