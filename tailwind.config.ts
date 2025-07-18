import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        galmuri: ['Galmuri', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
