export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type EscritorioConfig = {
  nomeEscritorio: string;
  nomeResponsavel: string;
  nomeCompletoAdvogado?: string;
  areasAtuacao: string[];
  estadoOAB: string;
  oabNumero?: string;
  cidade?: string;
  tomDeVoz: string;
  contextoAdicional?: string;
  logo?: string;
};
