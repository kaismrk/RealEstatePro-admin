import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Homy brand
        primary: {
          50:  "#f3edff",
          100: "#e3d4ff",
          200: "#c8a9ff",
          300: "#a578ff",
          400: "#8543ff",
          500: "#5f09fe",
          600: "#4d05d6",
          700: "#3a0699",
          800: "#2a046f",
          900: "#1c0250",
          DEFAULT: "#5f09fe",
        },
        accent: {
          DEFAULT: "#ee8b60",
        },
        // Warm neutrals (matches mobile Homy theme)
        neutral: {
          50:  "#fafafb",
          100: "#f5f5f7",
          200: "#e7e7ec",
          300: "#d3d3db",
          400: "#a1a1ac",
          500: "#6b6b76",
          600: "#4a4a55",
          700: "#2f2f38",
          800: "#1d1d24",
          900: "#0f0f14",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #3a0699 0%, #5f09fe 55%, #ee8b60 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(58,6,153,.08) 0%, rgba(95,9,254,.08) 55%, rgba(238,139,96,.08) 100%)",
      },
      boxShadow: {
        brand: "0 8px 24px rgba(95, 9, 254, .25)",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
