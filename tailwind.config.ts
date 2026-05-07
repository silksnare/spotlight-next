import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3fb',
          100: '#d6e1f6',
          200: '#adc3ed',
          300: '#85a6e4',
          400: '#5c88db',
          500: '#336ad2',
          700: '#1d4383',
          800: '#163666',
        },
      },
    },
  },
  plugins: [],
};

export default config;