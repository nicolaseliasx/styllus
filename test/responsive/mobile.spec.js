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

    const heroCta = page.locator('[data-hero-cta]');
    await expect(heroCta).toBeVisible();
    const heroCtaBox = await heroCta.boundingBox();
    expect(heroCtaBox.height).toBeGreaterThanOrEqual(44);
    expect(heroCtaBox.y + heroCtaBox.height).toBeLessThanOrEqual(viewport.height);

    const menuButtonBox = await page.locator('[data-menu-toggle]').boundingBox();
    expect(menuButtonBox.width).toBeGreaterThanOrEqual(44);
    expect(menuButtonBox.height).toBeGreaterThanOrEqual(44);

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
