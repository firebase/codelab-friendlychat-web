/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/*.{html,ts}", "./src/app/***/**/*.{html,ts}", "./src/app/**/*.{html,ts}", "./src/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'navy': {
          10: '#F6F7F9',
          20: '#E5EAF0',
          30: '#D4DCE7',
          40: '#C3CFDD',
          50: '#B2C1D4',
          100: '#8EA1B9',
          200: '#6B829D',
          300: '#476282',
          400: '#385574',
          500: '#2A4865',
          600: '#1B3A57',
          700: '#0C2D48',
          800: '#051E34',
          900: '#031525',
        },
        'amber': {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107',
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
          A100: '#FFE57F',
          A200: '#FFD740',
          A400: '#FFC400',
          A700: '#FFAB00',
        }
      },
    },
  },
  plugins: [],
}

