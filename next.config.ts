import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build para evitar errores de despliegue
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de TypeScript durante el build si es necesario
    ignoreBuildErrors: false,
  },
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SERVER_IP: process.env.NEXT_PUBLIC_SERVER_IP || 'localhost',
    NEXT_PUBLIC_SERVER_PORT: process.env.NEXT_PUBLIC_SERVER_PORT || '3001',
  },
};

export default nextConfig;