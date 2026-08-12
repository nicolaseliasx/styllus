import { test, expect } from '@playwright/test';

test('redução de movimento mantém o conteúdo imediatamente acessível', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('body')).not.toHaveClass(/is-motion-ready/);
  await expect(page.locator('.story-copy')).toHaveClass(/is-visible/);
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '1');
});

test.describe('motion padrão', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('hero entra em sequência e o menu mostra links em cascata', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('body')).toHaveClass(/is-motion-ready/);
    await expect(page.locator('.hero-lockup')).toHaveCSS('animation-name', 'intro-reveal');

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
});
