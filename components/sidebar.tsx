"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, MessageSquare, LayoutDashboard, LogOut, BookUser, ClipboardList, FileOutput, ScrollText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscritorioConfig } from "@/lib/types";

const navItems = [
  { href: "/dashboard",                label: "Início",          icon: LayoutDashboard },
  { href: "/clientes",                 label: "Clientes",        icon: BookUser },
  { href: "/processos",                label: "Processos",       icon: ClipboardList },
  { href: "/documentos",               label: "Gerar Documento", icon: FileOutput },
  { href: "/contratos",                label: "Contratos",       icon: ScrollText },
  { href: "/financeiro",               label: "Financeiro",      icon: TrendingUp },
  { href: "/agentes/revisar-contrato", label: "Revisar Contrato",icon: FileText },
  { href: "/agentes/faq-juridico",     label: "FAQ Jurídico",    icon: MessageSquare },
];

export function Sidebar({ config }: { config: EscritorioConfig }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col bg-navy text-white">
      <div className="flex flex-col items-center gap-3 px-4 py-6 border-b border-white/10">
        {config.logo ? (
          <Image
            src={config.logo}
            alt={config.nomeEscritorio}
            width={72}
            height={72}
            className="rounded-lg object-contain"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gold/20 flex items-center justify-center">
            <Scale className="h-8 w-8 text-gold" />
          </div>
        )}
        <div className="text-center">
          <p className="font-semibold text-sm text-white leading-tight">
            {config.nomeEscritorio}
          </p>
          <p className="text-xs text-white/50 mt-0.5">OAB/{config.estadoOAB}</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-gold text-navy font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
