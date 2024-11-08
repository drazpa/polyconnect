/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        glow: {
          '0%': {
            'box-shadow': '0 0 5px rgba(147,51,234,0.2), 0 0 20px rgba(147,51,234,0.2)',
          },
          '100%': {
            'box-shadow': '0 0 10px rgba(147,51,234,0.4), 0 0 30px rgba(147,51,234,0.2)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};