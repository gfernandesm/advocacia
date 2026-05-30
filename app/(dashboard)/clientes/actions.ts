"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import type { TipoCliente } from "@/lib/database.types"

export async function createCliente(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const nome          = (formData.get("nome") as string)?.trim()
  const cpf           = (formData.get("cpf") as string)?.replace(/\D/g, "")
  const tipo          = (formData.get("tipo") as TipoCliente) ?? "outro"
  const rg            = (formData.get("rg") as string)?.trim() || null
  const estado_civil  = (formData.get("estado_civil") as string) || null
  const nacionalidade = (formData.get("nacionalidade") as string)?.trim() || "brasileiro(a)"
  const profissao     = (formData.get("profissao") as string)?.trim() || null
  const telefone      = (formData.get("telefone") as string)?.trim() || null
  const email         = (formData.get("email") as string)?.trim() || null
  const endereco      = (formData.get("endereco") as string)?.trim() || null
  const bairro        = (formData.get("bairro") as string)?.trim() || null
  const cidade        = (formData.get("cidade") as string)?.trim() || null
  const estado        = (formData.get("estado") as string)?.toUpperCase().trim() || null
  const cep           = (formData.get("cep") as string)?.replace(/\D/g, "") || null
  const hipossuficiente = formData.get("hipossuficiente") === "on"

  if (!nome) return { error: "Nome é obrigatório" }
  if (!cpf || cpf.length !== 11) return { error: "CPF inválido" }

  const supabase = createServerClient()

  const { error } = await supabase.from("clientes").insert({
    nome,
    cpf,
    tipo,
    rg,
    estado_civil,
    nacionalidade,
    profissao,
    telefone,
    email,
    endereco,
    bairro,
    cidade,
    estado,
    cep,
    hipossuficiente,
    observacoes: null,
  })

  if (error) {
    if (error.code === "23505") return { error: "CPF já cadastrado" }
    return { error: "Erro ao salvar. Tente novamente." }
  }

  revalidatePath("/clientes")
  return {}
}

export async function updateCliente(
  id: string,
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const nome          = (formData.get("nome") as string)?.trim()
  const cpf           = (formData.get("cpf") as string)?.replace(/\D/g, "")
  const tipo          = (formData.get("tipo") as TipoCliente) ?? "outro"
  const rg            = (formData.get("rg") as string)?.trim() || null
  const estado_civil  = (formData.get("estado_civil") as string) || null
  const nacionalidade = (formData.get("nacionalidade") as string)?.trim() || "brasileiro(a)"
  const profissao     = (formData.get("profissao") as string)?.trim() || null
  const telefone      = (formData.get("telefone") as string)?.trim() || null
  const email         = (formData.get("email") as string)?.trim() || null
  const endereco      = (formData.get("endereco") as string)?.trim() || null
  const bairro        = (formData.get("bairro") as string)?.trim() || null
  const cidade        = (formData.get("cidade") as string)?.trim() || null
  const estado        = (formData.get("estado") as string)?.toUpperCase().trim() || null
  const cep           = (formData.get("cep") as string)?.replace(/\D/g, "") || null
  const hipossuficiente = formData.get("hipossuficiente") === "on"

  if (!nome) return { error: "Nome é obrigatório" }
  if (!cpf || cpf.length !== 11) return { error: "CPF inválido" }

  const supabase = createServerClient()

  const { error } = await supabase
    .from("clientes")
    .update({ nome, cpf, tipo, rg, estado_civil, nacionalidade, profissao, telefone, email, endereco, bairro, cidade, estado, cep, hipossuficiente })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") return { error: "CPF já cadastrado para outro cliente" }
    return { error: "Erro ao salvar. Tente novamente." }
  }

  revalidatePath("/clientes")
  return {}
}

export async function deleteCliente(id: string): Promise<{ error?: string }> {
  const supabase = createServerClient()

  const { count } = await supabase
    .from("processos")
    .select("*", { count: "exact", head: true })
    .eq("cliente_id", id)

  if (count && count > 0) {
    return { error: `Cliente tem ${count} processo(s) vinculado(s). Exclua os processos antes de remover o cliente.` }
  }

  const { error } = await supabase.from("clientes").delete().eq("id", id)
  if (error) return { error: "Erro ao excluir. Tente novamente." }

  revalidatePath("/clientes")
  return {}
}
