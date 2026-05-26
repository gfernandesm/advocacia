# Advocacia OS

> Projeto criado em 2026-05-26. Produto SaaS para escritórios de advocacia.

## Sobre

Ferramenta interna com interface web para advogados automatizarem seu trabalho
(revisar contratos, gerar petições, organizar casos, fazer intake de clientes).
Um codebase replicável — cada escritório cliente recebe um deploy configurado.

## Tipo

Produto para vender

## Entregas previstas

- Aplicação web Next.js 14
- Agentes de IA via Claude API (Anthropic SDK)
- Interface de chat para cada agente
- Sistema de configuração por cliente (config/_template.ts)
- Templates de documentos jurídicos

## Estrutura do projeto

```
advocacia-os/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Login
│   ├── (dashboard)/      # Painel principal
│   └── api/agents/       # API routes dos agentes
├── lib/
│   ├── agents/           # Lógica de cada agente
│   └── config.ts         # Configuração do escritório ativo
├── config/               # Um arquivo por cliente
├── components/           # Componentes React
└── templates/            # Modelos de documentos
```

## Onde salvar o que

- Lógica dos agentes: `lib/agents/`
- Prompts de sistema: dentro de cada arquivo de agente
- Templates de documentos: `templates/`
- Config de clientes: `config/`
- Componentes UI: `components/`

## Contexto que herda da raiz

Herda tom e contexto do negócio de `_memoria/` da raiz do MazyOS.

## Específico desse projeto

- Stack: Next.js 14 + shadcn/ui + Tailwind + Supabase + Claude API
- Cada cliente novo = novo arquivo em `config/` + deploy no Vercel
- Nunca hardcodar nome do escritório no código — sempre via config
- Prompts com `cache_control: ephemeral` para reduzir custo de API
