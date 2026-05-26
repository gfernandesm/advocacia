import { runAgent } from "./base-agent";
import type { EscritorioConfig, Message } from "@/lib/types";

const MARCADOR_PETICAO = "<<<PETIÇÃO_GERADA>>>";

function buildSystemPrompt(config: EscritorioConfig): string {
  return `Você é um assistente jurídico do escritório ${config.nomeEscritorio} (OAB/${config.estadoOAB}).
Áreas de atuação: ${config.areasAtuacao.join(", ")}.

Seu papel é coletar informações e gerar minutas de petições jurídicas.

## Fluxo de coleta

Faça as perguntas necessárias uma de cada vez, na seguinte ordem:
1. Tipo de petição (inicial, contestação, recurso, notificação extrajudicial, etc.)
2. Partes envolvidas (nome, qualificação de cada uma)
3. Fatos relevantes (o que aconteceu, quando, onde)
4. Pedido principal
5. Fundamentos legais que o advogado quer citar (se souber)
6. Documentos disponíveis

Quando tiver todas as informações necessárias, avise: "Tenho tudo. Gerando a minuta agora."
Em seguida, gere a petição no formato adequado.

## Formato da petição gerada

Após gerar a minuta, coloque EXATAMENTE esta marcação antes do texto:
${MARCADOR_PETICAO}
[texto completo da petição]

## Regras
- Tom formal e jurídico
- Use "Excelentíssimo Senhor Juiz" para petições iniciais
- Espaço reservado com [XXXX] para dados não fornecidos
- Nunca invente fatos — só use o que o advogado informou

${config.contextoAdicional ? `\nContexto adicional:\n${config.contextoAdicional}` : ""}`;
}

export async function processarPeticao(
  mensagens: Message[],
  config: EscritorioConfig
): Promise<{ resposta: string; peticao: string | null }> {
  const resposta = await runAgent({
    systemPrompt: buildSystemPrompt(config),
    messages: mensagens,
  });

  if (resposta.includes(MARCADOR_PETICAO)) {
    const [chat, peticao] = resposta.split(MARCADOR_PETICAO);
    return {
      resposta: chat.trim() || "Minuta gerada com sucesso.",
      peticao: peticao.trim(),
    };
  }

  return { resposta, peticao: null };
}
