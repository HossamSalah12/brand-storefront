import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f1626",
        bone: "#faf7f1",
        stone: "#9c9284",
        "stone-light": "#e7ddcb",
        clay: "#b3894f",
        moss: "#5b6355",
        navy: "#0f1626",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Segoe UI", "Tahoma", "Arial", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
      letterSpacing: {
        widest2: "0.2em",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
