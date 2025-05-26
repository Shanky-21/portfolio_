/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
  ],
  theme: {
    extend: {
      colors: {
        'github-1': '#9be9a8', // Lightest
        'github-2': '#40c463', 
        'github-3': '#30a14e',
        'github-4': '#216e39', // Darkest
        category: {
          DEFAULT: '#6B7280', // gray-500
          react: '#06B6D4',     // cyan-500
          nextjs: '#3B82F6',   // blue-500
          typescript: '#0EA5E9',// sky-500
          tailwind: '#14B8A6', // teal-500
          javascript: '#F59E0B',// yellow-500
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            a: {
              color: theme('colors.sky.600'),
              '&:hover': {
                color: theme('colors.sky.700'),
              },
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.sky.400'),
              '&:hover': {
                color: theme('colors.sky.500'),
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.gray.100'),
            },
            code: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.300'),
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
              color: theme('colors.gray.300'),
            },
            blockquote: {
              borderColor: theme('colors.sky.400'),
            }
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 