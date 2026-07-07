/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f3',
          100: '#e6ede4',
          200: '#cddccb',
          300: '#aac4a5',
          400: '#82a67c',
          500: '#628a5c',
          600: '#4b6f47',
          700: '#3c583a',
          800: '#324731',
          900: '#2a3b2a',
          950: '#152016',
        },
        cream: {
          50: '#fefdfb',
          100: '#fbf7ef',
          200: '#f6eede',
          300: '#eeddc0',
          400: '#e2c799',
        },
        clay: {
          400: '#d99a72',
          500: '#c17c4e',
          600: '#a6633a',
          700: '#874e2f',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
