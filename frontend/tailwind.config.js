/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './layouts/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0F',
        surface: '#16161F',
        accent: '#7B2FFF',
        glow: '#A855F7',
        textPrimary: '#F8FAFC',
        textMuted: '#9CA3AF'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 25px rgba(123, 47, 255, 0.4)',
        card: '0 10px 40px rgba(10, 10, 15, 0.65)'
      }
    }
  },
  plugins: []
};

