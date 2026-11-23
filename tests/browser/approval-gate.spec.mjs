import { test, expect } from '@playwright/test';

test('internal synthetic qualification task is allowed without external side effects', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Synthetic event ID').fill('browser-poc-internal-001');
  await page.getByRole('button', { name: 'Create internal qualification task' }).click();

  await expect(page.getByTestId('task-status')).toHaveText('pending');
  await expect(page.getByTestId('approval-required')).toHaveText('false');
  await expect(page.getByTestId('execution-allowed')).toHaveText('true');
  await expect(page.getByTestId('execution-performed')).toHaveText('false');
});

test('external-contact task is held for explicit approval and is never executed', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Synthetic event ID').fill('browser-poc-external-001');
  await page.getByRole('button', { name: 'Create external-contact task' }).click();

  await expect(page.getByTestId('task-status')).toHaveText('awaiting_approval');
  await expect(page.getByTestId('approval-required')).toHaveText('true');
  await expect(page.getByTestId('execution-allowed')).toHaveText('false');
  await expect(page.getByTestId('execution-performed')).toHaveText('false');
  await expect(page.getByText('No external action is performed by this test server.')).toBeVisible();
});
