# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> customer registration, fake payment, manager menu ops, QR scan, and fulfillment flow
- Location: tests/app.spec.ts:80:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('article').filter({ hasText: 'Order 2529594f' }).first().getByText('QR Ready')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('article').filter({ hasText: 'Order 2529594f' }).first().getByText('QR Ready')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - paragraph [ref=e8]: Customer workspace
      - heading "Order faster, pay cleanly, and keep QR pickup on track." [level=1] [ref=e9]
      - paragraph [ref=e10]: "This workspace drives the full customer API surface: menu browsing, cart sync, checkout, payment verification, QR retrieval, and issue escalation."
    - generic [ref=e11]:
      - paragraph [ref=e12]: Signed in as
      - heading "QA Customer 1775933724868" [level=2] [ref=e13]
      - paragraph [ref=e14]: qa.customer.1775933724868@smartcanteen.test
      - generic [ref=e15]:
        - generic [ref=e16]:
          - paragraph [ref=e17]: Role
          - paragraph [ref=e18]: CUSTOMER
        - generic [ref=e19]:
          - paragraph [ref=e20]: Tenant
          - paragraph [ref=e21]: 81f53fc5-cbd2-44c3-9964-b75c0a568f9f
      - button "Sign out" [ref=e22] [cursor=pointer]
  - generic [ref=e23]:
    - generic [ref=e24]:
      - paragraph [ref=e25]: Workspace
      - generic [ref=e26]:
        - button "Menu Browse the live menu, filter items, and build a backend-synced cart." [ref=e27] [cursor=pointer]:
          - paragraph [ref=e28]: Menu
          - paragraph [ref=e29]: Browse the live menu, filter items, and build a backend-synced cart.
        - button "Orders Track payment, QR, fulfillment, and issue workflows in one place." [ref=e30] [cursor=pointer]:
          - paragraph [ref=e31]: Orders
          - paragraph [ref=e32]: Track payment, QR, fulfillment, and issue workflows in one place.
        - button "Account View your campus profile and environment capabilities." [ref=e33] [cursor=pointer]:
          - paragraph [ref=e34]: Account
          - paragraph [ref=e35]: View your campus profile and environment capabilities.
    - generic [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]:
          - paragraph [ref=e41]: Order history
          - heading "Track every order lifecycle" [level=2] [ref=e42]
          - paragraph [ref=e43]: The customer order list is refreshed on an interval whenever an order is still moving through payment or fulfillment.
        - generic [ref=e44]:
          - generic [ref=e45]:
            - textbox [ref=e46]:
              - /placeholder: From date
            - textbox [ref=e47]:
              - /placeholder: To date
          - textbox "Search by order, item, or status" [ref=e49]
      - article [ref=e51]:
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]:
              - heading "Order 2529594f" [level=3] [ref=e55]
              - generic [ref=e56]: Payment Pending
            - paragraph [ref=e57]: Payment was started and is waiting for confirmation.
            - paragraph [ref=e58]: 12 Apr 2026, 12:25 am • Main Canteen
          - generic [ref=e59]:
            - paragraph [ref=e60]: Total
            - paragraph [ref=e61]: ₹50.00
        - generic [ref=e63]:
          - paragraph [ref=e64]: Cold Coffee
          - paragraph [ref=e65]: Quantity 1
          - paragraph [ref=e66]: ₹50.00
```

# Test source

```ts
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
  77  |   await expect(page.getByText('Inactive')).toBeVisible({ timeout: 10_000 });
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
> 124 |   await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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
  178 |   await expect(page.getByText('SUCCESS')).toBeVisible();
  179 | 
  180 |   await page.getByRole('button', { name: 'Sign out' }).click();
  181 |   await login(page, customerEmail, customerPassword);
  182 |   await page.getByRole('button', { name: 'Orders' }).click();
  183 |   await page.getByPlaceholder('Search by order, item, or status').fill(orderHeading.replace('Order ', ''));
  184 |   const customerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();
  185 |   await customerOrderCard.getByRole('button', { name: 'Report issue' }).click();
  186 |   await page.getByLabel('Describe the issue').fill('Packaging was damaged after pickup.');
  187 |   await page.getByRole('button', { name: 'Submit issue' }).click();
  188 |   await expect(customerOrderCard.getByText('Issue Reported')).toBeVisible({ timeout: 15_000 });
  189 | });
  190 | 
  191 | test('manager can refund a confirmed paid order and payment report reflects it', async ({ page }) => {
  192 |   await login(page, 'student.alpha@smartcanteen.com', customerPassword);
  193 |   await expect(page.getByText('Customer workspace')).toBeVisible();
  194 | 
  195 |   const firstMenuCard = page
  196 |     .locator('article')
  197 |     .filter({ has: page.getByRole('button', { name: 'Add to cart' }) })
  198 |     .first();
  199 | 
  200 |   await firstMenuCard.getByRole('button', { name: 'Add to cart' }).click();
  201 |   await page.getByRole('button', { name: 'Place order' }).click();
  202 |   await page.getByRole('button', { name: 'Orders' }).click();
  203 |   await expect(page.getByText('Order history', { exact: true })).toBeVisible();
  204 | 
  205 |   const firstOrderCard3 = page
  206 |     .locator('article')
  207 |     .filter({ has: page.getByRole('button', { name: 'Pay now' }) })
  208 |     .first();
  209 | 
  210 |   const orderHeading = (await firstOrderCard3.locator('h3').first().textContent()) ?? '';
  211 |   await firstOrderCard3.getByRole('button', { name: 'Pay now' }).click();
  212 | 
  213 |   // Re-anchor by heading text so locator stays valid after Pay now disappears
  214 |   const orderCard = page.locator('article').filter({ hasText: orderHeading }).first();
  215 |   await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
  216 |   await orderCard.getByRole('button', { name: 'View QR' }).click();
  217 |   const qrToken = await page.getByLabel('Signed token').inputValue();
  218 |   await page.getByRole('button', { name: 'Close' }).click();
  219 | 
  220 |   await page.getByRole('button', { name: 'Sign out' }).click();
  221 |   await login(page, 'manager.alpha@smartcanteen.com', managerPassword);
  222 |   await expect(page.getByText('Kitchen operations')).toBeVisible();
  223 | 
  224 |   await page.getByRole('button', { name: 'Scanner' }).click();
```