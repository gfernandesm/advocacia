"use client"

import { useEffect, useRef, useState, useActionState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Plus, X } from "lucide-react"
import { createContrato } from "@/app/(dashboard)/contratos/actions"

type ProcessoOption = {
  id: string
  descricao_acao: string | null
  tipo_acao: string
  reu_nome: string
  cliente_id: string
  clientes: { id: string; nome: string } | null
}

const cls = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
const lbl = "block text-sm font-medium text-foreground mb-1"

export function NovoContratoDialog({ processos }: { processos: ProcessoOption[] }) {
  const [open, setOpen]       = useState(false)
  const [modelo, setModelo]   = useState<"parcelado_fixo" | "percentual_exito">("parcelado_fixo")
  const [processoId, setProcessoId] = useState("")
  const [state, formAction, isPending] = useActionState(createContrato, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && !state.error) { setOpen(false); formRef.current?.reset() }
  }, [state])

  const processoSelecionado = processos.find((p) => p.id === processoId)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors">
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">Novo Contrato</Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></Dialog.Close>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4">

            {/* Processo */}
            <div>
              <label className={lbl}>Processo <span className="text-red-500">*</span></label>
              <select
                name="processo_id"
                required
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
                className={cls}
              >
                <option value="">Selecione um processo...</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.clientes as { nome: string } | null)?.nome} — {p.descricao_acao ?? p.tipo_acao}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo oculto para cliente_id */}
            <input type="hidden" name="cliente_id" value={processoSelecionado?.cliente_id ?? ""} />

            {/* Modelo */}
            <div>
              <label className={lbl}>Modelo de honorários</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "parcelado_fixo", label: "Parcelado fixo" },
                  { value: "percentual_exito", label: "Percentual de êxito" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm transition-colors ${
                      modelo === opt.value ? "border-gold bg-gold/10 text-navy font-medium" : "border-border text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="modelo"
                      value={opt.value}
                      checked={modelo === opt.value}
                      onChange={() => setModelo(opt.value as typeof modelo)}
                      className="accent-gold"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Campos por modelo */}
            {modelo === "parcelado_fixo" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Valor total (R$) <span className="text-red-500">*</span></label>
                  <input name="valor_total" required placeholder="3.500,00" className={cls} />
                </div>
                <div>
                  <label className={lbl}>Parcelas <span className="text-red-500">*</span></label>
                  <input name="num_parcelas" required type="number" min="1" placeholder="7" className={cls} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Percentual de êxito (%) <span className="text-red-500">*</span></label>
                  <input name="percentual_exito" required placeholder="30" className={cls} />
                </div>
                <div>
                  <label className={lbl}>Base de cálculo</label>
                  <input name="base_calculo_exito" placeholder="valor econômico obtido na ação" className={cls} />
                </div>
              </div>
            )}

            {/* Plataforma */}
            <div>
              <label className={lbl}>Plataforma de assinatura</label>
              <select name="plataforma_assinatura" defaultValue="pendente" className={cls}>
                <option value="pendente">Pendente</option>
                <option value="d4sign">D4Sign</option>
                <option value="clicksign">Clicksign</option>
                <option value="fisico">Físico</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Observações</label>
              <textarea name="observacoes" rows={2} className={`${cls} resize-none`} placeholder="Notas internas..." />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50">
                {isPending ? "Salvando..." : "Salvar contrato"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
