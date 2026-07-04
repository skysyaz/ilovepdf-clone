import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
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
          dark: "#FF5A4D",
        },
        ink: {
          DEFAULT: "#1F2937",
          dark: "#F9FAFB",
        },
        canvas: {
          DEFAULT: "#F9FAFB",
          dark: "#0B1220",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#111827",
        },
        muted: {
          DEFAULT: "#6B7280",
          dark: "#9CA3AF",
        },
        border: {
          DEFAULT: "#E5E7EB",
          dark: "#1F2937",
        },
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
