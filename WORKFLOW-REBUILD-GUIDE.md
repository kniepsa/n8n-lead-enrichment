# N8N Workflow Rebuild Guide

## What Changed: Old vs New

### Old Workflow Issues (12+ Errors):
```
❌ Code nodes using deprecated $input.item API
❌ HTTP Request typeVersion 3 (outdated)
❌ Complex cross-node references failing
❌ apiKeys string vs object confusion
❌ No error handling (workflows crash on API failures)
❌ No deduplication (same URL processed multiple times)
❌ CSV includes non-deliverable emails
❌ Progress tracking unreliable
```

### New Workflow Features (Zero Errors):
```
✅ Modern $input.first() and $input.all() APIs
✅ HTTP Request typeVersion 4.2 (latest)
✅ Simplified Set nodes for transformations
✅ Proper error handling (continueOnFail: true)
✅ Automatic URL deduplication
✅ CSV filtered to deliverable emails only
✅ Reliable progress tracking
✅ IF condition handles missing emails gracefully
```

---

## Workflow Comparison

| Aspect | Old Workflow | New Workflow |
|--------|--------------|--------------|
| **Total Nodes** | 25+ nodes | 19 nodes |
| **Code Nodes** | 8 complex Code nodes | 2 simple Code nodes |
| **Set Nodes** | 2 | 5 (replaces complex Code) |
| **Error Handling** | None | All API calls |
| **Validation Errors** | 12+ errors | 0 errors |
| **Deduplication** | No | Yes |
| **Email Filtering** | Includes all | Deliverable only |

---

## How to Import the New Workflow

### Option 1: Import via n8n UI (Recommended)

1. **Open n8n**: https://n8n.srv953382.hstgr.cloud
2. **Deactivate old workflow**:
   - Find "Lead Enrichment Pipeline" workflow
   - Toggle it OFF (prevent conflicts)
3. **Import new workflow**:
   - Click "Add Workflow" dropdown (top right)
   - Select "Import from File"
   - Choose `/home/amk/projects/n8n/n8n-lead-enrichment-workflow-REBUILT.json`
4. **Verify nodes**:
   - All 19 nodes should appear green (no red errors)
   - Check positions are readable (auto-layout if needed)
5. **Activate workflow**:
   - Toggle "Active" at top right
   - Verify webhook URL is: `https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment`

### Option 2: Import via CLI (If available)

```bash
# Copy workflow to n8n server
scp n8n-lead-enrichment-workflow-REBUILT.json user@n8n-server:/tmp/

# Import via n8n CLI
n8n import:workflow --input=/tmp/n8n-lead-enrichment-workflow-REBUILT.json
```

---

## Node-by-Node Validation Checklist

After importing, verify each node configuration:

### 1. ✅ Webhook
- Path: `lead-enrichment`
- HTTP Method: `POST`
- Response Mode: `lastNode`

### 2. ✅ Set Variables
- Extracts 7 fields from `$json.body`:
  - jobId, source, data, apiKeys, useFreeCredit, progressUrl, completeUrl
- All use `={{ $json.body.field }}` syntax

### 3. ✅ IF Source Type
- Condition: `$json.source` equals `linkedin_urls`
- True path → Parse LinkedIn URLs

### 4. ✅ Parse LinkedIn URLs (Code Node)
- Uses `$input.first().json` (modern API)
- Parses apiKeys if string
- Deduplicates URLs with `[...new Set(urls)]`
- Returns single object (not array)

### 5. ✅ Split In Batches
- Field: `linkedInUrls`
- Batch Size: `1` (process one at a time)

### 6. ✅ MagicalAPI Enrichment (HTTP Request)
- **TypeVersion: 4.2** (critical!)
- Method: POST
- URL: `https://api.magicalapi.com/v1/profile/linkedin`
- Authentication: `none` (manual headers)
- Headers:
  - Authorization: `Bearer {{ $('Parse LinkedIn URLs').item.json.apiKeys.magicalApi }}`
  - Content-Type: `application/json`
- Body: `specifyBody: "json"` with `jsonBody` parameter
- **continueOnFail: true** (critical!)

### 7. ✅ Extract Profile Data (Set Node)
- 9 assignments: linkedin_url, first_name, last_name, company, title, location, jobId, apiKeys, progressUrl
- Uses fallback values: `$json.company?.name || $json.company || ''`
- Preserves context for downstream nodes

### 8. ✅ Prospeo Email Finder (HTTP Request)
- **TypeVersion: 4.2**
- Method: GET
- URL uses `encodeURIComponent()` for safety
- **continueOnFail: true**

### 9. ✅ Extract Email Data (Set Node)
- 2 assignments: email, email_status
- `includeOtherFields: true` (preserves previous data)

### 10. ✅ IF Email Found
- Condition: `$json.email` is not empty
- True → Reoon Verification
- False → Set No Email Status

### 11. ✅ Reoon Verification (HTTP Request)
- **TypeVersion: 4.2**
- Method: GET
- URL uses `encodeURIComponent()` for email
- Mode: `quick`
- **continueOnFail: true**

### 12. ✅ Extract Verification Status (Set Node)
- 2 assignments: verification_status, is_deliverable
- Checks: `$json.status === 'safe' || $json.status === 'deliverable'`
- `includeOtherFields: true`

### 13. ✅ Set No Email Status (Set Node)
- Handles false path from IF Email Found
- Sets: verification_status = "not_verified", is_deliverable = false
- `includeOtherFields: true`

### 14. ✅ Merge Email Results
- Combines both paths (verified and not verified)
- Ensures all items continue to progress update

### 15. ✅ Progress Update (HTTP Request)
- **TypeVersion: 4.2**
- Method: POST
- Sends: jobId, step, processed, total
- Uses `$runIndex + 1` for accurate count
- **continueOnFail: true** (don't fail workflow if callback fails)

### 16. ✅ Split In Batches (Loop Back)
- Progress Update connects back to Split In Batches
- Loop continues until all URLs processed
- Second output goes to Aggregate All Results

### 17. ✅ Aggregate All Results
- Collects all items from loop
- Aggregates all item data

### 18. ✅ Generate CSV & Stats (Code Node)
- Uses `$input.all()` to get all items
- Calculates stats: total, deliverable, invalid, no_email, successRate
- **Filters CSV to only deliverable emails**: `.filter(i => i.json.is_deliverable === true)`
- Generates CSV with 10 columns
- Proper CSV escaping: `"${String(cell).replace(/"/g, '""')}""`

### 19. ✅ Completion Callback (HTTP Request)
- **TypeVersion: 4.2**
- Method: POST
- Sends: jobId, downloadUrl (data URI), stats
- Uses `encodeURIComponent()` for CSV content

---

## Testing Plan

### Test 1: Single LinkedIn URL (Basic Functionality)

**Trigger from Next.js UI or cURL**:
```bash
curl -X POST https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-001",
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/",
    "apiKeys": "{\"magicalApi\":\"YOUR_KEY\",\"prospeo\":\"YOUR_KEY\",\"reoon\":\"YOUR_KEY\"}",
    "useFreeCredit": true,
    "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
    "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
  }'
```

**Expected Results**:
- ✅ Workflow executes without errors
- ✅ MagicalAPI returns profile data
- ✅ Prospeo finds email
- ✅ Reoon verifies email
- ✅ Progress callback fires once
- ✅ Completion callback fires with CSV data
- ✅ CSV contains 1 row (if deliverable)

**Failure Scenarios to Test**:
- Invalid LinkedIn URL → workflow continues, CSV empty
- MagicalAPI fails → workflow continues, CSV empty
- Prospeo fails → workflow continues, email marked "not_found"
- Reoon fails → workflow continues, verification "unknown"

---

### Test 2: Multiple LinkedIn URLs (Loop Handling)

**Trigger**:
```bash
curl -X POST https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-002",
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/,https://www.linkedin.com/in/timcook/,https://www.linkedin.com/in/jeff-weiner-08505/",
    "apiKeys": "{\"magicalApi\":\"YOUR_KEY\",\"prospeo\":\"YOUR_KEY\",\"reoon\":\"YOUR_KEY\"}",
    "useFreeCredit": true,
    "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
    "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
  }'
```

**Expected Results**:
- ✅ Workflow processes all 3 URLs
- ✅ Progress callback fires 3 times (processed: 1, 2, 3)
- ✅ Split In Batches loops correctly
- ✅ Aggregate collects all 3 results
- ✅ CSV contains 0-3 rows (depending on deliverable count)
- ✅ Stats show correct counts

---

### Test 3: Duplicate URL Deduplication

**Trigger**:
```bash
curl -X POST https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-003",
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/,https://www.linkedin.com/in/satyanadella/,https://www.linkedin.com/in/satyanadella/",
    "apiKeys": "{\"magicalApi\":\"YOUR_KEY\",\"prospeo\":\"YOUR_KEY\",\"reoon\":\"YOUR_KEY\"}",
    "useFreeCredit": true,
    "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
    "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
  }'
```

**Expected Results**:
- ✅ Parse LinkedIn URLs deduplicates to 1 URL
- ✅ totalUrls = 1 (not 3)
- ✅ Only 1 MagicalAPI call made
- ✅ Progress callback fires once
- ✅ CSV contains max 1 row

---

### Test 4: Error Handling (Network Failures)

**Simulate by using invalid API keys**:
```bash
curl -X POST https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "test-004",
    "source": "linkedin_urls",
    "data": "https://www.linkedin.com/in/satyanadella/",
    "apiKeys": "{\"magicalApi\":\"INVALID\",\"prospeo\":\"INVALID\",\"reoon\":\"INVALID\"}",
    "useFreeCredit": false,
    "progressUrl": "https://n8n-steel-seven.vercel.app/api/enrich/progress",
    "completeUrl": "https://n8n-steel-seven.vercel.app/api/enrich/complete"
  }'
```

**Expected Results**:
- ✅ Workflow does NOT crash
- ✅ MagicalAPI returns error → continueOnFail handles it
- ✅ Extract Profile Data uses fallback values
- ✅ Workflow continues to completion
- ✅ CSV is empty (no deliverable emails)
- ✅ Stats show: total=1, deliverable=0
- ✅ Completion callback still fires

---

## Debugging Common Issues

### Issue 1: "Code doesn't return items properly"
**Symptom**: Parse LinkedIn URLs node fails
**Cause**: Using `$input.item` instead of `$input.first()`
**Fix**: Verified - new workflow uses `$input.first().json`

### Issue 2: HTTP Request validation error
**Symptom**: HTTP nodes show red error
**Cause**: typeVersion 3 with wrong parameters
**Fix**: Verified - new workflow uses typeVersion 4.2

### Issue 3: Split In Batches doesn't loop
**Symptom**: Only processes first URL
**Cause**: Loop connection not made from Progress Update → Split In Batches
**Fix**: Verified - connection exists in line 530-538

### Issue 4: CSV includes invalid emails
**Symptom**: CSV has rows with is_deliverable = false
**Cause**: No filtering in Generate CSV & Stats
**Fix**: Verified - line 363 filters: `.filter(i => i.json.is_deliverable === true)`

### Issue 5: apiKeys not found in nodes
**Symptom**: `$json.apiKeys.magicalApi` is undefined
**Cause**: apiKeys not passed through Set nodes
**Fix**: Verified - Extract Profile Data includes apiKeys assignment (line 174-177)

---

## Production Readiness Checklist

Before going live:

### n8n Configuration
- [ ] Workflow imported and activated
- [ ] Webhook path is `lead-enrichment`
- [ ] Webhook accepts POST requests
- [ ] All 19 nodes show green (no errors)
- [ ] Test execution completes successfully

### Next.js Integration
- [ ] `N8N_WEBHOOK_URL` environment variable points to correct webhook
- [ ] Free tier API keys configured in `.env.local`
- [ ] Progress polling interval is 2 seconds (per CLAUDE.md)
- [ ] CSV download works from completion callback

### API Keys
- [ ] MagicalAPI key valid and has credits
- [ ] Prospeo API key valid and has credits
- [ ] Reoon API key valid and has credits
- [ ] Keys stored securely (never in git)

### Monitoring
- [ ] n8n execution history shows successful runs
- [ ] Progress callbacks reach Next.js successfully
- [ ] Completion callbacks reach Next.js successfully
- [ ] CSV data is properly encoded

---

## Success Metrics

After deployment, verify:

| Metric | Target | How to Check |
|--------|--------|--------------|
| **Workflow Success Rate** | >95% | n8n execution history |
| **Average Processing Time** | <30s per URL | n8n execution logs |
| **API Call Success Rate** | >90% | Check continueOnFail nodes |
| **CSV Quality** | 100% deliverable | Spot check downloaded CSVs |
| **Progress Accuracy** | 100% | Compare processed vs total |

---

## Next Steps

1. **Import workflow** to n8n instance
2. **Run Test 1** with single LinkedIn URL
3. **Verify** all nodes execute successfully
4. **Run Test 2** with multiple URLs
5. **Deploy** Next.js app with updated webhook URL
6. **Monitor** first 10 real user jobs
7. **Optimize** based on actual API response times

---

## Rollback Plan (If Needed)

If new workflow has issues:

1. **Deactivate** new workflow
2. **Reactivate** old workflow (backup at `n8n-lead-enrichment-workflow-FIXED.json`)
3. **Investigate** errors in n8n execution logs
4. **Fix** and re-import
5. **Test** again before switching

**Important**: Keep both workflows until new one is proven stable for 100+ jobs.
