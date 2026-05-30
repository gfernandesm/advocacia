"use client"

import { useEffect, useRef, useActionState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { updateCliente } from "@/app/(dashboard)/clientes/actions"
import type { Cliente, TipoCliente } from "@/lib/database.types"

const TIPOS: { value: TipoCliente; label: string }[] = [
  { value: "servidor_publico", label: "Servidor Público" },
  { value: "militar",          label: "Militar" },
  { value: "consumidor",       label: "Consumidor" },
  { value: "outro",            label: "Outro" },
]

const ESTADOS_CIVIS = [
  "solteiro(a)", "casado(a)", "divorciado(a)",
  "separado(a) judicialmente", "viúvo(a)", "união estável",
]

const cls = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">{titulo}</p>
      {children}
    </div>
  )
}

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
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditarClienteDialog({ cliente, open, onOpenChange }: Props) {
  const updateComId = updateCliente.bind(null, cliente.id)
  const [state, formAction, isPending] = useActionState(updateComId, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && !state.error) onOpenChange(false)
  }, [state, onOpenChange])

  const v = (campo: keyof Cliente) => {
    const val = cliente[campo]
    return typeof val === "string" ? val : ""
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl bg-background border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Editar Cliente
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form ref={formRef} action={formAction} className="space-y-5">

            <Secao titulo="Identificação">
              <Campo label="Nome completo" obrigatorio>
                <input name="nome" required defaultValue={v("nome")} className={cls} />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="CPF" obrigatorio>
                  <input
                    name="cpf"
                    required
                    defaultValue={cliente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                    className={cls}
                  />
                </Campo>
                <Campo label="RG">
                  <input name="rg" defaultValue={v("rg")} className={cls} />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Estado civil">
                  <select name="estado_civil" defaultValue={v("estado_civil")} className={cls}>
                    <option value="">Selecione...</option>
                    {ESTADOS_CIVIS.map((ec) => (
                      <option key={ec} value={ec}>{ec}</option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Nacionalidade">
                  <input name="nacionalidade" defaultValue={v("nacionalidade") || "brasileiro(a)"} className={cls} />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Campo label="Profissão">
                  <input name="profissao" defaultValue={v("profissao")} className={cls} />
                </Campo>
                <Campo label="Tipo">
                  <select name="tipo" defaultValue={cliente.tipo} className={cls}>
                    {TIPOS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Contato">
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Telefone">
                  <input name="telefone" defaultValue={v("telefone")} className={cls} />
                </Campo>
                <Campo label="Email">
                  <input name="email" type="email" defaultValue={v("email")} className={cls} />
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Endereço">
              <Campo label="Logradouro">
                <input name="endereco" defaultValue={v("endereco")} className={cls} />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Bairro">
                  <input name="bairro" defaultValue={v("bairro")} className={cls} />
                </Campo>
                <Campo label="CEP">
                  <input name="cep" defaultValue={v("cep")} className={cls} />
                </Campo>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Campo label="Cidade">
                    <input name="cidade" defaultValue={v("cidade")} className={cls} />
                  </Campo>
                </div>
                <Campo label="UF">
                  <input name="estado" defaultValue={v("estado")} maxLength={2} className={`${cls} uppercase`} />
                </Campo>
              </div>
            </Secao>

            <Secao titulo="Jurídico">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="hipossuficiente"
                  defaultChecked={cliente.hipossuficiente}
                  className="w-4 h-4 rounded border-border accent-gold"
                />
                <span className="text-sm text-foreground">
                  Hipossuficiente — gratuidade da justiça (Art. 5º LXXIV CF)
                </span>
              </label>
            </Secao>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
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
                {isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
