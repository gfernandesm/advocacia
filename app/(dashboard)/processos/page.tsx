import { createServerClient } from "@/lib/supabase/server"
import { ProcessoList } from "@/components/processos/processo-list"
import { NovoProcessoDialog } from "@/components/processos/novo-processo-dialog"

export default async function ProcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; fase?: string }>
}) {
  const { q, fase } = await searchParams
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
        <NovoProcessoDialog clientes={clientes ?? []} />
      </div>

      <ProcessoList
        processos={(processos ?? []) as never}
        searchQuery={q}
        faseFilter={fase}
      />
    </div>
  )
}
