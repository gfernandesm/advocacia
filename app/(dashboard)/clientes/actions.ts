"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import type { TipoCliente } from "@/lib/database.types"

export async function createCliente(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const nome = (formData.get("nome") as string)?.trim()
  const cpf = (formData.get("cpf") as string)?.replace(/\D/g, "")
  const tipo = (formData.get("tipo") as TipoCliente) ?? "outro"
  const profissao = (formData.get("profissao") as string) || null
  const telefone = (formData.get("telefone") as string) || null
  const email = (formData.get("email") as string) || null
  const cidade = (formData.get("cidade") as string) || null
  const estado = (formData.get("estado") as string)?.toUpperCase() || null
  const hipossuficiente = formData.get("hipossuficiente") === "on"

  if (!nome) return { error: "Nome é obrigatório" }
  if (!cpf || cpf.length !== 11) return { error: "CPF inválido" }

  const supabase = createServerClient()

  const { error } = await supabase.from("clientes").insert({
    nome,
    cpf,
    tipo,
    profissao,
    telefone,
    email,
    cidade,
    estado,
    hipossuficiente,
    nacionalidade: "brasileiro(a)",
  })

  if (error) {
    if (error.code === "23505") return { error: "CPF já cadastrado" }
    return { error: "Erro ao salvar. Tente novamente." }
  }

  revalidatePath("/clientes")
  return {}
}
