"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { DOCUMENTOS_DISPONIVEIS, type TipoDocumento } from "@/lib/documents/tipos"

// ── tipos ────────────────────────────────────────────────────

type ClienteFull = {
  id: string
  nome: string
  cpf: string
  rg: string | null
  estado_civil: string | null
  profissao: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  hipossuficiente: boolean
}

type Processo = {
  id: string
  cliente_id: string
  numero: string | null
  tipo_acao: string
  descricao_acao: string | null
  reu_nome: string
}

// ── campos do cliente por tipo de documento ──────────────────

type CampoCliente = {
  name: keyof ClienteFull
  label: string
  placeholder: string
}

const CAMPOS_CLIENTE: Partial<Record<TipoDocumento, CampoCliente[]>> = {
  procuracao: [
    { name: "rg",           label: "RG",            placeholder: "00.000.000-0" },
    { name: "estado_civil", label: "Estado civil",  placeholder: "solteiro(a), casado(a), divorciado(a)..." },
    { name: "profissao",    label: "Profissão",      placeholder: "Professor(a) da rede estadual" },
    { name: "endereco",     label: "Endereço completo", placeholder: "Rua X, nº Y, Bairro Z" },
  ],
  declaracao_hipossuficiencia: [
    { name: "profissao",    label: "Profissão",      placeholder: "Professor(a) da rede estadual" },
  ],
  contrato_parcelado: [
    { name: "profissao",    label: "Profissão",      placeholder: "Professor(a) da rede estadual" },
    { name: "endereco",     label: "Endereço",       placeholder: "Rua X, nº Y, Bairro Z" },
  ],
  contrato_exito: [
    { name: "profissao",    label: "Profissão",      placeholder: "Sargento da PM reserva" },
  ],
  peticao_inicial: [
    { name: "rg",           label: "RG",             placeholder: "00.000.000-0" },
    { name: "estado_civil", label: "Estado civil",   placeholder: "solteiro(a), casado(a)..." },
    { name: "profissao",    label: "Profissão",      placeholder: "Professor(a) da rede estadual" },
    { name: "endereco",     label: "Endereço completo", placeholder: "Rua X, nº Y, Bairro Z" },
  ],
}

// ── campos extras por tipo (dados do contrato/recurso) ───────

const CAMPOS_EXTRAS: Record<string, {
  name: string
  label: string
  placeholder: string
  textarea?: boolean
}[]> = {
  contrato_parcelado: [
    { name: "valor_total",  label: "Valor total (R$)",        placeholder: "3.500,00" },
    { name: "num_parcelas", label: "Número de parcelas",      placeholder: "7" },
  ],
  contrato_exito: [
    { name: "percentual",   label: "Percentual de êxito (%)", placeholder: "30" },
    { name: "base_calculo", label: "Base de cálculo",         placeholder: "valor econômico obtido na ação" },
  ],
  peticao_inicial: [
    { name: "fatos",        label: "Fatos relevantes",        placeholder: "Descreva os fatos do caso...", textarea: true },
    { name: "pedidos",      label: "Pedidos",                 placeholder: "Liste os pedidos da ação...", textarea: true },
  ],
  embargos_declaracao: [
    { name: "vicio",        label: "Vício a ser sanado",      placeholder: "Descreva a omissão, contradição ou obscuridade...", textarea: true },
  ],
  contestacao: [
    { name: "objeto",       label: "Objeto da contestação",   placeholder: "Qual a pretensão do autor que se contesta...", textarea: true },
    { name: "fundamentos",  label: "Fundamentos",             placeholder: "Fundamentos legais e fáticos...", textarea: true },
  ],
  replica: [
    { name: "objeto",       label: "Pontos a rebater",        placeholder: "Quais argumentos da contestação refutar...", textarea: true },
    { name: "fundamentos",  label: "Fundamentos",             placeholder: "Argumentos da réplica...", textarea: true },
  ],
  alegacoes_finais: [
    { name: "objeto",       label: "Síntese do processo",     placeholder: "Resumo dos fatos e provas produzidas...", textarea: true },
    { name: "fundamentos",  label: "Pedido final",            placeholder: "Requer a procedência dos pedidos porque...", textarea: true },
  ],
  recurso_inominado: [
    { name: "objeto",       label: "Decisão recorrida",       placeholder: "Descreva a sentença impugnada...", textarea: true },
    { name: "fundamentos",  label: "Razões do recurso",       placeholder: "Por que a sentença deve ser reformada...", textarea: true },
  ],
  resp: [
    { name: "objeto",       label: "Acórdão recorrido",       placeholder: "Descreva o acórdão impugnado...", textarea: true },
    { name: "fundamentos",  label: "Violação legal / dissídio", placeholder: "Artigos violados e/ou divergência jurisprudencial...", textarea: true },
  ],
  agresp: [
    { name: "objeto",       label: "Decisão que negou o REsp", placeholder: "Descreva a decisão de inadmissão...", textarea: true },
    { name: "fundamentos",  label: "Razões do agravo",        placeholder: "Por que o REsp deve ser admitido...", textarea: true },
  ],
}

// ── estilos base ─────────────────────────────────────────────

const cls = "w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
const lbl = "block text-sm font-medium text-foreground mb-1"

// ── componente ───────────────────────────────────────────────

export function GeradorForm({
  clientes,
  processos,
}: {
  clientes: ClienteFull[]
  processos: Processo[]
}) {
  const [clienteId, setClienteId]         = useState("")
  const [processoId, setProcessoId]       = useState("")
  const [tipo, setTipo]                   = useState<TipoDocumento | "">("")
  const [clienteOverrides, setClienteOverrides] = useState<Record<string, string>>({})
  const [extras, setExtras]               = useState<Record<string, string>>({})
  const [loading, setLoading]             = useState(false)
  const [erro, setErro]                   = useState("")

  const clienteSelecionado = clientes.find((c) => c.id === clienteId) ?? null
  const processosFiltrados = processos.filter((p) => p.cliente_id === clienteId)
  const docSelecionado     = DOCUMENTOS_DISPONIVEIS.find((d) => d.value === tipo)
  const camposCliente      = tipo ? (CAMPOS_CLIENTE[tipo as TipoDocumento] ?? []) : []
  const camposExtras       = tipo ? (CAMPOS_EXTRAS[tipo] ?? []) : []

  // Valor exibido no campo: override do usuário > dado do banco > vazio
  const valorCampo = (campo: CampoCliente) => {
    if (clienteOverrides[campo.name] !== undefined) return clienteOverrides[campo.name]
    const val = clienteSelecionado?.[campo.name]
    return typeof val === "string" ? val : ""
  }

  const handleClienteChange = (id: string) => {
    setClienteId(id)
    setProcessoId("")
    setClienteOverrides({}) // limpa overrides ao trocar de cliente
  }

  const handleTipoChange = (t: TipoDocumento | "") => {
    setTipo(t)
    setClienteOverrides({})
    setExtras({})
  }

  const handleOverride = (name: string, value: string) =>
    setClienteOverrides((prev) => ({ ...prev, [name]: value }))

  const handleExtra = (name: string, value: string) =>
    setExtras((prev) => ({ ...prev, [name]: value }))

  const handleGerar = async () => {
    if (!clienteId || !tipo) {
      setErro("Selecione um cliente e o tipo de documento.")
      return
    }
    if (docSelecionado?.precisaProcesso && !processoId) {
      setErro("Este tipo de documento requer um processo selecionado.")
      return
    }

    setErro("")
    setLoading(true)

    try {
      const res = await fetch("/api/documentos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          processoId: processoId || undefined,
          tipo,
          clienteOverrides: Object.keys(clienteOverrides).length ? clienteOverrides : undefined,
          extras: Object.keys(extras).length ? extras : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErro(data.error ?? "Erro ao gerar documento.")
        return
      }

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = res.headers.get("Content-Disposition")
        ?.match(/filename="(.+?)"/)?.[1] ?? "documento.docx"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Cliente */}
      <div>
        <label className={lbl}>Cliente <span className="text-red-500">*</span></label>
        <select
          value={clienteId}
          onChange={(e) => handleClienteChange(e.target.value)}
          className={cls}
        >
          <option value="">Selecione um cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} — {c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de documento */}
      <div>
        <label className={lbl}>Tipo de documento <span className="text-red-500">*</span></label>
        <select
          value={tipo}
          onChange={(e) => handleTipoChange(e.target.value as TipoDocumento)}
          className={cls}
        >
          <option value="">Selecione o tipo...</option>
          {DOCUMENTOS_DISPONIVEIS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Processo (quando necessário) */}
      {tipo && clienteId && (
        <div>
          <label className={lbl}>
            Processo
            {docSelecionado?.precisaProcesso && <span className="text-red-500"> *</span>}
          </label>
          <select
            value={processoId}
            onChange={(e) => setProcessoId(e.target.value)}
            className={cls}
          >
            <option value="">
              {processosFiltrados.length === 0 ? "Nenhum processo cadastrado" : "Nenhum (opcional)"}
            </option>
            {processosFiltrados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.descricao_acao ?? p.tipo_acao} — {p.reu_nome}
                {p.numero ? ` (${p.numero})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dados do cliente para o documento */}
      {camposCliente.length > 0 && clienteId && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Dados do cliente</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pré-preenchido com o cadastro. Edite o que estiver faltando antes de gerar.
            </p>
          </div>
          {camposCliente.map((campo) => {
            const vazio = !valorCampo(campo) || valorCampo(campo) === "[A PREENCHER]"
            return (
              <div key={campo.name}>
                <label className={lbl}>
                  {campo.label}
                  {vazio && (
                    <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      ausente no cadastro
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={campo.placeholder}
                  value={valorCampo(campo)}
                  onChange={(e) => handleOverride(campo.name, e.target.value)}
                  className={`${cls} ${vazio ? "border-amber-300 focus:ring-amber-400/50" : ""}`}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Campos extras por tipo (contrato, recursos, etc.) */}
      {camposExtras.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-foreground">Informações do documento</p>
          {camposExtras.map((campo) => (
            <div key={campo.name}>
              <label className={lbl}>{campo.label}</label>
              {campo.textarea ? (
                <textarea
                  rows={4}
                  placeholder={campo.placeholder}
                  value={extras[campo.name] ?? ""}
                  onChange={(e) => handleExtra(campo.name, e.target.value)}
                  className={`${cls} resize-none`}
                />
              ) : (
                <input
                  type="text"
                  placeholder={campo.placeholder}
                  value={extras[campo.name] ?? ""}
                  onChange={(e) => handleExtra(campo.name, e.target.value)}
                  className={cls}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Erro */}
      {erro && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{erro}</p>
      )}

      {/* Botão */}
      <button
        onClick={handleGerar}
        disabled={loading || !clienteId || !tipo}
        className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy text-sm font-semibold rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando documento...</>
          : <><FileDown className="h-4 w-4" /> Gerar e baixar .docx</>
        }
      </button>

      {loading && (
        <p className="text-xs text-muted-foreground">
          O Claude está redigindo o documento. Isso pode levar 15–30 segundos...
        </p>
      )}
    </div>
  )
}
