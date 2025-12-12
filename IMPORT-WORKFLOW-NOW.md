# Import Fixed Workflow - MagicalAPI Authentication Fixed

## What Was Fixed

The **MagicalAPI Enrichment** node was misconfigured with conflicting authentication settings:
- ❌ Had `authentication: "genericCredentialType"` expecting a pre-saved credential
- ❌ But also tried to pass API key dynamically at runtime
- ✅ Fixed by removing credential authentication and using dynamic headers only (like Prospeo and Reoon nodes)

---

## How to Import the Fixed Workflow

### Step 1: Access the Fixed File

**Windows Explorer Path:**
```
\\wsl$\Ubuntu\home\amk\projects\n8n\n8n-lead-enrichment-workflow-FIXED.json
```

Or open WSL terminal and run:
```bash
cd /home/amk/projects/n8n
explorer.exe .
```

### Step 2: Delete the Broken Workflow in n8n

1. Go to: https://n8n.srv953382.hstgr.cloud
2. Find **"Lead Enrichment Pipeline"** workflow
3. Click the **"..."** menu → **"Delete"**
4. Confirm deletion

### Step 3: Import the Fixed Workflow

1. Click **"+ Add workflow"** (top-right)
2. Click **"Import from file"**
3. Select: `n8n-lead-enrichment-workflow-FIXED.json`
4. The workflow will be imported with all nodes

### Step 4: Activate the Workflow

1. Open the imported workflow
2. **No validation errors should appear**
3. Click **"Active"** toggle (top-right)
4. Webhook should activate successfully

---

## Verify It's Working

### Check 1: Workflow Activated
- Toggle should be green/active
- No "Problem running workflow" error at the bottom

### Check 2: Webhook is Live
The webhook should be accessible at:
```
https://n8n.srv953382.hstgr.cloud/webhook/lead-enrichment
```

### Check 3: Test with Next.js App

```bash
cd /home/amk/projects/n8n
pnpm dev
```

Visit http://localhost:3000 and paste:
```
https://www.linkedin.com/in/satyanadella/
```

Click **"Get 10 Free Verified Emails"**

---

## What Changed in the Fix

**Before (Broken):**
```json
{
  "authentication": "genericCredentialType",          ← REMOVED
  "genericAuthType": "httpHeaderAuth",                 ← REMOVED
  "headerParameters": {
    "parameters": [
      {
        "name": "Authorization",
        "value": "=Bearer {{ $json.apiKeys.magicalApi }}"  ← UPDATED
      }
    ]
  }
}
```

**After (Working):**
```json
{
  "headerParameters": {
    "parameters": [
      {
        "name": "Authorization",
        "value": "={{ 'Bearer ' + $json.apiKeys.magicalApi }}"  ← FIXED
      }
    ]
  }
  // No authentication field
}
```

---

## Why This Fix Works

n8n has two ways to handle authentication:

1. **Pre-Saved Credentials** (For static keys stored in n8n)
   - Requires `authentication: "genericCredentialType"`
   - Validates at workflow activation time
   - NOT what we need

2. **Dynamic Headers** (For runtime values from webhook payload)
   - No `authentication` field needed
   - API key injected at execution time
   - **This is what we need** ✅

The MagicalAPI node was using approach #1 but trying to inject dynamic values (approach #2), which caused the validation error.

Now it matches the pattern used by Prospeo and Reoon nodes (which work correctly).

---

## If You Still See Errors

1. **Make sure you deleted the old workflow** before importing
2. **Check the file location** is correct in Windows Explorer
3. **Verify the JSON file** isn't corrupted (should be ~60KB)
4. If errors persist, share a screenshot and I'll help debug

---

## Next Steps After Activation

1. ✅ Test with 1-2 LinkedIn URLs
2. ✅ Verify progress updates work
3. ✅ Confirm CSV download completes
4. Deploy to production (update environment variables on Vercel)
5. Rotate exposed API keys for security
