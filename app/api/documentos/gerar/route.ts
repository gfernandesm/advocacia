import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { gerarDocumento, type TipoDocumento } from "@/lib/agents/document-generator"
import { buildDocx } from "@/lib/documents/builder"
import { getConfig } from "@/lib/config"
import { DOCUMENTOS_DISPONIVEIS } from "@/lib/documents/tipos"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clienteId, processoId, tipo, extras, clienteOverrides } = body as {
      clienteId: string
      processoId?: string
      tipo: TipoDocumento
      extras?: Record<string, string>
      clienteOverrides?: Record<string, string>
    }

    if (!clienteId || !tipo) {
      return NextResponse.json({ error: "clienteId e tipo são obrigatórios" }, { status: 400 })
    }

    const supabase = createServerClient()
    const config = getConfig()

    // Busca cliente
    const { data: cliente, error: errCliente } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", clienteId)
      .single()

    if (errCliente || !cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Busca processo (se fornecido)
    let processo = null
    if (processoId) {
      const { data } = await supabase
        .from("processos")
        .select("*")
        .eq("id", processoId)
        .single()
      processo = data
    }

    // Mescla dados do banco com overrides preenchidos na tela
    const ov = clienteOverrides ?? {}
    const dadosCliente = {
      nome:           cliente.nome,
      cpf:            cliente.cpf,
      rg:             ov.rg             ?? cliente.rg,
      estado_civil:   ov.estado_civil   ?? cliente.estado_civil,
      profissao:      ov.profissao      ?? cliente.profissao,
      nacionalidade:  cliente.nacionalidade,
      endereco:       ov.endereco       ?? cliente.endereco,
      cidade:         cliente.cidade,
      estado:         cliente.estado,
      hipossuficiente: cliente.hipossuficiente,
    }

    // Gera o conteúdo com Claude
    const conteudo = await gerarDocumento({
      tipo,
      config,
      cliente: {
        nome: dadosCliente.nome,
        cpf: dadosCliente.cpf,
        rg: dadosCliente.rg,
        estado_civil: dadosCliente.estado_civil,
        profissao: dadosCliente.profissao,
        nacionalidade: dadosCliente.nacionalidade,
        endereco: dadosCliente.endereco,
        cidade: dadosCliente.cidade,
        estado: dadosCliente.estado,
        hipossuficiente: dadosCliente.hipossuficiente,
      },
      processo: processo
        ? {
            numero: processo.numero,
            tipo_acao: processo.tipo_acao,
            descricao_acao: processo.descricao_acao,
            reu_nome: processo.reu_nome,
            reu_tipo: processo.reu_tipo,
            vara: processo.vara,
            tribunal: processo.tribunal,
            comarca: processo.comarca,
            valor_causa: processo.valor_causa,
          }
        : undefined,
      extras,
    })

    // Define assinantes por tipo
    const assinantes = tipo.startsWith("contrato")
      ? [
          { nome: cliente.nome, cpf: cliente.cpf, qualidade: "cliente" as const },
          {
            nome: config.nomeCompletoAdvogado ?? config.nomeResponsavel,
            qualidade: "advogado" as const,
          },
        ]
      : tipo === "procuracao" || tipo === "declaracao_hipossuficiencia"
        ? [{ nome: cliente.nome, cpf: cliente.cpf, qualidade: "cliente" as const }]
        : [
            {
              nome: config.nomeCompletoAdvogado ?? config.nomeResponsavel,
              qualidade: "advogado" as const,
            },
          ]

    // Título legível (com acentos e capitalização correta)
    const tituloDoc = DOCUMENTOS_DISPONIVEIS.find((d) => d.value === tipo)?.label
      ?? tipo.replace(/_/g, " ").toUpperCase()

    // Gera o .docx
    const buffer = await buildDocx({
      titulo: tituloDoc,
      conteudo,
      advogado: {
        nomeCompleto: config.nomeCompletoAdvogado ?? config.nomeResponsavel,
        oab: config.oabNumero ?? "",
        estado: config.estadoOAB,
        escritorio: config.nomeEscritorio,
        cidade: config.cidade ?? "São José dos Campos/SP",
      },
      assinantes,
    })

    // Salva referência no banco
    await supabase.from("documentos").insert({
      cliente_id: clienteId,
      processo_id: processoId ?? null,
      tipo: tipo as never,
      titulo: `${tipo.replace(/_/g, " ")} — ${cliente.nome}`,
      conteudo_html: conteudo,
    })

    // Retorna o arquivo
    const nomeArquivo = `${tipo}-${cliente.nome.split(" ")[0].toLowerCase()}.docx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (err) {
    console.error("Erro na geração de documento:", err)
    return NextResponse.json({ error: "Erro interno ao gerar documento" }, { status: 500 })
  }
}
