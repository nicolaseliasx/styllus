# Brand Book — Styllus Fitness Center

Baseado no template "applying-brand-guidelines" do Claude Cookbook, aplicado à
identidade real extraída dos assets oficiais.

## Marca

Styllus Fitness Center — academia de bairro séria em Palhoça/SC (Pte. do
Imaruim), reinaugurada com estrutura renovada de equipamentos Santana Fitness.
Posicionamento: academia para quem quer **treinar de verdade** — sem enrolação,
com equipe presente e planos acessíveis.

## Logo (intocável)

| Asset | Uso |
| --- | --- |
| `assets/styllus-mark.webp` (1280×1280) | Emblema grande — seção Estrutura |
| `assets/styllus-lockup.webp` (960×960) | Lockup vertical — hero |
| `assets/styllus-mark-header.webp` (180×180) | Favicon e header/footer |

- Nunca redesenhar, recolorir, adicionar contornos ou distorcer.
- Sobre fundo escuro (`#030508`–`#0d1118`); glow azul sutil permitido
  (`drop-shadow` até 0.3 de opacidade).
- Espaço limpo mínimo ao redor igual à altura da letra "S" do emblema.

## Paleta (extraída do logo — dominate + accent)

| Token | Hex | Papel |
| --- | --- | --- |
| `--black` | `#030508` | Fundo dominante |
| `--graphite` | `#080b10` | Seções alternadas |
| `--surface` | `#0d1118` | Painéis |
| Azuis do logo | `#053d8f` `#1363bd` `#3c96db` | Profundidade/gradients |
| `--blue` | `#087cff` | Acento elétrico (CTAs, glows, `em`) |
| `--blue-light` | `#39a2ff` | Acento em texto/ícones |
| `--white` | `#f4f7fb` | Texto principal |
| `--silver` | `#a4adba` | Texto secundário |

Regra: escuro domina (~85%), azul elétrico aparece em momentos decisivos
(CTA, `em` dos títulos, linhas/glow), nunca como fundo grande chapado.

## Tipografia

- **Anton** (400) — títulos display, SEMPRE uppercase, line-height 0.9–0.95,
  tracking 0 a 0.01em. É a voz da marca: forte, condensada, direta.
- **Barlow** (300/400/600/700) — corpo e botões. Botões em 700 uppercase com
  letter-spacing ≥ 0.08em.
- **JetBrains Mono** (500) — eyebrows, números de seção, coordenadas, labels
  técnicas. uppercase, letter-spacing ≥ 0.14em, tamanhos ≤ 0.8rem.
- Hierarquia por contraste extremo: título display vs. corpo tem salto 3x+.

## Voz e tom

Motivacional mas concreto. Frases curtas. Imperativo. Zero clichês de academia
de rede ("sem desculpas", "vira o jogo") e zero hype vazio.

- Bom: "Estrutura renovada. Energia de sempre." / "Treino de verdade começa
  com estrutura de verdade."
- Ruim: "A academia mais incrível da região!!!" / "Promoção imperdível".

Valores fixos do rodapé: **Força · Saúde · Disciplina · Resultados**.

## Checklist de qualidade (antes de qualquer merge)

- [ ] Logo intacto (hashes verdes em `npm test`)
- [ ] Sem overflow horizontal em 360px e 1920px
- [ ] Alvos de toque ≥ 44px; safe-areas iOS ok
- [ ] `prefers-reduced-motion`: conteúdo 100% acessível sem animação
- [ ] LCP do hero com `fetchpriority="high"` + `srcset` nas fotos
- [ ] Copy em pt-BR, tom do brand book, dados de contato corretos
- [ ] Tema: escuro dominante, azul como acento — não o contrário
