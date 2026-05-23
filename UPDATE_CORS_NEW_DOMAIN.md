# Update CORS for New Frontend URL

## Your New Frontend URL
```
OLD: https://nool-rouge.vercel.app
NEW: https://noolerp.vercel.app
```

## What You Need To Do

### Update Environment Variable in Render

1. Go to https://dashboard.render.com
2. Click **nool-backend** service
3. Click **Settings** tab
4. Find **Environment** section
5. **UPDATE** the existing variable:
   - **Key:** `CORS_ALLOWED_ORIGINS`
   - **OLD Value:** `https://nool-rouge.vercel.app`
   - **NEW Value:** `https://noolerp.vercel.app`
6. Click **Save**
7. Wait 2-3 minutes for auto-redeploy

### Alternative: Allow Both Domains (Recommended)

If you want to support both old and new domain:

1. Update the variable to:
   ```
   CORS_ALLOWED_ORIGINS=https://nool-rouge.vercel.app,https://noolerp.vercel.app
   ```
2. This allows both domains to work
3. Useful if both are still in use

---

## How It Works

The CORS filter now needs to match your new frontend domain:

```
Before:
Browser (nool-rouge.vercel.app) → Backend checks for nool-rouge.vercel.app ✅

After:
Browser (noolerp.vercel.app) → Backend checks for nool-rouge.vercel.app ❌
                                 (Still looking for old domain!)

Fixed:
Browser (noolerp.vercel.app) → Backend checks for noolerp.vercel.app ✅
```

---

## Testing

After updating:

1. Open https://noolerp.vercel.app
2. Press F12 → Network tab
3. Try login
4. Should see OPTIONS request with 200 status ✅

---

## Summary

✅ **Code is already correct** - It reads from CORS_ALLOWED_ORIGINS env var
⏳ **Action needed**: Update CORS_ALLOWED_ORIGINS in Render to `https://noolerp.vercel.app`
✅ **Result**: Login will work with new domain!

