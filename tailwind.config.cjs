/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // antd ships its own reset; disabling preflight avoids button/heading conflicts with antd components.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#E63946", 50: "#FDECEE", 100: "#FAD3D7", 600: "#D62839", 700: "#B21E2E" },
        ink: { DEFAULT: "#0F0F12", soft: "#3F3F46" },
        muted: "#6B6B76",
        canvas: "#F6F6F8",
        line: { DEFAULT: "#E9E9EE", soft: "#F0F0F3" },
        sidebar: "#0B0B0E",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 15, 18, 0.04), 0 1px 1px rgba(15, 15, 18, 0.02)",
        lift: "0 12px 32px -12px rgba(15, 15, 18, 0.18)",
      },
    },
  },
  plugins: [],
};
