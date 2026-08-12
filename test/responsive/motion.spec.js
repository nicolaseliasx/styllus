import { test, expect } from '@playwright/test';

test('redução de movimento mantém o conteúdo imediatamente acessível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Conteúdo deve ser visível sem animação
  await expect(page.locator('.hero-lockup')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero-proofs')).toBeVisible();
  await expect(page.locator('.story-copy')).toBeVisible();
});

test.describe('motion padrão', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('hero anima na entrada e o menu mostra links em cascata', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Aguardar GSAP terminar as animações de entrada (maior delay é 920ms + duração 1.1s = ~2100ms)
    await page.waitForTimeout(2500);

    // Após a animação, todos os elementos hero devem estar completamente visíveis
    await expect(page.locator('.hero-lockup')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.hero-actions')).toBeVisible();
    await expect(page.locator('.hero-proofs')).toBeVisible();

    await expect(page.locator('.hero-proofs')).toContainText('Equipamentos de musculação em dia');

    // Menu
    await page.locator('[data-menu-toggle]').click();
    await expect(page.locator('[data-nav]')).toHaveClass(/is-open/);
    const firstDelay = await page.locator('[data-nav] a').first().evaluate(
      (el) => getComputedStyle(el).transitionDelay,
    );
    const lastDelay = await page.locator('[data-nav] a').last().evaluate(
      (el) => getComputedStyle(el).transitionDelay,
    );
    expect(firstDelay).not.toBe(lastDelay);
    await expect(page.locator('[data-nav] a').last()).toHaveCSS('opacity', '1');
  });

  test('scroll reveal via GSAP ScrollTrigger', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');

    // Rolar até .campaign-intro
    await page.locator('.campaign-intro').evaluate((el) => {
      document.documentElement.style.scrollBehavior = 'auto';
      el.scrollIntoView({ block: 'center' });
    });

    // GSAP ScrollTrigger deve ter disparado — aguardar a animação terminar
    await page.waitForTimeout(1200);

    // O elemento deve estar visível (opacity: 1) após o GSAP animar
    const opacity = await page.locator('.campaign-intro').evaluate(
      (el) => parseFloat(getComputedStyle(el).opacity),
    );
    expect(opacity).toBeGreaterThan(0.9);
  });
});
