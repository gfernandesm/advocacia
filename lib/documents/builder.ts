import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  BorderStyle,
  HeadingLevel,
  convertInchesToTwip,
} from "docx"

type BuildDocxParams = {
  titulo: string
  conteudo: string       // texto gerado pelo Claude, parágrafos separados por \n\n
  advogado: {
    nomeCompleto: string
    oab: string
    estado: string
    escritorio: string
    cidade: string
    telefone?: string
    email?: string
  }
  assinantes?: {
    nome: string
    cpf?: string
    qualidade: "cliente" | "advogado"
  }[]
}

function paragrafo(texto: string, opcoes?: {
  negrito?: boolean
  centralizado?: boolean
  espacoAntes?: number
  espacoDepois?: number
  tamanho?: number
}) {
  return new Paragraph({
    alignment: opcoes?.centralizado ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: {
      before: convertInchesToTwip((opcoes?.espacoAntes ?? 0) / 72),
      after:  convertInchesToTwip((opcoes?.espacoDepois ?? 6) / 72),
      line: 276, // 1.15
    },
    children: [
      new TextRun({
        text: texto,
        bold: opcoes?.negrito ?? false,
        size: (opcoes?.tamanho ?? 12) * 2,
        font: "Times New Roman",
      }),
    ],
  })
}

function linhaVazia() {
  return new Paragraph({ children: [new TextRun("")] })
}

function linhaDivisoria() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" } },
    children: [new TextRun("")],
  })
}

export async function buildDocx(params: BuildDocxParams): Promise<Buffer> {
  const { titulo, conteudo, advogado, assinantes = [] } = params

  const hoje = new Date().toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  })

  // Remove markdown residual e divide em parágrafos
  const limpar = (t: string) =>
    t
      .replace(/^---+$/gm, "")          // linhas horizontais
      .replace(/\*\*(.+?)\*\*/g, "$1")  // **negrito**
      .replace(/\*(.+?)\*/g, "$1")      // *itálico*
      .replace(/__(.+?)__/g, "$1")      // __sublinhado__
      .replace(/^#{1,6}\s+/gm, "")      // # títulos markdown
      .trim()

  const blocos = limpar(conteudo)
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean)

  const corpoParas = blocos.map((bloco) => {
    const isTitulo = /^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ\s\d.,/-]{4,}$/.test(bloco) && bloco === bloco.toUpperCase()
    return paragrafo(bloco, { negrito: isTitulo, centralizado: isTitulo, espacoDepois: 12 })
  })

  // ── cabeçalho ────────────────────────────────────────────

  const cabecalho = [
    paragrafo(advogado.escritorio.toUpperCase(), { negrito: true, centralizado: true, tamanho: 14 }),
    paragrafo(
      `${advogado.nomeCompleto} | OAB/${advogado.estado} ${advogado.oab}`,
      { centralizado: true, tamanho: 10 }
    ),
    ...(advogado.telefone || advogado.email
      ? [paragrafo(
          [advogado.telefone, advogado.email].filter(Boolean).join(" | "),
          { centralizado: true, tamanho: 10 }
        )]
      : []),
    linhaDivisoria(),
    linhaVazia(),
  ]

  // ── título ───────────────────────────────────────────────

  const tituloPara = [
    paragrafo(titulo.toUpperCase(), { negrito: true, centralizado: true, tamanho: 13, espacoAntes: 6, espacoDepois: 16 }),
  ]

  // ── local e data ─────────────────────────────────────────

  const localData = [
    linhaVazia(),
    paragrafo(`${advogado.cidade}, ${hoje}`, { centralizado: true }),
    linhaVazia(),
  ]

  // ── assinaturas ──────────────────────────────────────────

  const formatarCPF = (cpf: string) => {
    const d = cpf.replace(/\D/g, "")
    return d.length === 11
      ? `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
      : cpf
  }

  const assinaturasParas = assinantes.flatMap((a) => [
    paragrafo("_______________________________", { centralizado: true }),
    paragrafo(a.nome.toUpperCase(), { centralizado: true, negrito: true }),
    ...(a.qualidade === "advogado"
      ? [paragrafo(`OAB/${advogado.estado} ${advogado.oab}`, { centralizado: true })]
      : a.cpf
        ? [paragrafo(`CPF: ${formatarCPF(a.cpf)}`, { centralizado: true })]
        : []
    ),
    linhaVazia(),
  ])

  // ── documento ────────────────────────────────────────────

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top:    convertInchesToTwip(1.18),
              bottom: convertInchesToTwip(1.18),
              left:   convertInchesToTwip(1.38),
              right:  convertInchesToTwip(0.98),
            },
          },
        },
        children: [
          ...cabecalho,
          ...tituloPara,
          ...corpoParas,
          ...localData,
          ...assinaturasParas,
        ],
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
