/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          dark: '#0e0b24',
          sidebar: '#110d2e',
          card: '#19153b'
        },
        gold: {
          light: '#fde047',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          metallic: '#d4af37',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(16, 24, 40, 0.06), 0 2px 8px -2px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 12px 32px -4px rgba(16, 24, 40, 0.12), 0 4px 12px -2px rgba(16, 24, 40, 0.06)',
        'glow-purple': '0 0 30px rgba(124, 58, 237, 0.35)',
        'glow-blue': '0 0 30px rgba(37, 99, 235, 0.35)',
      }
    },
  },
  plugins: [],
}
