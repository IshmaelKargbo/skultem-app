import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    extend: {
      animation: {
        'spin-reverse': 'spin-reverse 2.4s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },,
  },
  plugins: [],
}

export default config