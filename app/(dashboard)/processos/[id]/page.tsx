import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { ArrowLeft, FileText, Calendar, User, Building2 } from "lucide-react"
import { ProcessoDetalheAcoes } from "@/components/processos/processo-detalhe-acoes"

const TIPO_ACAO_LABEL: Record<string, string> = {
  quinquenio_sextaparte: "Quinquênio / Sexta-parte",
  irpf_inexigibilidade:  "IRPF Inexigível",
  licenca_premio:        "Licença-Prêmio",
  reintegracao_militar:  "Reintegração Militar",
  diarias_diligencia:    "Diárias de Diligência",
  busca_apreensao:       "Busca e Apreensão",
  consumidor:            "Consumidor",
  outro:                 "Outro",
}

const FASE_LABEL: Record<string, string> = {
  inicial:             "Inicial",
  contestacao:         "Contestação",
  replica:             "Réplica",
  embargos_declaracao: "Embargos de Declaração",
  alegacoes_finais:    "Alegações Finais",
  sentenca:            "Sentença",
  recurso_inominado:   "Recurso Inominado",
  apelacao:            "Apelação",
  resp:                "REsp",
  agresp:              "AgREsp",
  transitado_julgado:  "Transitado em Julgado",
  execucao:            "Execução",
  arquivado:           "Arquivado",
}

const FASE_COR: Record<string, string> = {
  inicial:             "bg-gray-100 text-gray-600",
  contestacao:         "bg-yellow-100 text-yellow-700",
  replica:             "bg-yellow-100 text-yellow-700",
  embargos_declaracao: "bg-yellow-100 text-yellow-700",
  alegacoes_finais:    "bg-orange-100 text-orange-700",
  sentenca:            "bg-blue-100 text-blue-700",
  recurso_inominado:   "bg-purple-100 text-purple-700",
  apelacao:            "bg-purple-100 text-purple-700",
  resp:                "bg-purple-100 text-purple-700",
  agresp:              "bg-purple-100 text-purple-700",
  transitado_julgado:  "bg-green-100 text-green-700",
  execucao:            "bg-teal-100 text-teal-700",
  arquivado:           "bg-red-100 text-red-400",
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
    </div>
  )
}

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()

  type ProcessoDetalhe = {
    id: string; numero: string | null; tipo_acao: string; descricao_acao: string | null
    reu_nome: string; reu_tipo: string; vara: string | null; tribunal: string | null
    comarca: string | null; fase_atual: string; valor_causa: number | null
    resultado: string; observacoes: string | null; cliente_id: string
    created_at: string; updated_at: string
    clientes: { id: string; nome: string; cpf: string; profissao: string | null; telefone: string | null; email: string | null; tipo: string; hipossuficiente: boolean } | null
  }

  const { data: processoRaw } = await supabase
    .from("processos")
    .select(`*, clientes(id, nome, cpf, profissao, telefone, email, tipo, hipossuficiente)`)
    .eq("id", id)
    .single()

  if (!processoRaw) notFound()

  const processo = processoRaw as unknown as ProcessoDetalhe

  const { data: eventos } = await supabase
    .from("eventos_processo")
    .select("*")
    .eq("processo_id", id)
    .order("data_evento", { ascending: false })

  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, tipo, titulo, created_at")
    .eq("processo_id", id)
    .order("created_at", { ascending: false })

  const { data: contratos } = await supabase
    .from("contratos")
    .select("id, modelo, status, valor_total, percentual_exito, plataforma_assinatura")
    .eq("processo_id", id)

  const cliente = processo.clientes

  const formatarValor = (v: number | null) =>
    v ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"

  const formatarData = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR")

  return (
    <div className="p-8 max-w-4xl space-y-6">

      {/* Voltar */}
      <Link href="/processos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos processos
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${FASE_COR[processo.fase_atual]}`}>
              {FASE_LABEL[processo.fase_atual]}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {processo.descricao_acao ?? TIPO_ACAO_LABEL[processo.tipo_acao]}
          </h1>
          {processo.numero && (
            <p className="font-mono text-sm text-muted-foreground mt-1">{processo.numero}</p>
          )}
        </div>
        <ProcessoDetalheAcoes processo={processo as never} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Dados do processo */}
        <div className="md:col-span-2 space-y-4">
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Processo
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo de ação"    value={TIPO_ACAO_LABEL[processo.tipo_acao]} />
              <InfoItem label="Réu"             value={processo.reu_nome} />
              <InfoItem label="Vara / Juízo"    value={processo.vara} />
              <InfoItem label="Tribunal"        value={processo.tribunal} />
              <InfoItem label="Comarca"         value={processo.comarca} />
              <InfoItem label="Valor da causa"  value={formatarValor(processo.valor_causa)} />
            </div>
            {processo.observacoes && (
              <div>
                <p className="text-xs text-muted-foreground">Observações</p>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{processo.observacoes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Histórico de fases
            </div>
            {!eventos?.length ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {eventos.map((ev, i) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? "bg-gold" : "bg-border"}`} />
                      {i < eventos.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">{ev.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatarData(ev.data_evento)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentos */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Documentos gerados
              </div>
              <Link
                href={`/documentos?processoId=${id}`}
                className="text-xs text-gold-dark hover:underline"
              >
                + Gerar documento
              </Link>
            </div>
            {!documentos?.length ? (
              <p className="text-sm text-muted-foreground">Nenhum documento gerado ainda.</p>
            ) : (
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{doc.titulo}</p>
                      <p className="text-xs text-muted-foreground">{formatarData(doc.created_at)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {doc.tipo.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar direita */}
        <div className="space-y-4">

          {/* Cliente */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4 text-muted-foreground" />
              Cliente
            </div>
            {cliente ? (
              <>
                <Link href={`/clientes`} className="block hover:opacity-80 transition-opacity">
                  <p className="font-medium text-foreground">{cliente.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cliente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                  </p>
                </Link>
                {cliente.profissao && <p className="text-xs text-muted-foreground">{cliente.profissao}</p>}
                {cliente.telefone  && <p className="text-xs text-muted-foreground">{cliente.telefone}</p>}
                {cliente.email     && <p className="text-xs text-muted-foreground">{cliente.email}</p>}
                {cliente.hipossuficiente && (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                    Gratuidade
                  </span>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>

          {/* Contratos */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Contratos</p>
              <Link href={`/contratos/novo?processoId=${id}`} className="text-xs text-gold-dark hover:underline">
                + Novo
              </Link>
            </div>
            {!contratos?.length ? (
              <p className="text-sm text-muted-foreground">Sem contratos vinculados.</p>
            ) : (
              <div className="space-y-2">
                {contratos.map((c) => (
                  <div key={c.id} className="text-xs space-y-0.5">
                    <p className="font-medium text-foreground capitalize">
                      {c.modelo === "parcelado_fixo" ? "Honorários parcelados" : "Percentual de êxito"}
                    </p>
                    <p className="text-muted-foreground">
                      {c.modelo === "parcelado_fixo"
                        ? c.valor_total ? `R$ ${c.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"
                        : c.percentual_exito ? `${c.percentual_exito}% de êxito` : "—"
                      }
                    </p>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs ${c.status === "assinado" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
