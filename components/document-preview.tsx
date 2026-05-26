"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentPreviewProps {
  conteudo: string;
  titulo: string;
}

export function DocumentPreview({ conteudo, titulo }: DocumentPreviewProps) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(conteudo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function baixar() {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">{titulo}</h2>
        <div className="flex gap-2">
          <button
            onClick={copiar}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors",
              copiado
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {copiado ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={baixar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Baixar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-border bg-card p-6">
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{conteudo}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
