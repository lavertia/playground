import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = 'http://127.0.0.1:5173/tests/browser/combobox.html';
const errors = [];
let ready = false;

for (let attempt = 0; attempt < 75; attempt++) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            ready = true;
            break;
        }
    } catch {
        // Vite may still be starting.
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}
assert.ok(ready, 'Vite did not serve the Combobox test harness');

const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
});
const page = await browser.newPage({ viewport: { width: 1120, height: 800 } });
page.on('pageerror', error => errors.push(error.message));

async function openSelect(scope) {
    const trigger = scope.locator('[data-slot="combobox-trigger"]');
    await trigger.click();
    const popup = page.locator('[data-slot="combobox-content"]:visible');
    await popup.waitFor({ state: 'visible', timeout: 6000 });
    return popup;
}

async function choose(scope, label, search) {
    const popup = await openSelect(scope);
    const input = popup.locator('input[data-slot="combobox-input"]');
    await input.fill(search);
    await popup.getByRole('option', { name: label, exact: true }).click();
    await popup.waitFor({ state: 'hidden' });
}

try {
    await page.goto(url);
    await page.getByText('Group by', { exact: true }).waitFor();
    const groupScope = page.getByTestId('group-control');
    await choose(groupScope, 'Role', 'role');
    assert.equal(await page.getByTestId('group-value').textContent(), 'role');

    await page.getByRole('button', { name: 'Toggle Filters' }).click();
    const filterScope = page.getByTestId('filter-control');
    await choose(filterScope, 'Editor', 'edi');
    assert.equal(await page.getByTestId('role-value').textContent(), 'Editor');

    await page.getByRole('button', { name: 'Apply' }).click();
    assert.equal(await page.getByTestId('submitted-role').textContent(), 'Editor',
        'The actual form value must be the key, not the label');

    const fieldScope = page.getByTestId('field-control');
    await choose(fieldScope, 'Quantity', 'quan');
    assert.equal(await page.getByTestId('field-value').textContent(), 'quantity');

    await page.getByRole('button', { name: 'Open dialog' }).click();
    await page.getByRole('dialog', { name: 'Edit fictional user' }).waitFor();
    const modalScope = page.getByTestId('dialog-control');
    await choose(modalScope, 'Admin', 'adm');
    assert.equal(await page.getByTestId('dialog-value').textContent(), 'Admin');
    assert.ok(await page.getByRole('dialog').isVisible(), 'Dialog should stay open after selection');

    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });

    await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
    await choose(groupScope, 'Verified', 'ver');
    assert.equal(await page.getByTestId('group-value').textContent(), 'verified');

    assert.deepEqual(errors, [], 'No client-side React exceptions should occur');
    console.log('PASS Base UI Combobox opens, filters, selects, submits, works in a Dialog and under RTL');
} catch (error) {
    await page.screenshot({ path: '/tmp/lavertia-combobox-browser-failure.png', fullPage: true });
    console.error('Browser console errors:', errors);
    throw error;
} finally {
    await browser.close();
}
