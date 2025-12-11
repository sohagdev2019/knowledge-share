# Login Session Persistence Fix

## Problem
After logging in through the OTP flow, the session state was being lost immediately after redirecting to the home page. The navbar continued to show "Sign in" and "Join" buttons instead of the user dropdown, indicating the session was not persisting.

## Root Causes
1. **LoginForm was bypassing OTP flow**: The login form was trying to sign in directly with credentials instead of using the required OTP verification flow.
2. **Session token validation issues**: The session token validation in `auth.ts` had edge cases that could cause failures.
3. **Session cookie timing**: The session cookie wasn't being set properly before redirect, causing a race condition.

## Solutions Implemented

### 1. Fixed LoginForm to Use OTP Flow
**File**: `app/(auth)/login/_components/LoginForm.tsx`

- Changed `signInWithPassword()` to call `/api/auth/password/send-otp` endpoint
- Redirects to `/verify-request?email=...&type=password` after OTP is sent
- Follows the proper authentication flow: Password → OTP → Session

### 2. Improved Session Token Validation
**File**: `lib/auth.ts`

- Added better error handling for expired session tokens
- Improved validation logic to check all required fields
- Added proper cleanup of expired tokens
- Added cookie configuration for better session persistence

### 3. Fixed Session Creation After OTP Verification
**File**: `app/(auth)/verify-request/page.tsx`

- Added `useSession` hook with `update` function
- Added delay after `signIn()` to ensure cookie is set
- Called `update()` to force session refresh
- Added delay before redirect to ensure session is fully established
- Applied same fix to both password OTP and email OTP flows

### 4. Enhanced Session Configuration
**File**: `lib/auth.ts`

- Added explicit cookie configuration with proper settings
- Set session `maxAge` to 30 days
- Configured secure cookies for production

## Testing the Fix

### Test Case 1: Password Login with OTP
1. Navigate to `/login`
2. Enter email/username and password
3. Click "Login with Password"
4. ✅ Should see "Verification code sent to your email" toast
5. ✅ Should redirect to `/verify-request?email=...&type=password`
6. Enter the 6-digit OTP from email (or console in dev mode)
7. Click "Verify Account"
8. ✅ Should see "Login successful!" toast
9. ✅ Should redirect to home page (`/`)
10. ✅ Navbar should show user dropdown (not "Sign in"/"Join" buttons)
11. ✅ Session should persist on page refresh

### Test Case 2: Email OTP Login
1. Navigate to `/login`
2. Use email OTP login flow
3. ✅ Should follow same verification process
4. ✅ Session should persist after redirect

### Test Case 3: Session Persistence
1. After successful login, refresh the page
2. ✅ Session should still be active
3. ✅ Navbar should still show user dropdown
4. ✅ Should be able to navigate to protected routes

### Test Case 4: Invalid OTP
1. Enter incorrect OTP
2. ✅ Should see error message
3. ✅ Should remain on verification page
4. ✅ Should be able to resend OTP

## Debugging

If session still doesn't persist:

1. **Check browser console** for any errors
2. **Check Network tab**:
   - Verify `/api/auth/session` endpoint returns session data
   - Check that cookies are being set (look for `next-auth.session-token`)
3. **Check server logs** for authentication errors
4. **Verify environment variables**:
   - `NEXTAUTH_SECRET` is set
   - `NEXTAUTH_URL` is set (or auto-detected)
5. **Clear browser cookies** and try again
6. **Check browser cookie settings** (ensure cookies are enabled)

## Files Modified

- `app/(auth)/login/_components/LoginForm.tsx` - Updated to use OTP flow
- `lib/auth.ts` - Fixed session token validation and added cookie config
- `app/(auth)/verify-request/page.tsx` - Fixed session creation timing

## Technical Details

### Session Flow
1. User submits credentials → `/api/auth/password/send-otp`
2. Server validates password → Sends OTP → Returns success
3. Client redirects → `/verify-request?email=...&type=password`
4. User submits OTP → `/api/auth/password/verify`
5. Server validates OTP → Creates session token → Returns token
6. Client calls `signIn("credentials")` with session token
7. `auth.ts` validates token → Creates JWT session → Sets cookie
8. Client waits → Calls `update()` → Redirects
9. Session persists in cookie → Navbar shows user info

### Session Token Format
```json
{
  "userId": "user-id",
  "email": "user@example.com",
  "type": "session-token",
  "verified": true
}
```

Token is stored in `verification` table with UUID as ID and expires in 5 minutes.



