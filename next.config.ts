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
};

export default nextConfig;