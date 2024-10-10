/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors:{
        accentPurple: 'rgb(130, 95, 253)',
      }
    },
  },
  plugins: [],
};
