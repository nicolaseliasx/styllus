import { chromium } from '@playwright/test';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [];
p.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));
p.on('requestfailed', (r) => errors.push('reqfail: ' + r.url() + ' ' + r.failure()?.errorText));

await p.goto('http://127.0.0.1:5199/', { waitUntil: 'networkidle' });

await p.locator('.hero-gallery .overview-gallery-open').click();
const lb = p.locator('[data-gallery-lightbox] img');

for (let i = 0; i < 5; i++) {
  if (i > 0) await p.locator('[data-gallery-next]').click();
  await p.waitForTimeout(1200);
  const info = await lb.evaluate((img) => {
    const r = img.getBoundingClientRect();
    return {
      src: img.currentSrc.split('/').pop(),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rendered: Math.round(r.width) + 'x' + Math.round(r.height),
    };
  });
  console.log(`foto ${i + 1}:`, JSON.stringify(info));
}

console.log('ERROS:', errors.length ? errors : 'nenhum');
await b.close();
