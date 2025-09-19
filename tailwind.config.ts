import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4CAF50', // Verde exacto del inventario
          foreground: '#ffffff', // Blanco puro
        },
        secondary: {
          DEFAULT: '#2F4050', // Azul oscuro exacto del inventario
          foreground: '#ffffff', // Blanco puro
        },
        background: '#f8f9fa',
        foreground: '#2c3e50', // Color de texto del inventario
        card: '#ffffff',
        'card-foreground': '#2c3e50',
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#4CAF50',
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#7f8c8d', // Gris más suave
        },
        accent: {
          DEFAULT: '#ecf0f1',
          foreground: '#2c3e50',
        },
        destructive: {
          DEFAULT: '#e74c3c',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
export default config
