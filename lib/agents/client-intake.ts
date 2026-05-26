import { runAgent } from "./base-agent";
import type { EscritorioConfig, Message } from "@/lib/types";

const MARCADOR_FICHA = "<<<FICHA_GERADA>>>";

function buildSystemPrompt(config: EscritorioConfig): string {
  return `Você é o assistente de intake do escritório ${config.nomeEscritorio}.
Sua função é coletar informações do cliente de forma organizada para o advogado.

## Dados a coletar (um por vez)

Pessoais:
- Nome completo
- CPF
- Data de nascimento
- Estado civil
- Endereço completo
- Telefone e email

Sobre o caso:
- Natureza da demanda (trabalhista, cível, criminal, etc.)
- Descrição do que aconteceu (fatos, datas, pessoas envolvidas)
- O que o cliente deseja como resultado
- Documentos que possui

## Regras
- Faça uma pergunta por vez
- Confirme dados numéricos (CPF, datas) antes de continuar
- Mantenha tom profissional e acolhedor
- Nunca dê opiniões jurídicas — apenas colete

Quando tiver todos os dados obrigatórios (nome, CPF, contato, descrição do caso),
avise: "Coletei todas as informações necessárias. Gerando a ficha agora."

Em seguida, coloque EXATAMENTE esta marcação e a ficha formatada:
${MARCADOR_FICHA}
[ficha em markdown com todos os dados organizados]

${config.contextoAdicional ? `\nContexto adicional:\n${config.contextoAdicional}` : ""}`;
}

export async function processarIntake(
  mensagens: Message[],
  config: EscritorioConfig
): Promise<{ resposta: string; ficha: string | null }> {
  const resposta = await runAgent({
    systemPrompt: buildSystemPrompt(config),
    messages: mensagens,
  });

  if (resposta.includes(MARCADOR_FICHA)) {
    const [chat, ficha] = resposta.split(MARCADOR_FICHA);
    return {
      resposta: chat.trim() || "Ficha gerada com sucesso.",
      ficha: ficha.trim(),
    };
  }

  return { resposta, ficha: null };
}
