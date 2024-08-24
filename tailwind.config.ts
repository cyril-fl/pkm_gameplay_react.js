import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/datas/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideAndFade: {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "20%": { opacity: "1", transform: "translateY(100px)" },
          "40%": { opacity: "1", transform: "translateY(100px)" },
          "70%": { opacity: "1", transform: "translateY(100px)" },
          "90%": { opacity: "0", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(0)" },
        },
      },
      animation: {
        slideAndFade: "slideAndFade 4s ease-in-out",
      },

      fontFamily: {
        "jersey-10": ["var(--jersey-10)", "sans-serif"],
        "jersey-15": ["var(--jersey-15)", "sans-serif"],
        "jersey-20": ["var(--jersey-20)", "sans-serif"],
        "jersey-25": ["var(--jersey-25)", "sans-serif"],
        "jacquard-24": ["var(--jacquard-24)", "sans-serif"],
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "GameBoy-screen-s": "#C4CFA1",
        "GameBoy-screen-md": "#8B956D",
        "GameBoy-screen-l": "#4D533C",
        "GameBoy-body-s": "#E6E6E6",
        "GameBoy-body-l": "#BDBDBD",
        "GameBoy-body-xl": "#8F8F8F",
        "GameBoy-body-xxl": "#8C8C8C",
        // "GameBoy-white": "#FFFFFF",
        // "GameBoy-black": "#1F1F1F",
        "GameBoy-black": "#FFFFFF",
        "GameBoy-white": "#1F1F1F",
      },
      aspectRatio: {
        "3/2": "3 / 2",
        "4/3": "4 / 3",
        "16/9": "16 / 9",
        "21/9": "21 / 9",
        "1/1": "1 / 1",
        "4/7": "4 / 7",
        // Ajoute ici d'autres rapports d'aspect si nécessaire
      },
    },
  },
  plugins: [],
};
export default config;
