import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0C0A09',
          800: '#1C1917',
          700: '#292524',
          600: '#44403C',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        stone: {
          400: '#A8A29E',
          500: '#78716C',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(217, 119, 6, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
