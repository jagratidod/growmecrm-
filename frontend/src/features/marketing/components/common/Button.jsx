import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  icon,
  iconRight = false,
  arrow = false,
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-150 rounded-full border border-line select-none';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-dark shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-brutal-active',
    secondary:
      'bg-white text-black hover:bg-light-gray shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-brutal-active',
    ghost:
      'bg-transparent text-black hover:bg-black hover:text-white border border-line shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-brutal-active',
    dark:
      'bg-black text-white hover:bg-dark-gray shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-brutal-active',
  };

  const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${className}`;

  const content = (
    <>
      {icon && !iconRight && icon}
      {children}
      {icon && iconRight && icon}
      {arrow && <ArrowRight size={16} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {content}
    </button>
  );
}
