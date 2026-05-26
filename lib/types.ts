export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type EscritorioConfig = {
  nomeEscritorio: string;
  nomeResponsavel: string;
  areasAtuacao: string[];
  estadoOAB: string;
  tomDeVoz: string;
  contextoAdicional?: string;
  logo?: string;
};
