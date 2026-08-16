import { test, expect } from '@playwright/test';

test('lightbox pausa rotação e navega em sequência correta', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');

  await page.locator('.hero-gallery .overview-gallery-open').click();
  const lightbox = page.locator('[data-gallery-lightbox]');
  const img = lightbox.locator('img');

  await expect(img).toHaveAttribute('src', /overview-01-2560\.webp/);

  // 8s parado: rotação da galeria deveria ter disparado (~5,5s) — mas está pausada
  await page.waitForTimeout(8000);
  await expect(img).toHaveAttribute('src', /overview-01-2560\.webp/);

  // Galeria por trás também deve continuar na mesma foto
  await expect(page.locator('.hero-gallery img.is-active')).toHaveAttribute('data-full', /overview-01-2560\.webp/);

  // Sequência exata, sem pular nem repetir
  await lightbox.locator('[data-gallery-next]').click();
  await expect(img).toHaveAttribute('src', /overview-02-2560\.webp/);
  await lightbox.locator('[data-gallery-next]').click();
  await expect(img).toHaveAttribute('src', /overview-03-2560\.webp/);
  await lightbox.locator('[data-gallery-next]').click();
  await expect(img).toHaveAttribute('src', /overview-04-2560\.webp/);
  await lightbox.locator('[data-gallery-next]').click();
  await expect(img).toHaveAttribute('src', /overview-05-2560\.webp/);

  // Wrap-around e voltar
  await lightbox.locator('[data-gallery-next]').click();
  await expect(img).toHaveAttribute('src', /overview-01-2560\.webp/);
  await lightbox.locator('[data-gallery-previous]').click();
  await expect(img).toHaveAttribute('src', /overview-05-2560\.webp/);

  // Foto carregada de verdade (não apenas src atribuído)
  const natural = await img.evaluate((el) => el.naturalWidth);
  expect(natural).toBe(2560);
});
