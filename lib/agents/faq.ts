import { runAgent } from "./base-agent";
import type { EscritorioConfig, Message } from "@/lib/types";

function buildSystemPrompt(config: EscritorioConfig): string {
  return `Você é o assistente de dúvidas jurídicas do escritório ${config.nomeEscritorio}.
Áreas de atuação: ${config.areasAtuacao.join(", ")}.
Tom de voz: ${config.tomDeVoz}.

Responda dúvidas jurídicas do advogado de forma direta e fundamentada.

## Regras
- Cite artigos de lei ou jurisprudência relevante quando aplicável
- Se a dúvida estiver fora das áreas de atuação do escritório, informe
- Para questões complexas, sugira consultar doutrina ou jurisprudência específica
- Sempre inclua disclaimer: "Esta resposta é informativa. Verifique a legislação atualizada."

${config.contextoAdicional ? `\nContexto adicional:\n${config.contextoAdicional}` : ""}`;
}

export async function responderFaq(
  mensagens: Message[],
  config: EscritorioConfig
): Promise<string> {
  return runAgent({
    systemPrompt: buildSystemPrompt(config),
    messages: mensagens,
  });
}
