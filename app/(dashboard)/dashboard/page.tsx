import { createServerClient } from "@/lib/supabase/server"
import { getConfig } from "@/lib/config"
import { FolderOpen, CheckCircle2, Clock, XCircle, TrendingUp, AlertCircle, Users, FileText } from "lucide-react"
import Link from "next/link"
import { FiltroPeriodo } from "@/components/dashboard/filtro-periodo"

// ── helpers ──────────────────────────────────────────────────

function dataInicioPeriodo(periodo: string): string | null {
  const hoje = new Date()
  switch (periodo) {
    case "mes":
      return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
    case "trimestre":
      return new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1).toISOString()
    case "ano":
      return new Date(hoje.getFullYear(), 0, 1).toISOString()
    default:
      return null
  }
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// ── card de métrica ───────────────────────────────────────────

function KpiCard({ label, valor, sub, icon, cor, href }: {
  label: string
  valor: string | number
  sub?: string
  icon: React.ReactNode
  cor: string
  href?: string
}) {
  const inner = (
    <div className={`border border-border rounded-lg p-5 flex items-start justify-between ${href ? "hover:border-gold/50 hover:shadow-sm transition-all cursor-pointer" : ""}`}>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-semibold mt-1 ${cor}`}>{valor}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-lg mt-0.5 ${cor.replace("text-", "bg-").replace("-700","-100").replace("-600","-100").replace("-500","-100")}`}>
        {icon}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

// ── separador de seção ────────────────────────────────────────

function Secao({ titulo }: { titulo: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">{titulo}</p>
  )
}

// ── página ───────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const { periodo = "total" } = await searchParams
  const supabase = createServerClient()
  const config   = getConfig()
  const dataInicio = dataInicioPeriodo(periodo)

  // Processos
  let qProcessos = supabase.from("processos").select("id, resultado, created_at, fase_atual")
  if (dataInicio) qProcessos = qProcessos.gte("created_at", dataInicio)
  const { data: processos } = await qProcessos

  const totalProcessos     = processos?.length ?? 0
  const emAndamento        = processos?.filter((p) => p.resultado === "em_andamento").length ?? 0
  const concluidos         = processos?.filter((p) => ["procedente","parcialmente_procedente","acordo"].includes(p.resultado)).length ?? 0
  const arquivados         = processos?.filter((p) => ["arquivado","improcedente"].includes(p.resultado)).length ?? 0

  // Clientes
  let qClientes = supabase.from("clientes").select("id, created_at")
  if (dataInicio) qClientes = qClientes.gte("created_at", dataInicio)
  const { data: clientes } = await qClientes
  const totalClientes = clientes?.length ?? 0

  // Parcelas (financeiro)
  const { data: parcelas } = await supabase.from("parcelas").select("valor, status, data_vencimento")
  const hoje = new Date().toISOString().split("T")[0]
  const totalFaturado  = parcelas?.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0) ?? 0
  const totalReceber   = parcelas?.filter((p) => p.status === "pendente").reduce((s, p) => s + p.valor, 0) ?? 0
  const totalAtrasado  = parcelas?.filter((p) => p.status === "pendente" && p.data_vencimento < hoje).reduce((s, p) => s + p.valor, 0) ?? 0

  // Documentos gerados no período
  let qDocs = supabase.from("documentos").select("id, created_at")
  if (dataInicio) qDocs = qDocs.gte("created_at", dataInicio)
  const { data: documentos } = await qDocs
  const totalDocumentos = documentos?.length ?? 0

  // Últimos processos
  type UltimoProcesso = {
    id: string; descricao_acao: string | null; tipo_acao: string
    fase_atual: string; resultado: string
    clientes: { nome: string } | null
  }
  const { data: ultimosProcessosRaw } = await supabase
    .from("processos")
    .select("id, descricao_acao, tipo_acao, fase_atual, resultado, clientes(nome)")
    .order("created_at", { ascending: false })
    .limit(5)
  const ultimosProcessos = (ultimosProcessosRaw as unknown as UltimoProcesso[]) ?? []

  const FASE_COR: Record<string, string> = {
    inicial: "bg-gray-100 text-gray-600",
    contestacao: "bg-yellow-100 text-yellow-700",
    replica: "bg-yellow-100 text-yellow-700",
    embargos_declaracao: "bg-yellow-100 text-yellow-700",
    alegacoes_finais: "bg-orange-100 text-orange-700",
    sentenca: "bg-blue-100 text-blue-700",
    recurso_inominado: "bg-purple-100 text-purple-700",
    apelacao: "bg-purple-100 text-purple-700",
    resp: "bg-purple-100 text-purple-700",
    agresp: "bg-purple-100 text-purple-700",
    transitado_julgado: "bg-green-100 text-green-700",
    execucao: "bg-teal-100 text-teal-700",
    arquivado: "bg-red-100 text-red-400",
  }

  const FASE_LABEL: Record<string, string> = {
    inicial: "Inicial", contestacao: "Contestação", replica: "Réplica",
    embargos_declaracao: "Embargos", alegacoes_finais: "Alegações Finais",
    sentenca: "Sentença", recurso_inominado: "Recurso", apelacao: "Apelação",
    resp: "REsp", agresp: "AgREsp", transitado_julgado: "Transitado",
    execucao: "Execução", arquivado: "Arquivado",
  }

  const TIPO_ACAO_LABEL: Record<string, string> = {
    quinquenio_sextaparte: "Quinquênio/Sexta-parte",
    irpf_inexigibilidade: "IRPF Inexigível",
    licenca_premio: "Licença-Prêmio",
    reintegracao_militar: "Reintegração Militar",
    diarias_diligencia: "Diárias de Diligência",
    busca_apreensao: "Busca e Apreensão",
    consumidor: "Consumidor",
    outro: "Outro",
  }

  const saudacao = () => {
    const h = new Date().getHours()
    if (h < 12) return "Bom dia"
    if (h < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {saudacao()}, {config.nomeResponsavel}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {config.nomeEscritorio}
          </p>
        </div>
        <FiltroPeriodo periodoAtual={periodo} />
      </div>

      {/* Processos */}
      <Secao titulo="Processos" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Total"
          valor={totalProcessos}
          icon={<FolderOpen className="h-5 w-5 text-blue-600" />}
          cor="text-blue-600"
          href="/processos"
        />
        <KpiCard
          label="Em andamento"
          valor={emAndamento}
          sub={totalProcessos ? `${Math.round((emAndamento/totalProcessos)*100)}% do total` : undefined}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          cor="text-yellow-600"
          href="/processos"
        />
        <KpiCard
          label="Concluídos"
          valor={concluidos}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          cor="text-green-600"
        />
        <KpiCard
          label="Arquivados"
          valor={arquivados}
          icon={<XCircle className="h-5 w-5 text-red-400" />}
          cor="text-red-400"
        />
      </div>

      {/* Financeiro */}
      <Secao titulo="Financeiro" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Total faturado"
          valor={fmt(totalFaturado)}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          cor="text-green-600"
          href="/financeiro"
        />
        <KpiCard
          label="A receber"
          valor={fmt(totalReceber)}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          cor="text-blue-600"
          href="/contratos"
        />
        <KpiCard
          label="Em atraso"
          valor={fmt(totalAtrasado)}
          sub={totalAtrasado > 0 ? "Requer atenção" : "Nenhum atraso"}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          cor={totalAtrasado > 0 ? "text-red-500" : "text-muted-foreground"}
          href="/financeiro"
        />
      </div>

      {/* Outros */}
      <Secao titulo="Geral" />
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <KpiCard
          label="Clientes"
          valor={totalClientes}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          cor="text-purple-600"
          href="/clientes"
        />
        <KpiCard
          label="Documentos gerados"
          valor={totalDocumentos}
          icon={<FileText className="h-5 w-5 text-orange-500" />}
          cor="text-orange-500"
        />
      </div>

      {/* Últimos processos */}
      {ultimosProcessos && ultimosProcessos.length > 0 && (
        <>
          <Secao titulo="Processos recentes" />
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {ultimosProcessos.map((p) => (
                  <Link key={p.id} href={`/processos/${p.id}`} legacyBehavior>
                    <tr className="hover:bg-muted/20 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {p.clientes?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p.descricao_acao ?? TIPO_ACAO_LABEL[p.tipo_acao] ?? p.tipo_acao}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${FASE_COR[p.fase_atual] ?? "bg-gray-100 text-gray-600"}`}>
                          {FASE_LABEL[p.fase_atual] ?? p.fase_atual}
                        </span>
                      </td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 border-t border-border bg-muted/10">
              <Link href="/processos" className="text-xs text-gold-dark hover:underline">
                Ver todos os processos →
              </Link>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
