const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Playwright test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  try {
    // Navigate to the site
    console.log('📍 Navigating to https://n8n-steel-seven.vercel.app\n');
    await page.goto('https://n8n-steel-seven.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take screenshot of initial page
    await page.screenshot({ path: '/tmp/01-initial-page.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/01-initial-page.png\n');

    // Test 1: LinkedIn URL Enrichment
    console.log('🔍 Test 1: LinkedIn URL Enrichment\n');

    // Find the textarea and paste LinkedIn URL
    const linkedinUrl = 'https://www.linkedin.com/in/satyanadella/';
    console.log(`   Pasting: ${linkedinUrl}`);

    await page.fill('textarea', linkedinUrl);
    await page.screenshot({ path: '/tmp/02-linkedin-url-entered.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/02-linkedin-url-entered.png\n');

    // Click the "Get 10 Free Verified Emails" button
    console.log('   Clicking "Get 10 Free Verified Emails" button');
    const freeButton = await page.getByText('Get 10 Free Verified Emails');
    await freeButton.click();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/03-after-click.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/03-after-click.png\n');

    // Wait for progress tracker to appear
    console.log('   Waiting for progress tracker...');
    try {
      await page.waitForSelector('text=Enrichment in Progress', { timeout: 10000 });
      console.log('✅ Progress tracker appeared!\n');
    } catch (e) {
      console.log('⚠️  Progress tracker did not appear\n');
    }

    await page.screenshot({ path: '/tmp/04-progress-tracker.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/04-progress-tracker.png\n');

    // Monitor progress for 30 seconds
    console.log('   Monitoring progress for 30 seconds...\n');
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(3000);

      // Try to get progress text
      const progressText = await page.evaluate(() => {
        const progress = document.body.innerText;
        const match = progress.match(/(\d+)%/);
        return match ? match[0] : 'No progress found';
      });

      console.log(`   Progress check #${i + 1}: ${progressText}`);

      // Check if completed
      const hasDownloadButton = await page.getByText('Download CSV').isVisible().catch(() => false);
      if (hasDownloadButton) {
        console.log('\n🎉 Enrichment completed! Download button visible.\n');
        await page.screenshot({ path: '/tmp/05-completed.png', fullPage: true });
        console.log('✅ Screenshot saved: /tmp/05-completed.png\n');
        break;
      }

      // Check if error
      const hasError = await page.locator('text=error').isVisible().catch(() => false);
      if (hasError) {
        console.log('\n❌ Error detected in UI\n');
        await page.screenshot({ path: '/tmp/05-error.png', fullPage: true });
        console.log('✅ Screenshot saved: /tmp/05-error.png\n');
        break;
      }
    }

    // Get final page state
    console.log('\n📊 Final page state:');
    const finalText = await page.evaluate(() => document.body.innerText);
    console.log(finalText.substring(0, 500) + '...\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
    console.log('✅ Error screenshot saved: /tmp/error-screenshot.png\n');
  } finally {
    await browser.close();
    console.log('✅ Browser closed\n');
  }
})();
