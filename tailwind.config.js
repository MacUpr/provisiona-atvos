/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atvos: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a', // Atvos Primary Green
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
          950: '#021f0e',
        },
        sap: {
          blue: '#0a6ed1', // SAP Corporate Blue
          dark: '#002b49',
        },
        brand: {
          dark: '#0B1320',
          surface: '#111C2E',
          surfaceLight: '#1B2A42',
          card: '#162235',
          border: '#243752',
          text: '#F1F5F9',
          muted: '#94A3B8',
          accent: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
