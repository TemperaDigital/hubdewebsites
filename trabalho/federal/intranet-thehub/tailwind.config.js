/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens "The Hub" (ver PRD v3 - Seção 15)
        hub: {
          primary: '#1B2A4A',      // navy do hero e navegação
          'primary-700': '#243a63',
          'primary-600': '#2d4675',
          accent: '#F5B301',       // âmbar (barra de seção, destaques)
          bg: '#F4F6F9',           // fundo geral
          card: '#FFFFFF',
          muted: '#64748B',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: { xl: '0.9rem' },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,.06), 0 1px 2px rgba(16,24,40,.04)',
        cardHover: '0 6px 20px rgba(16,24,40,.10)',
      },
    },
  },
  plugins: [],
}
