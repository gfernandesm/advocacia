"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { MessageSquare } from "lucide-react";
import type { Message } from "@/lib/types";

export default function FaqJuridicoPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Pode me fazer qualquer dúvida jurídica. Vou responder com base no contexto do escritório.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function handleSend(texto: string) {
    const novasMensagens: Message[] = [
      ...messages,
      { role: "user", content: texto },
    ];
    setMessages(novasMensagens);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/faq-juridico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: novasMensagens }),
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
      <div className="flex flex-col flex-1 max-w-2xl mx-auto">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            FAQ Jurídico
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dúvidas rápidas com base no contexto do escritório.
          </p>
        </div>

        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder="Qual a sua dúvida?"
        />
      </div>
    </div>
  );
}
