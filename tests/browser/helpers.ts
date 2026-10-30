import { expect, type Page } from '@playwright/test'

export const guideNames = ['2.6 Screen', 'Al Salam Mall', 'Al Nassar Tower Vertical', 'Alshaheed - Mupi', 'The Gate Mall Outdoor']
export async function approveGuides(page: Page) {
  await page.getByRole('button', { name: /3 · Adapt/ }).click()
  await expect(page.locator('.calibration-card')).toHaveCount(5)
  for (const name of guideNames) {
    await page.getByRole('button', { name: `Edit ${name}`, exact: true }).click()
    await page.getByRole('button', { name: /Approve this guide|Guide approved/, exact: true }).click()
    await page.getByRole('button', { name: 'Back to five previews', exact: false }).click()
  }
  await page.getByRole('button', { name: 'Use these guides for full adaptation', exact: true }).click()
}
