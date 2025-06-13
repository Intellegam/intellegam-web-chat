import { generateId } from 'ai';
import { getUnixTime } from 'date-fns';
import { test, expect, type Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

const testEmail = `test-${getUnixTime(new Date())}@playwright.com`;
const testPassword = generateId(16);

class AuthPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/login');
    await expect(this.page.getByRole('heading')).toContainText('Sign In');
  }

  async gotoRegister() {
    await this.page.goto('/register');
    await expect(this.page.getByRole('heading')).toContainText('Sign Up');
  }

  async register(email: string, password: string) {
    await this.gotoRegister();
    await this.page.getByPlaceholder('user@acme.com').click();
    await this.page.getByPlaceholder('user@acme.com').fill(email);
    await this.page.getByLabel('Password').click();
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }

  async login(email: string, password: string) {
    await this.gotoLogin();
    await this.page.getByPlaceholder('user@acme.com').click();
    await this.page.getByPlaceholder('user@acme.com').fill(email);
    await this.page.getByLabel('Password').click();
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }

  async expectToastToContain(text: string) {
    await expect(this.page.getByTestId('toast')).toContainText(text);
  }
}

test.describe
  .serial('authentication', () => {
    let authPage: AuthPage;

    test.beforeEach(async ({ page }) => {
      authPage = new AuthPage(page);
    });

    test('redirect to landing page when unauthenticated', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/start');
    });

    test('redirect login to WorkOS hosted auth', async ({ page }) => {
      await page.goto('/login');
      // Should redirect to WorkOS AuthKit login
      await page.waitForURL(/authkit/, { timeout: 10000 });
      await expect(page.url()).toMatch(/authkit/);
    });

    test('redirect register to WorkOS hosted auth', async ({ page }) => {
      await page.goto('/register');
      // Should redirect to WorkOS AuthKit login
      await page.waitForURL(/authkit/, { timeout: 10000 });
      await expect(page.url()).toMatch(/authkit/);
    });

    test.skip('register a test account', async ({ page }) => {
      // Note: This test is skipped because WorkOS handles registration
      // Registration now happens through WorkOS hosted auth pages
      await authPage.register(testEmail, testPassword);
      await expect(page).toHaveURL('/');
      await authPage.expectToastToContain('Account created successfully!');
    });

    test.skip('register test account with existing email', async () => {
      // Note: This test is skipped because WorkOS handles registration
      await authPage.register(testEmail, testPassword);
      await authPage.expectToastToContain('Account already exists!');
    });

    test.skip('log into account', async ({ page }) => {
      // Note: This test is skipped because WorkOS handles authentication
      // Login now happens through WorkOS hosted auth pages
      await authPage.login(testEmail, testPassword);

      await page.waitForURL('/');
      await expect(page).toHaveURL('/');
      await expect(page.getByPlaceholder('Send a message...')).toBeVisible();
    });
  });
