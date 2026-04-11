# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> manager can refund a confirmed paid order and payment report reflects it
- Location: tests/app.spec.ts:191:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('article').filter({ hasText: 'Order 071553a8' }).first().getByText('QR Ready')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('article').filter({ hasText: 'Order 071553a8' }).first().getByText('QR Ready')

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
      - heading "Alpha Student" [level=2] [ref=e13]
      - paragraph [ref=e14]: student.alpha@smartcanteen.com
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
      - generic [ref=e50]:
        - article [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]:
              - generic [ref=e54]:
                - heading "Order 071553a8" [level=3] [ref=e55]
                - generic [ref=e56]: Payment Pending
              - paragraph [ref=e57]: Payment was started and is waiting for confirmation.
              - paragraph [ref=e58]: 12 Apr 2026, 12:26 am • Main Canteen
            - generic [ref=e59]:
              - paragraph [ref=e60]: Total
              - paragraph [ref=e61]: ₹50.00
          - generic [ref=e63]:
            - paragraph [ref=e64]: Cold Coffee
            - paragraph [ref=e65]: Quantity 1
            - paragraph [ref=e66]: ₹50.00
        - article [ref=e67]:
          - generic [ref=e68]:
            - generic [ref=e69]:
              - generic [ref=e70]:
                - heading "Order 0e28d7cb" [level=3] [ref=e71]
                - generic [ref=e72]: Payment Pending
              - paragraph [ref=e73]: Payment was started and is waiting for confirmation.
              - paragraph [ref=e74]: 12 Apr 2026, 12:19 am • Main Canteen
            - generic [ref=e75]:
              - paragraph [ref=e76]: Total
              - paragraph [ref=e77]: ₹50.00
          - generic [ref=e79]:
            - paragraph [ref=e80]: Cold Coffee
            - paragraph [ref=e81]: Quantity 1
            - paragraph [ref=e82]: ₹50.00
        - article [ref=e83]:
          - generic [ref=e84]:
            - generic [ref=e85]:
              - generic [ref=e86]:
                - heading "Order 3f4906fa" [level=3] [ref=e87]
                - generic [ref=e88]: Created
              - paragraph [ref=e89]: Order has been drafted and is waiting for payment.
              - paragraph [ref=e90]: 12 Apr 2026, 12:04 am • Main Canteen
            - generic [ref=e91]:
              - paragraph [ref=e92]: Total
              - paragraph [ref=e93]: ₹50.00
          - generic [ref=e95]:
            - paragraph [ref=e96]: Cold Coffee
            - paragraph [ref=e97]: Quantity 1
            - paragraph [ref=e98]: ₹50.00
          - button "Pay now" [ref=e100] [cursor=pointer]
        - article [ref=e101]:
          - generic [ref=e102]:
            - generic [ref=e103]:
              - generic [ref=e104]:
                - heading "Order e832cae0" [level=3] [ref=e105]
                - generic [ref=e106]: Created
              - paragraph [ref=e107]: Order has been drafted and is waiting for payment.
              - paragraph [ref=e108]: 12 Apr 2026, 12:01 am • Main Canteen
            - generic [ref=e109]:
              - paragraph [ref=e110]: Total
              - paragraph [ref=e111]: ₹50.00
          - generic [ref=e113]:
            - paragraph [ref=e114]: Cold Coffee
            - paragraph [ref=e115]: Quantity 1
            - paragraph [ref=e116]: ₹50.00
          - button "Pay now" [ref=e118] [cursor=pointer]
        - article [ref=e119]:
          - generic [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]:
                - heading "Order 8b0e054c" [level=3] [ref=e123]
                - generic [ref=e124]: Created
              - paragraph [ref=e125]: Order has been drafted and is waiting for payment.
              - paragraph [ref=e126]: 11 Apr 2026, 11:59 pm • Main Canteen
            - generic [ref=e127]:
              - paragraph [ref=e128]: Total
              - paragraph [ref=e129]: ₹50.00
          - generic [ref=e131]:
            - paragraph [ref=e132]: Cold Coffee
            - paragraph [ref=e133]: Quantity 1
            - paragraph [ref=e134]: ₹50.00
          - button "Pay now" [ref=e136] [cursor=pointer]
        - article [ref=e137]:
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [ref=e140]:
                - heading "Order 47824a87" [level=3] [ref=e141]
                - generic [ref=e142]: Created
              - paragraph [ref=e143]: Order has been drafted and is waiting for payment.
              - paragraph [ref=e144]: 11 Apr 2026, 11:55 pm • Main Canteen
            - generic [ref=e145]:
              - paragraph [ref=e146]: Total
              - paragraph [ref=e147]: ₹50.00
          - generic [ref=e149]:
            - paragraph [ref=e150]: Cold Coffee
            - paragraph [ref=e151]: Quantity 1
            - paragraph [ref=e152]: ₹50.00
          - button "Pay now" [ref=e154] [cursor=pointer]
        - article [ref=e155]:
          - generic [ref=e156]:
            - generic [ref=e157]:
              - generic [ref=e158]:
                - heading "Order 3a0edd4c" [level=3] [ref=e159]
                - generic [ref=e160]: Created
              - paragraph [ref=e161]: Order has been drafted and is waiting for payment.
              - paragraph [ref=e162]: 11 Apr 2026, 11:50 pm • Main Canteen
            - generic [ref=e163]:
              - paragraph [ref=e164]: Total
              - paragraph [ref=e165]: ₹200.00
          - generic [ref=e167]:
            - paragraph [ref=e168]: Cold Coffee
            - paragraph [ref=e169]: Quantity 4
            - paragraph [ref=e170]: ₹200.00
          - button "Pay now" [ref=e172] [cursor=pointer]
```

# Test source

```ts
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
> 215 |   await expect(orderCard.getByText('QR Ready')).toBeVisible({ timeout: 20_000 });
      |                                                 ^ Error: expect(locator).toBeVisible() failed
  216 |   await orderCard.getByRole('button', { name: 'View QR' }).click();
  217 |   const qrToken = await page.getByLabel('Signed token').inputValue();
  218 |   await page.getByRole('button', { name: 'Close' }).click();
  219 | 
  220 |   await page.getByRole('button', { name: 'Sign out' }).click();
  221 |   await login(page, 'manager.alpha@smartcanteen.com', managerPassword);
  222 |   await expect(page.getByText('Kitchen operations')).toBeVisible();
  223 | 
  224 |   await page.getByRole('button', { name: 'Scanner' }).click();
  225 |   await page.getByLabel('Signed token').fill(qrToken);
  226 |   await page.getByRole('button', { name: 'Validate QR' }).click();
  227 |   await expect(page.getByText('Last confirmed order')).toBeVisible({ timeout: 15_000 });
  228 | 
  229 |   await page.getByRole('button', { name: 'Orders' }).click();
  230 |   await page.getByPlaceholder('Search order, item, or customer').fill(orderHeading.replace('Order ', ''));
  231 |   const managerOrderCard = page.locator('article').filter({ hasText: orderHeading.replace('Order ', '') }).first();
  232 |   await managerOrderCard.getByRole('button', { name: 'Mark Refunded' }).click();
  233 |   await page.getByLabel('Reason').fill('Customer requested an immediate refund at pickup.');
  234 |   await page.getByRole('button', { name: 'Confirm action' }).click();
  235 |   await expect(managerOrderCard.getByText('Refunded')).toBeVisible({ timeout: 15_000 });
  236 | 
  237 |   await page.getByRole('button', { name: 'Payments' }).click();
  238 |   await expect(page.getByText('REFUNDED')).toBeVisible();
  239 | });
  240 | 
```