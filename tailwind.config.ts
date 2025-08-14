import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Sophisticated Burnt Orange Palette
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EA580C', // Primary burnt orange
          600: '#DC2626',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#D1D5DB', // Neutral 300
          400: '#94A3B8',
          500: '#64748B', // Neutral 500
          600: '#475569', // Neutral 700
          700: '#334155',
          800: '#1E293B', // Secondary slate
          900: '#0F172A',
        },
        accent: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#0891B2', // Accent cyan
          600: '#0E7490',
          700: '#155E75',
          800: '#164E63',
          900: '#083344',
        },
        destructive: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#B91C1C', // Destructive deep red
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
