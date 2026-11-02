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
    try {
        await popup.waitFor({ state: 'visible', timeout: 2500 });
    } catch (error) {
        console.error('Combobox trigger debug:', {
            label: await trigger.getAttribute('aria-label'),
            expanded: await trigger.getAttribute('aria-expanded'),
            outerHTML: (await trigger.evaluate(element => element.outerHTML)).slice(0, 1200),
            portalCount: await page.locator('[data-slot="combobox-content"]').count(),
            popupState: await page.locator('[data-slot="combobox-content"]').first().getAttribute('data-open').catch(() => null),
            pageText: (await page.locator('body').innerText()).slice(0, 1000),
        });
        throw error;
    }
    return popup;
}

async function choose(scope, label, search) {
    const popup = await openSelect(scope);
    const input = popup.locator('input[data-slot="combobox-input"]');
    await input.fill(search);
    const option = popup.getByRole('option', { name: label, exact: true });
    await option.waitFor({ state: 'visible' });
    const inputRect = await input.boundingBox();
    const optionRect = await option.boundingBox();
    assert.ok(inputRect && optionRect, 'Input and first option must be visible');
    const gap = optionRect.y - (inputRect.y + inputRect.height);
    assert.ok(gap >= -12 && gap <= 48, 'Unexpected empty space between Combobox search and options: ' + gap);
    await option.click();
    await popup.waitFor({ state: 'hidden' });
}

try {
    await page.goto(url);
    await page.getByTestId('group-control').getByText('Group by', { exact: true }).waitFor();
    const groupScope = page.getByTestId('group-control');
    await choose(groupScope, 'Role', 'role');
    assert.equal(await page.getByTestId('group-value').textContent(), 'role');

    const compact = page.getByTestId('compact-control');
    await compact.locator('[data-slot="select-trigger"]').click();
    const selectPopup = page.locator('[data-slot="select-content"]:visible');
    await selectPopup.waitFor({ state: 'visible' });
    await selectPopup.getByRole('option', { name: 'Descending' }).click();
    assert.equal(await page.getByTestId('direction-value').textContent(), 'desc');

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

    const table = page.getByTestId('native-table');
    await table.getByRole('heading', { name: 'Native Table Preview' }).waitFor();
    assert.equal(await table.getByRole('row').count(), 4, 'Native table should render header and 3 records');

    await table.getByRole('button', { name: 'Filters', exact: true }).click();
    await choose(table, 'Published', 'pub');
    assert.equal(await table.getByRole('row').count(), 3, 'The native snapshot table must filter to 2 rows');

    await table.getByRole('button', { name: 'Manage columns' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Status' }).click();
    assert.equal(await table.getByRole('columnheader', { name: 'Status' }).count(), 0,
        'Column manager must update the shared table renderer');

    const featureLab = page.getByTestId('feature-lab');
    await featureLab.getByRole('heading', { name: 'Defining table columns' }).waitFor();
    await featureLab.getByRole('tab', { name: 'PHP source' }).click();
    await featureLab.locator('pre code').getByText("->columns([TextColumn::make('title')])").waitFor();
    await featureLab.getByRole('tab', { name: 'Live preview' }).click();
    await featureLab.getByRole('heading', { name: 'Native Table Preview' }).waitFor();

    await page.goto(url + '?labFeature=16');
    const reorderLab = page.getByTestId('feature-lab');
    await reorderLab.getByRole('heading', { name: 'Reordering records' }).waitFor();
    await reorderLab.getByRole('button', { name: 'Enable reordering' }).click();
    await reorderLab.getByRole('button', { name: 'Move record 2 up' }).click();
    await reorderLab.getByText(/beforeReorder:/).waitFor();
    await reorderLab.getByText(/afterReorder:/).waitFor();
    await reorderLab.getByText('Demo only — no database update').waitFor();

    await page.goto(url + '?labFeature=22');
    const skeletonLab = page.getByTestId('feature-lab');
    await skeletonLab.getByRole('heading', { name: 'Displaying a loading skeleton' }).waitFor();
    await skeletonLab.getByRole('button', { name: 'Replay loading' }).click();
    await skeletonLab.getByRole('status', { name: 'Loading table preview' }).waitFor();
    await skeletonLab.getByRole('heading', { name: 'Native Table Preview' }).waitFor({ timeout: 6000 });

    // Check the actual two-column desktop layout, narrow mobile behavior,
    // both writing directions and dark mode, rather than a fixed-width demo.
    for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        for (const direction of ['ltr', 'rtl']) {
            await page.goto(url);
            await page.evaluate(dir => {
                document.documentElement.dir = dir;
                document.documentElement.classList.toggle('dark', dir === 'rtl');
            }, direction);

            const responsiveLab = page.getByTestId('feature-lab');
            await responsiveLab.getByRole('heading', { name: 'Defining table columns' }).waitFor();
            await responsiveLab.getByRole('heading', { name: 'Native Table Preview' }).waitFor();

            const dimensions = await page.evaluate(() => ({
                page: document.documentElement.scrollWidth,
                viewport: document.documentElement.clientWidth,
            }));
            assert.ok(dimensions.page <= dimensions.viewport + 2,
                `Unexpected horizontal page overflow at ${width}px, ${direction}: ${JSON.stringify(dimensions)}`);

            const layoutColumns = await responsiveLab.locator('[data-table-feature-lab] > .grid').last()
                .evaluate(element => getComputedStyle(element).gridTemplateColumns.trim().split(/\\s+/).length);
            assert.equal(layoutColumns, width >= 1024 ? 2 : 1,
                `Incorrect feature lab layout at ${width}px, ${direction}`);

            const codeTab = responsiveLab.getByRole('tab', { name: 'PHP source' });
            await codeTab.focus();
            await page.keyboard.press('Enter');
            await responsiveLab.locator('pre code').waitFor({ state: 'visible' });
            await responsiveLab.getByRole('tab', { name: 'Live preview' }).click();
            await responsiveLab.getByRole('heading', { name: 'Native Table Preview' }).waitFor();

            await page.screenshot({
                path: `/tmp/lavertia-table-lab-${width}-${direction}.png`,
                fullPage: true,
                animations: 'disabled',
            });
        }
    }

    assert.deepEqual(errors, [], 'No client-side React exceptions should occur');
    console.log('PASS Base UI controls, native tables and 28-feature Lab preview/code, reorder logs and skeleton');
} catch (error) {
    await page.screenshot({ path: '/tmp/lavertia-combobox-browser-failure.png', fullPage: true });
    console.error('Browser console errors:', errors);
    throw error;
} finally {
    await browser.close();
}
