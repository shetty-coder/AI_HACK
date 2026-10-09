/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0B0F19',
          card: '#111827',
          cardHover: '#1E293B',
          border: '#1E293B',
          accent: '#06B6D4', // cyan-500
          cyan: '#22D3EE',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
