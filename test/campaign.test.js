import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';

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

test('o markup prioriza estrutura, suporte e planos em vez de campanha temporal', async () => {
  const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(markup, /styllus-lockup\.webp/);
  assert.match(markup, /styllus-mark-header\.webp/);
  assert.match(markup, /ELA ESTÁ<br \/><em>DE VOLTA\.<\/em>/);
  assert.match(markup, /Equipamentos de musculação em dia/);
  assert.match(markup, /Equipe presente/);
  assert.match(markup, /Planos para sua rotina/);
  assert.match(markup, /Preços imperdíveis/);
  assert.match(markup, /Força <i><\/i> Saúde <i><\/i> Disciplina <i><\/i> Resultados/);
  assert.match(markup, /A Styllus está/);
  assert.doesNotMatch(markup, /final-cta-lockup/);
  assert.doesNotMatch(markup, /data-value-rotator|data-campaign|campaign\.js/);
  assert.doesNotMatch(markup, /E a <strong>STYLLUS<\/strong> entra em uma nova fase|O mesmo nome\. A mesma essência|promoção irresistível/);

  const nav = markup.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, />Estrutura</);
  assert.match(nav, />Localização</);
  assert.match(nav, />Falar no WhatsApp</);
  assert.doesNotMatch(nav, />Reinauguração<|>A Styllus</);
});

test('exibe endereço e mapa acessível na seção Estrutura', async () => {
  const markup = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(markup, /R\. Princesa Isabel, 600 — Pte\. do Imaruim, Palhoça — SC, 88130-635/);
  assert.match(markup, /<iframe[\s\S]*title="Mapa da Styllus Fitness Center em R\. Princesa Isabel, 600, Palhoça, SC"/);
  assert.match(markup, /https:\/\/www\.google\.com\/maps\?q=R\.\+Princesa\+Isabel/);
  assert.match(markup, />\s*Abrir no Google Maps/);
  assert.match(markup, /VENHA CONHECER<br \/><em>A STYLLUS\.<\/em>/);
  assert.match(markup, /src="\/assets\/styllus-mark\.webp"[^>]*alt=""/);
  assert.doesNotMatch(markup, /class="about-tags"/);
});
