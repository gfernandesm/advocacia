"use client"

import { useEffect, useRef, useActionState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { updateProcesso } from "@/app/(dashboard)/processos/actions"
import type { Processo, TipoAcao, TipoReu } from "@/lib/database.types"

const TIPOS_ACAO: { value: TipoAcao; label: string }[] = [
  { value: "quinquenio_sextaparte",  label: "Quinquênio / Sexta-parte" },
  { value: "irpf_inexigibilidade",   label: "IRPF Inexigível" },
  { value: "licenca_premio",         label: "Licença-Prêmio" },
  { value: "reintegracao_militar",   label: "Reintegração Militar" },
  { value: "diarias_diligencia",     label: "Diárias de Diligência" },
  { value: "busca_apreensao",        label: "Busca e Apreensão" },
  { value: "consumidor",             label: "Consumidor" },
  { value: "outro",                  label: "Outro" },
]

const TIPOS_REU: { value: TipoReu; label: string }[] = [
  { value: "uniao_federal",             label: "União Federal" },
  { value: "fazenda_publica_estadual",  label: "Fazenda Pública Estadual" },
  { value: "fazenda_publica_municipal", label: "Fazenda Pública Municipal" },
  { value: "empresa",                   label: "Empresa" },
  { value: "outro",                     label: "Outro" },
]

const cls = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

type Props = {
  processo: Processo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarProcessoDialog({ processo, open, onOpenChange }: Props) {
  const updateComId = updateProcesso.bind(null, processo.id)
  const [state, formAction, isPending] = useActionState(updateComId, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && !state.error) onOpenChange(false)
  }, [state, onOpenChange])

  const v = (campo: keyof Processo) => {
    const val = processo[campo]
    return val !== null && val !== undefined ? String(val) : ""
  }

  const formatarValor = (v: number | null) => {
    if (!v) return ""
    return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl bg-background border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">Editar Processo</Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Tipo de ação" obrigatorio>
                <select name="tipo_acao" defaultValue={processo.tipo_acao} className={cls}>
                  {TIPOS_ACAO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
              <Campo label="Número do processo">
                <input name="numero" defaultValue={v("numero")} placeholder="0000000-00.0000.0.00.0000" className={cls} />
              </Campo>
            </div>

            <Campo label="Descrição resumida">
              <input name="descricao_acao" defaultValue={v("descricao_acao")} placeholder="Ex: Ação Declaratória de Inexigibilidade de IRPF" className={cls} />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Réu" obrigatorio>
                <input name="reu_nome" required defaultValue={v("reu_nome")} className={cls} />
              </Campo>
              <Campo label="Tipo do réu">
                <select name="reu_tipo" defaultValue={processo.reu_tipo} className={cls}>
                  {TIPOS_REU.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Vara / Juízo">
                <input name="vara" defaultValue={v("vara")} placeholder="3ª Vara Federal de SJC" className={cls} />
              </Campo>
              <Campo label="Tribunal">
                <input name="tribunal" defaultValue={v("tribunal")} placeholder="TRF-3, TJSP, JEF" className={cls} />
              </Campo>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Comarca">
                <input name="comarca" defaultValue={v("comarca")} placeholder="São José dos Campos" className={cls} />
              </Campo>
              <Campo label="Valor da causa (R$)">
                <input name="valor_causa" defaultValue={formatarValor(processo.valor_causa)} placeholder="21.223,01" className={cls} />
              </Campo>
            </div>

            <Campo label="Observações">
              <textarea name="observacoes" defaultValue={v("observacoes")} rows={3} className={`${cls} resize-none`} placeholder="Anotações internas sobre o processo..." />
            </Campo>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              </Dialog.Close>
              <button type="submit" disabled={isPending} className="px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50">
                {isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
