/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        'accent-green': 'hsl(var(--accent-green))',
        // Sistema de colores moderno
        'header-primary': '#283447', // Azul oscuro elegante (mismo que inventario)
        'sidebar-active': '#27ae60', // Verde vibrante
        'background-main': '#f8f9fc', // Gris muy claro con tinte azul
        'card-white': '#ffffff', // Blanco puro
        'border-subtle': '#e9ecef', // Gris muy sutil
        'text-secondary': '#6c757d', // Gris para texto secundario
        
        // Zebra striping moderno
        'zebra-even': 'rgba(0,123,255,0.03)', // Azul muy sutil para filas pares
        'zebra-hover': 'rgba(0,123,255,0.08)', // Azul para hover
        
        // Badges y categorías con color
        'badge-sistema': '#e3f2fd', // Azul claro
        'badge-laptop': '#f3e5f5', // Púrpura claro
        'badge-hardware': '#e8f5e8', // Verde claro
        'badge-impresora': '#fff3e0', // Naranja claro
        
        // Colores legacy para compatibilidad
        'blue-pastel': {
          DEFAULT: '#2c3e50', // Usar header-primary
          foreground: '#ffffff',
          light: '#f8f9fc', // Usar background-main
          medium: '#e3f2fd', // Usar badge-sistema
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
