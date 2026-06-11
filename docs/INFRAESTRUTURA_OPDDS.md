# Infraestrutura OPDDS

Baseada no mapa de infraestrutura do Gatedo, adaptada para O Poder dos Desacreditados.

## Arquitetura

- Frontend: React + Vite + PWA em `public/app`.
- Backend: NestJS + Prisma + TypeScript em `backend`.
- Banco futuro: PostgreSQL gerenciado, preferencialmente Neon.
- Storage futuro: Cloudflare R2 para PDFs, imagens, áudios e exports.
- Deploy futuro:
  - `app.opoderdosdesacreditados.online` -> frontend PWA.
  - `api.opoderdosdesacreditados.online` -> backend Render.
  - `opoderdosdesacreditados.online` -> landing/site.

## Responsabilidades

Frontend:
- experiência de leitura;
- player;
- onboarding;
- iGentMIND UI;
- Diário UI;
- progresso visual;
- consumo da API.

Backend:
- autenticação;
- tokens de acesso;
- entitlements/order bumps;
- progresso de leitura;
- respostas do Diário;
- histórico do iGentMIND;
- webhooks de checkout;
- URLs de mídia/storage.

Banco:
- usuários;
- produtos liberados;
- progresso;
- favoritos;
- entradas do Diário;
- conversas do iGentMIND;
- eventos de compra/webhook.

## Planos e produtos

- `opdds_base`: livro, PDF, app, biblioteca e áudios.
- `opdds_diario`: Diário dos Desacreditados editável.
- `opdds_igentmind_30d`: iGentMIND por 30 dias.
- `opdds_igentmind_90d`: iGentMIND por 90 dias.
- `opdds_vip`: pacote completo.

## Estratégia local

Enquanto o backend não estiver conectado:
- tokens continuam funcionando no frontend;
- Diário salva em `localStorage`;
- order bump é simulado localmente;
- build de produção do frontend segue estável.

## Estratégia produção

1. Subir backend NestJS no Render.
2. Criar banco Neon e rodar Prisma.
3. Configurar CORS para frontend e landing.
4. Migrar tokens locais para usuários + entitlements.
5. Integrar webhook do checkout.
6. Sincronizar Diário/progresso/iGentMIND no backend.
