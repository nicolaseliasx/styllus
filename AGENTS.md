# Styllus Fitness Center — Guia do Agente

Site estático one-page (Vite + JS vanilla + GSAP). Objetivo único: apresentar a
academia e converter para WhatsApp. Sem backend, sem formulários, sem cookies.

## Comandos

- `npm run dev` — dev server
- `npm test` — testes de conteúdo/assets (node:test)
- `npm run test:responsive` — testes Playwright (mobile/tablet/desktop)
- `npm run build` — build de produção em `dist/`
- Deploy: automático via GitHub Actions no push para `main` (GitHub Pages)

## Estética (adaptado do Claude Cookbook — "Prompting for Frontend Aesthetics")

Evite a estética genérica de IA. Este projeto busca um visual autoral, com
identidade de academia séria — escuro, metálico, azul elétrico.

- **Tipografia**: nunca use Inter, Roboto, Open Sans, Lato ou fontes de sistema
  como identidade. Display: **Anton** (impacto condensado). Corpo: **Barlow**.
  Acento técnico (labels, números, coordenadas): **JetBrains Mono**. Use
  contraste extremo: pesos 300 vs 700+, saltos de escala 3x, não 1.5x.
- **Cor e tema**: comprometa-se com o tema escuro navy + azul elétrico derivado
  do logo (ver BRAND.md). Cor dominante com acentos pontuais vence paletas
  tímidas e uniformes. CSS variables para consistência.
- **Motion**: um page-load bem orquestrado com staggered reveals gera mais
  impacto que micro-interações espalhadas. Priorize soluções CSS-only; GSAP
  apenas para entradas e scroll reveals. Respeite sempre
  `prefers-reduced-motion` (há testes cobrindo isso).
- **Backgrounds**: atmosfera e profundidade, nunca cor chapada. Camadas de
  gradients radiais, grids geométricos sutis, glows contextuais.
- **Evite**: gradientes roxos, layouts "SaaS dashboard", cards genéricos com
  border-radius grande e sombras suaves, fontes batidas, emojis.

## Regras rígidas

- O logo da Styllus é **intocável** (assets originais + hashes verificados em
  `test/campaign.test.js`).
- Dados de contato são fixos: WhatsApp (48) 99188-5129 →
  `https://api.whatsapp.com/send?phone=5548991885129&text=...` (injetado em
  `[data-whatsapp]` pelo `src/main.js`), e-mail `contato@styllusfitness.com.br`,
  endereço R. Princesa Isabel, 600 — Pte. do Imaruim, Palhoça — SC, 88130-635,
  mapa Google embed na seção Estrutura.
- Imagens: fotos partem de HEIC 4032×2268 em `assets/overview/`; sempre gere
  variantes WebP (800w/1600w/2560w) com `magick` e sirva com `srcset`.
- Perfeição em mobile (360px+) e desktop (1920px+): sem overflow horizontal,
  alvos de toque ≥ 44px, safe-areas iOS respeitadas. Os testes Playwright
  codificam esses limites — mantenha-os verdes.
- Escreva copy em pt-BR com tom motivacional mas concreto (ver BRAND.md).
  Nada de hype vazio tipo "promoção imperdível".
