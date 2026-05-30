"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { EditarProcessoDialog } from "./editar-processo-dialog"
import type { Processo } from "@/lib/database.types"

export function ProcessoDetalheAcoes({ processo }: { processo: Processo }) {
  const [editando, setEditando] = useState(false)

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => setEditando(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </button>

      <EditarProcessoDialog
        processo={processo}
        open={editando}
        onOpenChange={setEditando}
      />
    </div>
  )
}
