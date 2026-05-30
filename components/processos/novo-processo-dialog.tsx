"use client"

import { useEffect, useRef, useState, useActionState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Plus, X } from "lucide-react"
import { createProcesso } from "@/app/(dashboard)/processos/actions"

type ClienteOption = { id: string; nome: string; cpf: string }

const TIPOS_ACAO = [
  { value: "quinquenio_sextaparte", label: "Quinquênio / Sexta-parte" },
  { value: "irpf_inexigibilidade",  label: "IRPF Inexigível" },
  { value: "licenca_premio",        label: "Licença-Prêmio" },
  { value: "reintegracao_militar",  label: "Reintegração Militar" },
  { value: "diarias_diligencia",    label: "Diárias de Diligência" },
  { value: "busca_apreensao",       label: "Busca e Apreensão" },
  { value: "consumidor",            label: "Consumidor" },
  { value: "outro",                 label: "Outro" },
] as const

const TIPOS_REU = [
  { value: "uniao_federal",            label: "União Federal" },
  { value: "fazenda_publica_estadual", label: "Fazenda Pública Estadual" },
  { value: "fazenda_publica_municipal",label: "Fazenda Pública Municipal" },
  { value: "empresa",                  label: "Empresa" },
  { value: "outro",                    label: "Outro" },
] as const

const cls = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"

export function NovoProcessoDialog({ clientes }: { clientes: ClienteOption[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createProcesso, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && !state.error) {
      setOpen(false)
      formRef.current?.reset()
    }
  }, [state])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors">
          <Plus className="h-4 w-4" />
          Novo Processo
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl bg-background border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Novo Processo
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4">

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select name="cliente_id" required defaultValue="" className={cls}>
                <option value="" disabled>Selecione um cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de ação + Número */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo de ação <span className="text-red-500">*</span>
                </label>
                <select name="tipo_acao" defaultValue="outro" className={cls}>
                  {TIPOS_ACAO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Número do processo
                </label>
                <input
                  name="numero"
                  placeholder="0000000-00.0000.0.00.0000"
                  className={cls}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Descrição resumida
              </label>
              <input
                name="descricao_acao"
                placeholder="Ex: Ação Declaratória de Inexigibilidade de IRPF"
                className={cls}
              />
            </div>

            {/* Réu + Tipo réu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Réu <span className="text-red-500">*</span>
                </label>
                <input
                  name="reu_nome"
                  required
                  placeholder="Ex: União Federal"
                  className={cls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo do réu
                </label>
                <select name="reu_tipo" defaultValue="uniao_federal" className={cls}>
                  {TIPOS_REU.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vara + Tribunal */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Vara / Juízo
                </label>
                <input
                  name="vara"
                  placeholder="Ex: 3ª Vara Federal de SJC"
                  className={cls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tribunal
                </label>
                <input
                  name="tribunal"
                  placeholder="Ex: TRF-3, TJSP, JEF"
                  className={cls}
                />
              </div>
            </div>

            {/* Comarca + Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Comarca
                </label>
                <input
                  name="comarca"
                  placeholder="Ex: São José dos Campos"
                  className={cls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Valor da causa (R$)
                </label>
                <input
                  name="valor_causa"
                  placeholder="Ex: 21.223,01"
                  className={cls}
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {state.error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <button type="button" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Salvando..." : "Salvar processo"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
