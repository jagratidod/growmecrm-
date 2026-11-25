/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        cream: 'var(--gm-canvas)',
        'warm-white': 'var(--gm-surface)',
        primary: 'var(--gm-accent)',
        'primary-dark': 'var(--gm-accent-hover)',
        'primary-light': 'var(--gm-accent-line)',
        black: 'var(--gm-ink)',
        'deep-black': 'var(--gm-ink)',
        'light-gray': 'var(--gm-canvas)',
        'medium-gray': 'var(--gm-muted)',
        'border-gray': 'var(--gm-line)',
        'dark-gray': 'var(--gm-ink)',
        'yellow-sticker': 'var(--gm-blue-soft)',
        'tag-blue': '#DBEAFE',
        'tag-green': '#D1FAE5',
        'tag-purple': 'var(--gm-accent-soft)',
        'tag-pink': '#FCE7F3',
        violet: 'var(--gm-accent)',
        'violet-dark': 'var(--gm-accent-hover)',
        'violet-light': 'var(--gm-accent-hover)',
        'violet-soft': 'var(--gm-accent-soft)',
      },
      fontFamily: {
        display: 'var(--gm-font)',
      },
      boxShadow: {
        brutal: 'var(--gm-shadow)',
        'brutal-sm': 'var(--gm-shadow)',
        'brutal-lg': 'var(--gm-shadow-raised)',
        'brutal-orange': 'var(--gm-shadow)',
        'brutal-violet': 'var(--gm-shadow)',
        'brutal-violet-lg': 'var(--gm-shadow-raised)',
        'brutal-hover': 'var(--gm-shadow-raised)',
        'brutal-active': 'var(--gm-shadow)',
      },
      borderWidth: {
        '3': '3px',
      },
      rotate: {
        '-3': '-3deg',
        '-2': '-2deg',
        '2': '2deg',
        '3': '3deg',
        '5': '5deg',
        '-5': '-5deg',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
