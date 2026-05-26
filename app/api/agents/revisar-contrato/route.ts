import { NextRequest, NextResponse } from "next/server";
import { analisarContrato, perguntarSobreContrato } from "@/lib/agents/contract-review";
import { getConfig } from "@/lib/config";
import type { Message } from "@/lib/types";

export async function POST(req: NextRequest) {
  const config = getConfig();
  const contentType = req.headers.get("content-type") ?? "";

  // Upload de arquivo — análise inicial
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const arquivo = formData.get("arquivo") as File | null;

    if (!arquivo) {
      return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 400 });
    }

    let texto = "";

    if (arquivo.name.endsWith(".txt")) {
      texto = await arquivo.text();
    } else if (arquivo.name.endsWith(".pdf")) {
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      texto = parsed.text;
    } else if (arquivo.name.endsWith(".docx") || arquivo.name.endsWith(".doc")) {
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      texto = result.value;
    } else {
      return NextResponse.json({ error: "Formato não suportado. Use PDF, DOCX ou TXT." }, { status: 400 });
    }

    if (!texto.trim()) {
      return NextResponse.json({ error: "Não foi possível extrair texto do arquivo." }, { status: 422 });
    }

    const analise = await analisarContrato(texto, config);
    return NextResponse.json({ analise });
  }

  // Perguntas de acompanhamento
  const body = await req.json();
  const mensagens: Message[] = body.mensagens;
  const contexto: string = body.contexto;

  if (!mensagens || !contexto) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const resposta = await perguntarSobreContrato(mensagens, contexto, config);
  return NextResponse.json({ resposta });
}
