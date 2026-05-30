import { createServerClient } from "@/lib/supabase/server"
import { ClientList } from "@/components/clientes/client-list"
import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog"

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = createServerClient()

  let query = supabase
    .from("clientes")
    .select("*")
    .order("nome")

  if (q) {
    query = query.or(`nome.ilike.%${q}%,cpf.ilike.%${q}%`)
  }

  const { data: clientes } = await query

  const total = clientes?.length ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} cliente{total !== 1 ? "s" : ""} cadastrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <NovoClienteDialog />
      </div>

      <ClientList clientes={clientes ?? []} searchQuery={q} />
    </div>
  )
}
