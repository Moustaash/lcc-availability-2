
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        'primary': '#8f3e32',
        'background-dark': '#0d1117',
        'card-dark': '#161b22',
        'text-dark': '#e8e8e8',
        'border-dark': '#30363d',
        'status-confirmed': '#3b82f6', // blue
        'status-option': '#f59e0b', // amber
        // FIX: Add missing 'status-blocked' color definition.
        'status-blocked': '#6b7280',
      },
    },
  },
  plugins: [],
}