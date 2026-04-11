# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> super admin manages colleges, managers, and token refresh
- Location: tests/app.spec.ts:14:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Inactive')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Inactive')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e8]: Platform control room
      - heading "Operate every tenant from a single service dashboard." [level=1] [ref=e9]
      - paragraph [ref=e10]: Analytics, college lifecycle management, registration links, and manager assignment all stay anchored to the live backend contracts.
      - button "Create college" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - paragraph [ref=e14]: Signed in as
      - heading "Platform Owner" [level=2] [ref=e15]
      - paragraph [ref=e16]: owner@smartcanteen.com
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: Role
          - paragraph [ref=e20]: SUPER ADMIN
        - generic [ref=e21]:
          - paragraph [ref=e22]: Tenant
          - paragraph [ref=e23]: Platform scope
      - button "Sign out" [ref=e24] [cursor=pointer]
  - generic [ref=e25]:
    - generic [ref=e26]:
      - paragraph [ref=e27]: Workspace
      - generic [ref=e28]:
        - button "Overview Cross-tenant analytics and live platform health." [ref=e29] [cursor=pointer]:
          - paragraph [ref=e30]: Overview
          - paragraph [ref=e31]: Cross-tenant analytics and live platform health.
        - button "Colleges Create, update, deactivate, and share registration links." [active] [ref=e32] [cursor=pointer]:
          - paragraph [ref=e33]: Colleges
          - paragraph [ref=e34]: Create, update, deactivate, and share registration links.
        - button "Managers Inspect canteens and assign campus managers." [ref=e35] [cursor=pointer]:
          - paragraph [ref=e36]: Managers
          - paragraph [ref=e37]: Inspect canteens and assign campus managers.
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]:
          - paragraph [ref=e43]: Tenant directory
          - heading "Create and manage colleges" [level=2] [ref=e44]
          - paragraph [ref=e45]: Search the tenant catalog, update contact details, pause access, and generate the exact signup links students can use for registration.
        - textbox "Search by college, code, or email" [ref=e47]: QA College 1775933712501
      - article [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - generic [ref=e52]:
              - heading "QA College 1775933712501" [level=3] [ref=e53]
              - generic [ref=e54]: Active
            - paragraph [ref=e55]: QA712501 • admin.1775933712501@college.test
            - paragraph [ref=e56]: QA Street, Test City
          - button "Inspect" [ref=e57] [cursor=pointer]
        - generic [ref=e58]:
          - generic [ref=e59]:
            - paragraph [ref=e60]: Users
            - paragraph [ref=e61]: "1"
          - generic [ref=e62]:
            - paragraph [ref=e63]: Canteens
            - paragraph [ref=e64]: "1"
          - generic [ref=e65]:
            - paragraph [ref=e66]: Orders
            - paragraph [ref=e67]: "0"
        - generic [ref=e68]:
          - button "Edit college" [ref=e69] [cursor=pointer]
          - button "Copy signup link" [ref=e70] [cursor=pointer]
          - button "Deactivate" [ref=e71] [cursor=pointer]
```

# Test source

```ts
  1   | import { type Page, expect, test } from '@playwright/test';
  2   | 
  3   | const apiBaseUrl = 'http://127.0.0.1:8080/api';
  4   | const managerPassword = 'Manager@123';
  5   | const customerPassword = 'Customer@123';
  6   | 
  7   | const login = async (page: Page, email: string, password: string) => {
  8   |   await page.goto('/login');
  9   |   await page.getByLabel('Email').fill(email);
  10  |   await page.getByLabel('Password').fill(password);
  11  |   await page.getByRole('button', { name: 'Sign in' }).click();
  12  | };
  13  | 
  14  | test('super admin manages colleges, managers, and token refresh', async ({ page, request }) => {
  15  |   const uniqueId = Date.now().toString();
  16  |   const collegeName = `QA College ${uniqueId}`;
  17  |   const collegeCode = `QA${uniqueId.slice(-6)}`;
  18  |   const managerName = `QA Manager ${uniqueId}`;
  19  |   const managerEmail = `qa.manager.${uniqueId}@smartcanteen.test`;
  20  | 
  21  |   await page.goto('/login');
  22  |   await expect(page.getByText('Public service checks')).toBeVisible();
  23  |   await expect(page.getByText('Smart Canteen Backend')).toBeVisible();
  24  |   await page.getByLabel('Email').fill('owner@smartcanteen.com');
  25  |   await page.getByLabel('Password').fill('SuperAdmin@123');
  26  |   await page.getByRole('button', { name: 'Sign in' }).click();
  27  | 
  28  |   await expect(page.getByText('Platform control room')).toBeVisible();
  29  |   await expect(page.getByRole('heading', { name: 'Live platform health' })).toBeVisible();
  30  | 
  31  |   const refreshToken = await page.evaluate(() => {
  32  |     const raw = window.localStorage.getItem('smart-canteen.session');
  33  |     return raw ? (JSON.parse(raw) as { refreshToken: string }).refreshToken : '';
  34  |   });
  35  | 
  36  |   const refreshResponse = await request.post(`${apiBaseUrl}/auth/refresh`, {
  37  |     data: { refreshToken }
  38  |   });
  39  |   expect(refreshResponse.ok()).toBeTruthy();
  40  |   const refreshPayload = await refreshResponse.json();
  41  |   expect(refreshPayload.data.accessToken).toBeTruthy();
  42  | 
  43  |   await page.getByRole('button', { name: 'Create college' }).click();
  44  |   await page.getByLabel('College name').fill(collegeName);
  45  |   await page.getByLabel('College code').fill(collegeCode);
  46  |   await page.getByLabel('Contact email').fill(`admin.${uniqueId}@college.test`);
  47  |   await page.getByLabel('Contact phone').fill('9000012345');
  48  |   await page.getByLabel('Address').fill('QA Street, Test City');
  49  |   await page.getByLabel('Default canteen name').fill('QA Main Canteen');
  50  |   await page.getByLabel('Default canteen location').fill('Ground Floor');
  51  |   await page.getByRole('button', { name: 'Create tenant' }).click();
  52  | 
  53  |   await expect(page.getByText(collegeName)).toBeVisible();
  54  | 
  55  |   await page.getByRole('button', { name: 'Colleges' }).click();
  56  |   await expect(page.getByText('Tenant directory')).toBeVisible();
  57  | 
  58  |   await page.getByPlaceholder('Search by college, code, or email').fill(collegeName);
  59  |   await page.getByRole('button', { name: 'Edit college' }).click();
  60  |   await page.getByLabel('Contact phone').fill('9888877777');
  61  |   await page.getByRole('button', { name: 'Save changes' }).click();
  62  | 
  63  |   await page.getByRole('button', { name: 'Managers' }).click();
  64  |   await expect(page.getByText('Manager roster')).toBeVisible();
  65  |   await page.getByRole('button', { name: 'Assign manager' }).first().click();
  66  |   await page.getByLabel('Full name').fill(managerName);
  67  |   await page.getByLabel('Email').fill(managerEmail);
  68  |   await page.getByLabel('Phone').fill('9333344444');
  69  |   await page.getByLabel('Temporary password').fill('Manager@123');
  70  |   await page.getByLabel('Canteen').selectOption({ index: 1 });
  71  |   await page.locator('form').filter({ has: page.getByLabel('Temporary password') }).getByRole('button', { name: 'Assign manager' }).click();
  72  | 
  73  |   await expect(page.getByText(managerName)).toBeVisible();
  74  | 
  75  |   await page.getByRole('button', { name: 'Colleges' }).click();
  76  |   await page.getByRole('button', { name: 'Deactivate' }).click();
> 77  |   await expect(page.getByText('Inactive')).toBeVisible({ timeout: 10_000 });
      |                                            ^ Error: expect(locator).toBeVisible() failed
  78  | });
  79  | 
  80  | test('customer registration, fake payment, manager menu ops, QR scan, and fulfillment flow', async ({ page }) => {
  81  |   const uniqueId = Date.now().toString();
  82  |   const customerName = `QA Customer ${uniqueId}`;
  83  |   const customerEmail = `qa.customer.${uniqueId}@smartcanteen.test`;
  84  |   const customItemName = `QA Wrap ${uniqueId}`;
  85  | 
  86  |   await page.goto('/register');
  87  |   await page.locator('select').first().selectOption({ index: 1 });
  88  |   await page.getByLabel('Full name').fill(customerName);
  89  |   await page.getByLabel('Email').fill(customerEmail);
  90  |   await page.getByLabel('Phone').fill('9444455555');
  91  |   await page.getByLabel('Password').fill(customerPassword);
  92  |   await page.getByLabel('Student or faculty ID').fill(`QA-${uniqueId}`);
  93  |   await page.getByLabel('Year of study').fill('3');
  94  |   await page.getByRole('button', { name: 'Create account' }).click();
  95  | 
  96  |   await expect(page.getByText('Customer workspace', { exact: true })).toBeVisible();
  97  |   await page.getByRole('button', { name: 'Account' }).click();
  98  |   await expect(page.getByText('Service health')).toBeVisible();
  99  |   await expect(page.getByText('Smart Canteen Backend')).toBeVisible();
  100 |   await page.getByRole('button', { name: 'Menu' }).click();
  101 | 
  102 |   const firstMenuCard = page
  103 |     .locator('article')
  104 |     .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
  105 |     .first();
  106 | 
  107 |   await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  108 |   await page.getByRole('button', { name: 'Clear cart' }).click();
  109 |   await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  110 |   await page.getByRole('button', { name: 'Place order' }).click();
  111 |   await page.getByRole('button', { name: 'Orders' }).click();
  112 |   await expect(page.getByText('Order history', { exact: true })).toBeVisible();
  113 | 
  114 |   const firstOrderCard = page
  115 |     .locator('article')
  116 |     .filter({ has: page.getByRole('button', { name: 'Pay now' }) })
  117 |     .first();
  118 | 
  119 |   const orderHeading = (await firstOrderCard.locator('h3').first().textContent()) ?? '';
  120 |   await firstOrderCard.getByRole('button', { name: 'Pay now' }).click();
  121 | 
  122 |   // Re-anchor by heading text so locator stays valid after Pay now disappears
  123 |   const orderCard = page.locator('article').filter({ hasText: orderHeading }).first();
  124 |   await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
  125 |   await orderCard.getByRole('button', { name: 'View QR' }).click();
  126 | 
  127 |   const qrToken = await page.getByLabel('Signed token').inputValue();
  128 |   await page.getByRole('button', { name: 'Close' }).click();
  129 | 
  130 |   await page.getByRole('button', { name: 'Sign out' }).click();
  131 |   await expect(page).toHaveURL(/\/login$/);
  132 | 
  133 |   await login(page, 'manager.alpha@smartcanteen.com', managerPassword);
  134 | 
  135 |   await expect(page.getByText('Kitchen operations')).toBeVisible();
  136 | 
  137 |   await page.getByRole('button', { name: 'Menu' }).click();
  138 |   await page.getByRole('button', { name: 'Create menu item' }).click();
  139 |   await page.getByLabel('Item name').fill(customItemName);
  140 |   await page.getByLabel('Category').fill('QA Specials');
  141 |   await page.getByLabel('Price in paise').fill('12345');
  142 |   await page.getByLabel('Stock quantity').fill('9');
  143 |   await page.getByLabel('Description').fill('Playwright generated menu item.');
  144 |   await page.getByRole('button', { name: 'Create item' }).click();
  145 | 
  146 |   await page.getByPlaceholder('Search menu items').fill(customItemName);
  147 |   await expect(page.getByText(customItemName)).toBeVisible();
  148 |   await page.getByRole('button', { name: 'Edit' }).click();
  149 |   await page.getByLabel('Stock quantity').fill('12');
  150 |   await page.getByRole('button', { name: 'Save changes' }).click();
  151 | 
  152 |   await page.getByRole('button', { name: 'Delete' }).click();
  153 |   await expect(page.getByText(customItemName)).not.toBeVisible();
  154 | 
  155 |   await page.getByRole('button', { name: 'Scanner' }).click();
  156 |   await page.getByLabel('Signed token').fill(qrToken);
  157 |   await page.getByRole('button', { name: 'Validate QR' }).click();
  158 |   await expect(page.getByText('Last confirmed order')).toBeVisible({ timeout: 15_000 });
  159 | 
  160 |   await page.getByRole('button', { name: 'Orders' }).click();
  161 |   await page.getByPlaceholder('Search order, item, or customer').fill(orderHeading.replace('Order ', ''));
  162 |   const managerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();
  163 | 
  164 |   await managerOrderCard.getByRole('button', { name: 'Mark Preparing' }).click();
  165 |   await page.getByRole('button', { name: 'Confirm action' }).click();
  166 |   await expect(managerOrderCard.getByText('Preparing')).toBeVisible({ timeout: 15_000 });
  167 | 
  168 |   await managerOrderCard.getByRole('button', { name: 'Mark Ready' }).click();
  169 |   await page.getByRole('button', { name: 'Confirm action' }).click();
  170 |   await expect(managerOrderCard.getByText('Ready')).toBeVisible({ timeout: 15_000 });
  171 | 
  172 |   await managerOrderCard.getByRole('button', { name: 'Mark Completed' }).click();
  173 |   await page.getByRole('button', { name: 'Confirm action' }).click();
  174 |   await expect(managerOrderCard.getByText('Completed')).toBeVisible({ timeout: 15_000 });
  175 | 
  176 |   await page.getByRole('button', { name: 'Payments' }).click();
  177 |   await expect(page.getByText('Revenue and refund visibility')).toBeVisible();
```