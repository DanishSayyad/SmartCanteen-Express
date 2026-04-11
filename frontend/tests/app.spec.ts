import { type Page, expect, test } from '@playwright/test';

const apiBaseUrl = 'http://127.0.0.1:8080/api';
const managerPassword = 'Manager@123';
const customerPassword = 'Customer@123';

const login = async (page: Page, email: string, password: string) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

test('super admin manages colleges, managers, and token refresh', async ({ page, request }) => {
  const uniqueId = Date.now().toString();
  const collegeName = `QA College ${uniqueId}`;
  const collegeCode = `QA${uniqueId.slice(-6)}`;
  const managerName = `QA Manager ${uniqueId}`;
  const managerEmail = `qa.manager.${uniqueId}@smartcanteen.test`;

  await page.goto('/login');
  await expect(page.getByText('Public service checks')).toBeVisible();
  await expect(page.getByText('Smart Canteen Backend')).toBeVisible();
  await page.getByLabel('Email').fill('owner@smartcanteen.com');
  await page.getByLabel('Password').fill('SuperAdmin@123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Platform control room')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Live platform health' })).toBeVisible();

  const refreshToken = await page.evaluate(() => {
    const raw = window.localStorage.getItem('smart-canteen.session');
    return raw ? (JSON.parse(raw) as { refreshToken: string }).refreshToken : '';
  });

  const refreshResponse = await request.post(`${apiBaseUrl}/auth/refresh`, {
    data: { refreshToken }
  });
  expect(refreshResponse.ok()).toBeTruthy();
  const refreshPayload = await refreshResponse.json();
  expect(refreshPayload.data.accessToken).toBeTruthy();

  await page.getByRole('button', { name: 'Create college' }).click();
  await page.getByLabel('College name').fill(collegeName);
  await page.getByLabel('College code').fill(collegeCode);
  await page.getByLabel('Contact email').fill(`admin.${uniqueId}@college.test`);
  await page.getByLabel('Contact phone').fill('9000012345');
  await page.getByLabel('Address').fill('QA Street, Test City');
  await page.getByLabel('Default canteen name').fill('QA Main Canteen');
  await page.getByLabel('Default canteen location').fill('Ground Floor');
  await page.getByRole('button', { name: 'Create tenant' }).click();

  await expect(page.getByText(collegeName)).toBeVisible();

  await page.getByRole('button', { name: 'Colleges' }).click();
  await expect(page.getByText('Tenant directory')).toBeVisible();

  await page.getByPlaceholder('Search by college, code, or email').fill(collegeName);
  await page.getByRole('button', { name: 'Edit college' }).click();
  await page.getByLabel('Contact phone').fill('9888877777');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await page.getByRole('button', { name: 'Managers' }).click();
  await expect(page.getByText('Manager roster')).toBeVisible();
  await page.getByRole('button', { name: 'Assign manager' }).first().click();
  await page.getByLabel('Full name').fill(managerName);
  await page.getByLabel('Email').fill(managerEmail);
  await page.getByLabel('Phone').fill('9333344444');
  await page.getByLabel('Temporary password').fill('Manager@123');
  await page.getByLabel('Canteen').selectOption({ index: 1 });
  await page.locator('form').filter({ has: page.getByLabel('Temporary password') }).getByRole('button', { name: 'Assign manager' }).click();

  await expect(page.getByText(managerName)).toBeVisible();

  await page.getByRole('button', { name: 'Colleges' }).click();
  await page.getByPlaceholder('Search by college, code, or email').fill(collegeName);
  await expect(page.locator('article').filter({ hasText: collegeName })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Deactivate' }).click();
  await expect(page.getByText('Inactive')).toBeVisible({ timeout: 10_000 });
});

test('customer registration, fake payment, manager menu ops, QR scan, and fulfillment flow', async ({ page }) => {
  const uniqueId = Date.now().toString();
  const customerName = `QA Customer ${uniqueId}`;
  const customerEmail = `qa.customer.${uniqueId}@smartcanteen.test`;
  const customItemName = `QA Wrap ${uniqueId}`;

  await page.goto('/register');
  await page.locator('select').first().selectOption({ index: 1 });
  await page.getByLabel('Full name').fill(customerName);
  await page.getByLabel('Email').fill(customerEmail);
  await page.getByLabel('Phone').fill('9444455555');
  await page.getByLabel('Password').fill(customerPassword);
  await page.getByLabel('Student or faculty ID').fill(`QA-${uniqueId}`);
  await page.getByLabel('Year of study').fill('3');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('Customer workspace', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Account' }).click();
  await expect(page.getByText('Service health')).toBeVisible();
  await expect(page.getByText('Smart Canteen Backend')).toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();

  const firstMenuCard = page
    .locator('article')
    .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
    .first();

  await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Clear cart' }).click();
  await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Place order' }).click();
  await page.getByRole('button', { name: 'Orders' }).click();
  await expect(page.getByText('Order history', { exact: true })).toBeVisible();

  const firstOrderCard = page
    .locator('article')
    .filter({ has: page.getByRole('button', { name: 'Pay now' }) })
    .first();

  const orderHeading = (await firstOrderCard.locator('h3').first().textContent()) ?? '';
  await firstOrderCard.getByRole('button', { name: 'Pay now' }).click();

  // Re-anchor by heading text so locator stays valid after Pay now disappears
  const orderCard = page.locator('article').filter({ hasText: orderHeading }).first();
  await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
  await orderCard.getByRole('button', { name: 'View QR' }).click();

  const qrToken = await page.getByLabel('Signed token').inputValue();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await login(page, 'manager.alpha@smartcanteen.com', managerPassword);

  await expect(page.getByText('Kitchen operations')).toBeVisible();

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Create menu item' }).click();
  await page.getByLabel('Item name').fill(customItemName);
  await page.getByLabel('Category').fill('QA Specials');
  await page.getByLabel('Price in paise').fill('12345');
  await page.getByLabel('Stock quantity').fill('9');
  await page.getByLabel('Description').fill('Playwright generated menu item.');
  await page.getByRole('button', { name: 'Create item' }).click();

  await page.getByPlaceholder('Search menu items').fill(customItemName);
  await expect(page.getByText(customItemName)).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Stock quantity').fill('12');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(customItemName)).not.toBeVisible();

  await page.getByRole('button', { name: 'Scanner' }).click();
  await page.getByLabel('Signed token').fill(qrToken);
  await page.getByRole('button', { name: 'Validate QR' }).click();
  await expect(page.getByText('Last confirmed order')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Orders' }).click();
  await page.getByPlaceholder('Search order, item, or customer').fill(orderHeading.replace('Order ', ''));
  const managerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();

  await managerOrderCard.getByRole('button', { name: 'Mark Preparing' }).click();
  await page.getByRole('button', { name: 'Confirm action' }).click();
  await expect(managerOrderCard.getByText('Preparing')).toBeVisible({ timeout: 15_000 });

  await managerOrderCard.getByRole('button', { name: 'Mark Ready' }).click();
  await page.getByRole('button', { name: 'Confirm action' }).click();
  await expect(managerOrderCard.getByText('Ready')).toBeVisible({ timeout: 15_000 });

  await managerOrderCard.getByRole('button', { name: 'Mark Completed' }).click();
  await page.getByRole('button', { name: 'Confirm action' }).click();
  await expect(managerOrderCard.getByText('Completed')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Payments' }).click();
  await expect(page.getByText('Revenue and refund visibility')).toBeVisible();
  await expect(page.getByText('SUCCESS')).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await login(page, customerEmail, customerPassword);
  await page.getByRole('button', { name: 'Orders' }).click();
  await page.getByPlaceholder('Search by order, item, or status').fill(orderHeading.replace('Order ', ''));
  const customerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();
  await customerOrderCard.getByRole('button', { name: 'Report issue' }).click();
  await page.getByLabel('Describe the issue').fill('Packaging was damaged after pickup.');
  await page.getByRole('button', { name: 'Submit issue' }).click();
  await expect(customerOrderCard.getByText('Issue Reported')).toBeVisible({ timeout: 15_000 });
});

test('manager can refund a confirmed paid order and payment report reflects it', async ({ page }) => {
  await login(page, 'student.alpha@smartcanteen.com', customerPassword);
  await expect(page.getByText('Customer workspace')).toBeVisible();

  const firstMenuCard = page
    .locator('article')
    .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
    .first();

  await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: 'Place order' }).click();
  await page.getByRole('button', { name: 'Orders' }).click();
  await expect(page.getByText('Order history', { exact: true })).toBeVisible();

  const firstOrderCard3 = page
    .locator('article')
    .filter({ has: page.getByRole('button', { name: 'Pay now' }) })
    .first();

  const orderHeading = (await firstOrderCard3.locator('h3').first().textContent()) ?? '';
  await firstOrderCard3.getByRole('button', { name: 'Pay now' }).click();

  // Re-anchor by heading text so locator stays valid after Pay now disappears
  const orderCard = page.locator('article').filter({ hasText: orderHeading }).first();
  await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
  await orderCard.getByRole('button', { name: 'View QR' }).click();
  const qrToken = await page.getByLabel('Signed token').inputValue();
  await page.getByRole('button', { name: 'Close' }).click();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await login(page, 'manager.alpha@smartcanteen.com', managerPassword);
  await expect(page.getByText('Kitchen operations')).toBeVisible();

  await page.getByRole('button', { name: 'Scanner' }).click();
  await page.getByLabel('Signed token').fill(qrToken);
  await page.getByRole('button', { name: 'Validate QR' }).click();
  await expect(page.getByText('Last confirmed order')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Orders' }).click();
  await page.getByPlaceholder('Search order, item, or customer').fill(orderHeading.replace('Order ', ''));
  const managerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();
  await managerOrderCard.getByRole('button', { name: 'Mark Refunded' }).click();
  await page.getByLabel('Reason').fill('Customer requested an immediate refund at pickup.');
  await page.getByRole('button', { name: 'Confirm action' }).click();
  await expect(managerOrderCard.getByText('Refunded')).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Payments' }).click();
  await expect(page.getByText('REFUNDED')).toBeVisible();
});
