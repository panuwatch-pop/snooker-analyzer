/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snooker: {
          green: '#0b381e',
          baize: '#13542d',
          accent: '#10b981',
          red: '#dc2626',
          yellow: '#eab308',
          brown: '#854d0e',
          blue: '#2563eb',
          pink: '#ec4899',
          black: '#18181b',
        },
        player1: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        },
        player2: {
          light: '#fbbf24',
          DEFAULT: '#d97706',
          dark: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
