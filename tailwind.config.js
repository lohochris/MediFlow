/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // enables class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // scan all react files
  ],
  theme: {
    extend: {
      colors: {
        // Brand color used in Header.jsx: bg-brand
        brand: "#059669", // emerald-600 (green)
      },
    },
  },
  plugins: [],
};
