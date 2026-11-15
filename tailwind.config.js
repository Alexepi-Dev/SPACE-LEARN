/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spaceNight: '#0B1833',
        deepIndigo: '#152A4A',
        sunAmber: '#C6A15B',
        spaceTurquoise: '#236B50',
        vividIndigo: '#174F3B',
        spaceMist: '#F5F7F5',
        deepGreen: '#174F3B',
        secondaryGreen: '#236B50',
        gold: '#C6A15B',
        spaceBlue: '#0B1833',
        blueSecondary: '#152A4A',
        offWhite: '#F5F7F5',
        textPrimary: '#0B1833',
        textSecondary: '#152A4A',
        accent: '#C6A15B',
      },
      boxShadow: {
        soft: '0 20px 55px rgba(11, 24, 51, 0.18)',
      },
    },
  },
  plugins: [],
}

