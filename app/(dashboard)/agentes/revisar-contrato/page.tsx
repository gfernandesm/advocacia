"use client";

import { useState, useRef } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentPreview } from "@/components/document-preview";
import { Upload, FileText } from "lucide-react";
import type { Message } from "@/lib/types";

export default function RevisarContratoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResultado(null);

    const formData = new FormData();
    formData.append("arquivo", file);

    try {
      const res = await fetch("/api/agents/revisar-contrato", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setResultado(data.analise);
      setMessages([
        {
          role: "assistant",
          content: "Analisei o contrato. Veja o relatório ao lado.",
        },
      ]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: "Erro ao processar o arquivo. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(texto: string) {
    if (!resultado) return;

    const novasMensagens: Message[] = [
      ...messages,
      { role: "user", content: texto },
    ];
    setMessages(novasMensagens);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/revisar-contrato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novasMensagens, contexto: resultado }),
      });
      const data = await res.json();
      setMessages([
        ...novasMensagens,
        { role: "assistant", content: data.resposta },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col w-96 border-r border-border">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Revisar Contrato
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie o contrato para análise ou faça perguntas após a revisão.
          </p>
        </div>

        {!resultado && (
          <div className="p-5">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="w-full flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">
                {loading ? "Analisando..." : "Clique para enviar PDF ou DOCX"}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder="Pergunte sobre o contrato..."
          disabled={!resultado}
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {resultado ? (
          <DocumentPreview conteudo={resultado} titulo="Análise do Contrato" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Envie um contrato para ver a análise aqui.
          </div>
        )}
      </div>
    </div>
  );
}
