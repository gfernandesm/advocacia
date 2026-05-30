"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateFaseProcesso } from "@/app/(dashboard)/processos/actions"
import type { FaseProcesso, TipoAcao } from "@/lib/database.types"

// ── tipos ────────────────────────────────────────────────────

type ProcessoRow = {
  id: string
  numero: string | null
  tipo_acao: TipoAcao
  descricao_acao: string | null
  reu_nome: string
  fase_atual: FaseProcesso
  valor_causa: number | null
  clientes: { id: string; nome: string } | null
}

// ── colunas do kanban (7 grupos) ─────────────────────────────

type Coluna = {
  id: string
  label: string
  fases: FaseProcesso[]
  headerCls: string
}

const COLUNAS: Coluna[] = [
  { id: "inicial",       label: "Inicial",          fases: ["inicial"],                                              headerCls: "border-gray-400" },
  { id: "instrucao",     label: "Em Instrução",      fases: ["contestacao", "replica", "embargos_declaracao"],       headerCls: "border-yellow-400" },
  { id: "alegacoes",     label: "Alegações Finais",  fases: ["alegacoes_finais"],                                    headerCls: "border-orange-400" },
  { id: "sentenca",      label: "Sentença",          fases: ["sentenca"],                                            headerCls: "border-blue-400" },
  { id: "recurso",       label: "Recurso",           fases: ["recurso_inominado", "apelacao", "resp", "agresp"],     headerCls: "border-purple-400" },
  { id: "transitado",    label: "Transitado",        fases: ["transitado_julgado", "execucao"],                     headerCls: "border-green-400" },
  { id: "arquivado",     label: "Arquivado",         fases: ["arquivado"],                                          headerCls: "border-red-300" },
]

// ── todas as fases para o select ─────────────────────────────

const TODAS_FASES: { value: FaseProcesso; label: string }[] = [
  { value: "inicial",             label: "Inicial" },
  { value: "contestacao",         label: "Contestação" },
  { value: "replica",             label: "Réplica" },
  { value: "embargos_declaracao", label: "Embargos de Declaração" },
  { value: "alegacoes_finais",    label: "Alegações Finais" },
  { value: "sentenca",            label: "Sentença" },
  { value: "recurso_inominado",   label: "Recurso Inominado" },
  { value: "apelacao",            label: "Apelação" },
  { value: "resp",                label: "REsp" },
  { value: "agresp",              label: "AgREsp" },
  { value: "transitado_julgado",  label: "Transitado em Julgado" },
  { value: "execucao",            label: "Execução" },
  { value: "arquivado",           label: "Arquivado" },
]

const TIPO_ACAO_LABEL: Record<TipoAcao, string> = {
  quinquenio_sextaparte: "Quinquênio/Sexta-parte",
  irpf_inexigibilidade:  "IRPF Inexigível",
  licenca_premio:        "Licença-Prêmio",
  reintegracao_militar:  "Reintegração Militar",
  diarias_diligencia:    "Diárias de Diligência",
  busca_apreensao:       "Busca e Apreensão",
  consumidor:            "Consumidor",
  outro:                 "Outro",
}

function formatValor(v: number | null) {
  if (!v) return null
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ── card ─────────────────────────────────────────────────────

function ProcessoCard({
  processo,
  onFaseChange,
  isPending,
}: {
  processo: ProcessoRow
  onFaseChange: (fase: FaseProcesso) => void
  isPending: boolean
}) {
  return (
    <div className={`bg-card border border-border rounded-lg p-3 space-y-2 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <div>
        <p className="font-medium text-sm text-foreground leading-tight">
          {processo.clientes?.nome ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
          {processo.descricao_acao ?? TIPO_ACAO_LABEL[processo.tipo_acao]}
        </p>
      </div>

      {processo.numero && (
        <p className="font-mono text-xs text-muted-foreground/70 truncate">
          {processo.numero}
        </p>
      )}

      {formatValor(processo.valor_causa) && (
        <p className="text-xs text-muted-foreground">
          {formatValor(processo.valor_causa)}
        </p>
      )}

      <div className="pt-1 border-t border-border">
        <select
          value={processo.fase_atual}
          disabled={isPending}
          onChange={(e) => onFaseChange(e.target.value as FaseProcesso)}
          className="w-full text-xs px-2 py-1 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-gold/50 disabled:opacity-50"
        >
          {TODAS_FASES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ── kanban ───────────────────────────────────────────────────

export function ProcessoKanban({ processos }: { processos: ProcessoRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleFaseChange = (processoId: string, novaFase: FaseProcesso) => {
    startTransition(async () => {
      await updateFaseProcesso(processoId, novaFase)
      router.refresh()
    })
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
      {COLUNAS.map((col) => {
        const cards = processos.filter((p) => col.fases.includes(p.fase_atual))
        return (
          <div key={col.id} className="flex-shrink-0 w-64">
            <div className={`border-t-2 ${col.headerCls} pt-3`}>
              <div className="flex items-center justify-between mb-3 px-0.5">
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-medium">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.map((p) => (
                  <ProcessoCard
                    key={p.id}
                    processo={p}
                    isPending={isPending}
                    onFaseChange={(fase) => handleFaseChange(p.id, fase)}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="border border-dashed border-border rounded-lg h-16 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground/50">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
