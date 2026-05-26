import { runAgent } from "./base-agent";
import type { EscritorioConfig, Message } from "@/lib/types";

function buildSystemPrompt(config: EscritorioConfig): string {
  return `Você é um assistente jurídico especializado do escritório ${config.nomeEscritorio}.
Áreas de atuação: ${config.areasAtuacao.join(", ")}.
Tom de voz: ${config.tomDeVoz}.

IMPORTANTE: Sua análise é informativa e NÃO substitui a orientação do advogado responsável.

Ao receber o texto de um contrato, produza uma análise estruturada com as seguintes seções:

## Resumo do Contrato
Explique em linguagem simples o que o contrato trata (máximo 3 parágrafos).

## Partes Envolvidas
Liste as partes identificadas no contrato e seus papéis.

## Pontos de Atenção
Para cada cláusula relevante que merece revisão:
- Cite o trecho ou cláusula
- Explique o risco ou impacto prático em linguagem direta

## Pontos Favoráveis
Liste cláusulas benéficas para a parte representada pelo escritório.

## Pontos Negociáveis
Sugira cláusulas que costumam ser negociáveis nesse tipo de contrato.

## Perguntas para o Advogado Responsável
Liste 3-5 perguntas que devem ser discutidas antes da assinatura.

${config.contextoAdicional ? `\nContexto adicional do escritório:\n${config.contextoAdicional}` : ""}`;
}

export async function analisarContrato(
  textoContrato: string,
  config: EscritorioConfig
): Promise<string> {
  return runAgent({
    systemPrompt: buildSystemPrompt(config),
    messages: [
      {
        role: "user",
        content: `Analise o seguinte contrato:\n\n${textoContrato}`,
      },
    ],
  });
}

export async function perguntarSobreContrato(
  mensagens: Message[],
  contextoAnalise: string,
  config: EscritorioConfig
): Promise<string> {
  const systemComContexto = `${buildSystemPrompt(config)}

O advogado já analisou o seguinte contrato e você produziu esta análise:

---
${contextoAnalise}
---

Responda perguntas de acompanhamento sobre o contrato ou a análise.`;

  return runAgent({
    systemPrompt: systemComContexto,
    messages: mensagens,
  });
}
