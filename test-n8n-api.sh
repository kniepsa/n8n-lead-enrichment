#!/bin/bash

# N8N API Test Script
# Tests the rebuilt lead enrichment workflow via n8n API

N8N_URL="https://n8n.srv953382.hstgr.cloud"
WORKFLOW_FILE="n8n-lead-enrichment-workflow-REBUILT.json"
TEST_JOB_ID="test-$(date +%s)"

echo "======================================"
echo "N8N Workflow API Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if n8n is accessible
echo "📡 Step 1: Checking N8N accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "$N8N_URL" | grep -q "200\|302"; then
    echo -e "${GREEN}✅ N8N is accessible${NC}"
else
    echo -e "${RED}❌ N8N is not accessible${NC}"
    exit 1
fi
echo ""

# Step 2: Test webhook endpoint
echo "🔗 Step 2: Testing webhook endpoint..."
WEBHOOK_URL="$N8N_URL/webhook/lead-enrichment"
echo "Webhook URL: $WEBHOOK_URL"

# Test with sample data
TEST_PAYLOAD=$(cat <<EOF
{
  "jobId": "$TEST_JOB_ID",
  "source": "linkedin_urls",
  "data": "https://www.linkedin.com/in/satyanadella/",
  "apiKeys": "{\"magicalApi\":\"test\",\"prospeo\":\"test\",\"reoon\":\"test\"}",
  "useFreeCredit": false,
  "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
  "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
}
EOF
)

echo ""
echo "Test payload:"
echo "$TEST_PAYLOAD" | jq '.' 2>/dev/null || echo "$TEST_PAYLOAD"
echo ""

echo "Sending test request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Check response
if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${YELLOW}⚠️  Webhook not found (404) - Workflow may not be activated${NC}"
    echo "This means:"
    echo "  1. The workflow hasn't been imported yet, OR"
    echo "  2. The workflow is imported but not activated, OR"
    echo "  3. The webhook path is incorrect"
    echo ""
    echo "Next steps:"
    echo "  1. Import the workflow: $WORKFLOW_FILE"
    echo "  2. Activate it in the n8n UI"
    echo "  3. Verify webhook path is 'lead-enrichment'"
elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Webhook is working!${NC}"
    echo ""
    echo "The workflow is:"
    echo "  ✅ Imported"
    echo "  ✅ Activated"
    echo "  ✅ Responding to requests"
else
    echo -e "${RED}❌ Unexpected response: $HTTP_CODE${NC}"
fi

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "Job ID: $TEST_JOB_ID"
echo "Webhook URL: $WEBHOOK_URL"
echo "HTTP Status: $HTTP_CODE"
echo ""

# Step 3: Verify workflow JSON structure
echo "🔍 Step 3: Validating workflow JSON structure..."
if [ -f "$WORKFLOW_FILE" ]; then
    echo -e "${GREEN}✅ Workflow file exists${NC}"

    # Count nodes
    NODE_COUNT=$(jq '.nodes | length' "$WORKFLOW_FILE")
    echo "Total nodes: $NODE_COUNT"

    # List node names
    echo ""
    echo "Nodes in workflow:"
    jq -r '.nodes[] | "  - \(.name) (\(.type))"' "$WORKFLOW_FILE"

    echo ""
    echo "Expected: 19 nodes"
    if [ "$NODE_COUNT" -eq 19 ]; then
        echo -e "${GREEN}✅ Node count matches${NC}"
    else
        echo -e "${YELLOW}⚠️  Node count: $NODE_COUNT (expected 19)${NC}"
    fi

    # Check for webhook node
    echo ""
    WEBHOOK_PATH=$(jq -r '.nodes[] | select(.type=="n8n-nodes-base.webhook") | .parameters.path' "$WORKFLOW_FILE")
    if [ "$WEBHOOK_PATH" = "lead-enrichment" ]; then
        echo -e "${GREEN}✅ Webhook path is correct: $WEBHOOK_PATH${NC}"
    else
        echo -e "${RED}❌ Webhook path mismatch: $WEBHOOK_PATH${NC}"
    fi

    # Check typeVersions
    echo ""
    echo "Checking HTTP Request node versions..."
    HTTP_VERSIONS=$(jq -r '.nodes[] | select(.type=="n8n-nodes-base.httpRequest") | "\(.name): v\(.typeVersion)"' "$WORKFLOW_FILE")
    echo "$HTTP_VERSIONS"

    if echo "$HTTP_VERSIONS" | grep -q "4.2"; then
        echo -e "${GREEN}✅ Using latest HTTP Request version (4.2)${NC}"
    else
        echo -e "${YELLOW}⚠️  Check HTTP Request versions${NC}"
    fi

else
    echo -e "${RED}❌ Workflow file not found: $WORKFLOW_FILE${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "Manual Import Instructions"
echo "======================================"
echo ""
echo "If the webhook test failed (404), import the workflow manually:"
echo ""
echo "1. Open: $N8N_URL"
echo "2. Click: 'Add Workflow' or 'Import'"
echo "3. Select: 'Import from File'"
echo "4. Choose: $WORKFLOW_FILE"
echo "5. Click: 'Save'"
echo "6. Toggle: 'Active' (top right)"
echo ""
echo "Then re-run this test script."
echo ""
