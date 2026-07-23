/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a1428',
        secondary: '#1a2d4d',
        accent: '#FFD700',
        purple: '#6A0DAD',
        cyan: '#00FFFF',
        'cyan-400': '#00FFFF',
      },
      backgroundImage: {
        'gradient-gaming': 'linear-gradient(135deg, #0a1428 0%, #1a2d4d 50%, #6A0DAD 100%)',
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { textShadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
          '50%': { textShadow: '0 0 50px rgba(255, 215, 0, 1)' },
        },
      },
    },
  },
  plugins: [],
}
