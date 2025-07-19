# Production Deployment Guide

## API URL Configuration for Production

### Problem
Your app uses relative API paths like `fetch("/api/notes")` which work in development but can cause issues in production, especially with server-side rendering and static generation.

### Solution
I've created an API utility system that automatically handles URLs for both development and production environments.

## Files Created/Updated

### 1. API Utility (`src/lib/api.js`)
- `getBaseUrl()` - Automatically detects the correct base URL
- `getApiUrl(path)` - Creates full API URLs
- `apiFetch(path, options)` - Enhanced fetch with automatic URL handling

### 2. Environment Variables
Added to `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Production (Vercel):**
Set this environment variable in your Vercel dashboard:
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## How to Update Your API Calls

### Before:
```javascript
const response = await fetch("/api/notes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
```

### After:
```javascript
import { apiFetch } from "@/lib/api";

const response = await apiFetch("/api/notes", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### Key Changes:
1. Import `apiFetch` from `@/lib/api`
2. Replace `fetch()` with `apiFetch()`
3. Remove `"Content-Type": "application/json"` headers (handled automatically)

## Files That Need Updates

Run this command to see all files that need updating:
```bash
node scripts/update-api-calls.js
```

### Priority Files (Already Updated):
- ✅ `src/app/dashboard/page.jsx`
- ✅ `src/app/reset-password/page.jsx`

### Files You Need to Update:
1. `src/components/team-switcher.jsx`
2. `src/components/team-management-dialog.jsx`
3. `src/components/search-dialog.jsx`
4. `src/components/app-sidebar.jsx`
5. `src/app/signup/page.jsx`
6. `src/app/profile/page.jsx`
7. `src/app/forgot-password/page.jsx`
8. `src/app/dashboard/shared/page.jsx`
9. `src/app/dashboard/notes/[id]/page.jsx`
10. `src/app/dashboard/notes/trash/page.jsx`
11. `src/app/dashboard/notes/starred/page.jsx`
12. `src/app/dashboard/notes/page.jsx`
13. `src/app/dashboard/account/page.jsx`

## Deployment Steps

### 1. Update Remaining API Calls
For each file listed above:
1. Add import: `import { apiFetch } from "@/lib/api";`
2. Replace `fetch("/api/...")` with `apiFetch("/api/...")`
3. Remove `"Content-Type": "application/json"` headers

### 2. Set Production Environment Variable
In your Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add: `NEXT_PUBLIC_APP_URL` = `https://your-actual-domain.vercel.app`

### 3. Update NextAuth Configuration
In your production environment variables, also set:
```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

### 4. Test Locally
Before deploying:
```bash
npm run build
npm run start
```

## Example Updates

### Component Example (`src/components/team-switcher.jsx`):
```javascript
// Add import
import { apiFetch } from "@/lib/api";

// Update fetch call
const response = await apiFetch("/api/teams");
```

### Page Example (`src/app/signup/page.jsx`):
```javascript
// Add import
import { apiFetch } from "@/lib/api";

// Update fetch call
const response = await apiFetch("/api/auth/signup", {
  method: "POST",
  body: JSON.stringify(formData),
});
```

## Benefits

1. **Automatic URL Resolution**: Works in development, production, and preview environments
2. **Server-Side Compatibility**: Handles both client and server-side API calls
3. **Simplified Code**: No need to manually manage Content-Type headers
4. **Environment Agnostic**: Automatically detects the correct base URL

## Verification

After updating all files and deploying:
1. Check browser network tab for API calls
2. Ensure all API calls use full URLs in production
3. Test all major features (login, notes, teams, etc.)

## Troubleshooting

If you still see API errors after deployment:
1. Verify `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
2. Check that all fetch calls have been updated to use `apiFetch`
3. Ensure your API routes are working correctly
4. Check Vercel function logs for any server-side errors