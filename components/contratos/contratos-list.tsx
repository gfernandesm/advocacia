"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { marcarParcelaPaga, atualizarStatusContrato } from "@/app/(dashboard)/contratos/actions"

type Parcela = { id: string; numero: number; valor: number; data_vencimento: string; data_pagamento: string | null; status: string }
type Contrato = {
  id: string
  modelo: string
  status: string
  valor_total: number | null
  num_parcelas: number | null
  percentual_exito: number | null
  base_calculo_exito: string | null
  plataforma_assinatura: string
  data_assinatura: string | null
  created_at: string
  clientes: { id: string; nome: string; cpf: string } | null
  processos: { id: string; descricao_acao: string | null; tipo_acao: string; reu_nome: string } | null
  parcelas: Parcela[]
}

const STATUS_BADGE: Record<string, string> = {
  rascunho:             "bg-gray-100 text-gray-600",
  aguardando_assinatura:"bg-yellow-100 text-yellow-700",
  assinado:             "bg-green-100 text-green-700",
  cancelado:            "bg-red-100 text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  rascunho:             "Rascunho",
  aguardando_assinatura:"Aguardando assinatura",
  assinado:             "Assinado",
  cancelado:            "Cancelado",
}

const PARCELA_STATUS: Record<string, { icon: React.ReactNode; cls: string }> = {
  pendente: { icon: <Clock className="h-3.5 w-3.5" />,        cls: "text-muted-foreground" },
  pago:     { icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: "text-green-600" },
  vencido:  { icon: <AlertCircle className="h-3.5 w-3.5" />,  cls: "text-red-500" },
  cancelado:{ icon: null,                                       cls: "text-muted-foreground" },
}

function ParcelaRow({ parcela, contratoId }: { parcela: Parcela; contratoId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ps = PARCELA_STATUS[parcela.status] ?? PARCELA_STATUS.pendente

  return (
    <div className={`flex items-center justify-between py-1.5 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2">
        <span className={ps.cls}>{ps.icon}</span>
        <div>
          <p className="text-xs font-medium text-foreground">
            {parcela.numero}ª parcela — {parcela.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-muted-foreground">
            Vence {new Date(parcela.data_vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
            {parcela.data_pagamento && ` · Pago em ${new Date(parcela.data_pagamento + "T00:00:00").toLocaleDateString("pt-BR")}`}
          </p>
        </div>
      </div>
      {parcela.status === "pendente" && (
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => { await marcarParcelaPaga(parcela.id); router.refresh() })}
          className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          Marcar pago
        </button>
      )}
    </div>
  )
}

function ContratoCard({ contrato }: { contrato: Contrato }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const parcelasPagas   = contrato.parcelas?.filter((p) => p.status === "pago").length ?? 0
  const totalParcelas   = contrato.parcelas?.length ?? 0
  const totalRecebido   = contrato.parcelas?.filter((p) => p.status === "pago").reduce((s, p) => s + p.valor, 0) ?? 0
  const totalPendente   = contrato.parcelas?.filter((p) => p.status === "pendente").reduce((s, p) => s + p.valor, 0) ?? 0

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 bg-muted/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[contrato.status]}`}>
              {STATUS_LABEL[contrato.status]}
            </span>
            <span className="text-xs text-muted-foreground">via {contrato.plataforma_assinatura}</span>
          </div>
          <p className="font-medium text-foreground">
            {contrato.clientes?.nome ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contrato.processos?.descricao_acao ?? contrato.processos?.tipo_acao ?? "—"} — {contrato.processos?.reu_nome}
          </p>
        </div>
        <div className="text-right">
          {contrato.modelo === "parcelado_fixo" ? (
            <>
              <p className="font-semibold text-foreground">
                {contrato.valor_total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <p className="text-xs text-muted-foreground">{totalParcelas}x parcelas</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">{contrato.percentual_exito}% êxito</p>
              {contrato.base_calculo_exito && (
                <p className="text-xs text-muted-foreground">{contrato.base_calculo_exito}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progresso parcelado */}
      {contrato.modelo === "parcelado_fixo" && totalParcelas > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{parcelasPagas}/{totalParcelas} pagas · Recebido: {totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <span className="text-green-600">Pendente: {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${totalParcelas ? (parcelasPagas / totalParcelas) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-3 divide-y divide-border">
            {contrato.parcelas?.map((p) => (
              <ParcelaRow key={p.id} parcela={p} contratoId={contrato.id} />
            ))}
          </div>
        </div>
      )}

      {/* Ações de status */}
      {contrato.status !== "cancelado" && (
        <div className="px-4 py-2 border-t border-border flex gap-2 bg-muted/10">
          {contrato.status === "rascunho" && (
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => { await atualizarStatusContrato(contrato.id, "aguardando_assinatura"); router.refresh() })}
              className="text-xs px-2 py-1 border border-border rounded hover:bg-muted transition-colors"
            >
              Enviar para assinatura
            </button>
          )}
          {contrato.status === "aguardando_assinatura" && (
            <button
              disabled={isPending}
              onClick={() => startTransition(async () => { await atualizarStatusContrato(contrato.id, "assinado"); router.refresh() })}
              className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
            >
              Marcar como assinado
            </button>
          )}
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await atualizarStatusContrato(contrato.id, "cancelado"); router.refresh() })}
            className="text-xs px-2 py-1 text-muted-foreground hover:text-red-500 transition-colors ml-auto"
          >
            Cancelar contrato
          </button>
        </div>
      )}
    </div>
  )
}

export function ContratosList({ contratos }: { contratos: Contrato[] }) {
  if (!contratos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Nenhum contrato cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contratos.map((c) => <ContratoCard key={c.id} contrato={c} />)}
    </div>
  )
}
