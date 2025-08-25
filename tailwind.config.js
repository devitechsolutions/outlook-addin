/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/taskpane/**/*.{js,jsx,ts,tsx,html}",
    "./src/commands/**/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3f9',
          100: '#cce7f3',
          200: '#99cfe7',
          300: '#66b7db',
          400: '#339fcf',
          500: '#0075a8',
          600: '#005e86',
          700: '#004665',
          800: '#002f43',
          900: '#001722',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
      }
    },
  },
  plugins: [],
}