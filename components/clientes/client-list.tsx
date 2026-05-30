"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { Search, UserCircle2, Pencil, Trash2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { deleteCliente } from "@/app/(dashboard)/clientes/actions"
import { EditarClienteDialog } from "./editar-cliente-dialog"
import type { Cliente, TipoCliente } from "@/lib/database.types"

// ── labels ───────────────────────────────────────────────────

const TIPO_LABEL: Record<TipoCliente, string> = {
  servidor_publico: "Servidor Público",
  militar:          "Militar",
  consumidor:       "Consumidor",
  outro:            "Outro",
}

const TIPO_CLASS: Record<TipoCliente, string> = {
  servidor_publico: "bg-blue-100 text-blue-700",
  militar:          "bg-green-100 text-green-700",
  consumidor:       "bg-orange-100 text-orange-700",
  outro:            "bg-gray-100 text-gray-600",
}

function mascaraCPF(cpf: string) {
  const d = cpf.replace(/\D/g, "")
  if (d.length !== 11) return cpf
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-**`
}

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("")
}

// ── dialog de confirmação de exclusão ────────────────────────

function ConfirmarExclusao({
  cliente,
  open,
  onOpenChange,
}: {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [erro, setErro] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    setErro("")
    startTransition(async () => {
      const result = await deleteCliente(cliente.id)
      if (result.error) {
        setErro(result.error)
      } else {
        onOpenChange(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) setErro(""); onOpenChange(v) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background border border-border rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Excluir cliente
            </Dialog.Title>
            <Dialog.Close className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <p className="text-sm text-muted-foreground mb-1">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{cliente.nome}</span>?
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Essa ação não pode ser desfeita.
          </p>

          {erro && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md mb-4">{erro}</p>
          )}

          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleDelete}
              disabled={isPending}
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

// ── lista principal ───────────────────────────────────────────

export function ClientList({
  clientes,
  searchQuery,
}: {
  clientes: Cliente[]
  searchQuery?: string
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  const [clienteEditando, setClienteEditando]   = useState<Cliente | null>(null)
  const [clienteExcluindo, setClienteExcluindo] = useState<Cliente | null>(null)

  const handleSearch = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set("q", value)
      else next.delete("q")
      router.replace(`${pathname}?${next.toString()}`)
    },
    [router, pathname, params]
  )

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          defaultValue={searchQuery ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
      </div>

      {/* Empty state */}
      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserCircle2 className="h-12 w-12 text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado ainda."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">CPF</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Localidade</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-dark flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {iniciais(c.nome)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.nome}</p>
                        {c.hipossuficiente && (
                          <p className="text-xs text-muted-foreground">Gratuidade</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {mascaraCPF(c.cpf)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TIPO_CLASS[c.tipo]}`}>
                      {TIPO_LABEL[c.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.cidade && c.estado ? `${c.cidade}/${c.estado}` : c.cidade ?? c.estado ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.telefone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setClienteEditando(c)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setClienteExcluindo(c)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      {clienteEditando && (
        <EditarClienteDialog
          cliente={clienteEditando}
          open={!!clienteEditando}
          onOpenChange={(open) => { if (!open) setClienteEditando(null) }}
        />
      )}

      {clienteExcluindo && (
        <ConfirmarExclusao
          cliente={clienteExcluindo}
          open={!!clienteExcluindo}
          onOpenChange={(open) => { if (!open) setClienteExcluindo(null) }}
        />
      )}
    </div>
  )
}
