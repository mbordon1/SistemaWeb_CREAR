/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-dark': '#6D28D9',
        'primary-light': '#EDE9FE',
        'primary-subtle': '#F4F2FF',
        teal: '#0D9488',
        'teal-dark': '#0F766E',
        'teal-light': '#CCFBF1',
        sidebar: '#2E1065',
        'sidebar-end': '#3B0764',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 16px 0 rgb(124 58 237 / 0.10)',
        'card-lg': '0 8px 32px 0 rgb(124 58 237 / 0.14)',
      },
      animation: {
        'fade-up': 'fadeUp 0.25s ease-out both',
        'fade-in': 'fadeIn 0.2s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
