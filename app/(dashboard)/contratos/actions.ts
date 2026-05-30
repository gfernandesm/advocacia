"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import type { ModeloContrato, PlataformaAssinatura, StatusParcela } from "@/lib/database.types"

export async function createContrato(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const processo_id         = formData.get("processo_id") as string
  const cliente_id          = formData.get("cliente_id") as string
  const modelo              = formData.get("modelo") as ModeloContrato
  const plataforma          = (formData.get("plataforma_assinatura") as PlataformaAssinatura) ?? "pendente"
  const observacoes         = (formData.get("observacoes") as string)?.trim() || null

  if (!processo_id || !cliente_id) return { error: "Processo e cliente são obrigatórios" }

  const supabase = createServerClient()

  let contratoData: Record<string, unknown> = {
    processo_id, cliente_id, modelo, plataforma_assinatura: plataforma,
    status: "rascunho", observacoes,
  }

  if (modelo === "parcelado_fixo") {
    const valor_str   = formData.get("valor_total") as string
    const num_parcelas = parseInt(formData.get("num_parcelas") as string)
    const valor_total = valor_str ? parseFloat(valor_str.replace(/\./g, "").replace(",", ".")) : null

    if (!valor_total || !num_parcelas) return { error: "Valor total e número de parcelas são obrigatórios" }
    contratoData = { ...contratoData, valor_total, num_parcelas }
  } else {
    const percentual = formData.get("percentual_exito") as string
    const base       = (formData.get("base_calculo_exito") as string)?.trim() || null
    const pct        = percentual ? parseFloat(percentual.replace(",", ".")) : null
    if (!pct) return { error: "Percentual de êxito é obrigatório" }
    contratoData = { ...contratoData, percentual_exito: pct, base_calculo_exito: base }
  }

  const { data: contrato, error } = await supabase
    .from("contratos")
    .insert(contratoData as never)
    .select("id, valor_total, num_parcelas")
    .single()

  if (error || !contrato) return { error: "Erro ao salvar contrato." }

  // Gera parcelas automaticamente para contratos parcelados
  if (modelo === "parcelado_fixo" && contrato.valor_total && contrato.num_parcelas) {
    const valorParcela = contrato.valor_total / contrato.num_parcelas
    const hoje = new Date()
    const parcelas = Array.from({ length: contrato.num_parcelas }, (_, i) => {
      const venc = new Date(hoje)
      venc.setMonth(venc.getMonth() + i)
      return {
        contrato_id:     contrato.id,
        numero:          i + 1,
        valor:           valorParcela,
        data_vencimento: venc.toISOString().split("T")[0],
        status:          "pendente" as StatusParcela,
      }
    })
    await supabase.from("parcelas").insert(parcelas)
  }

  revalidatePath("/contratos")
  revalidatePath(`/processos/${processo_id}`)
  return {}
}

export async function marcarParcelaPaga(parcelaId: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from("parcelas")
    .update({ status: "pago", data_pagamento: new Date().toISOString().split("T")[0] })
    .eq("id", parcelaId)

  if (error) return { error: error.message }
  revalidatePath("/contratos")
  revalidatePath("/financeiro")
  return {}
}

export async function marcarParcelaVencida(parcelaId: string): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from("parcelas")
    .update({ status: "vencido" })
    .eq("id", parcelaId)

  if (error) return { error: error.message }
  revalidatePath("/contratos")
  revalidatePath("/financeiro")
  return {}
}

export async function atualizarStatusContrato(
  contratoId: string,
  status: "rascunho" | "aguardando_assinatura" | "assinado" | "cancelado"
): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const update: Record<string, unknown> = { status }
  if (status === "assinado") update.data_assinatura = new Date().toISOString().split("T")[0]

  const { error } = await supabase.from("contratos").update(update).eq("id", contratoId)
  if (error) return { error: error.message }
  revalidatePath("/contratos")
  return {}
}
