import type { EscritorioConfig } from "@/lib/types";

// Copie este arquivo, renomeie para o slug do cliente (ex: silva-advocacia.ts)
// e preencha os campos. Depois adicione o import em lib/config.ts.

export const templateConfig: EscritorioConfig = {
  // Nome completo do escritório (aparece no topo da sidebar e nos documentos)
  nomeEscritorio: "Silva & Associados Advocacia",

  // Nome do advogado responsável (usado no dashboard)
  nomeResponsavel: "Dr. João Silva",

  // Áreas de atuação — usadas para calibrar os prompts dos agentes
  areasAtuacao: ["Direito Cível", "Direito Trabalhista", "Direito Empresarial"],

  // Estado da OAB (ex: SP, RJ, MG)
  estadoOAB: "SP",

  // Tom de voz para documentos gerados
  // Exemplos: "formal e objetivo", "formal e didático", "técnico e preciso"
  tomDeVoz: "formal e objetivo",

  // Contexto adicional passado para todos os agentes
  // Use para informar especialidades, restrições, clientes típicos, etc.
  contextoAdicional: `
O escritório atende principalmente empresas de médio porte.
Clientes típicos: PMEs do setor de serviços e varejo.
Especialidade em contratos B2B e rescisões trabalhistas.
  `.trim(),
};
