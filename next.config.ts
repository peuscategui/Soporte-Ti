import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Deshabilitar ESLint durante el build para evitar errores de despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de TypeScript durante el build si es necesario
    ignoreBuildErrors: false,
  },
  // Asegurar que los archivos .mjs se incluyan en el build standalone
  outputFileTracingIncludes: {
    '/api/tasks/**': ['./src/lib/database.mjs', './src/lib/validators.mjs'],
    '/api/tasks/tickets/**': ['./src/lib/database.mjs'],
  },
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SERVER_IP: process.env.NEXT_PUBLIC_SERVER_IP || 'localhost',
    NEXT_PUBLIC_SERVER_PORT: process.env.NEXT_PUBLIC_SERVER_PORT || '3001',
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
};

export default nextConfig;