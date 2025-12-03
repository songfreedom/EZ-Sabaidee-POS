/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Phetsarath OT"', '"Noto Sans Lao Looped"', '"Noto Sans Lao"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}