import type { EscritorioConfig } from "./types";
import { albertoFernandesConfig } from "@/config/alberto-fernandes";

const configs: Record<string, EscritorioConfig> = {
  template: {
    nomeEscritorio: "Advocacia OS",
    nomeResponsavel: "Dr(a).",
    areasAtuacao: ["Cível", "Trabalhista", "Empresarial"],
    estadoOAB: "SP",
    tomDeVoz: "formal e objetivo",
    contextoAdicional: "",
  },

  "alberto-fernandes": albertoFernandesConfig,

  // ↓ Adicione novos clientes aqui, copiando o bloco abaixo
  // "silva-advocacia": {
  //   nomeEscritorio: "Silva & Associados",
  //   nomeResponsavel: "Dr. João Silva",
  //   areasAtuacao: ["Direito Cível", "Direito Trabalhista"],
  //   estadoOAB: "SP",
  //   tomDeVoz: "formal e objetivo",
  //   contextoAdicional: "Atende PMEs do setor de serviços.",
  // },
};

export function getConfig(): EscritorioConfig {
  const clienteId = process.env.CLIENTE_ID ?? "template";
  return configs[clienteId] ?? configs["template"];
}
