/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'github-1': '#9be9a8', // Lightest
        'github-2': '#40c463', 
        'github-3': '#30a14e',
        'github-4': '#216e39', // Darkest
      }
    },
  },
  plugins: [],
} 