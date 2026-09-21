import type { Config } from 'tailwindcss'

/**
 * Escala de raio por tipo de elemento (Shape Consistency Lock):
 * - botões / inputs / chips -> `md` (10px)
 * - painéis / cards / tabelas -> `lg` (16px)
 * - pills (badges, seletor de status) -> `full`
 * Nunca misturar: um botão nunca usa `full`, um card nunca usa `full`.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './sections/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        algtrix: {
          bg: 'var(--algtrix-bg)',
          surface: 'var(--algtrix-surface)',
          surface2: 'var(--algtrix-surface-2)',
          surface3: 'var(--algtrix-surface-3)',
          text: 'var(--algtrix-text)',
          muted: 'var(--algtrix-muted)',
          dim: 'var(--algtrix-dim)',
          accent: 'var(--algtrix-accent)',
          accentHover: 'var(--algtrix-accent-hover)',
          accentSoft: 'var(--algtrix-accent-soft)',
          accentStrong: 'var(--algtrix-accent-strong)',
          violet: 'var(--algtrix-violet)',
          violetSoft: 'var(--algtrix-violet-soft)',
          amber: 'var(--algtrix-amber)',
          risk: 'var(--algtrix-risk)',
          border: 'var(--algtrix-border)',
          borderStrong: 'var(--algtrix-border-strong)',
          borderAccent: 'var(--algtrix-border-accent)',
        },
        brand: {
          DEFAULT: 'var(--brand-primary)',
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          dark: 'var(--brand-dark)',
          light: 'var(--brand-light)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        surface: 'var(--surface)',
        border: 'var(--border)',
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          inverse: 'var(--text-inverse)',
        },
      },
      fontFamily: {
        sans: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        page: '1240px',
        pageWide: '1440px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,18,43,0.04), 0 16px 40px -18px rgba(24,18,43,0.14)',
        'card-dark': '0 20px 44px -16px rgba(24,18,43,0.22)',
        glow: '0 0 0 1px rgba(15,138,151,0.22), 0 12px 28px -14px rgba(15,138,151,0.22)',
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '16px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
