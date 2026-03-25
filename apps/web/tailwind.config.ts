import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agora: {
          bg: "#050505",
          surface: "#0a0e1a",
          border: "#1a2344",
          accent: "#4f8eff",
          cyan: "#39d8ff",
          violet: "#8f7dff",
          gold: "#e3c27a",
          claude: "#d97706",
          codex: "#10b981",
          meta: "#8b5cf6",
          user: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        tech: ["Orbitron", "Rajdhani", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 4s infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "reverse-spin-slow": "reverse-spin-slow 25s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", filter: "blur(10px)" },
          "50%": { opacity: "1", filter: "blur(20px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "reverse-spin-slow": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
