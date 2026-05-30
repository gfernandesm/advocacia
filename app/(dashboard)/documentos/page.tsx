import { createServerClient } from "@/lib/supabase/server"
import { GeradorForm } from "@/components/documentos/gerador-form"

export default async function DocumentosPage() {
  const supabase = createServerClient()

  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, cpf, rg, estado_civil, profissao, endereco, cidade, estado, hipossuficiente")
    .order("nome")

  const { data: processos } = await supabase
    .from("processos")
    .select("id, cliente_id, numero, tipo_acao, descricao_acao, reu_nome")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Gerar Documento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o cliente, o tipo de documento e gere o arquivo Word pronto para edição.
        </p>
      </div>

      <GeradorForm
        clientes={clientes ?? []}
        processos={(processos ?? []) as never}
      />
    </div>
  )
}
