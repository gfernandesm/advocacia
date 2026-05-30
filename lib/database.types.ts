// Tipos gerados manualmente a partir de supabase/schema.sql
// Atualizar aqui sempre que o schema mudar.

// ── ENUMS ────────────────────────────────────────────────────

export type TipoCliente =
  | "servidor_publico"
  | "militar"
  | "consumidor"
  | "outro";

export type TipoAcao =
  | "quinquenio_sextaparte"
  | "irpf_inexigibilidade"
  | "licenca_premio"
  | "reintegracao_militar"
  | "diarias_diligencia"
  | "busca_apreensao"
  | "consumidor"
  | "outro";

export type TipoReu =
  | "uniao_federal"
  | "fazenda_publica_estadual"
  | "fazenda_publica_municipal"
  | "empresa"
  | "outro";

export type FaseProcesso =
  | "inicial"
  | "contestacao"
  | "replica"
  | "embargos_declaracao"
  | "alegacoes_finais"
  | "sentenca"
  | "recurso_inominado"
  | "apelacao"
  | "resp"
  | "agresp"
  | "transitado_julgado"
  | "execucao"
  | "arquivado";

export type ResultadoProcesso =
  | "em_andamento"
  | "procedente"
  | "improcedente"
  | "parcialmente_procedente"
  | "acordo"
  | "arquivado";

export type ModeloContrato = "parcelado_fixo" | "percentual_exito";

export type PlataformaAssinatura = "d4sign" | "clicksign" | "fisico" | "pendente";

export type StatusContrato =
  | "rascunho"
  | "aguardando_assinatura"
  | "assinado"
  | "cancelado";

export type StatusParcela = "pendente" | "pago" | "vencido" | "cancelado";

export type TipoDocumento =
  | "procuracao"
  | "declaracao_hipossuficiencia"
  | "contrato"
  | "peticao_inicial"
  | "contestacao"
  | "replica"
  | "embargos_declaracao"
  | "alegacoes_finais"
  | "recurso_inominado"
  | "recurso_especial"
  | "agresp"
  | "outro";

// ── TABELAS ───────────────────────────────────────────────────

export type Cliente = {
  id: string;
  nome: string;
  cpf: string;
  rg: string | null;
  estado_civil: string | null;
  profissao: string | null;
  tipo: TipoCliente;
  nacionalidade: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  hipossuficiente: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Processo = {
  id: string;
  cliente_id: string;
  numero: string | null;
  tipo_acao: TipoAcao;
  descricao_acao: string | null;
  reu_nome: string;
  reu_tipo: TipoReu;
  vara: string | null;
  tribunal: string | null;
  comarca: string | null;
  fase_atual: FaseProcesso;
  valor_causa: number | null;
  resultado: ResultadoProcesso;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventoProcesso = {
  id: string;
  processo_id: string;
  fase: FaseProcesso;
  descricao: string;
  data_evento: string;
  created_at: string;
};

export type Contrato = {
  id: string;
  processo_id: string;
  cliente_id: string;
  modelo: ModeloContrato;
  valor_total: number | null;
  num_parcelas: number | null;
  percentual_exito: number | null;
  base_calculo_exito: string | null;
  plataforma_assinatura: PlataformaAssinatura;
  status: StatusContrato;
  data_assinatura: string | null;
  link_documento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type Parcela = {
  id: string;
  contrato_id: string;
  numero: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusParcela;
  created_at: string;
};

export type Documento = {
  id: string;
  processo_id: string | null;
  contrato_id: string | null;
  cliente_id: string | null;
  tipo: TipoDocumento;
  titulo: string;
  conteudo_html: string | null;
  arquivo_path: string | null;
  fase_vinculada: FaseProcesso | null;
  created_at: string;
  updated_at: string;
};

// ── JOINS COMUNS ──────────────────────────────────────────────

export type ProcessoComCliente = Processo & {
  clientes: Pick<Cliente, "id" | "nome" | "cpf" | "tipo">;
};

export type ContratoComParcelas = Contrato & {
  parcelas: Parcela[];
};

// ── INSERTS (sem campos gerados automaticamente) ──────────────

// Campos nullable viram opcionais nos inserts — o banco aceita omissão.
export type ClienteInsert = Omit<Cliente, "id" | "created_at" | "updated_at"> & {
  rg?: string | null; estado_civil?: string | null; profissao?: string | null;
  endereco?: string | null; bairro?: string | null; cidade?: string | null;
  estado?: string | null; cep?: string | null; telefone?: string | null;
  email?: string | null; observacoes?: string | null;
};
export type ProcessoInsert = Omit<Processo, "id" | "created_at" | "updated_at"> & {
  numero?: string | null; descricao_acao?: string | null; vara?: string | null;
  tribunal?: string | null; comarca?: string | null; valor_causa?: number | null;
  observacoes?: string | null;
};
export type ContratoInsert = Omit<Contrato, "id" | "created_at" | "updated_at"> & {
  valor_total?: number | null; num_parcelas?: number | null;
  percentual_exito?: number | null; base_calculo_exito?: string | null;
  data_assinatura?: string | null; link_documento?: string | null;
  observacoes?: string | null;
};
export type ParcelaInsert = Omit<Parcela, "id" | "created_at"> & {
  data_pagamento?: string | null;
};
export type DocumentoInsert = Omit<Documento, "id" | "created_at" | "updated_at"> & {
  processo_id?: string | null; contrato_id?: string | null; cliente_id?: string | null;
  conteudo_html?: string | null; arquivo_path?: string | null;
  fase_vinculada?: FaseProcesso | null;
};
export type EventoProcessoInsert = Omit<EventoProcesso, "id" | "created_at">;

// ── TIPO DO BANCO (para createClient<Database>) ───────────────
// O Supabase JS exige Relationships, Views, Functions e CompositeTypes.

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: Cliente;
        Insert: ClienteInsert;
        Update: Partial<ClienteInsert>;
        Relationships: [];
      };
      processos: {
        Row: Processo;
        Insert: ProcessoInsert;
        Update: Partial<ProcessoInsert>;
        Relationships: [];
      };
      eventos_processo: {
        Row: EventoProcesso;
        Insert: EventoProcessoInsert;
        Update: Partial<EventoProcessoInsert>;
        Relationships: [];
      };
      contratos: {
        Row: Contrato;
        Insert: ContratoInsert;
        Update: Partial<ContratoInsert>;
        Relationships: [];
      };
      parcelas: {
        Row: Parcela;
        Insert: ParcelaInsert;
        Update: Partial<ParcelaInsert>;
        Relationships: [];
      };
      documentos: {
        Row: Documento;
        Insert: DocumentoInsert;
        Update: Partial<DocumentoInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      tipo_cliente: TipoCliente;
      tipo_acao: TipoAcao;
      tipo_reu: TipoReu;
      fase_processo: FaseProcesso;
      resultado_processo: ResultadoProcesso;
      modelo_contrato: ModeloContrato;
      plataforma_assinatura: PlataformaAssinatura;
      status_contrato: StatusContrato;
      status_parcela: StatusParcela;
      tipo_documento: TipoDocumento;
    };
    CompositeTypes: Record<string, never>;
  };
};
