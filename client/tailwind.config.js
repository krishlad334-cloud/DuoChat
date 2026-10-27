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
        studio: {
          bg: '#09090b',
          card: '#121215',
          panel: '#18181b',
          border: '#27272a',
          muted: '#71717a',
          hover: '#1e1e24',
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
