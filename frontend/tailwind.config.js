/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#d32f2f',     // ambulance red
        secondary: '#004080',   // navy blue
      }
    }
  },
  plugins: [],
}
