import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "../components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "EFC Soporte TI",
  description: "Sistema de gestión de soporte técnico EFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
