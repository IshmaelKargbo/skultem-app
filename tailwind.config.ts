import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      borderRadius: {
        xl: '1rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/typography'),
  ],
}

export default config