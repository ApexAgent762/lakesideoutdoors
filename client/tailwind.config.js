/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lakeside: {
          blue: '#3BB8E8',
          teal: '#1A7A8A',
          orange: '#F97316',
          dark: '#0F1E2D',
          darker: '#0A1520',
          card: '#162333',
          border: '#1E3448',
        }
      }
    },
  },
  plugins: [],
}
