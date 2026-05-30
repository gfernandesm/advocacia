"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"

const PERIODOS = [
  { value: "mes",       label: "Este mês" },
  { value: "trimestre", label: "3 meses" },
  { value: "ano",       label: "Este ano" },
  { value: "total",     label: "Tudo" },
]

export function FiltroPeriodo({ periodoAtual }: { periodoAtual: string }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()

  const setPeriodo = (value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value === "total") next.delete("periodo")
    else next.set("periodo", value)
    router.replace(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1 gap-0.5">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriodo(p.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            periodoAtual === p.value
              ? "bg-background text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
