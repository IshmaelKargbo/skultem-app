import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./app/**/*.{vue,js,ts,jsx,tsx}"],

  darkMode: "class",

  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      // 🎬 your animations (kept intact)
      animation: {
        "spin-reverse": "spin-reverse 2.4s linear infinite",
      },

      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },

        "fade-up": {
          from: {
            opacity: "0",
            transform: "translateY(16px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      fontFamily: {
        sans: ["Arial", "sans-serif"],
      },

      fontSize: {
        xs: ["11px", "16px"],
        sm: ["12px", "18px"],
        base: ["13px", "20px"],
        lg: ["14px", "22px"],
        xl: ["28px", "34px"],
      },

      colors: {
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          500: "#6b7280",
          900: "#111827",
        },
      },

      spacing: {
        18: "4.5rem",
        28: "7rem",
      },

      width: {
        a4: "794px",
      },

      minHeight: {
        a4: "1123px",
      },

      letterSpacing: {
        wide: "0.5px",
        wider: "0.6px",
      },
    },
  },

  plugins: [],
};

export default config;