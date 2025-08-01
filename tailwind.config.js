module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      backgroundImage: {
        'cheetah-gradient': 'linear-gradient(90deg, #f28a22 0%, #FF5E62 100%)',
        'card-gradient': 'linear-gradient(135deg, #fff7e6 0%, #ffe0b2 100%)',
      },
      boxShadow: {
        'cheetah': '0 6px 38px -8px rgba(242,138,34,0.21)',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease both',
        'slide-up': 'slideUp 0.6s ease-out both',
        'scooty-glide': 'scootyGlide 6s ease-in-out infinite',
        'liquid-move': 'liquid-move 20s ease-in-out infinite alternate',
        'liquid-glow': 'liquid-glow 8s ease-in-out infinite alternate',
        'flair-line-1': 'flair-line-1 25s linear infinite', // New animation
        'flair-line-2': 'flair-line-2 30s linear infinite', // New animation
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(42px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scootyGlide: {
          '0%': { transform: 'translateX(-666%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(666%)' },
        },
        'liquid-move': {
          'from': { transform: 'translate(-10rem, -20rem) rotate(-30deg)' },
          'to': { transform: 'translate(20rem, 10rem) rotate(60deg)' }
        },
        // ✨ New keyframes for the flair lines ✨
        'flair-line-1': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'flair-line-2': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'liquid-glow': {
          '0%': { 
            opacity: '0.8',
            transform: 'scale(1) rotate(0deg)' 
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.02) rotate(1deg)' 
          },
          '100%': { 
            opacity: '0.9',
            transform: 'scale(1) rotate(0deg)' 
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};