/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e1ebf5',
          200: '#c2d7eb',
          300: '#a3c2e1',
          400: '#6699ce',
          500: '#2970ba',
          600: '#0A2540',
          700: '#09213a',
          800: '#071b2d',
          900: '#061625',
          950: '#040e18',
        },
        secondary: {
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
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563eb',
        }
      },
    },
  },
  plugins: [],
}

