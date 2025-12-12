# n8n Workflow Fix - Import Instructions

## Problem Fixed

The workflow "Lead Enrichment Pipeline" (ID: `usIZAecigs1dpUQM`) had validation errors preventing activation because:

1. **7 Code nodes lost their JavaScript implementations** when created via API
2. **Set Variables node** referenced non-existent environment variable `$env.NEXTJS_BASE_URL`

This corrected workflow file (`n8n-lead-enrichment-workflow-FIXED.json`) includes:
- ✅ All 7 Code nodes with complete `functionCode` implementations
- ✅ Set Variables node with hardcoded Vercel URL: `https://n8n-steel-seven.vercel.app`
- ✅ All 25+ nodes properly connected with batching loops

---

## Step 1: Delete the Broken Workflow

1. Open your n8n instance: https://n8n.srv953382.hstgr.cloud
2. Find the workflow **"Lead Enrichment Pipeline"**
3. Click the **"..."** menu → **"Delete"**
4. Confirm deletion

---

## Step 2: Import the Fixed Workflow

1. In n8n, click **"+ Add workflow"** (top-right)
2. Click **"Import from file"**
3. Select the file: `/home/amk/projects/n8n/n8n-lead-enrichment-workflow-FIXED.json`
4. The workflow will be imported with all nodes and connections intact

---

## Step 3: Activate the Workflow

1. Open the imported workflow
2. Verify all nodes show no errors (no red warnings)
3. Click the **"Active"** toggle (top-right)
4. Workflow should activate successfully with webhook live at:
   ```
   https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment
   ```

---

## Step 4: Test the Workflow

### Option A: Test via n8n UI

1. Click **"Test workflow"** button
2. Manually trigger the webhook with test payload:
   ```json
   {
     "jobId": "test-123",
     "source": "linkedin_urls",
     "data": "https://www.linkedin.com/in/satyanadella/",
     "apiKeys": {
       "magicalApi": "mag_f4023e362f4f92dab44520f176abde788536398",
       "prospeo": "dd7ecf187d6c70777a016651d9938544",
       "reoon": "8Rn9u9KaErYjnjcnRcdT3gwtaOpGb9D1"
     },
     "useFreeCredit": true
   }
   ```

### Option B: Test via Next.js App

1. Start Next.js dev server:
   ```bash
   cd /home/amk/projects/n8n
   pnpm dev
   ```

2. Open http://localhost:3000

3. Paste LinkedIn URL:
   ```
   https://www.linkedin.com/in/satyanadella/
   ```

4. Click **"Get 10 Free Verified Emails"**

5. Watch progress bar update and CSV download on completion

---

## Verification Checklist

- [ ] Workflow imports without errors
- [ ] All 25+ nodes are present
- [ ] No red validation warnings on any node
- [ ] Workflow can be activated (toggle turns green)
- [ ] Webhook URL is live: `https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment`
- [ ] Test execution completes successfully
- [ ] Progress updates appear in Next.js app
- [ ] CSV download works with deliverable emails

---

## What Was Fixed

### Fixed Code Nodes (7 total)

1. **Parse LinkedIn URLs** (`9122fdac-7d9e-4b8c-ade3-f747da33cc9a`)
   - Parses input data (string/array) into LinkedIn URLs array

2. **Prepare Batch** (`54dffe06-9539-4800-bcea-a6b8047349ad`)
   - Slices LinkedIn URLs into batches of 5 for MagicalAPI rate limiting

3. **Extract Profile Data** (`6c3988d0-fe6e-4cd3-8e36-c85d46c5bce4`)
   - Extracts profile fields from MagicalAPI response (name, title, company)

4. **Extract Email Data** (`557f278b-a41c-42ed-a148-f3a03f89e100`)
   - Merges Prospeo email results with profile data

5. **Extract Verification Status** (`9262e756-3805-4189-94b5-233c201a3dda`)
   - Parses Reoon verification and marks deliverability

6. **Calculate Statistics** (`3ce87165-f839-4d9c-9ae0-680bfa43a866`)
   - Computes success metrics (deliverable/invalid/total)

7. **Generate CSV** (`02628893-3d4d-463c-8914-a7f71bebfb94`)
   - Creates downloadable CSV with deliverable leads only

### Fixed Set Variables Node

**Before (broken)**:
```javascript
progressUrl: "={{ $env.NEXTJS_BASE_URL }}/api/enrich/progress"
completeUrl: "={{ $env.NEXTJS_BASE_URL }}/api/enrich/complete"
```

**After (working)**:
```javascript
progressUrl: "https://n8n-steel-seven.vercel.app/api/enrich/progress"
completeUrl: "https://n8n-steel-seven.vercel.app/api/enrich/complete"
```

---

## Troubleshooting

### Issue: Import fails with "Invalid workflow JSON"

**Solution**: Ensure you're using the file `n8n-lead-enrichment-workflow-FIXED.json` from the project directory.

### Issue: Nodes still show validation errors

**Solution**: Check the error message. If it's about credentials, verify API keys are accessible in the test payload.

### Issue: Webhook not responding

**Solution**:
1. Verify workflow is Active (green toggle)
2. Check webhook path matches: `/webhook/lead-enrichment`
3. Test webhook directly with cURL:
   ```bash
   curl -X POST https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment \
     -H "Content-Type: application/json" \
     -d '{
       "jobId": "test-123",
       "source": "linkedin_urls",
       "data": "https://www.linkedin.com/in/satyanadella/",
       "apiKeys": {
         "magicalApi": "mag_f4023e362f4f92dab44520f176abde788536398",
         "prospeo": "dd7ecf187d6c70777a016651d9938544",
         "reoon": "8Rn9u9KaErYjnjcnRcdT3gwtaOpGb9D1"
       },
       "useFreeCredit": true
     }'
   ```

---

## Next Steps After Testing

1. **Deploy to Production**:
   - Add environment variables to Vercel (if needed)
   - Verify Next.js production build works

2. **Security**: Rotate exposed API keys:
   - MagicalAPI: https://magicalapi.com/dashboard
   - Prospeo: https://prospeo.io/dashboard
   - Reoon: https://reoon.com/dashboard

3. **Monitor Costs**: Track API usage per 100 leads (~$12-30 cost)

4. **Scale Testing**: Test with 10-20 URLs before going to 50-100

---

## Support

If you encounter any issues during import:
1. Check n8n execution logs (click on workflow execution)
2. Verify all node IDs match the original workflow
3. Confirm API keys are valid by testing each API individually
