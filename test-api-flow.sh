#!/bin/bash

echo "🚀 Testing n8n Lead Enrichment API Flow"
echo "========================================"
echo ""

BASE_URL="https://n8n-steel-seven.vercel.app"

# Test 1: LinkedIn URL
echo "📍 Test 1: LinkedIn URL Enrichment"
echo "   URL: https://www.linkedin.com/in/satyanadella/"
echo ""

# Submit job
echo "   Submitting job..."
JOB_RESPONSE=$(curl -X POST "$BASE_URL/api/enrich" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/",
    "useFreeCredit": true
  }' \
  --silent)

echo "   Response: $JOB_RESPONSE"
JOB_ID=$(echo $JOB_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('jobId', 'NONE'))")
echo "   Job ID: $JOB_ID"
echo ""

if [ "$JOB_ID" = "NONE" ]; then
  echo "❌ Failed to create job"
  exit 1
fi

# Poll for progress (30 seconds = 10 polls)
echo "   Polling for progress (30 seconds)..."
for i in {1..10}; do
  sleep 3
  PROGRESS=$(curl -s "$BASE_URL/api/enrich?jobId=$JOB_ID")
  STATUS=$(echo $PROGRESS | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))")
  STEP=$(echo $PROGRESS | python3 -c "import sys, json; print(json.load(sys.stdin).get('step', 'unknown'))")
  PERCENTAGE=$(echo $PROGRESS | python3 -c "import sys, json; print(json.load(sys.stdin).get('percentage', 0))")

  echo "   Poll #$i: status=$STATUS, step=$STEP, progress=$PERCENTAGE%"

  if [ "$STATUS" = "complete" ]; then
    echo ""
    echo "✅ Job completed successfully!"
    echo "   Final response:"
    echo "$PROGRESS" | python3 -m json.tool
    exit 0
  elif [ "$STATUS" = "error" ]; then
    echo ""
    echo "❌ Job failed with error"
    echo "   Error response:"
    echo "$PROGRESS" | python3 -m json.tool
    exit 1
  fi
done

echo ""
echo "⏱️  Job still processing after 30 seconds"
echo "   Last known state: status=$STATUS, step=$STEP, progress=$PERCENTAGE%"
echo ""
echo "🔍 This suggests the n8n workflow may not be sending callbacks."
echo "   Check n8n executions at: https://n8n.srv953382.hstgr.cloud"
