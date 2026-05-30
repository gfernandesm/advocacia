"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import type { TipoAcao, TipoReu } from "@/lib/database.types"

export async function createProcesso(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const cliente_id    = formData.get("cliente_id") as string
  const numero        = (formData.get("numero") as string)?.trim() || null
  const tipo_acao     = formData.get("tipo_acao") as TipoAcao
  const descricao     = (formData.get("descricao_acao") as string)?.trim() || null
  const reu_nome      = (formData.get("reu_nome") as string)?.trim()
  const reu_tipo      = formData.get("reu_tipo") as TipoReu
  const vara          = (formData.get("vara") as string)?.trim() || null
  const tribunal      = (formData.get("tribunal") as string)?.trim() || null
  const comarca       = (formData.get("comarca") as string)?.trim() || null
  const valor_str     = formData.get("valor_causa") as string
  const valor_causa   = valor_str ? parseFloat(valor_str.replace(/\./g, "").replace(",", ".")) : null

  if (!cliente_id) return { error: "Selecione um cliente" }
  if (!reu_nome)   return { error: "Nome do réu é obrigatório" }

  const supabase = createServerClient()

  const { error } = await supabase.from("processos").insert({
    cliente_id,
    numero,
    tipo_acao,
    descricao_acao: descricao,
    reu_nome,
    reu_tipo,
    vara,
    tribunal,
    comarca,
    valor_causa,
    fase_atual: "inicial",
    resultado:  "em_andamento",
  })

  if (error) return { error: "Erro ao salvar. Tente novamente." }

  revalidatePath("/processos")
  return {}
}
