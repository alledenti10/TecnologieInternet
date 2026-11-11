import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'

const config = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.{vue,js,ts}',
    './App.{vue,js,ts}',
    // Include PDF HTML producer (server) and the PDF Tailwind entry
    './server/**/*.{js,ts}',
    './assets/css/stile-pdf.css'
  ],
  safelist: [
    // Ensure typography and common utilities for PDF aren't purged
    'prose',
    'prose-slate',
    'max-w-none',
    'text-center',
    'px-4', 'py-3', 'mt-6',
    'border-2', 'border-cyan-500', 'rounded-lg', 'bg-cyan-50', 'text-base', 'font-bold', 'text-cyan-700'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9efff',
          200: '#b5dcff',
          300: '#86c0ff',
          400: '#599dff',
          500: '#3d7df6',
          600: '#2f60d3',
          700: '#274cb0',
          800: '#243f89',
          900: '#22376c'
        },
        aurora: {
          50: '#f4f6ff',
          100: '#e6e9ff',
          200: '#cdd3ff',
          300: '#b0b8ff',
          400: '#8b91ff',
          500: '#716ffe',
          600: '#5b51f1',
          700: '#493fce',
          800: '#3a34a3',
          900: '#312d81'
        }
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', ...defaultTheme.fontFamily.sans]
      },
      boxShadow: {
        card: '0 20px 60px rgba(15, 23, 42, 0.25)',
        glass: '0 8px 32px rgba(15, 23, 42, 0.35)',
        glow: '0 40px 120px rgba(79, 70, 229, 0.35)'
      },
      backgroundImage: {
        'grid-glow': 'radial-gradient(circle at center, rgba(255,255,255,0.12) 0, transparent 58%)',
        'brand-gradient': 'linear-gradient(120deg, #00d1ff 0%, #6366f1 55%, #a855f7 100%)'
      }
    }
  },
  plugins: [typography]
} satisfies Config

export default config
