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
          400: '#7e6cfe',
          500: '#6c5ce7',
          600: '#5a4fcb',
          700: '#483db2',
        },
        fantasy: {
          accent: '#2c2137',
          dark: '#191627',
          darker: '#0f0e17',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}