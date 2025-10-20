import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        slate: {
          50: "#f6f5f1",
          100: "#eeede7",
          200: "#e1dfd8",
          300: "#cbc9be",
          400: "#a9a79d",
          500: "#86857a",
          600: "#69685f",
          700: "#4f4e46",
          800: "#2d3546",
          900: "#1e293b",
          950: "#0f172a",
        },
        gray: {
          100: "#ebeae5",
          200: "#dcdad4",
          300: "#c5c4bb",
          400: "#a3a398",
          500: "#828276",
          600: "#65655c",
          700: "#4d4d46",
          800: "#35352f",
          900: "#23231f",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#0f9f75",
          700: "#0d7f63",
        },
        green: {
          400: "#34d399",
          500: "#22c55e",
          600: "#16a34a",
        },
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        purple: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        fuchsia: {
          400: "#f0abfc",
          500: "#d946ef",
          600: "#c026d3",
        },
        pink: {
          400: "#f9a8d4",
          500: "#f472b6",
          600: "#ec4899",
        },
        surface: {
          muted: "var(--color-surface-muted)",
          strong: "var(--color-surface-strong)",
        },
        link: {
          DEFAULT: "var(--color-link)",
          hover: "var(--color-link-hover)",
        },
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          foreground: "var(--color-sidebar-foreground)",
          accent: "var(--color-sidebar-accent)",
          "accent-foreground": "var(--color-sidebar-accent-foreground)",
          primary: "var(--color-sidebar-primary)",
          "primary-foreground": "var(--color-sidebar-primary-foreground)",
          border: "var(--color-sidebar-border)",
          ring: "var(--color-sidebar-ring)",
        },
        sport: {
          DEFAULT: "var(--color-sport)",
          soft: "var(--color-sport-soft)",
        },
        investing: {
          DEFAULT: "var(--color-investing)",
          soft: "var(--color-investing-soft)",
        },
        business: {
          DEFAULT: "var(--color-business)",
          soft: "var(--color-business-soft)",
        },
        education: {
          DEFAULT: "var(--color-education)",
          soft: "var(--color-education-soft)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
};

export default config;
