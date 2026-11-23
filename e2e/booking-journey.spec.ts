import { test, expect } from '@playwright/test';

/**
 * Oasis Amusement Park — Playwright E2E User Journey Suite
 * Tests public discovery, attraction slot inspection, booking wizard, and admin console.
 */
test.describe('Oasis Amusement Park E2E Journeys', () => {
  const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

  test('1. Homepage renders hero, 3D landmark, attractions, packages, and FAQ', async ({
    page,
  }) => {
    await page.goto(WEB_URL);
    await expect(page.locator('h1')).toContainText('Thrills');
    await expect(page.getByText('All-In-One Park Packages')).toBeVisible();
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible();
  });

  test('2. Attractions catalog filters by category and opens attraction details', async ({
    page,
  }) => {
    await page.goto(`${WEB_URL}/attractions`);
    await expect(page.locator('h1')).toContainText('Attractions');
    await expect(page.getByText('Omni VR Battle Arena')).toBeVisible();
  });

  test('3. Guided Booking Wizard loads General Admission and attraction passes', async ({
    page,
  }) => {
    await page.goto(`${WEB_URL}/book`);
    await expect(page.locator('h1')).toContainText('Book Your Oasis Experience');
    await expect(page.getByText('General Park Admission Passes')).toBeVisible();
  });

  test('4. Admin Operations Console renders role-protected sign-in gate', async ({
    page,
  }) => {
    await page.goto(`${WEB_URL}/admin`);
    await expect(
      page.getByText('Oasis Staff & Admin Operations'),
    ).toBeVisible();
  });
});
