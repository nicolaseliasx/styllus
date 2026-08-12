import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

import { getCampaignState } from '../src/campaign.js';

test('mantém a pré-reinauguração antes da meia-noite de 15/08 em Brasília', () => {
  assert.equal(getCampaignState(new Date('2026-08-15T02:59:59.999Z')), 'prelaunch');
});

test('ativa a nova fase exatamente à meia-noite de 15/08 em Brasília', () => {
  assert.equal(getCampaignState(new Date('2026-08-15T03:00:00.000Z')), 'launched');
});

test('mantém o estado lançado depois da data de corte', () => {
  assert.equal(getCampaignState(new Date('2027-01-01T00:00:00.000Z')), 'launched');
});

test('usa os assets oficiais transparentes e preserva os originais', async () => {
  const assets = [
    'assets/1.PNG',
    'assets/2.png',
    'assets/styllus-lockup.webp',
    'assets/styllus-mark.webp',
    'assets/styllus-mark-header.webp',
  ];
  await Promise.all(assets.map((asset) => stat(new URL(`../${asset}`, import.meta.url))));

  const originals = new Map([
    ['assets/1.PNG', '3b9524f6d4b1cc3f4b0cd2089c8687a0de2021cd5d90fff30b4ed7195898d53b'],
    ['assets/2.png', 'b49cbe6ee185beae7fc0173d182ebfd5f42a06e9faf7fb48512e3d88dd02db2e'],
  ]);
  for (const [asset, expectedHash] of originals) {
    const contents = await readFile(new URL(`../${asset}`, import.meta.url));
    assert.equal(createHash('sha256').update(contents).digest('hex'), expectedHash);
  }
});

test('o markup elimina o halter CSS, usa valores rotativos e reduz a navegação principal', async () => {
  const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(markup, /styllus-lockup\.webp/);
  assert.match(markup, /styllus-mark-header\.webp/);
  assert.match(markup, /data-value-rotator/);
  assert.match(markup, /ELA ESTÁ<br \/><em>DE VOLTA\.<\/em>/);
  assert.match(markup, /<strong>FORÇA<\/strong>/);
  assert.match(markup, /<strong>DISCIPLINA<\/strong>/);
  assert.doesNotMatch(markup, /final-cta-lockup/);
  assert.doesNotMatch(markup, /Supere seus limites|Constância que transforma|data-value-dot/);
  assert.doesNotMatch(markup, /hero-silhouette|weight-bar|weight-left|weight-right|hero-manifesto|hero-emblem|hero-grid|hero-values-mark|hero-values-aura/);
  assert.doesNotMatch(markup, /<p class="eyebrow hero-entry"/);

  const nav = markup.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, />A Styllus</);
  assert.match(nav, />Reinauguração</);
  assert.match(nav, />Falar no WhatsApp</);
  assert.doesNotMatch(nav, />Início<|>Estrutura<|>Contato</);
});
