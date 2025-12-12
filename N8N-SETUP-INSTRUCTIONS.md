# n8n Lead Enrichment Workflow - Setup Instructions

## Step 1: Import Workflow into n8n

1. Open your n8n instance: https://n8n.srv953382.hstgr.cloud
2. Click **"Add workflow"** → **"Import from file"**
3. Upload the file: `n8n-lead-enrichment-workflow.json`
4. The workflow "Lead Enrichment Pipeline" will be imported with 25+ nodes

## Step 2: Configure n8n Environment Variables

In n8n, go to **Settings** → **Environment Variables** and add:

```bash
NEXTJS_BASE_URL=http://localhost:3000
```

**For production**, update this to your Vercel URL:
```bash
NEXTJS_BASE_URL=https://your-app.vercel.app
```

## Step 3: Activate the Workflow

1. Open the imported workflow in n8n
2. Click **"Active"** toggle in the top-right to enable it
3. The webhook will now be live at:
   ```
   https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment
   ```

## Step 4: Update Next.js Webhook URL

If the webhook path changed, update your `.env.local`:

```bash
N8N_WEBHOOK_URL="https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment"
```

## Step 5: Test the Workflow

### Test with 3 LinkedIn URLs:

1. Start your Next.js dev server:
   ```bash
   cd /home/amk/projects/n8n
   pnpm dev
   ```

2. Open http://localhost:3000

3. Paste these test LinkedIn URLs:
   ```
   https://www.linkedin.com/in/satyanadella/
   https://www.linkedin.com/in/jeffweiner08/
   https://www.linkedin.com/in/reidhoffman/
   ```

4. Click **"Get 10 Free Verified Emails"**

5. Watch the progress bar update in real-time

6. Download the CSV when complete

### Expected Result:
- Progress updates every 2 seconds
- CSV with deliverable emails only
- Stats showing deliverable/invalid counts

## Workflow Overview

The workflow processes leads through these stages:

1. **Webhook Trigger** - Receives enrichment request from Next.js
2. **Parse Input** - Extracts LinkedIn URLs (supports direct URLs or Apollo URLs)
3. **MagicalAPI Enrichment** - Gets profile data (name, title, company)
4. **Prospeo Email Finding** - Finds email addresses for each profile
5. **Reoon Verification** - Verifies email deliverability
6. **CSV Generation** - Creates downloadable CSV with deliverable leads only
7. **Completion Callback** - Sends results back to Next.js app

## Troubleshooting

### Issue: Webhook not receiving requests

**Solution**: Check that:
- Workflow is Active (toggle in top-right)
- N8N_WEBHOOK_URL in `.env.local` matches the webhook path
- Next.js dev server is running

### Issue: API errors (MagicalAPI, Prospeo, Reoon)

**Solution**: Verify API keys are working:
- Test MagicalAPI: https://playground.magicalapi.com/
- Test Prospeo: https://prospeo.io/dashboard
- Test Reoon: https://reoon.com/dashboard

### Issue: Progress not updating

**Solution**: Check:
- NEXTJS_BASE_URL in n8n environment variables points to your running Next.js app
- Next.js `/api/enrich/progress` endpoint is accessible
- Check n8n execution logs for errors

### Issue: CSV download fails

**Solution**:
- Check n8n execution logs for the "Generate CSV" node
- Verify "Completion Callback" node successfully posted to `/api/enrich/complete`
- Check Next.js console for any errors

## Performance Notes

- **5 LinkedIn URLs**: ~2-3 minutes
- **50 LinkedIn URLs**: ~10-15 minutes
- **100 LinkedIn URLs**: ~15-20 minutes

## Cost Estimates

Per 100 enriched leads:
- MagicalAPI: ~$5-10
- Prospeo: ~$5-15
- Reoon: ~$2-5
- **Total**: ~$12-30

## Next Steps

1. Test with 3-5 URLs first
2. Once working, test with 10-20 URLs
3. Deploy to production:
   - Update NEXTJS_BASE_URL in n8n to your Vercel URL
   - Add environment variables to Vercel
   - Update webhook URL in production build
4. Monitor costs and adjust batch sizes if needed
5. **Security**: Rotate exposed API keys after testing

## API Key Rotation (Important!)

After everything is working, rotate these exposed keys:

1. **MagicalAPI**: https://magicalapi.com/dashboard
2. **Prospeo**: https://prospeo.io/dashboard
3. **Reoon**: https://reoon.com/dashboard

Then update:
- `.env.local` (local development)
- Vercel environment variables (production)

## Support

If you encounter issues:
1. Check n8n execution logs (click on workflow execution in n8n)
2. Check Next.js console for errors
3. Verify all API keys are valid
4. Test each API individually first
