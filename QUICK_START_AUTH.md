# 🚀 QUICK START - Authentication Setup (5 Minutes)

## What You Need to Do

### 1. Add to `.env` File (1 minute)

Copy and paste these into your `.env` file, then fill in your credentials:

```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (from GitHub Developer Settings)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Resend Email API (from Resend.com)
RESEND_API_KEY=re_your_resend_api_key
```

### 2. Get Google Credentials (2 minutes)

1. Go to: https://console.cloud.google.com/
2. Create new project called "Local Business Finder"
3. Search for "Google+ API" and enable it
4. Click "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/auth/google/callback`
7. Copy the Client ID and Client Secret to `.env`

### 3. Get GitHub Credentials (1 minute)

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Local Business Finder
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/auth/github/callback
4. Copy Client ID and generate Client Secret
5. Add to `.env`

### 4. Get Resend API Key (1 minute)

1. Go to: https://resend.com
2. Sign up (free)
3. Go to "API Keys"
4. Create new key
5. Copy to `.env`

### 5. Install & Start (0 minute)

```bash
npm install
npm start
```

---

## That's It! Test It

### Test Email Signup
```
1. http://localhost:3000/register
2. Fill form and click "Create Account"
3. Check email for OTP code
4. Paste code and verify
5. ✓ Logged in!
```

### Test Google Login
```
1. http://localhost:3000/register
2. Click "Google" button
3. ✓ Auto-logged in!
```

### Test GitHub Login
```
1. http://localhost:3000/register
2. Click "GitHub" button
3. ✓ Auto-logged in!
```

### Test Forgot Password
```
1. http://localhost:3000/login
2. Click "Forgot password?"
3. Enter email
4. Check email for OTP
5. Reset password
6. ✓ Done!
```

---

## Environment Variables Checklist

```
□ GOOGLE_CLIENT_ID
□ GOOGLE_CLIENT_SECRET
□ GITHUB_CLIENT_ID
□ GITHUB_CLIENT_SECRET
□ RESEND_API_KEY
□ npm install (for new packages)
```

---

## What's New?

✅ **Signup Improvements**
- Email verification with OTP
- Google OAuth (one-click signup)
- GitHub OAuth (one-click signup)

✅ **Login Improvements**
- Forgot password link
- OTP-based password reset

✅ **Security**
- Email verification required
- Bcrypt password hashing
- OAuth integration

---

## Documentation

For more details, see:
- `AUTHENTICATION_SETUP.md` - Complete setup guide
- `AUTH_QUICK_REF.md` - Quick reference
- `AUTH_IMPLEMENTATION_GUIDE.md` - Step-by-step walkthrough

---

**Total Setup Time: ~5 minutes**

You're done! 🎉
