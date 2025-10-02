import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/layout/LayoutWrapper";
import AdminRoleEnforcer from "../components/AdminRoleEnforcer";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        <AdminRoleEnforcer />
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
