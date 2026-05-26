"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentPreview } from "@/components/document-preview";
import { Users } from "lucide-react";
import type { Message } from "@/lib/types";

export default function IntakeClientePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Vou coletar as informações do cliente. Pode começar pelo nome completo.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [ficha, setFicha] = useState<string | null>(null);

  async function handleSend(texto: string) {
    const novasMensagens: Message[] = [
      ...messages,
      { role: "user", content: texto },
    ];
    setMessages(novasMensagens);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/intake-cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novasMensagens }),
      });
      const data = await res.json();

      setMessages([
        ...novasMensagens,
        { role: "assistant", content: data.resposta },
      ]);

      if (data.ficha) {
        setFicha(data.ficha);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col w-96 border-r border-border">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Intake de Cliente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Coleta dados do caso e gera ficha estruturada.
          </p>
        </div>

        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder="Digite as informações do cliente..."
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {ficha ? (
          <DocumentPreview conteudo={ficha} titulo="Ficha do Cliente" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            A ficha do cliente aparecerá aqui ao final da coleta.
          </div>
        )}
      </div>
    </div>
  );
}
