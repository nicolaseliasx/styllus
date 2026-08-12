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
  await expect(page.locator('[data-value-slide].is-pulsing')).toHaveCount(0);
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

  test('reveal acompanha o scroll e regride ao voltar pelo mesmo intervalo', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');

    const positionReveal = async (viewportRatio) => {
      await page.locator('.campaign-intro').evaluate((element, ratio) => {
        document.documentElement.style.scrollBehavior = 'auto';
        const rect = element.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + rect.top - (window.innerHeight * ratio));
      }, viewportRatio);
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return page.locator('.campaign-intro').evaluate((element) => ({
        progress: Number.parseFloat(getComputedStyle(element).getPropertyValue('--reveal-progress')),
        opacity: Number.parseFloat(getComputedStyle(element).opacity),
        blur: Number.parseFloat(getComputedStyle(element).getPropertyValue('--reveal-blur')),
        offset: Number.parseFloat(getComputedStyle(element).getPropertyValue('--reveal-offset')),
      }));
    };

    const hidden = await positionReveal(0.95);
    const halfwayDown = await positionReveal(0.835);
    const visible = await positionReveal(0.72);
    const halfwayUp = await positionReveal(0.835);
    const hiddenAgain = await positionReveal(0.95);

    expect(hidden.progress).toBeLessThanOrEqual(0.02);
    expect(halfwayDown.progress).toBeGreaterThan(0.4);
    expect(halfwayDown.progress).toBeLessThan(0.7);
    expect(halfwayDown.opacity).toBeCloseTo(halfwayDown.progress, 1);
    expect(halfwayDown.blur).toBeGreaterThan(0.8);
    expect(halfwayDown.offset).toBeGreaterThan(5);
    expect(visible.progress).toBeGreaterThanOrEqual(0.98);
    expect(halfwayUp.progress).toBeGreaterThan(0.4);
    expect(halfwayUp.progress).toBeLessThan(0.7);
    expect(hiddenAgain.progress).toBeLessThanOrEqual(0.02);
  });
});
