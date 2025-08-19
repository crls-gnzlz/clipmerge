/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eaf2fb',      // azul muy claro
          100: '#d2e2f7',     // azul claro
          200: '#a6c3ef',     // azul suave
          300: '#6fa0e0',     // azul intermedio
          400: '#3977c2',     // azul medio
          500: '#1763d6',     // azul ligeramente más claro que el 600
          600: '#0355d2',     // azul principal (nuevo)
          700: '#023e97',     // azul más oscuro
          800: '#01295e',     // azul muy oscuro
          900: '#01132b',     // casi negro azulado
          950: '#000a15',     // negro profundo
        },
        secondary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#2d3748',
          900: '#1a202c',
          950: '#0F4C81',
        }
      }
    },
  },
  plugins: [],
}
