import { NextRequest, NextResponse } from "next/server";
import { processarIntake } from "@/lib/agents/client-intake";
import { getConfig } from "@/lib/config";
import type { Message } from "@/lib/types";

export async function POST(req: NextRequest) {
  const config = getConfig();
  const body = await req.json();
  const mensagens: Message[] = body.mensagens;

  if (!mensagens || mensagens.length === 0) {
    return NextResponse.json({ error: "Mensagens não fornecidas." }, { status: 400 });
  }

  const resultado = await processarIntake(mensagens, config);
  return NextResponse.json(resultado);
}
