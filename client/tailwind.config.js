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
        wa: {
          green: '#00a884',
          'green-dark': '#008069',
          'green-light': '#25d366',
          'green-teal': '#128c7e',
          'bubble-sent-light': '#d9fdd3',
          'bubble-sent-dark': '#005c4b',
          'bubble-recv-light': '#ffffff',
          'bubble-recv-dark': '#202c33',
          'bg-light': '#efeae2',
          'bg-dark': '#0b141a',
          'panel-light': '#f0f2f5',
          'panel-dark': '#202c33',
          'sidebar-light': '#ffffff',
          'sidebar-dark': '#111b21',
          'input-light': '#ffffff',
          'input-dark': '#2a3942',
          'border-light': '#e9edef',
          'border-dark': '#222d34',
          'text-primary-light': '#111b21',
          'text-primary-dark': '#e9edef',
          'text-secondary-light': '#667781',
          'text-secondary-dark': '#8696a0',
          'tick-blue': '#53bdeb',
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
