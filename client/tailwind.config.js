/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        foreground: "#f8f8f8",
        card: "#121215",
        "card-foreground": "#f8f8f8",
        popover: "#0a0a0c",
        "popover-foreground": "#f8f8f8",
        primary: {
          DEFAULT: "#00ffa3", // Neon accent
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1e1e22",
          foreground: "#f8f8f8",
        },
        muted: {
          DEFAULT: "#1e2126",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "#00e5ff", // Another neon accent
          foreground: "#000000",
        },
        border: "#27272a",
        input: "#27272a",
        ring: "#00ffa3",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: 1, filter: "brightness(1)" },
          "50%": {
            opacity: 0.8,
            filter: "brightness(1.5) drop-shadow(0 0 10px #00ffa3)",
          },
        },
      },
    },
  },
  plugins: [],
};
