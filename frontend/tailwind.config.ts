import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand 3-Color System (60-30-10) ──────────────
        'brand-bg':     '#FFFFFF',
        'brand-text':   '#0F172A',
        'brand-slate':  '#0F172A',
        'brand-accent': '#F59E0B',
        'brand-muted':  '#64748B',
        'brand-border': '#E2E8F0',
        accent: {
          DEFAULT: '#F59E0B',
          hover:   '#D97706',
          dim:     'rgba(245, 158, 11, 0.12)',
          border:  'rgba(245, 158, 11, 0.35)',
        },
        'accent-dim': 'rgba(245, 158, 11, 0.12)',
        'accent-border': 'rgba(245, 158, 11, 0.35)',
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC',
        },
        dark: {
          0:   '#000000',
          50:  '#f4f4f5',
          100: '#e4e4e7',
          200: '#a1a1aa',
          300: '#71717a',
          400: '#52525b',
          500: '#3f3f46',
          600: '#27272a',
          700: '#1f1f23',
          800: '#141417',
          900: '#0a0a0c',
          950: '#050507',
        },

        // ── Legacy (kept for other pages) ───────────────
        twilight: {
          50: '#f8fdfb',
          100: '#f0faf6',
          200: '#e3f5ec',
          300: '#d1ede0',
          400: '#b8dccf',
          500: '#eaf2ef',
          600: '#7fb8a3',
          700: '#66a085',
          800: '#52806a',
          900: '#436956',
        },
        berry: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#912f56',
          600: '#831843',
          700: '#7c2d57',
          800: '#701a47',
          900: '#4c1d32',
        },
        navy: '#0b2540',
      },

      fontFamily: {
        space:  ['Space Grotesk', 'system-ui', 'sans-serif'],
        inter:  ['Inter', 'system-ui', 'sans-serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        mono:   ['JetBrains Mono', 'Fira Code', 'monospace'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },

      animation: {
        'fade-in':   'fadeIn 0.5s ease-out forwards',
        'fade-up':   'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-down': 'fadeDown 0.5s ease-out forwards',
        'wave':      'waveBar 1.6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft':'pulseSoft 3s ease-in-out infinite',
        'glow':      'glowPulse 2.5s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-18px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        waveBar: {
          '0%, 100%': { transform: 'scaleY(0.2)', opacity: '0.4' },
          '50%':      { transform: 'scaleY(1)',   opacity: '1'   },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1'   },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.25' },
          '50%':      { opacity: '0.45' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
      },

      boxShadow: {
        'accent':    '0 0 30px rgba(232, 54, 93, 0.25)',
        'accent-sm': '0 0 15px rgba(232, 54, 93, 0.15)',
        'card':      '0 1px 3px rgba(0,0,0,0.8)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.6)',
      },

      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,54,93,0.12), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
