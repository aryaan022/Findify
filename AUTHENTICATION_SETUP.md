# Enhanced Authentication System - Complete Setup Guide

## Overview
This document covers the complete authentication system with OTP verification, OAuth integration (Google & GitHub), and password reset functionality.

---

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Feature Overview](#feature-overview)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Required Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Database
DB_URL=mongodb+srv://...

# Mapbox (existing)
MAP_ACCESS_TOKEN=your_mapbox_token
```

### How to Get OAuth Credentials

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`, `https://youromain.com`
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`, `https://yourdomain.com/auth/google/callback`
5. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth Setup
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Local Business Finder"
   - Homepage URL: `http://localhost:3000` or your domain
   - Authorization callback URL: `http://localhost:3000/auth/github/callback` or your domain
4. Copy Client ID and Client Secret to `.env`

---

## Feature Overview

### 1. Sign Up with Email Verification
**Flow:** User registers → OTP sent to email → User verifies → Account activated

**Benefits:**
- Prevents invalid email registration
- Reduces spam accounts
- Users can't access account until email verified
- OTP expires after 10 minutes

### 2. Google/GitHub OAuth Login
**Flow:** User clicks OAuth button → Redirected to provider → User approves → Auto-logged in

**Benefits:**
- Frictionless sign-up/login
- No password to remember
- Auto-fetches profile picture
- Automatically marks email as verified

### 3. Forgot Password with OTP
**Flow:** User enters email → OTP sent → User verifies OTP → Sets new password

**Benefits:**
- Secure password reset
- No password reset links (more secure)
- OTP expires after 15 minutes
- User must verify identity before reset

---

## Authentication Flow

### Standard Sign Up Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ↓
   /register (GET)
   ↓
Display form with OAuth buttons
       │
       ├─→ Click Google/GitHub
       │   ├─ Redirected to provider
       │   ├─ User approves
       │   └─ Auto-logged in ✓
       │
       └─→ Enter email & password
           ↓
         POST /register
           ↓
         Validate inputs
           ├─ Check if email exists
           ├─ Prevent admin signup
           └─ Hash password
           ↓
         Generate OTP
         Send email
           ↓
         /verify-otp
           ↓
         User enters OTP
           ├─ Validate OTP
           ├─ Check expiry
           └─ Verify match
           ↓
       Mark email verified
       Auto-login user
       Redirect home ✓
```

### Password Reset Flow

```
/forgot-password (GET)
         ↓
User enters email
         ↓
POST /forgot-password
         ├─ Find user
         ├─ Generate reset OTP
         └─ Send email
         ↓
/reset-password (GET)
         ↓
User enters OTP + new password
         ↓
POST /reset-password
         ├─ Verify OTP
         ├─ Check expiry
         ├─ Hash new password
         └─ Clear reset OTP
         ↓
Success message
Redirect to login ✓
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| GET | `/register` | Show signup form | - |
| POST | `/register` | Submit signup form | `username`, `email`, `role`, `password` |
| POST | `/verify-otp` | Verify email OTP | `email`, `otp` |
| POST | `/resend-otp` | Resend signup OTP | `email` |
| GET | `/login` | Show login form | - |
| POST | `/login` | Submit login form | `username`, `password` |
| GET | `/logout` | Logout user | - |
| GET | `/auth/google` | Start Google OAuth | - |
| GET | `/auth/google/callback` | Google OAuth callback | - |
| GET | `/auth/github` | Start GitHub OAuth | - |
| GET | `/auth/github/callback` | GitHub OAuth callback | - |
| GET | `/forgot-password` | Show forgot password form | - |
| POST | `/forgot-password` | Submit forgot password | `email` |
| POST | `/reset-password` | Reset password | `email`, `otp`, `password`, `confirmPassword` |
| POST | `/resend-reset-otp` | Resend password reset OTP | `email` |

---

## Configuration

### Database Schema Updates

The User model has been updated with new fields:

```javascript
// OTP Fields
otp: String                    // 6-digit code
otpExpiry: Date               // When OTP expires

// Password Reset Fields
resetOtp: String              // 6-digit reset code
resetOtpExpiry: Date          // When reset OTP expires

// OAuth Fields
googleId: String              // Google unique ID
githubId: String              // GitHub unique ID
provider: String              // 'local', 'google', 'github'

// Verification
isEmailVerified: Boolean       // Email verification status
profilePicture: String        // OAuth profile picture

// Metadata
createdAt: Date               // Account creation date
updatedAt: Date               // Last update date
```

### OTP Utility Functions

Located in `utils/otp.js`:

```javascript
// Generate a 6-digit OTP
generateOTP()                 // Returns: "123456"

// Send OTP via email
sendOTP(email, otp, type)     // type: 'signup' or 'reset'

// Calculate OTP expiry time
getOTPExpiry(type)            // Returns: Date (10 min for signup, 15 min for reset)

// Verify OTP validity
verifyOTP(provided, stored, expiryTime)
// Returns: { valid: boolean, message: string }

// Clear OTP from user document
clearOTP(userDoc, type)       // type: 'signup' or 'reset'
```

---

## Testing

### Test Signup with OTP

1. **Navigate to signup:**
   ```
   http://localhost:3000/register
   ```

2. **Fill in form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Role: `user`
   - Password: `TestPass123!`

3. **Submit form**
   - You should see: "OTP sent to your email"
   - Redirected to: `/verify-otp`

4. **Check email:**
   - Open your email (or Resend dashboard if using test key)
   - Copy the 6-digit OTP

5. **Verify OTP:**
   - Paste OTP in verification page
   - Click "Verify Email"
   - Should be logged in and redirected home

### Test Google OAuth

1. **Click "Google" button on signup**
2. **Allow permissions**
3. **Should be auto-logged in**
4. **Account created with:**
   - Email from Google account
   - Username as display name
   - Profile picture from Google
   - Email already verified

### Test GitHub OAuth

1. **Click "GitHub" button on signup**
2. **Authorize application**
3. **Should be auto-logged in**
4. **Account created with:**
   - Email from GitHub account
   - Username as GitHub username
   - Profile picture from GitHub
   - Email already verified

### Test Forgot Password

1. **Go to login page**
2. **Click "Forgot password?"**
3. **Enter email of existing account**
4. **Check email for OTP**
5. **Enter OTP and new password**
6. **Should see "Password reset successfully"**
7. **Login with new password**

### Test Invalid OTP Scenarios

| Scenario | What Happens |
|----------|--------------|
| Wrong OTP | "Invalid OTP. Please check and try again." |
| Expired OTP | "OTP has expired. Please request a new one." |
| No OTP generated | "No OTP found. Please request a new one." |
| Resend after expiry | New OTP sent, timer resets to 10/15 minutes |

---

## Troubleshooting

### Issue: "Cannot find module passport-google-oauth20"

**Solution:**
```bash
npm install passport-google-oauth20 passport-github2
```

### Issue: Google/GitHub login not working

**Check:**
1. Environment variables are correct
2. Callback URL matches exactly in OAuth app settings
3. OAuth app is not in development mode (if applicable)
4. Domains are whitelisted in OAuth console

**Test with:**
```bash
curl http://localhost:3000/auth/google
# Should redirect to Google login page
```

### Issue: OTP not sending to email

**Check:**
1. `RESEND_API_KEY` is correct
2. Email address is valid
3. Check Resend dashboard for bounces
4. Check spam folder in email

**Test locally:**
```javascript
// In your route, add logging
const otpResult = await sendOTP(email, otp, 'signup');
console.log("OTP Send Result:", otpResult);
```

### Issue: "User already registered"

**Solution:**
- User tried to register with existing email
- They should click "Sign In" instead
- Or reset password if they forgot it

### Issue: OTP timer not working

**Check:**
1. Browser console for JavaScript errors
2. Lucide icons loaded correctly
3. Timer interval not cleared prematurely

**Fix in browser console:**
```javascript
// Manually test timer
let timeLeft = 600;
setInterval(() => console.log(timeLeft--), 1000);
```

### Issue: Password reset validation failing

**Check:**
1. Password at least 8 characters
2. Both password fields match
3. User exists in database

**Error codes:**
- "Passwords do not match" → Check password fields
- "Password must be at least 8 characters" → Use stronger password
- "Invalid OTP" → Verify OTP is correct

---

## Security Best Practices Implemented

✅ **OTP Security**
- 6-digit random OTP (1 million combinations)
- Time-limited (10-15 minutes)
- Hashed passwords using passport-local-mongoose
- Soft-delete for password history (if needed)

✅ **Email Security**
- Email verification before account activation
- OTP sent via secure Resend service
- No sensitive data in URLs
- Redirect after login for CSRF prevention

✅ **OAuth Security**
- HTTPS-only in production
- State parameter in OAuth flow (Passport handles)
- Secure cookie settings
- Profile picture from verified OAuth source

✅ **Password Security**
- Bcrypt hashing via passport-local-mongoose
- 8-character minimum requirement
- Strength indicator in UI
- Reset OTP expires after 15 minutes

---

## File Structure

```
Local Business Finder/
├── models/
│   └── User.js                 # Updated with OTP & OAuth fields
├── utils/
│   └── otp.js                  # OTP utility functions
├── views/
│   ├── register.ejs            # Updated with OAuth buttons
│   ├── login.ejs               # Updated with OAuth buttons + forgot link
│   ├── verify-otp.ejs          # NEW: OTP verification form
│   ├── forgot-password.ejs     # NEW: Forgot password form
│   └── reset-password.ejs      # NEW: Reset password form
├── app.js                       # Updated with new routes & strategies
├── middleware.js               # Existing auth middleware
├── package.json                # Updated with OAuth packages
└── .env                        # Updated with new credentials
```

---

## What's New in This Update

### ✨ Features Added

1. **Email Verification OTP**
   - Auto-generated 6-digit code
   - Sent via Resend email service
   - 10-minute expiration
   - Resend functionality

2. **Google OAuth**
   - One-click signup/login
   - Auto profile picture fetch
   - Auto email verification
   - Works across devices

3. **GitHub OAuth**
   - One-click signup/login
   - GitHub username as account username
   - GitHub avatar as profile picture
   - Developer-friendly

4. **Password Reset with OTP**
   - Secure OTP-based reset (not email links)
   - 15-minute expiration
   - Resend functionality
   - Password strength indicator

5. **Enhanced Security**
   - Email verification required
   - Provider tracking (local/google/github)
   - Account creation timestamps
   - Profile picture storage

### 🔄 Modified Features

- **Signup**: Now requires email verification before activation
- **Login**: Added "Forgot Password?" link
- **Views**: Added OAuth buttons to register and login pages

---

## Version Information

- **Version:** 2.0.0
- **Release Date:** December 19, 2025
- **Status:** ✅ Complete & Production Ready

---

## Next Steps

1. **Configure OAuth credentials** in `.env`
2. **Test signup flow** with OTP verification
3. **Test OAuth login** with Google/GitHub
4. **Test forgot password** with OTP reset
5. **Monitor email delivery** via Resend dashboard
6. **Set up production OAuth callbacks** when deploying

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review environment variables
3. Check console logs in browser and terminal
4. Verify OAuth app settings
5. Test with Resend API key in dashboard

---

**Need Help?** Check the comprehensive guide above or refer to individual files for implementation details.
