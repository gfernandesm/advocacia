import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getConfig } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: config.nomeEscritorio,
    description: `Sistema de automação jurídica — ${config.nomeEscritorio}`,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
