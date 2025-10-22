import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        liberty: {
          50: '#f2f6ff',
          100: '#e6edff',
          200: '#bfd0ff',
          300: '#8aaafb',
          400: '#5c80f6',
          500: '#3054ef',
          600: '#1e3bd3',
          700: '#152ca5',
          800: '#0f1e74',
          900: '#080f40',
        },
      },
    },
  },
  plugins: [],
};

export default config;
