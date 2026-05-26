# Briefing — Advocacia OS

**Criado em:** 2026-05-26
**Tipo:** Produto para vender

## Objetivo

Ferramenta interna web para advogados automatizarem o trabalho do dia a dia:
revisar contratos, gerar petições, fazer intake de clientes e organizar casos.

## Modelo de negócio

Um codebase base. Cada escritório cliente recebe:
- Deploy próprio (subdomínio ou domínio white-label)
- Arquivo de configuração com nome, áreas de atuação, tom de voz, templates
- Onboarding rápido (< 1 hora para novo cliente no ar)

## Usuário final

O advogado (usuário único ou pequena equipe). Não é interface para clientes
do escritório — é ferramenta de produtividade interna.

## Agentes previstos

1. **Revisar Contrato** — analisa texto de contrato, aponta cláusulas críticas
2. **Gerar Petição** — chat guiado, gera minuta baseada em template
3. **Intake de Cliente** — coleta informações do caso, gera ficha estruturada
4. **FAQ Jurídico** — responde dúvidas com base no contexto do escritório

## Decisões técnicas tomadas

- Next.js 14 (App Router) + TypeScript
- shadcn/ui + Tailwind para UI
- Claude API (claude-sonnet-4-6) com prompt caching
- Supabase para auth + banco + storage
- Deploy: Vercel

## Próximos passos

- [ ] Instalar dependências (`npm install`)
- [ ] Configurar `.env.local` com as chaves
- [ ] Testar agente de revisar contrato
- [ ] Criar primeiro config de cliente piloto
