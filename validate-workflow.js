/**
 * Workflow Validation Script
 * Validates the rebuilt n8n workflow JSON structure
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_FILE = path.join(__dirname, 'n8n-lead-enrichment-workflow-REBUILT.json');

console.log('🔍 N8N Workflow Validation\n');
console.log('='.repeat(60));

try {
  // Read and parse workflow
  const workflowData = JSON.parse(fs.readFileSync(WORKFLOW_FILE, 'utf8'));

  console.log(`\n📋 Workflow: ${workflowData.name || 'Unnamed'}`);
  console.log(`📦 Total Nodes: ${workflowData.nodes.length}`);

  // Expected configuration
  const expectedNodeCount = 18;
  const expectedNodes = [
    { name: 'Webhook', type: 'n8n-nodes-base.webhook' },
    { name: 'Set Variables', type: 'n8n-nodes-base.set' },
    { name: 'IF Source Type', type: 'n8n-nodes-base.if' },
    { name: 'Parse LinkedIn URLs', type: 'n8n-nodes-base.code' },
    { name: 'Split In Batches', type: 'n8n-nodes-base.splitInBatches' },
    { name: 'MagicalAPI Enrichment', type: 'n8n-nodes-base.httpRequest' },
    { name: 'Extract Profile Data', type: 'n8n-nodes-base.set' },
    { name: 'Prospeo Email Finder', type: 'n8n-nodes-base.httpRequest' },
    { name: 'Extract Email Data', type: 'n8n-nodes-base.set' },
    { name: 'IF Email Found', type: 'n8n-nodes-base.if' },
    { name: 'Reoon Verification', type: 'n8n-nodes-base.httpRequest' },
    { name: 'Extract Verification Status', type: 'n8n-nodes-base.set' },
    { name: 'Set No Email Status', type: 'n8n-nodes-base.set' },
    { name: 'Merge Email Results', type: 'n8n-nodes-base.merge' },
    { name: 'Progress Update', type: 'n8n-nodes-base.httpRequest' },
    { name: 'Aggregate All Results', type: 'n8n-nodes-base.aggregate' },
    { name: 'Generate CSV & Stats', type: 'n8n-nodes-base.code' },
    { name: 'Completion Callback', type: 'n8n-nodes-base.httpRequest' }
  ];

  // Validate node count
  console.log('\n📊 Node Count Validation:');
  if (workflowData.nodes.length === expectedNodeCount) {
    console.log(`  ✅ Node count correct: ${workflowData.nodes.length}/${expectedNodeCount}`);
  } else {
    console.log(`  ❌ Node count mismatch: ${workflowData.nodes.length}/${expectedNodeCount}`);
  }

  // Validate each expected node
  console.log('\n📝 Node Presence Validation:');
  let allNodesPresent = true;

  expectedNodes.forEach(expectedNode => {
    const found = workflowData.nodes.find(n =>
      n.name === expectedNode.name && n.type === expectedNode.type
    );
    if (found) {
      console.log(`  ✅ ${expectedNode.name} (${expectedNode.type})`);
    } else {
      console.log(`  ❌ ${expectedNode.name} (${expectedNode.type}) - NOT FOUND`);
      allNodesPresent = false;
    }
  });

  // Validate webhook configuration
  console.log('\n🔗 Webhook Configuration:');
  const webhookNode = workflowData.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
  if (webhookNode) {
    const webhookPath = webhookNode.parameters.path;
    const httpMethod = webhookNode.parameters.httpMethod;

    console.log(`  Path: ${webhookPath}`);
    console.log(`  Method: ${httpMethod}`);
    console.log(`  TypeVersion: ${webhookNode.typeVersion}`);

    if (webhookPath === 'lead-enrichment' && httpMethod === 'POST') {
      console.log('  ✅ Webhook configuration correct');
    } else {
      console.log('  ❌ Webhook configuration incorrect');
    }
  } else {
    console.log('  ❌ Webhook node not found');
  }

  // Validate HTTP Request nodes
  console.log('\n🌐 HTTP Request Nodes:');
  const httpNodes = workflowData.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');

  console.log(`  Total HTTP Request nodes: ${httpNodes.length}`);

  httpNodes.forEach(node => {
    const version = node.typeVersion;
    const continueOnFail = node.continueOnFail;
    const method = node.parameters.method;

    console.log(`\n  📡 ${node.name}:`);
    console.log(`     TypeVersion: ${version} ${version >= 4 ? '✅' : '❌ (should be 4.2)'}`);
    console.log(`     Method: ${method}`);
    console.log(`     ContinueOnFail: ${continueOnFail ? '✅' : '⚠️  No'}`);

    if (node.parameters.url) {
      console.log(`     URL: ${node.parameters.url.substring(0, 50)}...`);
    }
  });

  // Validate Code nodes
  console.log('\n💻 Code Nodes:');
  const codeNodes = workflowData.nodes.filter(n => n.type === 'n8n-nodes-base.code');

  console.log(`  Total Code nodes: ${codeNodes.length}`);

  codeNodes.forEach(node => {
    console.log(`\n  🔧 ${node.name}:`);
    console.log(`     TypeVersion: ${node.typeVersion}`);

    const code = node.parameters.jsCode || '';

    // Check for modern API usage
    if (code.includes('$input.first()') || code.includes('$input.all()')) {
      console.log('     ✅ Uses modern $input API');
    } else if (code.includes('$input.item')) {
      console.log('     ❌ Uses deprecated $input.item API');
    }

    // Check for error handling
    if (code.includes('try') && code.includes('catch')) {
      console.log('     ✅ Has error handling');
    } else {
      console.log('     ⚠️  No explicit error handling');
    }
  });

  // Validate connections
  console.log('\n🔗 Connection Validation:');
  const totalConnections = Object.keys(workflowData.connections || {}).length;
  console.log(`  Total node connections: ${totalConnections}`);

  // Check for loop (Split In Batches back to itself)
  const splitBatchesConnections = workflowData.connections['Split In Batches'];
  if (splitBatchesConnections && splitBatchesConnections.main && splitBatchesConnections.main[1]) {
    console.log('  ✅ Loop connection exists (Split In Batches → Aggregate)');
  } else {
    console.log('  ⚠️  Loop connection may be missing');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));

  const issues = [];

  if (workflowData.nodes.length !== expectedNodeCount) {
    issues.push(`Node count mismatch (${workflowData.nodes.length} vs ${expectedNodeCount})`);
  }

  if (!allNodesPresent) {
    issues.push('Some expected nodes are missing');
  }

  const httpNodesWithOldVersion = httpNodes.filter(n => n.typeVersion < 4).length;
  if (httpNodesWithOldVersion > 0) {
    issues.push(`${httpNodesWithOldVersion} HTTP nodes using old typeVersion`);
  }

  const httpNodesWithoutContinueOnFail = httpNodes.filter(n => !n.continueOnFail).length;
  if (httpNodesWithoutContinueOnFail > 0) {
    issues.push(`${httpNodesWithoutContinueOnFail} HTTP nodes missing continueOnFail`);
  }

  if (issues.length === 0) {
    console.log('\n✅ ALL VALIDATIONS PASSED');
    console.log('\nThe workflow is ready to import into n8n!');
    console.log('\nNext steps:');
    console.log('  1. Open https://n8n.srv953382.hstgr.cloud');
    console.log('  2. Import this workflow file');
    console.log('  3. Activate the workflow');
    console.log('  4. Test with: ./test-n8n-api.sh');
  } else {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log('\n' + '='.repeat(60));

  // Export validation report
  const report = {
    timestamp: new Date().toISOString(),
    workflowName: workflowData.name,
    nodeCount: workflowData.nodes.length,
    expectedNodeCount,
    allNodesPresent,
    issues,
    status: issues.length === 0 ? 'PASS' : 'FAIL',
    nodes: workflowData.nodes.map(n => ({
      name: n.name,
      type: n.type,
      typeVersion: n.typeVersion,
      continueOnFail: n.continueOnFail
    }))
  };

  fs.writeFileSync('workflow-validation-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: workflow-validation-report.json\n');

} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
