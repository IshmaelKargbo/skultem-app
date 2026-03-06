import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config