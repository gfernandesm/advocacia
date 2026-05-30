"use client"

import { useEffect, useRef, useState, useActionState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { UserPlus, X } from "lucide-react"
import { createCliente } from "@/app/(dashboard)/clientes/actions"

const TIPOS = [
  { value: "servidor_publico", label: "Servidor Público" },
  { value: "militar",          label: "Militar" },
  { value: "consumidor",       label: "Consumidor" },
  { value: "outro",            label: "Outro" },
] as const

export function NovoClienteDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createCliente, null)
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
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background border border-border rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Novo Cliente
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                name="nome"
                required
                placeholder="Ex: Lucimara Beatriz Fernandes"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>

            {/* CPF + Tipo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  name="cpf"
                  required
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo
                </label>
                <select
                  name="tipo"
                  defaultValue="outro"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profissão */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Profissão
              </label>
              <input
                name="profissao"
                placeholder="Ex: Professor da rede estadual"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>

            {/* Telefone + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Telefone
                </label>
                <input
                  name="telefone"
                  placeholder="(12) 99999-0000"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Cidade
                </label>
                <input
                  name="cidade"
                  placeholder="São José dos Campos"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  UF
                </label>
                <input
                  name="estado"
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50 uppercase"
                />
              </div>
            </div>

            {/* Hipossuficiente */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="hipossuficiente"
                className="w-4 h-4 rounded border-border accent-gold"
              />
              <span className="text-sm text-foreground">
                Hipossuficiente — gratuidade da justiça (Art. 5º LXXIV CF)
              </span>
            </label>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {state.error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Salvando..." : "Salvar cliente"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
