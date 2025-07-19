# Quick Fix Guide for API URLs

## 🚀 Automated Solution (Recommended)

Run this command to automatically update most files:

```bash
node scripts/auto-update-api-calls.js
```

This will:
- Add `import { apiFetch } from "@/lib/api";` to files that need it
- Replace `fetch("/api/...")` with `apiFetch("/api/...")`
- Remove unnecessary `"Content-Type": "application/json"` headers

## 🔧 Manual Updates (If needed)

If the automated script doesn't catch everything, here are the key patterns:

### 1. Add Import
At the top of each file with API calls:
```javascript
import { apiFetch } from "@/lib/api";
```

### 2. Replace Fetch Calls

**Before:**
```javascript
const response = await fetch("/api/notes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

**After:**
```javascript
const response = await apiFetch("/api/notes", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### 3. Simple GET Requests

**Before:**
```javascript
const response = await fetch("/api/teams");
```

**After:**
```javascript
const response = await apiFetch("/api/teams");
```

## 🎯 Priority Files (Update These First)

1. **Authentication Pages:**
   - ✅ `src/app/signup/page.jsx` (Already updated)
   - ✅ `src/app/reset-password/page.jsx` (Already updated)
   - `src/app/forgot-password/page.jsx`

2. **Dashboard Pages:**
   - ✅ `src/app/dashboard/page.jsx` (Already updated)
   - `src/app/dashboard/notes/page.jsx`
   - `src/app/dashboard/account/page.jsx`

3. **Core Components:**
   - `src/components/app-sidebar.jsx`
   - `src/components/team-switcher.jsx`

## 🌐 Environment Variables

### Development (.env.local):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel Dashboard):
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
```

## ✅ Verification Steps

After updating:

1. **Test Locally:**
   ```bash
   npm run build
   npm run start
   ```

2. **Check Network Tab:**
   - All API calls should use full URLs in production
   - No 404 errors on API endpoints

3. **Test Key Features:**
   - User registration/login
   - Creating/editing notes
   - Team functionality
   - File uploads

## 🐛 Common Issues

### Issue: API calls still use relative URLs
**Solution:** Make sure `NEXT_PUBLIC_APP_URL` is set in Vercel environment variables

### Issue: Content-Type errors
**Solution:** Remove manual `"Content-Type": "application/json"` headers - `apiFetch` handles this automatically

### Issue: Server-side API calls fail
**Solution:** The `apiFetch` utility automatically detects server vs client and uses appropriate URLs

## 📞 Need Help?

If you encounter issues:
1. Run `node scripts/update-api-calls.js` to see remaining files
2. Check the browser console for API errors
3. Verify environment variables in Vercel dashboard
4. Test the updated files locally before deploying