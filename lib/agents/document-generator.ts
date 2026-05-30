import Anthropic from "@anthropic-ai/sdk"
import type { EscritorioConfig } from "@/lib/types"
import type { TipoDocumento } from "@/lib/documents/tipos"
export type { TipoDocumento }

const client = new Anthropic()

export type DadosGeracao = {
  tipo: TipoDocumento
  config: EscritorioConfig
  cliente: {
    nome: string
    cpf: string
    rg?: string | null
    estado_civil?: string | null
    profissao?: string | null
    nacionalidade?: string
    endereco?: string | null
    cidade?: string | null
    estado?: string | null
    hipossuficiente?: boolean
  }
  processo?: {
    numero?: string | null
    tipo_acao?: string
    descricao_acao?: string | null
    reu_nome?: string
    reu_tipo?: string
    vara?: string | null
    tribunal?: string | null
    comarca?: string | null
    valor_causa?: number | null
  }
  extras?: Record<string, string> // campos adicionais por tipo
}

// ── prompt base ──────────────────────────────────────────────

function promptBase(config: EscritorioConfig) {
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ? `OAB/${config.estadoOAB} ${config.oabNumero}` : `OAB/${config.estadoOAB}`
  return `Você é um assistente jurídico especializado do escritório ${config.nomeEscritorio}.
Advogado responsável: ${adv}, ${oab}.
Cidade: ${config.cidade ?? "São José dos Campos/SP"}.
Tom de voz: ${config.tomDeVoz}.

REGRAS OBRIGATÓRIAS:
- Escreva em português jurídico formal, correto e preciso
- Use APENAS os dados fornecidos — nunca invente fatos, datas ou números
- Campos sem dados devem aparecer como [A PREENCHER]
- Parágrafos separados por linha em branco
- Títulos de seções em MAIÚSCULAS (ex: DOS FATOS, DO DIREITO)
- NÃO use markdown: sem asteriscos (**), sem sublinhado (__), sem traços (---), sem #
- NÃO inclua o título do documento — o sistema insere automaticamente
- NÃO inclua cabeçalho, rodapé, local nem data — o sistema adiciona automaticamente
- Retorne APENAS o corpo do documento em texto puro, sem explicações`
}

// ── prompts por tipo ─────────────────────────────────────────

function promptProcuracao(dados: DadosGeracao): string {
  const { cliente, processo, config } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"
  const localizacao = `${cliente.cidade ?? "[CIDADE]"}/${cliente.estado ?? "[UF]"}`

  return `${promptBase(config)}

Gere uma PROCURAÇÃO com base nos dados abaixo.

DADOS DO OUTORGANTE (CLIENTE):
- Nome: ${cliente.nome}
- Nacionalidade: ${cliente.nacionalidade ?? "brasileiro(a)"}
- Estado civil: ${cliente.estado_civil ?? "[A PREENCHER]"}
- Profissão: ${cliente.profissao ?? "[A PREENCHER]"}
- CPF: ${cliente.cpf}
- RG: ${cliente.rg ?? "[A PREENCHER]"}
- Endereço: ${cliente.endereco ?? "[A PREENCHER]"}, ${localizacao}

OUTORGADO (ADVOGADO): ${adv}, inscrito(a) na OAB/${config.estadoOAB} sob o nº ${oab}

FINALIDADE: ${processo?.descricao_acao ?? processo?.tipo_acao ?? "representação judicial e extrajudicial"}
RÉU/PARTE CONTRÁRIA: ${processo?.reu_nome ?? "[A PREENCHER]"}
${processo?.vara ? `JUÍZO/VARA: ${processo.vara}` : ""}
${processo?.numero ? `PROCESSO Nº: ${processo.numero}` : ""}

A procuração deve conter:
1. Qualificação completa do outorgante
2. Nomeação do outorgado com seus dados da OAB
3. Poderes para o foro em geral (ad judicia et extra) e poderes especiais relacionados à ação
4. Poderes específicos: receber citação, confessar, desistir, transigir, receber e dar quitação, interpor recursos, substabelecer
5. Cláusula de vigência enquanto durar a causa

Escreva em parágrafo único fluido, sem numeração.`
}

function promptDeclaracao(dados: DadosGeracao): string {
  const { cliente, processo, config } = dados

  return `${promptBase(config)}

Gere uma DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA (para concessão de gratuidade da justiça) com base nos dados abaixo.

DADOS DO DECLARANTE:
- Nome: ${cliente.nome}
- CPF: ${cliente.cpf}
- Profissão: ${cliente.profissao ?? "[A PREENCHER]"}
${processo?.descricao_acao ? `- Ação: ${processo.descricao_acao}` : ""}
${processo?.reu_nome ? `- Em face de: ${processo.reu_nome}` : ""}
${processo?.vara ? `- Perante: ${processo.vara}` : ""}

A declaração deve:
1. Afirmar que o declarante não possui condições de arcar com as custas do processo sem prejuízo do sustento próprio e familiar
2. Citar o Art. 5º, inciso LXXIV da Constituição Federal e Arts. 98 e 99 do CPC/2015
3. Declarar ciência de que a falsidade sujeitará às penas da lei (Art. 99, §1º CPC)
4. Ser redigida em primeira pessoa, tom declaratório formal
5. Ter assinatura ao final`
}

function promptContratoParcelado(dados: DadosGeracao): string {
  const { cliente, processo, config, extras } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"
  const valor = extras?.valor_total ? `R$ ${extras.valor_total}` : "[VALOR A PREENCHER]"
  const parcelas = extras?.num_parcelas ?? "[NÚMERO DE PARCELAS]"
  const valorParcela = extras?.valor_total && extras?.num_parcelas
    ? `R$ ${(parseFloat(extras.valor_total.replace(",", ".")) / parseInt(extras.num_parcelas)).toFixed(2).replace(".", ",")}`
    : "[VALOR DA PARCELA]"

  return `${promptBase(config)}

Gere um CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (modelo parcelado fixo) com base nos dados abaixo.

CONTRATANTE (CLIENTE):
- Nome: ${cliente.nome}
- CPF: ${cliente.cpf}
- Profissão: ${cliente.profissao ?? "[A PREENCHER]"}
- Endereço: ${cliente.endereco ?? "[A PREENCHER]"}, ${cliente.cidade ?? "[CIDADE]"}/${cliente.estado ?? "[UF]"}

CONTRATADO (ADVOGADO): ${adv}, OAB/${config.estadoOAB} ${oab}
ESCRITÓRIO: ${config.nomeEscritorio}
CIDADE DO FORO: ${config.cidade ?? "São José dos Campos/SP"}

OBJETO DO CONTRATO:
- Serviço: ${processo?.descricao_acao ?? processo?.tipo_acao ?? "[DESCRIÇÃO DO SERVIÇO]"}
${processo?.numero ? `- Processo/SEI nº: ${processo.numero}` : ""}
${processo?.reu_nome ? `- Em face de: ${processo.reu_nome}` : ""}

HONORÁRIOS:
- Valor total: ${valor}
- Parcelas: ${parcelas}x de ${valorParcela}
- Forma de pagamento: transferência bancária ou PIX

O contrato deve conter as seguintes cláusulas numeradas:
1. DO OBJETO (serviços a serem prestados)
2. DAS OBRIGAÇÕES DO ADVOGADO
3. DAS OBRIGAÇÕES DO CONTRATANTE
4. DOS HONORÁRIOS ADVOCATÍCIOS (valor total, parcelamento, vencimentos)
5. DAS DESPESAS PROCESSUAIS (custas, perícias e diligências são por conta do cliente)
6. DA COBRANÇA EM CASO DE INADIMPLÊNCIA (correção pelo IGPM + juros 1% a.m.)
7. DA RESCISÃO (condições para rescisão por ambas as partes)
8. DAS INFORMAÇÕES E SIGILO (LGPD - Lei 13.709/2018)
9. DAS DISPOSIÇÕES GERAIS
10. DO FORO (Comarca de ${config.cidade?.split("/")[0] ?? "São José dos Campos"}, SP)

Assina: Contratante (cliente) e Contratado (advogado) com duas testemunhas.`
}

function promptContratoExito(dados: DadosGeracao): string {
  const { cliente, processo, config, extras } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"
  const percentual = extras?.percentual ? `${extras.percentual}%` : "30% (trinta por cento)"
  const baseCalculo = extras?.base_calculo ?? "valor econômico obtido na ação"

  return `${promptBase(config)}

Gere um CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (modelo percentual de êxito) com base nos dados abaixo.

CONTRATANTE (CLIENTE):
- Nome: ${cliente.nome}
- CPF: ${cliente.cpf}
- Profissão: ${cliente.profissao ?? "[A PREENCHER]"}

CONTRATADO (ADVOGADO): ${adv}, OAB/${config.estadoOAB} ${oab}

OBJETO: ${processo?.descricao_acao ?? processo?.tipo_acao ?? "[TIPO DE AÇÃO]"}
${processo?.reu_nome ? `EM FACE DE: ${processo.reu_nome}` : ""}

HONORÁRIOS DE ÊXITO:
- Percentual: ${percentual} sobre o ${baseCalculo}
- Pagamento: após o trânsito em julgado ou levantamento dos valores

O contrato deve conter cláusulas numeradas cobrindo:
1. DO OBJETO
2. DAS OBRIGAÇÕES DO ADVOGADO
3. DAS OBRIGAÇÕES DO CONTRATANTE
4. DOS HONORÁRIOS (percentual de êxito, base de cálculo, momento do pagamento)
5. DAS DESPESAS PROCESSUAIS
6. DA CLÁUSULA ANTIFRAUDE (Art. 11.3 — vedação de atos que prejudiquem a apuração do valor)
7. DA RESCISÃO (honorários proporcionais em caso de rescisão)
8. DOS DADOS E SIGILO (LGPD)
9. DAS DISPOSIÇÕES GERAIS
10. DO FORO`
}

function promptPeticaoInicial(dados: DadosGeracao): string {
  const { cliente, processo, config, extras } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"
  const gratuidade = cliente.hipossuficiente
    ? "Requerer gratuidade da justiça (Art. 5º LXXIV CF e Art. 98 CPC)."
    : ""

  return `${promptBase(config)}

Gere uma PETIÇÃO INICIAL com base nos dados abaixo.

AUTOR: ${cliente.nome}, ${cliente.nacionalidade ?? "brasileiro(a)"}, ${cliente.estado_civil ?? "[estado civil]"}, ${cliente.profissao ?? "[profissão]"}, CPF ${cliente.cpf}
${cliente.hipossuficiente ? "Hipossuficiente — beneficiário da gratuidade da justiça." : ""}

RÉU: ${processo?.reu_nome ?? "[RÉU]"} (${processo?.reu_tipo ?? ""})
VARA/JUÍZO: ${processo?.vara ?? "[VARA A PREENCHER]"}
${processo?.comarca ? `COMARCA: ${processo.comarca}` : ""}
${processo?.tribunal ? `TRIBUNAL: ${processo.tribunal}` : ""}

TIPO DE AÇÃO: ${processo?.descricao_acao ?? processo?.tipo_acao ?? "[TIPO DE AÇÃO]"}
${processo?.valor_causa ? `VALOR DA CAUSA: R$ ${processo.valor_causa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}

FATOS RELEVANTES (elaborados pelo usuário):
${extras?.fatos ?? "[FATOS A SEREM DESCRITOS PELO ADVOGADO]"}

FUNDAMENTOS JURÍDICOS:
${extras?.fundamentos ?? "[FUNDAMENTOS JURÍDICOS APLICÁVEIS AO CASO]"}

PEDIDOS:
${extras?.pedidos ?? "[PEDIDOS A SEREM FORMULADOS]"}

A petição deve conter:
1. ENDEREÇAMENTO ao juízo competente
2. QUALIFICAÇÃO DO AUTOR E DO RÉU
3. DOS FATOS (narração clara e cronológica)
4. DO DIREITO (fundamentação legal e jurisprudencial)
5. DOS PEDIDOS (tutela de urgência se aplicável, ${gratuidade} pedidos principais)
6. DO VALOR DA CAUSA
7. Fechamento com "Nestes termos, pede deferimento."
8. Indicação: ${adv}, OAB/${config.estadoOAB} ${oab}`
}

function promptRecurso(tipo: string, dados: DadosGeracao): string {
  const { cliente, processo, config, extras } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"

  return `${promptBase(config)}

Gere um(a) ${tipo.toUpperCase()} com base nos dados abaixo.

RECORRENTE: ${cliente.nome}, CPF ${cliente.cpf}
PROCESSO Nº: ${processo?.numero ?? "[NÚMERO]"}
${processo?.tribunal ? `TRIBUNAL: ${processo.tribunal}` : ""}
${processo?.reu_nome ? `RECORRIDO: ${processo.reu_nome}` : ""}

OBJETO DO RECURSO:
${extras?.objeto ?? "[DECISÃO QUE SE RECORRE E MOTIVOS DO INCONFORMISMO]"}

FUNDAMENTOS:
${extras?.fundamentos ?? "[FUNDAMENTAÇÃO LEGAL E JURISPRUDENCIAL]"}

O recurso deve conter:
1. ENDEREÇAMENTO ao juízo/tribunal competente
2. SÍNTESE DOS FATOS E DA DECISÃO RECORRIDA
3. DAS RAZÕES RECURSAIS (fundamentação com artigos e jurisprudência)
4. DOS PEDIDOS (conhecimento e provimento do recurso)
5. Fechamento com ${adv}, OAB/${config.estadoOAB} ${oab}`
}

function promptEmbargos(dados: DadosGeracao): string {
  const { cliente, processo, config, extras } = dados
  const adv = config.nomeCompletoAdvogado ?? config.nomeResponsavel
  const oab = config.oabNumero ?? "[NÚMERO OAB]"

  return `${promptBase(config)}

Gere EMBARGOS DE DECLARAÇÃO com base nos dados abaixo.
Fundamento: Art. 1.022 do CPC/2015 — omissão, contradição ou obscuridade.

EMBARGANTE: ${cliente.nome}, CPF ${cliente.cpf}
PROCESSO Nº: ${processo?.numero ?? "[NÚMERO]"}
${processo?.vara ? `JUÍZO: ${processo.vara}` : ""}

VÍCIO APONTADO:
${extras?.vicio ?? "[DESCREVER A OMISSÃO, CONTRADIÇÃO OU OBSCURIDADE DA DECISÃO]"}

O documento deve:
1. Identificar precisamente o vício (omissão/contradição/obscuridade)
2. Indicar o ponto exato da decisão embargada
3. Requerer que o juízo sane o vício
4. Ser conciso (embargos de declaração são curtos — 1 a 2 páginas)
5. Citar Art. 1.022, II do CPC
6. Assinar: ${adv}, OAB/${config.estadoOAB} ${oab}`
}

// ── função principal ─────────────────────────────────────────

export async function gerarDocumento(dados: DadosGeracao): Promise<string> {
  let prompt: string

  switch (dados.tipo) {
    case "procuracao":
      prompt = promptProcuracao(dados)
      break
    case "declaracao_hipossuficiencia":
      prompt = promptDeclaracao(dados)
      break
    case "contrato_parcelado":
      prompt = promptContratoParcelado(dados)
      break
    case "contrato_exito":
      prompt = promptContratoExito(dados)
      break
    case "peticao_inicial":
      prompt = promptPeticaoInicial(dados)
      break
    case "embargos_declaracao":
      prompt = promptEmbargos(dados)
      break
    case "contestacao":
      prompt = promptRecurso("Contestação", dados)
      break
    case "replica":
      prompt = promptRecurso("Réplica", dados)
      break
    case "alegacoes_finais":
      prompt = promptRecurso("Alegações Finais", dados)
      break
    case "recurso_inominado":
      prompt = promptRecurso("Recurso Inominado (Lei 9.099/95)", dados)
      break
    case "resp":
      prompt = promptRecurso("Recurso Especial (Art. 105, III CF)", dados)
      break
    case "agresp":
      prompt = promptRecurso("Agravo em Recurso Especial (Art. 1.042 CPC)", dados)
      break
    default:
      throw new Error(`Tipo de documento não suportado: ${dados.tipo}`)
  }

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const bloco = msg.content[0]
  if (bloco.type !== "text") throw new Error("Resposta inesperada do Claude")

  return bloco.text
}

// DOCUMENTOS_DISPONIVEIS foi movido para lib/documents/tipos.ts
// para evitar que o SDK Anthropic seja importado no browser.
