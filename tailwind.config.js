/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode via class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "color-gray-900":"oklch(21% 0.034 264.665)",
        "color-gray-800":"oklch(27.8% 0.033 256.848)",
        "color-gray-200":"oklch(92.8% 0.006 264.531)",
        "color-gray-100":"oklch(96.7% 0.003 264.542)",
        "color-blue-300":"oklch(80.9% 0.105 251.813)",
        "color-blue-100":"oklch(93.2% 0.032 255.585)",
        "color-blue-400":"oklch(70.7% 0.165 254.624)",
        "color-blue-600":"oklch(54.6% 0.245 262.881)",
        "color-blue-700":"oklch(48.8% 0.243 264.376)",
        // "color-blue-800":"#2E4BB0",
      },
    },
  },
  plugins: [],
};