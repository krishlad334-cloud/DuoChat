/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        duo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1.0)' },
        }
      },
      animation: {
        'bounce-dot-1': 'bounceDot 1.4s infinite ease-in-out both',
        'bounce-dot-2': 'bounceDot 1.4s infinite ease-in-out 0.2s both',
        'bounce-dot-3': 'bounceDot 1.4s infinite ease-in-out 0.4s both',
      }
    },
  },
  plugins: [],
}
