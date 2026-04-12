/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#07070a',
          800: '#0c0c10',
          700: '#111116',
          600: '#17171d',
          500: '#1e1e26',
          400: '#2a2a34',
        },
        mist: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
        },
        emerald: {
          bio: '#10B981',
          glow: '#34D399',
          deep: '#059669',
        },
        cyan: {
          bio: '#06B6D4',
          glow: '#22D3EE',
        },
        amber: {
          bio: '#F59E0B',
          glow: '#FCD34D',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-slow': 'fadeIn 1.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 15% 20%, rgba(16,185,129,0.12) 0px, transparent 50%), radial-gradient(at 85% 70%, rgba(6,182,212,0.10) 0px, transparent 50%), radial-gradient(at 60% 30%, rgba(245,158,11,0.06) 0px, transparent 50%)',
        'shimmer-emerald': 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)',
      },
    },
  },
  plugins: [],
};
