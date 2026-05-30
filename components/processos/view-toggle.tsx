"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"

export function ViewToggle({ isKanban }: { isKanban: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const setView = (view: "kanban" | "table") => {
    const next = new URLSearchParams(params.toString())
    if (view === "kanban") next.delete("view")
    else next.set("view", "table")
    router.replace(`${pathname}?${next.toString()}`)
  }

  const btn = "p-1.5 rounded transition-colors"
  const active = "bg-gold/20 text-gold-dark"
  const inactive = "text-muted-foreground hover:text-foreground"

  return (
    <div className="flex items-center border border-border rounded-md p-0.5 gap-0.5">
      <button
        onClick={() => setView("kanban")}
        className={cn(btn, isKanban ? active : inactive)}
        title="Kanban"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView("table")}
        className={cn(btn, !isKanban ? active : inactive)}
        title="Tabela"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
