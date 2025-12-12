/**
 * Playwright Test Script for N8N Workflow
 * Tests the rebuilt lead enrichment workflow
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const N8N_URL = 'https://n8n.srv953382.hstgr.cloud';
const WORKFLOW_FILE = path.join(__dirname, 'n8n-lead-enrichment-workflow-REBUILT.json');

async function testN8NWorkflow() {
  console.log('🚀 Starting N8N Workflow Test...\n');

  const browser = await chromium.launch({
    headless: false,  // Show browser for debugging
    slowMo: 500       // Slow down actions to observe
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './test-videos/' }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to N8N
    console.log('📍 Step 1: Navigating to N8N instance...');
    await page.goto(N8N_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: '01-n8n-homepage.png' });
    console.log('✅ Successfully loaded N8N\n');

    // Step 2: Check if login is required
    console.log('🔐 Step 2: Checking authentication...');
    const isLoginPage = await page.locator('input[type="email"]').count() > 0 ||
                        await page.locator('input[type="password"]').count() > 0;

    if (isLoginPage) {
      console.log('⚠️  Login required. Please provide credentials or login manually.');
      console.log('Waiting 30 seconds for manual login...');
      await page.waitForTimeout(30000);
    } else {
      console.log('✅ Already authenticated\n');
    }

    // Step 3: Navigate to workflows list
    console.log('📋 Step 3: Navigating to workflows...');
    await page.goto(`${N8N_URL}/workflows`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: '02-workflows-list.png' });
    console.log('✅ Workflows list loaded\n');

    // Step 4: Check for existing "Lead Enrichment Pipeline" workflows
    console.log('🔍 Step 4: Checking for existing workflows...');
    const existingWorkflows = await page.locator('text=/Lead Enrichment/').count();
    console.log(`Found ${existingWorkflows} existing Lead Enrichment workflow(s)\n`);

    // Step 5: Import the rebuilt workflow
    console.log('📥 Step 5: Importing rebuilt workflow...');

    // Click "Add Workflow" button
    const addWorkflowButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    await addWorkflowButton.click();
    await page.waitForTimeout(1000);

    // Look for import option
    const importOption = page.locator('text=/Import.*File|Import from.*URL/i').first();
    await importOption.click();
    await page.waitForTimeout(1000);

    // Upload workflow file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(WORKFLOW_FILE);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '03-workflow-imported.png' });
    console.log('✅ Workflow imported\n');

    // Step 6: Verify all nodes are present
    console.log('🔍 Step 6: Verifying workflow nodes...');
    await page.waitForTimeout(2000);  // Wait for workflow to render

    const expectedNodes = [
      'Webhook',
      'Set Variables',
      'IF Source Type',
      'Parse LinkedIn URLs',
      'Split In Batches',
      'MagicalAPI Enrichment',
      'Extract Profile Data',
      'Prospeo Email Finder',
      'Extract Email Data',
      'IF Email Found',
      'Reoon Verification',
      'Extract Verification Status',
      'Set No Email Status',
      'Merge Email Results',
      'Progress Update',
      'Aggregate All Results',
      'Generate CSV & Stats',
      'Completion Callback'
    ];

    let nodesFound = 0;
    let nodesMissing = [];

    for (const nodeName of expectedNodes) {
      const nodeExists = await page.locator(`text="${nodeName}"`).count() > 0;
      if (nodeExists) {
        nodesFound++;
        console.log(`  ✅ ${nodeName}`);
      } else {
        nodesMissing.push(nodeName);
        console.log(`  ❌ ${nodeName} - NOT FOUND`);
      }
    }

    console.log(`\n📊 Nodes Summary: ${nodesFound}/${expectedNodes.length} found`);
    if (nodesMissing.length > 0) {
      console.log(`⚠️  Missing nodes: ${nodesMissing.join(', ')}\n`);
    } else {
      console.log('✅ All nodes present!\n');
    }

    // Step 7: Check for validation errors
    console.log('🔍 Step 7: Checking for validation errors...');

    // Look for red error indicators
    const errorNodes = await page.locator('[class*="error"], [class*="Error"], .node-error, .has-issues').count();

    if (errorNodes > 0) {
      console.log(`❌ Found ${errorNodes} node(s) with errors`);
      await page.screenshot({ path: '04-workflow-errors.png' });

      // Try to click on error nodes to see details
      const errorNode = page.locator('[class*="error"]').first();
      await errorNode.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '05-error-details.png' });
    } else {
      console.log('✅ No validation errors detected!\n');
    }

    // Step 8: Save the workflow
    console.log('💾 Step 8: Saving workflow...');
    const saveButton = page.locator('button:has-text("Save")').first();
    await saveButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '06-workflow-saved.png' });
    console.log('✅ Workflow saved\n');

    // Step 9: Activate the workflow
    console.log('⚡ Step 9: Activating workflow...');
    const activateToggle = page.locator('button[role="switch"], .workflow-activator, button:has-text("Inactive")').first();
    await activateToggle.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '07-workflow-activated.png' });
    console.log('✅ Workflow activated\n');

    // Step 10: Get webhook URL
    console.log('🔗 Step 10: Getting webhook URL...');

    // Click on Webhook node
    const webhookNode = page.locator('text="Webhook"').first();
    await webhookNode.click();
    await page.waitForTimeout(1000);

    // Look for webhook URL in node details
    const webhookUrlElement = page.locator('input[value*="webhook"], span:has-text("webhook")').first();
    const webhookUrl = await webhookUrlElement.textContent().catch(() =>
      `${N8N_URL}/webhook/lead-enrichment`
    );

    console.log(`📌 Webhook URL: ${webhookUrl}\n`);
    await page.screenshot({ path: '08-webhook-details.png' });

    // Step 11: Test execution (manual trigger or via API)
    console.log('🧪 Step 11: Preparing test execution...');
    console.log(`
To test the workflow, run this cURL command:

curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "jobId": "test-$(date +%s)",
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/",
    "apiKeys": "{\\"magicalApi\\":\\"YOUR_KEY\\",\\"prospeo\\":\\"YOUR_KEY\\",\\"reoon\\":\\"YOUR_KEY\\"}",
    "useFreeCredit": true,
    "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
    "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
  }'
`);

    // Step 12: Generate test report
    console.log('\n📊 Generating test report...');

    const report = {
      timestamp: new Date().toISOString(),
      n8nUrl: N8N_URL,
      workflowName: 'Lead Enrichment Pipeline - Rebuilt',
      nodesExpected: expectedNodes.length,
      nodesFound: nodesFound,
      nodesMissing: nodesMissing,
      validationErrors: errorNodes,
      webhookUrl: webhookUrl,
      status: nodesFound === expectedNodes.length && errorNodes === 0 ? 'PASS' : 'FAIL',
      screenshots: [
        '01-n8n-homepage.png',
        '02-workflows-list.png',
        '03-workflow-imported.png',
        '04-workflow-errors.png',
        '05-error-details.png',
        '06-workflow-saved.png',
        '07-workflow-activated.png',
        '08-webhook-details.png'
      ]
    };

    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Status: ${report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Nodes: ${nodesFound}/${expectedNodes.length}`);
    console.log(`Validation Errors: ${errorNodes}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    console.log(`Report: test-report.json`);
    console.log('='.repeat(60) + '\n');

    // Keep browser open for manual inspection
    console.log('⏳ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    throw error;
  } finally {
    await context.close();
    await browser.close();
    console.log('\n✅ Test completed!');
  }
}

// Run the test
testN8NWorkflow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
