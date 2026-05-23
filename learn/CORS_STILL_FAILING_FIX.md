# CORS Issue Still Persisting - Troubleshooting Guide

## Problem
You updated `CORS_ALLOWED_ORIGINS` in Render, but still getting CORS error with the new domain `https://noolerp.vercel.app`.

---

## Solution: Force Redeploy

The environment variable might not have triggered a redeploy. Here's how to force it:

### Option 1: Manual Redeploy in Render Dashboard (FASTEST)

1. Go to https://dashboard.render.com
2. Click **nool-backend** service
3. Click **Deployments** tab
4. Click **Deploy latest commit** button (or similar)
5. Wait for deployment to complete (monitor status)
6. Once deployed, test login

### Option 2: Update application.properties (BACKUP)

If Render redeploy doesn't work, we can also update the default value in the code:

```properties
# In: backend/src/main/resources/application.properties
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:5174,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:4173,https://nool-rouge.vercel.app,https://noolerp.vercel.app}
```

This adds the new domain to the fallback defaults.

### Option 3: Verify Environment Variable is Actually Set

1. Go to https://dashboard.render.com
2. Click **nool-backend** → **Settings** → **Environment**
3. Scroll down and find `CORS_ALLOWED_ORIGINS`
4. Verify the value is exactly:
   ```
   https://noolerp.vercel.app
   ```
   (or includes both domains if using comma-separated)

**Common mistakes:**
- ❌ Extra spaces: `https://noolerp.vercel.app ` (space at end)
- ❌ Wrong protocol: `http://noolerp.vercel.app` (should be https)
- ❌ Trailing slash: `https://noolerp.vercel.app/` (no slash)
- ❌ Wrong domain: `noolerp.vercel.com` (should be .app)

---

## Step-by-Step Troubleshooting

### Step 1: Verify Env Var is Set Correctly
- [ ] Check CORS_ALLOWED_ORIGINS in Render Settings
- [ ] Confirm exact value: `https://noolerp.vercel.app`
- [ ] No extra spaces or typos

### Step 2: Force Redeploy
- [ ] Click "Deploy latest commit" in Deployments tab
- [ ] Wait for deployment to complete (status changes to "Live")
- [ ] Check deployment logs for any errors

### Step 3: Clear Browser Cache
- [ ] Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
- [ ] Select "All time"
- [ ] Check "Cookies and other site data"
- [ ] Click "Clear data"

### Step 4: Test with Fresh Browser
- [ ] Open new Incognito/Private window
- [ ] Go to https://noolerp.vercel.app
- [ ] Try login
- [ ] Open DevTools (F12) → Network tab
- [ ] Check for OPTIONS request (should be 200)

### Step 5: Test with curl (Technical)
```bash
curl -i -X OPTIONS \
  "https://nool-backend-v3rd.onrender.com/api/auth/login" \
  -H "Origin: https://noolerp.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

**Should see:**
- ✅ HTTP 200 or 204
- ✅ `access-control-allow-origin: https://noolerp.vercel.app`

---

## If Manual Redeploy Doesn't Work

Let's update the code to hardcode the new domain:

**Update `application.properties`:**

```properties
# Add new domain to fallback
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:5174,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:4173,https://nool-rouge.vercel.app,https://noolerp.vercel.app}
```

Then:
1. Commit and push to GitHub
2. Render will auto-deploy
3. Test login

---

## Expected Timeline

```
Now:                 Manual redeploy in Render (click button)
+2-3 mins:          Deployment completes
+5 mins:            Test login on noolerp.vercel.app
+6 mins:            Login works! ✅
```

---

## Summary

✅ **Code is correct** - It reads CORS_ALLOWED_ORIGINS from env var
⏳ **Issue**: Env var set but redeploy might not have happened
🚀 **Solution**: Click "Deploy latest commit" in Render Deployments tab
✅ **Result**: Login will work!

