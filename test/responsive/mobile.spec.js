import { test, expect } from '@playwright/test';

const mobileViewports = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
];

for (const viewport of mobileViewports) {
  test(`${viewport.name}: mantém conversão e layout dentro da tela`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);

    const heroTop = await page.locator('.hero-lockup').evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    expect(heroTop).toBeGreaterThanOrEqual(74);
    expect(heroTop).toBeLessThanOrEqual(104);

    const heroCta = page.locator('[data-hero-cta]');
    await expect(heroCta).toBeVisible();
    const heroCtaBox = await heroCta.boundingBox();
    expect(heroCtaBox.height).toBeGreaterThanOrEqual(44);
    expect(heroCtaBox.y + heroCtaBox.height).toBeLessThanOrEqual(viewport.height);

    const heroLockupBox = await page.locator('.hero-lockup').boundingBox();
    expect(Math.abs((heroLockupBox.x + heroLockupBox.width / 2) - (viewport.width / 2))).toBeLessThanOrEqual(2);

    const heroTitleBox = await page.locator('.hero h1').boundingBox();
    expect(Math.abs((heroTitleBox.x + heroTitleBox.width / 2) - (viewport.width / 2))).toBeLessThanOrEqual(2);

    await expect(page.locator('.about-title-logo')).toBeVisible();
    const aboutLogoBox = await page.locator('.about-title-logo').boundingBox();
    expect(Math.abs((aboutLogoBox.x + aboutLogoBox.width / 2) - (viewport.width / 2))).toBeLessThanOrEqual(2);

    const menuButtonBox = await page.locator('[data-menu-toggle]').boundingBox();
    expect(menuButtonBox.width).toBeGreaterThanOrEqual(44);
    expect(menuButtonBox.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('[data-value-rotator]')).toBeVisible();
    await expect(page.locator('.hero-values-mark, .hero-values-dots, .hero-value span')).toHaveCount(0);

    await page.waitForTimeout(900);

    await page.screenshot({
      path: `test-results/styllus-${viewport.name}.png`,
      fullPage: true,
    });
  });
}

test('menu móvel gerencia foco, Escape e restauração do botão', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-nav] a').first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('WhatsApp flutuante aparece após o hero e não cobre CTAs equivalentes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const floatingButton = page.locator('.whatsapp-float');
  await expect(floatingButton).not.toHaveClass(/is-visible/);

  await page.locator('#historia').scrollIntoViewIfNeeded();
  await expect(floatingButton).toHaveClass(/is-visible/);

  await page.locator('.principles').scrollIntoViewIfNeeded();
  await expect(floatingButton).not.toHaveClass(/is-visible/);

  await page.locator('#contato [data-float-guard]').scrollIntoViewIfNeeded();
  await expect(floatingButton).not.toHaveClass(/is-visible/);
});

test('tablet e desktop não apresentam rolagem horizontal', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  }
});

test('desktop usa a marca acessível e somente a navegação reduzida', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await expect(page.getByAltText('Emblema da Styllus Fitness Center').first()).toBeVisible();
  await expect(page.getByAltText(/Styllus Fitness Center — força/)).toBeVisible();
  await expect(page.locator('[data-nav] a')).toHaveCount(3);
  await expect(page.locator('[data-nav]')).not.toContainText('Início');
  await expect(page.locator('[data-nav]')).not.toContainText('Estrutura');
  await expect(page.locator('[data-nav]')).not.toContainText('Contato');

  const heroTop = await page.locator('.hero-lockup').evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(heroTop).toBeGreaterThanOrEqual(86);
  expect(heroTop).toBeLessThanOrEqual(126);

  const alignment = await page.evaluate(() => {
    const heading = document.querySelector('.hero-heading').getBoundingClientRect();
    const values = document.querySelector('.hero-values').getBoundingClientRect();
    return Math.abs((heading.top + heading.height / 2) - (values.top + values.height / 2));
  });
  expect(alignment).toBeLessThanOrEqual(2);

  const opticalAlignment = await page.evaluate(async () => {
    const logo = document.querySelector('.hero-lockup');
    const heading = document.querySelector('.hero-heading').getBoundingClientRect();
    const image = new Image();
    image.src = logo.currentSrc || logo.src;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let alphaTotal = 0;
    let weightedX = 0;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        alphaTotal += alpha;
        weightedX += x * alpha;
      }
    }

    const logoBox = logo.getBoundingClientRect();
    const visualCenter = logoBox.left + ((weightedX / alphaTotal) / image.naturalWidth) * logoBox.width;
    const headingCenter = heading.left + heading.width / 2;
    return Math.abs(visualCenter - headingCenter);
  });
  expect(opticalAlignment).toBeGreaterThanOrEqual(18);
  expect(opticalAlignment).toBeLessThanOrEqual(45);

  await page.waitForTimeout(900);
  await page.screenshot({ path: 'test-results/styllus-desktop.png', fullPage: true });
});

test('módulo de valores exibe somente a palavra centralizada', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');

  const activeValue = page.locator('[data-value-slide].is-active strong');
  await expect(activeValue).toHaveText('FORÇA');
  await expect(page.locator('.hero-values-mark, .hero-values-dots, .hero-value span')).toHaveCount(0);

  const centering = await page.evaluate(() => {
    const module = document.querySelector('.hero-values').getBoundingClientRect();
    const word = document.querySelector('[data-value-slide].is-active strong').getBoundingClientRect();
    return Math.abs((module.left + module.width / 2) - (word.left + word.width / 2));
  });
  expect(centering).toBeLessThanOrEqual(2);
});

test('CTA final não repete o logo e mantém o conteúdo centralizado', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');

  await expect(page.locator('.final-cta-lockup')).toHaveCount(0);
  const centering = await page.evaluate(() => {
    const section = document.querySelector('.final-cta').getBoundingClientRect();
    const heading = document.querySelector('.final-cta h2').getBoundingClientRect();
    return Math.abs((section.left + section.width / 2) - (heading.left + heading.width / 2));
  });
  expect(centering).toBeLessThanOrEqual(2);
});

test('assets da marca têm alfa real e conteúdo centralizado', async ({ page }) => {
  await page.goto('/');

  for (const source of [
    '/assets/styllus-mark.webp',
    '/assets/styllus-mark-header.webp',
    '/assets/styllus-lockup.webp',
  ]) {
    const metrics = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);

      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if (data[(y * width + x) * 4 + 3] > 25) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      return {
        cornerAlphas: [data[3], data[(width - 1) * 4 + 3], data[(height - 1) * width * 4 + 3], data[(width * height - 1) * 4 + 3]],
        horizontalMarginDelta: Math.abs(minX - (width - 1 - maxX)),
        verticalMarginDelta: Math.abs(minY - (height - 1 - maxY)),
      };
    }, source);

    expect(metrics.cornerAlphas).toEqual([0, 0, 0, 0]);
    expect(metrics.horizontalMarginDelta).toBeLessThanOrEqual(2);
    expect(metrics.verticalMarginDelta).toBeLessThanOrEqual(8);
  }
});
