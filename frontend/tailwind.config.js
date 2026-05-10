/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Professional Palette
        'primary': '#0D6EFD',
        'primary-light': '#E7F1FF',
        'primary-dark': '#0B5ED7',
        'success': '#198754',
        'success-light': '#D1E7DD',
        'danger': '#DC3545',
        'danger-light': '#F8D7DA',
        'warning': '#FFC107',
        'warning-light': '#FFF3CD',
        'info': '#0DCAF0',
        'info-light': '#CFF4FC',
        // Grays
        'light-gray': '#F8F9FA',
        'lighter-gray': '#F0F2F5',
        'gray-border': '#E9ECEF',
        'gray-text': '#6C757D',
        'dark-gray': '#495057',
        'text-dark': '#212529',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'sm': '6px',
        'base': '8px',
        'lg': '12px',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}

