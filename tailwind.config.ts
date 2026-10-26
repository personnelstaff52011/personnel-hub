import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: "#05070E",
          900: "#070913",
          850: "#0B0F19",
          800: "#101626",
          700: "#1A233A",
        },
        violet: {
          glow: "#8B5CF6",
          deep: "#6D28D9",
          soft: "#A78BFA",
        },
        cyan: {
          neon: "#06B6D4",
          bright: "#22D3EE",
          electric: "#00F0FF",
        },
      },
      backgroundImage: {
        "gravity-radial": "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%)",
        "singularity-glow": "radial-gradient(circle at center, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 5s ease-in-out infinite",
        "float-fast": "float 3.5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(0.5deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
