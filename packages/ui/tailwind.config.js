/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        // Player colors
        player: {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
          yellow: '#eab308',
          black: '#1f2937',
          purple: '#a855f7',
        }
      },
    },
  },
  plugins: [],
}
