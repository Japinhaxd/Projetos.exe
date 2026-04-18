/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        'surface-hover': 'var(--bg-surface-hover)',
        border: 'var(--border-color)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        pos: '#3b82f6',
        'pos-soft': 'rgba(59, 130, 246, 0.12)',
        neg: '#ef4444',
        'neg-soft': 'rgba(239, 68, 68, 0.12)',
        warn: '#f59e0b',
        'warn-soft': 'rgba(245, 158, 11, 0.12)',
        orange: '#fb923c',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card-light': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-light-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.06)',
        'glow-pos': '0 0 0 1px rgba(59, 130, 246, 0.35), 0 0 24px rgba(59, 130, 246, 0.12)',
        'glow-neg': '0 0 0 1px rgba(239, 68, 68, 0.35), 0 0 24px rgba(239, 68, 68, 0.12)',
      },
      animation: {
        'slide-in': 'slideIn 220ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 220ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 18s ease infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
