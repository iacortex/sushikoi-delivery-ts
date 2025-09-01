/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sushi: {
          50: '#fef7f0',
          100: '#fdeee0',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        }
      },
      fontFamily: {
        'japanese': ['Noto Sans JP', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 