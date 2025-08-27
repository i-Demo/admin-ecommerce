/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}", // Angular
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        slowBounce: {
          '0%, 100%': { transform: 'translateY(-25%)', 'animation-timing-function': 'cubic-bezier(0.8,0,1,1)' },
          '50%': { transform: 'translateY(0)', 'animation-timing-function': 'cubic-bezier(0,0,0.2,1)' },
        }
      },
      animation: {
        'slow-bounce': 'slowBounce 2s infinite',
      }
    }
  },
  plugins: [],
}
