import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        line: "var(--line)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accentSoft: "var(--accent-soft)",
        accentStrong: "var(--accent-strong)",
        ok: "var(--green)",
        warn: "var(--amber)",
        danger: "var(--red)",
        info: "var(--blue)",
        violet: "var(--violet)",
      },
      borderRadius: {
        xl2: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,30,20,.04), 0 1px 3px rgba(20,30,20,.06)",
      },
    },
  },
  plugins: [],
};

export default config;
