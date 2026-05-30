// Arquivo seguro para importar no client — sem dependências de servidor.

export type TipoDocumento =
  | "procuracao"
  | "declaracao_hipossuficiencia"
  | "contrato_parcelado"
  | "contrato_exito"
  | "peticao_inicial"
  | "contestacao"
  | "replica"
  | "embargos_declaracao"
  | "alegacoes_finais"
  | "recurso_inominado"
  | "resp"
  | "agresp"

export const DOCUMENTOS_DISPONIVEIS: {
  value: TipoDocumento
  label: string
  precisaProcesso: boolean
}[] = [
  { value: "procuracao",                  label: "Procuração",                       precisaProcesso: false },
  { value: "declaracao_hipossuficiencia", label: "Declaração de Hipossuficiência",   precisaProcesso: false },
  { value: "contrato_parcelado",          label: "Contrato — Honorários Parcelados", precisaProcesso: false },
  { value: "contrato_exito",              label: "Contrato — Percentual de Êxito",   precisaProcesso: false },
  { value: "peticao_inicial",             label: "Petição Inicial",                  precisaProcesso: true  },
  { value: "contestacao",                 label: "Contestação",                      precisaProcesso: true  },
  { value: "replica",                     label: "Réplica",                          precisaProcesso: true  },
  { value: "embargos_declaracao",         label: "Embargos de Declaração",           precisaProcesso: true  },
  { value: "alegacoes_finais",            label: "Alegações Finais",                 precisaProcesso: true  },
  { value: "recurso_inominado",           label: "Recurso Inominado",                precisaProcesso: true  },
  { value: "resp",                        label: "Recurso Especial (REsp)",          precisaProcesso: true  },
  { value: "agresp",                      label: "Agravo em REsp (AgREsp)",          precisaProcesso: true  },
]
