"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Pencil, Trash2, X } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { updateFaseProcesso, deleteProcesso } from "@/app/(dashboard)/processos/actions"
import { EditarProcessoDialog } from "./editar-processo-dialog"
import type { FaseProcesso, TipoAcao, Processo } from "@/lib/database.types"

type ProcessoRow = Pick<Processo,
  "id" | "numero" | "tipo_acao" | "descricao_acao" | "reu_nome" | "reu_tipo"
  | "vara" | "tribunal" | "comarca" | "fase_atual" | "valor_causa" | "resultado" | "observacoes"
  | "cliente_id" | "created_at" | "updated_at"
> & {
  clientes: { id: string; nome: string } | null
}

// ── colunas ──────────────────────────────────────────────────

const COLUNAS = [
  { id: "inicial",    label: "Inicial",         fases: ["inicial"] as FaseProcesso[],                                              cls: "border-gray-400" },
  { id: "instrucao",  label: "Em Instrução",     fases: ["contestacao","replica","embargos_declaracao"] as FaseProcesso[],         cls: "border-yellow-400" },
  { id: "alegacoes",  label: "Alegações Finais", fases: ["alegacoes_finais"] as FaseProcesso[],                                    cls: "border-orange-400" },
  { id: "sentenca",   label: "Sentença",         fases: ["sentenca"] as FaseProcesso[],                                            cls: "border-blue-400" },
  { id: "recurso",    label: "Recurso",          fases: ["recurso_inominado","apelacao","resp","agresp"] as FaseProcesso[],        cls: "border-purple-400" },
  { id: "transitado", label: "Transitado",       fases: ["transitado_julgado","execucao"] as FaseProcesso[],                     cls: "border-green-400" },
  { id: "arquivado",  label: "Arquivado",        fases: ["arquivado"] as FaseProcesso[],                                          cls: "border-red-300" },
]

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

// ── confirm exclusão ─────────────────────────────────────────

function ConfirmarExclusaoProcesso({ processo, open, onOpenChange }: {
  processo: ProcessoRow; open: boolean; onOpenChange: (v: boolean) => void
}) {
  const [erro, setErro] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) setErro(""); onOpenChange(v) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background border border-border rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-foreground">Excluir processo</Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></Dialog.Close>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Excluir o processo de <span className="font-medium text-foreground">{processo.clientes?.nome}</span>?
          </p>
          <p className="text-xs text-muted-foreground mb-4">Eventos e documentos vinculados também serão removidos.</p>
          {erro && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md mb-4">{erro}</p>}
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
            </Dialog.Close>
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => {
                const r = await deleteProcesso(processo.id)
                if (r.error) { setErro(r.error) } else { onOpenChange(false); router.refresh() }
              })}
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── card ─────────────────────────────────────────────────────

function ProcessoCard({ processo, onFaseChange, isPending }: {
  processo: ProcessoRow
  onFaseChange: (fase: FaseProcesso) => void
  isPending: boolean
}) {
  const [editando, setEditando]     = useState(false)
  const [excluindo, setExcluindo]   = useState(false)

  return (
    <>
      <div className={`bg-card border border-border rounded-lg p-3 space-y-2 transition-opacity ${isPending ? "opacity-50" : ""}`}>
        {/* Header do card — clicável para detalhe */}
        <Link href={`/processos/${processo.id}`} className="block group">
          <p className="font-medium text-sm text-foreground leading-tight group-hover:text-gold-dark transition-colors">
            {processo.clientes?.nome ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
            {processo.descricao_acao ?? TIPO_ACAO_LABEL[processo.tipo_acao]}
          </p>
          {processo.numero && (
            <p className="font-mono text-xs text-muted-foreground/70 mt-1 truncate">{processo.numero}</p>
          )}
          {formatValor(processo.valor_causa) && (
            <p className="text-xs text-muted-foreground mt-1">{formatValor(processo.valor_causa)}</p>
          )}
        </Link>

        {/* Fase + ações */}
        <div className="pt-2 border-t border-border space-y-1.5">
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

          <div className="flex gap-1 justify-end">
            <button
              onClick={() => setEditando(true)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Editar"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={() => setExcluindo(true)}
              className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Excluir"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <EditarProcessoDialog
        processo={processo as never}
        open={editando}
        onOpenChange={setEditando}
      />
      <ConfirmarExclusaoProcesso
        processo={processo}
        open={excluindo}
        onOpenChange={setExcluindo}
      />
    </>
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
            <div className={`border-t-2 ${col.cls} pt-3`}>
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
