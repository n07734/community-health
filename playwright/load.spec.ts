import { test, expect } from '@playwright/test'

const token = process.env.TOKEN
if (!token) {
    throw new Error('TOKEN environment variable is not set')
}

const select = {
    reportTitle: '[data-qa-id="report-title"]',
    reportButton: '[data-qa-id="prefetch-Playwright"]',
    expandForm: '[data-qa-id="expand-prefetch-form"]',
    prefetchForm: '[data-qa-id="prefetch-top-up"]',
    inputToken: '[data-qa-id="input-token"]',
    loader: '[data-qa-id="loader"]',
}

test.describe('Initial page load', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
    })

    test('has correct default report title', async ({ page }) => {
        await page.waitForSelector(select.reportTitle)

        const titleElement = page.locator(select.reportTitle)
        const titleText = await titleElement.textContent()
        expect(titleText).toBe('vitejs')
    })

    test('loads Playwright report via button click', async ({ page }) => {
        await page.waitForSelector(select.reportTitle)

        await page.waitForSelector(select.reportButton)

        await page.click(select.reportButton)

        await page.waitForSelector(select.reportTitle)
        const titleElement = page.locator(select.reportTitle)
        const titleText = await titleElement.textContent()
        expect(titleText).toBe('microsoft/playwright')
    })
})

test.describe('Screenshots for each report type', () => {
    test('Org report screenshot matches baseline', async ({ page }) => {
        await page.goto('/?report=vitejs')
        await page.waitForSelector(select.loader, { state: 'detached' })
        await page.waitForSelector(select.reportTitle)

        await expect(page).toHaveScreenshot('org-report-page.png',{
            fullPage: true,
            timeout: 9000,
        })
    })

    test('Repo screenshot matches baseline', async ({ page }) => {
        await page.goto('/?report=microsoft-playwright')
        await page.waitForSelector(select.loader, { state: 'detached' })
        await page.waitForSelector(select.reportTitle)

        await expect(page).toHaveScreenshot('repo-report-page.png',{
            fullPage: true,
            timeout: 9000,
        })
    })

    test('Team screenshot matches baseline', async ({ page }) => {
        await page.goto('/?report=ReactCore')
        await page.waitForSelector(select.loader, { state: 'detached' })
        await page.waitForSelector(select.reportTitle)

        await expect(page).toHaveScreenshot('team-report-page.png',{
            fullPage: true,
            timeout: 9000,
        })
    })
})

test.describe('Screenshots for top up for each each report type', () => {
    test.beforeEach(async () => {
        // Increase timeout for these tests as they use a github token a lot which can be slow and throttled
        test.setTimeout(130_000)
    })

    const topUpReports = [
        {
            type: 'org',
            report: 'vitejs',
            amount: 'Get 1 month data',
            direction: 'Append data',
        },
        {
            type: 'org',
            report: 'vitejs',
            amount: 'Get 1 month data',
            direction: 'Prepend data',
        },
        {
            type: 'repo',
            report: 'microsoft-playwright',
            amount: 'Get 1 month data',
            direction: 'Append data',
        },
        {
            type: 'repo',
            report: 'microsoft-playwright',
            amount: 'Get 1 month data',
            direction: 'Prepend data',
        },
        {
            type: 'team',
            report: 'ViteCore',
            amount: 'Get 1 month data',
            direction: 'Append data',
        },
        {
            type: 'team',
            report: 'ViteCore',
            amount: 'Get 1 month data',
            direction: 'Prepend data',
        },
    ]

    topUpReports.forEach(({ type, report, amount, direction }) => {
        test(`${type} ${report} ${amount} ${direction} screenshot`, async ({ page }) => {
            await page.goto(`/?report=${report}`)

            await page.waitForSelector(select.expandForm)
            await page.click(select.expandForm)

            await page.waitForSelector(select.prefetchForm)

            await page.click('text=Get it all!')
            await page.getByLabel(amount).getByText(amount).click()


            if (direction !== 'Append data') {
                await page.click('text=Append data')
                await page.getByLabel(direction).getByText(direction).click()
            }

            await page.fill(select.inputToken, token)

            await page.click(select.prefetchForm)
            await page.waitForSelector(select.loader, { state: 'detached', timeout: 120_000 })

            await expect(page).toHaveScreenshot({
                fullPage: true,
                mask: [page.locator(select.inputToken)],
                timeout: 9000,
            })
        })
    })
})
