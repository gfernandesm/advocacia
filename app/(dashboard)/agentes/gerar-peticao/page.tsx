"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentPreview } from "@/components/document-preview";
import { Scale } from "lucide-react";
import type { Message } from "@/lib/types";

export default function GerarPeticaoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Vou ajudar a gerar a petição. Para começar, qual é o tipo de petição? (ex: inicial cível, contestação, recurso, notificação extrajudicial)",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [peticao, setPeticao] = useState<string | null>(null);

  async function handleSend(texto: string) {
    const novasMensagens: Message[] = [
      ...messages,
      { role: "user", content: texto },
    ];
    setMessages(novasMensagens);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/gerar-peticao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novasMensagens }),
      });
      const data = await res.json();

      setMessages([
        ...novasMensagens,
        { role: "assistant", content: data.resposta },
      ]);

      if (data.peticao) {
        setPeticao(data.peticao);
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
            <Scale className="h-5 w-5 text-primary" />
            Gerar Petição
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Responda as perguntas para montar a minuta.
          </p>
        </div>

        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder="Descreva o caso ou responda a pergunta..."
        />
      </div>

      <div className="flex-1 overflow-auto p-6">
        {peticao ? (
          <DocumentPreview conteudo={peticao} titulo="Minuta da Petição" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            A minuta aparecerá aqui quando estiver pronta.
          </div>
        )}
      </div>
    </div>
  );
}
