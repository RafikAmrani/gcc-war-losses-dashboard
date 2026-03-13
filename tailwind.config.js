/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bloomberg: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1e1e1e',
          panel: '#161616',
          orange: '#f97316',
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          muted: '#6b7280',
          text: '#e5e7eb',
          dim: '#9ca3af',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

