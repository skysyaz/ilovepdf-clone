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
        brand: {
          DEFAULT: "#E5322D",
          hover: "#FF6B35",
          dark: "#B8281F",
        },
        ink: "#1F2937",
        canvas: "#F9FAFB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 14px rgba(15, 23, 42, 0.08)",
        cta: "0 8px 24px rgba(229, 50, 45, 0.32)",
      },
    },
  },
  plugins: [],
};
export default config;
