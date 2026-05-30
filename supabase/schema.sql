-- ============================================================
-- Advocacia OS — Schema Supabase
-- Baseado nos 12 documentos reais do escritório
-- ============================================================

-- ── ENUMS ───────────────────────────────────────────────────

create type tipo_cliente as enum (
  'servidor_publico',
  'militar',
  'consumidor',
  'outro'
);

create type tipo_acao as enum (
  'quinquenio_sextaparte',
  'irpf_inexigibilidade',
  'licenca_premio',
  'reintegracao_militar',
  'diarias_diligencia',
  'busca_apreensao',
  'consumidor',
  'outro'
);

create type tipo_reu as enum (
  'uniao_federal',
  'fazenda_publica_estadual',
  'fazenda_publica_municipal',
  'empresa',
  'outro'
);

create type fase_processo as enum (
  'inicial',
  'contestacao',
  'replica',
  'embargos_declaracao',
  'alegacoes_finais',
  'sentenca',
  'recurso_inominado',
  'apelacao',
  'resp',
  'agresp',
  'transitado_julgado',
  'execucao',
  'arquivado'
);

create type resultado_processo as enum (
  'em_andamento',
  'procedente',
  'improcedente',
  'parcialmente_procedente',
  'acordo',
  'arquivado'
);

create type modelo_contrato as enum (
  'parcelado_fixo',
  'percentual_exito'
);

create type plataforma_assinatura as enum (
  'd4sign',
  'clicksign',
  'fisico',
  'pendente'
);

create type status_contrato as enum (
  'rascunho',
  'aguardando_assinatura',
  'assinado',
  'cancelado'
);

create type status_parcela as enum (
  'pendente',
  'pago',
  'vencido',
  'cancelado'
);

create type tipo_documento as enum (
  'procuracao',
  'declaracao_hipossuficiencia',
  'contrato',
  'peticao_inicial',
  'contestacao',
  'replica',
  'embargos_declaracao',
  'alegacoes_finais',
  'recurso_inominado',
  'recurso_especial',
  'agresp',
  'outro'
);

-- ── CLIENTES ─────────────────────────────────────────────────

create table clientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null,
  cpf             text unique not null,
  rg              text,
  estado_civil    text,
  profissao       text,
  tipo            tipo_cliente not null default 'outro',
  nacionalidade   text not null default 'brasileiro(a)',
  endereco        text,
  bairro          text,
  cidade          text,
  estado          text,
  cep             text,
  telefone        text,
  email           text,
  hipossuficiente boolean not null default false,
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── PROCESSOS ────────────────────────────────────────────────

create table processos (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references clientes(id) on delete restrict,
  numero          text,                        -- ex: "5000796-94.2026.4.03.6103"
  tipo_acao       tipo_acao not null,
  descricao_acao  text,                        -- título resumido da ação
  reu_nome        text not null,
  reu_tipo        tipo_reu not null,
  vara            text,                        -- "3ª Vara Federal de SJC"
  tribunal        text,                        -- "TRF-3", "TJSP", "JEF"
  comarca         text,
  fase_atual      fase_processo not null default 'inicial',
  valor_causa     numeric(15,2),
  resultado       resultado_processo not null default 'em_andamento',
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── EVENTOS DO PROCESSO (timeline) ───────────────────────────

create table eventos_processo (
  id              uuid primary key default gen_random_uuid(),
  processo_id     uuid not null references processos(id) on delete cascade,
  fase            fase_processo not null,
  descricao       text not null,
  data_evento     date not null default current_date,
  created_at      timestamptz not null default now()
);

-- ── CONTRATOS ────────────────────────────────────────────────

create table contratos (
  id                   uuid primary key default gen_random_uuid(),
  processo_id          uuid not null references processos(id) on delete restrict,
  cliente_id           uuid not null references clientes(id) on delete restrict,
  modelo               modelo_contrato not null,

  -- parcelado fixo
  valor_total          numeric(15,2),
  num_parcelas         integer,

  -- percentual de êxito
  percentual_exito     numeric(5,2),            -- ex: 30.00 para 30%
  base_calculo_exito   text,                    -- "valor econômico obtido"

  -- comum
  plataforma_assinatura plataforma_assinatura not null default 'pendente',
  status               status_contrato not null default 'rascunho',
  data_assinatura      date,
  link_documento       text,                    -- link D4Sign ou Clicksign
  observacoes          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── PARCELAS ─────────────────────────────────────────────────

create table parcelas (
  id              uuid primary key default gen_random_uuid(),
  contrato_id     uuid not null references contratos(id) on delete cascade,
  numero          integer not null,
  valor           numeric(15,2) not null,
  data_vencimento date not null,
  data_pagamento  date,
  status          status_parcela not null default 'pendente',
  created_at      timestamptz not null default now()
);

-- ── DOCUMENTOS ───────────────────────────────────────────────

create table documentos (
  id              uuid primary key default gen_random_uuid(),
  processo_id     uuid references processos(id) on delete cascade,
  contrato_id     uuid references contratos(id) on delete cascade,
  cliente_id      uuid references clientes(id) on delete cascade,
  tipo            tipo_documento not null,
  titulo          text not null,
  conteudo_html   text,                        -- texto gerado pelo agente
  arquivo_path    text,                        -- path no Supabase Storage
  fase_vinculada  fase_processo,               -- a qual fase pertence
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── ÍNDICES ──────────────────────────────────────────────────

create index idx_processos_cliente    on processos(cliente_id);
create index idx_processos_fase       on processos(fase_atual);
create index idx_processos_resultado  on processos(resultado);
create index idx_contratos_processo   on contratos(processo_id);
create index idx_contratos_status     on contratos(status);
create index idx_parcelas_contrato    on parcelas(contrato_id);
create index idx_parcelas_status      on parcelas(status);
create index idx_parcelas_vencimento  on parcelas(data_vencimento);
create index idx_documentos_processo  on documentos(processo_id);
create index idx_documentos_tipo      on documentos(tipo);
create index idx_eventos_processo     on eventos_processo(processo_id);

-- ── UPDATED_AT AUTOMÁTICO ────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_clientes_updated_at
  before update on clientes
  for each row execute function set_updated_at();

create trigger trg_processos_updated_at
  before update on processos
  for each row execute function set_updated_at();

create trigger trg_contratos_updated_at
  before update on contratos
  for each row execute function set_updated_at();

create trigger trg_documentos_updated_at
  before update on documentos
  for each row execute function set_updated_at();

-- ── ACESSO AO BANCO ──────────────────────────────────────────
-- Auth é gerenciada pelo next-auth (não pelo Supabase Auth).
-- O servidor usa SUPABASE_SERVICE_ROLE_KEY, que bypassa RLS.
-- RLS fica desabilitado — o controle de acesso é feito na camada
-- da aplicação (middleware next-auth já protege todas as rotas).
--
-- Se no futuro o projeto migrar para Supabase Auth ou multi-tenant
-- real, habilitar RLS e adicionar políticas por user_id.

-- ── SUPABASE STORAGE ─────────────────────────────────────────
-- Executar no dashboard do Supabase > Storage > New bucket
--
-- Bucket: "documentos"
-- Public: false
-- Allowed MIME types: application/pdf, text/html, text/plain
--
-- Policy sugerida (via dashboard):
-- INSERT/SELECT/UPDATE/DELETE: auth.uid() = owner
