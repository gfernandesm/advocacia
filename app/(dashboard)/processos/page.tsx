import { createServerClient } from "@/lib/supabase/server"
import { ProcessoList } from "@/components/processos/processo-list"
import { ProcessoKanban } from "@/components/processos/processo-kanban"
import { NovoProcessoDialog } from "@/components/processos/novo-processo-dialog"
import { ViewToggle } from "@/components/processos/view-toggle"

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fase?: string; view?: string }>
}) {
  const { q, fase, view } = await searchParams
  const isKanban = view !== "table"
  const supabase = createServerClient()

  let query = supabase
    .from("processos")
    .select(`
      id, numero, tipo_acao, descricao_acao,
      reu_nome, reu_tipo, tribunal, comarca,
      fase_atual, valor_causa, resultado,
      clientes ( id, nome )
    `)
    .order("created_at", { ascending: false })

  if (fase) query = query.eq("fase_atual", fase as never)
  if (q)    query = query.or(`numero.ilike.%${q}%,reu_nome.ilike.%${q}%,descricao_acao.ilike.%${q}%`)

  const { data: processos } = await query

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, cpf")
    .order("nome")

  const total = processos?.length ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Processos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} processo{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle isKanban={isKanban} />
          <NovoProcessoDialog clientes={clientes ?? []} />
        </div>
      </div>

      {isKanban ? (
        <ProcessoKanban processos={(processos ?? []) as never} />
      ) : (
        <ProcessoList
          processos={(processos ?? []) as never}
          searchQuery={q}
          faseFilter={fase}
        />
      )}
    </div>
  )
}
