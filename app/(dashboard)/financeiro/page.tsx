import { createServerClient } from "@/lib/supabase/server"
import { TrendingUp, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

function MetricCard({ label, valor, sub, icon, cor }: {
  label: string; valor: string; sub?: string
  icon: React.ReactNode; cor: string
}) {
  return (
    <div className="border border-border rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${cor}`}>{valor}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${cor.replace("text-", "bg-").replace("-600", "-100").replace("-700", "-100")}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default async function FinanceiroPage() {
  const supabase = createServerClient()

  const { data: parcelas } = await supabase
    .from("parcelas")
    .select(`
      id, numero, valor, data_vencimento, data_pagamento, status,
      contratos ( id, modelo, clientes(nome), processos(descricao_acao, tipo_acao) )
    `)
    .order("data_vencimento")

  const hoje = new Date().toISOString().split("T")[0]

  const totalRecebido = parcelas?.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0) ?? 0
  const totalPendente = parcelas?.filter((p) => p.status === "pendente").reduce((s, p) => s + p.valor, 0) ?? 0
  const totalVencido  = parcelas?.filter((p) => p.status === "vencido" || (p.status === "pendente" && p.data_vencimento < hoje)).reduce((s, p) => s + p.valor, 0) ?? 0

  const proximas = parcelas
    ?.filter((p) => p.status === "pendente" && p.data_vencimento >= hoje)
    .slice(0, 10) ?? []

  const vencidas = parcelas
    ?.filter((p) => p.status === "pendente" && p.data_vencimento < hoje) ?? []

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const fmtData = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR")

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral de honorários e pagamentos</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total recebido"
          valor={fmt(totalRecebido)}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          cor="text-green-600"
        />
        <MetricCard
          label="A receber"
          valor={fmt(totalPendente)}
          sub={`${proximas.length} parcela(s) próxima(s)`}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          cor="text-blue-600"
        />
        <MetricCard
          label="Em atraso"
          valor={fmt(totalVencido)}
          sub={vencidas.length > 0 ? `${vencidas.length} parcela(s) vencida(s)` : "Sem atrasos"}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          cor={vencidas.length > 0 ? "text-red-500" : "text-muted-foreground"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Próximos vencimentos */}
        <div className="border border-border rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Próximos vencimentos</h2>
          </div>
          {proximas.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Nenhum vencimento pendente.</p>
          ) : (
            <div className="divide-y divide-border">
              {proximas.map((p) => {
                const contrato = p.contratos as { clientes: { nome: string } | null; processos: { descricao_acao: string | null; tipo_acao: string } | null } | null
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {contrato?.clientes?.nome ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.numero}ª parcela · vence {fmtData(p.data_vencimento)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{fmt(p.valor)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Parcelas em atraso */}
        <div className="border border-border rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-foreground">Em atraso</h2>
          </div>
          {vencidas.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma parcela em atraso.</p>
          ) : (
            <div className="divide-y divide-border">
              {vencidas.map((p) => {
                const contrato = p.contratos as { clientes: { nome: string } | null } | null
                const diasAtraso = Math.floor((new Date().getTime() - new Date(p.data_vencimento).getTime()) / 86400000)
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{contrato?.clientes?.nome ?? "—"}</p>
                      <p className="text-xs text-red-500">{diasAtraso}d de atraso · venceu {fmtData(p.data_vencimento)}</p>
                    </div>
                    <p className="text-sm font-semibold text-red-500">{fmt(p.valor)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <div className="flex justify-end">
        <Link href="/contratos" className="text-sm text-gold-dark hover:underline">
          Ver todos os contratos →
        </Link>
      </div>
    </div>
  )
}
