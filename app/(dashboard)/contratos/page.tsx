import { createServerClient } from "@/lib/supabase/server"
import { ContratosList } from "@/components/contratos/contratos-list"
import { NovoContratoDialog } from "@/components/contratos/novo-contrato-dialog"

export default async function ContratosPage() {
  const supabase = createServerClient()

  const { data: contratos } = await supabase
    .from("contratos")
    .select(`
      id, modelo, status, valor_total, num_parcelas,
      percentual_exito, base_calculo_exito,
      plataforma_assinatura, data_assinatura, observacoes,
      created_at,
      clientes ( id, nome, cpf ),
      processos ( id, descricao_acao, tipo_acao, reu_nome ),
      parcelas ( id, numero, valor, data_vencimento, data_pagamento, status )
    `)
    .order("created_at", { ascending: false })

  const { data: processos } = await supabase
    .from("processos")
    .select(`id, descricao_acao, tipo_acao, reu_nome, cliente_id, clientes(id, nome)`)
    .order("created_at", { ascending: false })

  const total = contratos?.length ?? 0
  const totalReceber = contratos?.reduce((acc, c) => {
    if (c.modelo === "parcelado_fixo") {
      const pendentes = (c.parcelas as { status: string; valor: number }[])
        ?.filter((p) => p.status === "pendente")
        .reduce((s, p) => s + p.valor, 0) ?? 0
      return acc + pendentes
    }
    return acc
  }, 0) ?? 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} contrato{total !== 1 ? "s" : ""} •{" "}
            <span className="text-green-600 font-medium">
              {totalReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} a receber
            </span>
          </p>
        </div>
        <NovoContratoDialog processos={(processos ?? []) as never} />
      </div>

      <ContratosList contratos={(contratos ?? []) as never} />
    </div>
  )
}
