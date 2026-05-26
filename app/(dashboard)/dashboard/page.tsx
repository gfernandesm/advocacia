import { getConfig } from "@/lib/config";
import { Scale, FileText, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

const agentes = [
  {
    href: "/agentes/revisar-contrato",
    icon: FileText,
    titulo: "Revisar Contrato",
    descricao: "Analisa cláusulas, aponta riscos e pontos de negociação.",
  },
  {
    href: "/agentes/gerar-peticao",
    icon: Scale,
    titulo: "Gerar Petição",
    descricao: "Monta minutas a partir de um chat guiado e templates.",
  },
  {
    href: "/agentes/intake-cliente",
    icon: Users,
    titulo: "Intake de Cliente",
    descricao: "Coleta informações do caso e gera ficha estruturada.",
  },
  {
    href: "/agentes/faq-juridico",
    icon: MessageSquare,
    titulo: "FAQ Jurídico",
    descricao: "Responde dúvidas com base no contexto do escritório.",
  },
];

export default function DashboardPage() {
  const config = getConfig();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Bom dia, {config.nomeResponsavel}
        </h1>
        <p className="text-muted-foreground mt-1">
          O que vamos automatizar hoje?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {agentes.map((agente) => {
          const Icon = agente.icon;
          return (
            <Link
              key={agente.href}
              href={agente.href}
              className="group flex items-start gap-4 p-5 rounded-lg border border-border bg-card hover:border-gold hover:shadow-sm transition-all"
            >
              <div className="mt-0.5 p-2 rounded-md bg-gold/15 text-gold-dark group-hover:bg-gold/25 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">{agente.titulo}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {agente.descricao}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
