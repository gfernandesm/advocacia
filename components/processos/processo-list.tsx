"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"
import { Search, FolderOpen } from "lucide-react"
import type { FaseProcesso, TipoAcao } from "@/lib/database.types"

// ── tipos ────────────────────────────────────────────────────

type ProcessoRow = {
  id: string
  numero: string | null
  tipo_acao: TipoAcao
  descricao_acao: string | null
  reu_nome: string
  tribunal: string | null
  comarca: string | null
  fase_atual: FaseProcesso
  valor_causa: number | null
  clientes: { id: string; nome: string } | null
}

// ── labels & cores ───────────────────────────────────────────

const FASE: Record<FaseProcesso, { label: string; cls: string }> = {
  inicial:              { label: "Inicial",           cls: "bg-gray-100 text-gray-600" },
  contestacao:          { label: "Contestação",        cls: "bg-yellow-100 text-yellow-700" },
  replica:              { label: "Réplica",            cls: "bg-yellow-100 text-yellow-700" },
  embargos_declaracao:  { label: "Embargos",           cls: "bg-yellow-100 text-yellow-700" },
  alegacoes_finais:     { label: "Alegações Finais",   cls: "bg-orange-100 text-orange-700" },
  sentenca:             { label: "Sentença",           cls: "bg-blue-100 text-blue-700" },
  recurso_inominado:    { label: "Recurso Inominado",  cls: "bg-purple-100 text-purple-700" },
  apelacao:             { label: "Apelação",           cls: "bg-purple-100 text-purple-700" },
  resp:                 { label: "REsp",               cls: "bg-purple-100 text-purple-700" },
  agresp:               { label: "AgREsp",             cls: "bg-purple-100 text-purple-700" },
  transitado_julgado:   { label: "Transitado",         cls: "bg-green-100 text-green-700" },
  execucao:             { label: "Execução",           cls: "bg-teal-100 text-teal-700" },
  arquivado:            { label: "Arquivado",          cls: "bg-red-100 text-red-400" },
}

const TIPO_ACAO: Record<TipoAcao, string> = {
  quinquenio_sextaparte:  "Quinquênio/Sexta-parte",
  irpf_inexigibilidade:   "IRPF Inexigível",
  licenca_premio:         "Licença-Prêmio",
  reintegracao_militar:   "Reintegração Militar",
  diarias_diligencia:     "Diárias de Diligência",
  busca_apreensao:        "Busca e Apreensão",
  consumidor:             "Consumidor",
  outro:                  "Outro",
}

const FASES_FILTRO: { value: string; label: string }[] = [
  { value: "",                   label: "Todas as fases" },
  { value: "inicial",            label: "Inicial" },
  { value: "contestacao",        label: "Contestação" },
  { value: "replica",            label: "Réplica" },
  { value: "embargos_declaracao",label: "Embargos" },
  { value: "alegacoes_finais",   label: "Alegações Finais" },
  { value: "sentenca",           label: "Sentença" },
  { value: "recurso_inominado",  label: "Recurso Inominado" },
  { value: "apelacao",           label: "Apelação" },
  { value: "resp",               label: "REsp" },
  { value: "agresp",             label: "AgREsp" },
  { value: "transitado_julgado", label: "Transitado" },
  { value: "execucao",           label: "Execução" },
  { value: "arquivado",          label: "Arquivado" },
]

function formatValor(v: number | null) {
  if (v === null) return "—"
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ── componente ───────────────────────────────────────────────

export function ProcessoList({
  processos,
  searchQuery,
  faseFilter,
}: {
  processos: ProcessoRow[]
  searchQuery?: string
  faseFilter?: string
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      router.replace(`${pathname}?${next.toString()}`)
    },
    [router, pathname, params]
  )

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar processo, réu..."
            defaultValue={searchQuery ?? ""}
            onChange={(e) => setParam("q", e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50 w-64"
          />
        </div>
        <select
          value={faseFilter ?? ""}
          onChange={(e) => setParam("fase", e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
        >
          {FASES_FILTRO.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {processos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery || faseFilter
              ? "Nenhum processo encontrado para esse filtro."
              : "Nenhum processo cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Número</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo de Ação</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Réu</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fase</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Valor da Causa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processos.map((p) => {
                const fase = FASE[p.fase_atual]
                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{p.clientes?.nome ?? "—"}</p>
                      {p.comarca && (
                        <p className="text-xs text-muted-foreground">{p.comarca}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.numero ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.descricao_acao ?? TIPO_ACAO[p.tipo_acao]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.reu_nome}
                      {p.tribunal && (
                        <p className="text-xs">{p.tribunal}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${fase.cls}`}>
                        {fase.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatValor(p.valor_causa)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
