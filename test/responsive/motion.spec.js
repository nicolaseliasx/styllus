import { test, expect } from '@playwright/test';

test('redução de movimento mantém o conteúdo imediatamente acessível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('body')).not.toHaveClass(/is-motion-ready/);
  await expect(page.locator('body')).not.toHaveClass(/is-scroll-motion-ready/);
  await expect(page.locator('.story-copy')).toHaveClass(/is-visible/);
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-value-slide].is-active strong')).toHaveText('FORÇA');
});

test.describe('motion padrão', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('hero entra em sequência e o menu mostra links em cascata', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('body')).toHaveClass(/is-motion-ready/);
    await expect(page.locator('body')).toHaveClass(/is-scroll-motion-ready/);
    await expect(page.locator('.hero-lockup')).toHaveCSS('animation-name', 'intro-reveal');
    await expect(page.locator('.hero-values-panel')).toHaveCSS('animation-name', 'intro-reveal');
    await expect(page.locator('[data-value-slide].is-active strong')).toHaveText('FORÇA');
    await page.waitForTimeout(5250);
    await expect(page.locator('[data-value-slide].is-active strong')).toHaveText('SAÚDE');
    const halo = await page.locator('[data-value-slide].is-active strong').evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return {
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animationIterationCount: style.animationIterationCount,
        backgroundImage: style.backgroundImage,
      };
    });
    expect(halo.animationName).toBe('value-halo-pulse');
    expect(halo.animationDuration).toBe('4.5s');
    expect(halo.animationIterationCount).toBe('infinite');
    expect(halo.backgroundImage).toContain('radial-gradient');

    await page.locator('[data-menu-toggle]').click();
    await expect(page.locator('[data-nav]')).toHaveClass(/is-open/);

    const firstDelay = await page.locator('[data-nav] a').first().evaluate(
      (element) => getComputedStyle(element).transitionDelay,
    );
    const lastDelay = await page.locator('[data-nav] a').last().evaluate(
      (element) => getComputedStyle(element).transitionDelay,
    );

    expect(firstDelay).not.toBe(lastDelay);
    await expect(page.locator('[data-nav] a').last()).toHaveCSS('opacity', '1');
  });

  test('reveal aciona ao entrar no viewport via IntersectionObserver', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');

    // Elementos acima do fold já devem estar visíveis (is-scroll-motion-ready adicionado imediatamente)
    await expect(page.locator('body')).toHaveClass(/is-scroll-motion-ready/);

    // Rolar até o elemento .campaign-intro que está fora do viewport inicial
    await page.locator('.campaign-intro').evaluate((element) => {
      document.documentElement.style.scrollBehavior = 'auto';
      element.scrollIntoView({ block: 'center' });
    });

    // Aguardar IntersectionObserver acionar e adicionar .is-visible
    await page.waitForFunction(
      () => document.querySelector('.campaign-intro')?.classList.contains('is-visible'),
      { timeout: 3000 },
    );

    await expect(page.locator('.campaign-intro')).toHaveClass(/is-visible/);
    await expect(page.locator('.campaign-intro')).toHaveCSS('animation-name', 'reveal-entry');
  });
});
