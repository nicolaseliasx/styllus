import test from 'node:test';
import assert from 'node:assert/strict';
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
    'assets/1.jpg',
    'assets/2.png',
    'assets/styllus-lockup.webp',
    'assets/styllus-mark.webp',
    'assets/styllus-mark-header.webp',
  ];
  await Promise.all(assets.map((asset) => stat(new URL(`../${asset}`, import.meta.url))));
});

test('o markup elimina o halter CSS e reduz a navegação principal', async () => {
  const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(markup, /styllus-lockup\.webp/);
  assert.match(markup, /styllus-mark\.webp/);
  assert.match(markup, /FORÇA EM CADA MOVIMENTO/);
  assert.doesNotMatch(markup, /hero-silhouette|weight-bar|weight-left|weight-right/);

  const nav = markup.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, />A Styllus</);
  assert.match(nav, />Reinauguração</);
  assert.match(nav, />Falar no WhatsApp</);
  assert.doesNotMatch(nav, />Início<|>Estrutura<|>Contato</);
});
