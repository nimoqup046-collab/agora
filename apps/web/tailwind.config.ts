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
          bg: "#030508",
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
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
