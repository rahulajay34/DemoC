module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
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
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
