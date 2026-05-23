# Update Render CORS for Localhost + Production

## Current Status ✅
Your online login is working with `https://noolerp.vercel.app`!

## Now Let's Add Localhost

To also use the application locally during development, we need to update the `CORS_ALLOWED_ORIGINS` environment variable in Render.

---

## What to Update in Render

### Current Value
```
https://noolerp.vercel.app
```

### New Value (Add Localhost)
```
http://localhost:5173,http://localhost:5174,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:4173,https://nool-rouge.vercel.app,https://noolerp.vercel.app
```

---

## Steps to Update in Render

1. Go to https://dashboard.render.com
2. Click **nool-backend** service
3. Click **Settings** tab
4. Find **Environment** section
5. Find `CORS_ALLOWED_ORIGINS` variable
6. Update the value to include localhost (copy the new value above)
7. Click **Save**
8. Wait for auto-redeploy (2-3 minutes)

---

## What Gets Added

| Domain | Purpose |
|--------|---------|
| `http://localhost:5173` | Local dev server (Vite default) |
| `http://localhost:5174` | Alternate local port |
| `http://localhost:4173` | Vite preview port |
| `http://127.0.0.1:5173` | Local IP equivalent |
| `http://127.0.0.1:5174` | Local IP alternate |
| `http://127.0.0.1:4173` | Local IP preview |
| `https://nool-rouge.vercel.app` | Old production domain |
| `https://noolerp.vercel.app` | Current production domain |

---

## After Update: You Can Use

### 1. **Online Production**
```
https://noolerp.vercel.app
```
(Already working ✅)

### 2. **Local Development**
```
http://localhost:5173
```
(After adding localhost env var)

---

## How to Run Locally

After updating Render:

```bash
# Terminal 1: Start frontend locally
cd frontend
npm run dev
# Opens at http://localhost:5173

# Terminal 2: Start backend locally (if needed)
cd backend
./mvnw spring-boot:run
# Runs at http://localhost:8083/api
```

Then open `http://localhost:5173` in your browser and login will work! ✅

---

## Summary

✅ **Production**: https://noolerp.vercel.app (working now)
⏳ **Local**: Add localhost to Render env var
✅ **Result**: Can use both production and local

**Just update the environment variable in Render with the full value that includes localhost domains!**

