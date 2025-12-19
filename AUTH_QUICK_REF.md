# Authentication Features - Quick Reference

## 🚀 Quick Start

### For Users

#### Sign Up with Email Verification
```
1. Go to /register
2. Fill in: Username, Email, Role, Password
3. Click "Create Account"
4. Check email for 6-digit OTP
5. Enter OTP on verification page
6. ✓ Account ready!
```

#### Sign Up with Google
```
1. Go to /register
2. Click "Google" button
3. Allow permissions
4. ✓ Instantly logged in!
```

#### Sign Up with GitHub
```
1. Go to /register
2. Click "GitHub" button
3. Authorize application
4. ✓ Instantly logged in!
```

#### Forgot Password
```
1. Go to /login
2. Click "Forgot password?"
3. Enter your email
4. Check email for OTP
5. Enter OTP + new password
6. ✓ Password changed!
```

---

## 👨‍💻 For Developers

### Environment Variables Required

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# GitHub OAuth  
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Email Service
RESEND_API_KEY=xxx
```

### Installation

```bash
npm install passport-google-oauth20 passport-github2
```

### Files Added/Modified

| File | Action | Purpose |
|------|--------|---------|
| `models/User.js` | Modified | Added OTP & OAuth fields |
| `utils/otp.js` | Created | OTP generation & email |
| `views/verify-otp.ejs` | Created | OTP verification form |
| `views/forgot-password.ejs` | Created | Password reset request |
| `views/reset-password.ejs` | Created | Password reset completion |
| `views/register.ejs` | Modified | Added OAuth buttons |
| `views/login.ejs` | Modified | Added OAuth buttons & forgot link |
| `app.js` | Modified | All auth routes & strategies |

### API Routes

```javascript
// Sign Up
GET  /register                  // Show form
POST /register                  // Submit form, send OTP

// Email Verification
POST /verify-otp               // Verify email with OTP
POST /resend-otp               // Resend OTP to email

// Google OAuth
GET  /auth/google              // Initiate Google login
GET  /auth/google/callback     // Google redirects here

// GitHub OAuth
GET  /auth/github              // Initiate GitHub login
GET  /auth/github/callback     // GitHub redirects here

// Sign In
GET  /login                    // Show form
POST /login                    // Submit form

// Sign Out
GET  /logout                   // Logout user

// Password Reset
GET  /forgot-password          // Show form
POST /forgot-password          // Submit email
POST /reset-password           // Reset with OTP
POST /resend-reset-otp         // Resend password reset OTP
```

---

## 🔐 Security Features

### OTP (One-Time Password)
- ✅ 6-digit random code
- ✅ 10-minute expiry (signup)
- ✅ 15-minute expiry (reset)
- ✅ Auto-expires after use
- ✅ Can resend anytime

### Email Verification
- ✅ Required for signup
- ✅ OTP sent to registered email
- ✅ Auto-verified with OAuth
- ✅ Resend available

### OAuth Integration
- ✅ Google & GitHub support
- ✅ Auto email verification
- ✅ Auto profile picture fetch
- ✅ One-click sign up/login
- ✅ No password needed

### Password Security
- ✅ Bcrypt hashing
- ✅ 8-character minimum
- ✅ Strength indicator
- ✅ OTP-based reset
- ✅ No reset links

---

## 📝 Implementation Checklist

- [ ] Add environment variables to `.env`
- [ ] Get Google OAuth credentials
- [ ] Get GitHub OAuth credentials
- [ ] Get Resend API key
- [ ] Run `npm install`
- [ ] Start server: `npm start`
- [ ] Test signup with OTP
- [ ] Test Google login
- [ ] Test GitHub login
- [ ] Test forgot password
- [ ] Test login with new password

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Signup
```
Username: john_doe
Email: john@example.com
Role: User
Password: MyPassword123

Expected: OTP sent to email
```

### Scenario 2: Invalid Email
```
Email: notanemail

Expected: Email validation error
```

### Scenario 3: Duplicate Email
```
Email: existing@example.com (already registered)

Expected: "Email already registered" message
```

### Scenario 4: Expired OTP
```
Wait 11 minutes after OTP sent
Try to verify

Expected: "OTP has expired" message
```

### Scenario 5: Wrong OTP
```
Enter: 123456
Correct OTP: 789012

Expected: "Invalid OTP" message
```

---

## 🔧 OTP Utility Functions

```javascript
const { generateOTP, sendOTP, getOTPExpiry, verifyOTP, clearOTP } = require('./utils/otp');

// Generate new OTP
const otp = generateOTP();  // Returns: "123456"

// Send via email
const result = await sendOTP(email, otp, 'signup');
// type: 'signup' or 'reset'

// Get expiry time
const expiry = getOTPExpiry('signup');  // 10 minutes from now

// Verify OTP
const check = verifyOTP(userInput, storedOtp, expiryTime);
// Returns: { valid: true/false, message: "..." }

// Clear OTP after verification
clearOTP(userDoc, 'signup');  // type: 'signup' or 'reset'
```

---

## 📊 User Model Updates

### New Fields

```javascript
// OTP Management
otp: String                  // 6-digit code
otpExpiry: Date             // When it expires

// Password Reset
resetOtp: String            // Reset code
resetOtpExpiry: Date        // Reset code expiry

// OAuth
googleId: String            // Google user ID
githubId: String            // GitHub user ID
provider: String            // 'local', 'google', 'github'

// Metadata
isEmailVerified: Boolean     // Email status
profilePicture: String      // Avatar URL
createdAt: Date            // Account created
updatedAt: Date            // Last update
```

---

## 🎨 UI Components

### OAuth Buttons (Register & Login)
```html
<div class="oauth-buttons">
  <a href="/auth/google" class="oauth-btn google">
    <svg>...</svg> Google
  </a>
  <a href="/auth/github" class="oauth-btn github">
    <svg>...</svg> GitHub
  </a>
</div>
```

### Forgot Password Link (Login Page)
```html
<div class="forgot-password-link">
  <a href="/forgot-password">Forgot password?</a>
</div>
```

### OTP Input (Verification Page)
```html
<input type="text" name="otp" maxlength="6" pattern="[0-9]{6}">
```

### Password Reset Form (Reset Page)
```html
<input type="password" name="password" minlength="8">
<input type="password" name="confirmPassword">
```

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install passport-google-oauth20 passport-github2` |
| OTP not sending | Check RESEND_API_KEY and email address |
| Google login fails | Verify CLIENT_ID, CLIENT_SECRET, and callback URL |
| GitHub login fails | Check GITHUB_CLIENT_ID and callback URL |
| "Email already registered" | Use different email or reset password |
| OTP expired | Click "Resend OTP" to get new code |
| Passwords don't match | Check both password fields match exactly |

---

## 📱 Responsive Design

All authentication pages are fully responsive:
- ✅ Mobile phones
- ✅ Tablets
- ✅ Desktops
- ✅ Touch-friendly inputs
- ✅ Clear error messages

---

## 🔄 User Journey Map

```
New User
   ├─ Google OAuth → Auto signup → Logged in
   ├─ GitHub OAuth → Auto signup → Logged in
   └─ Email signup → OTP verify → Logged in

Returning User
   ├─ Google OAuth → Linked → Logged in
   ├─ GitHub OAuth → Linked → Logged in
   └─ Email + password → Logged in

Forgot Password
   ├─ Enter email
   ├─ Verify OTP
   ├─ Set new password
   └─ Login with new password
```

---

## 📚 File Locations

```
Local Business Finder/
├── models/User.js                 ← User schema
├── utils/otp.js                   ← OTP functions
├── views/
│   ├── register.ejs               ← Signup form
│   ├── login.ejs                  ← Login form
│   ├── verify-otp.ejs             ← OTP verification
│   ├── forgot-password.ejs        ← Password reset request
│   └── reset-password.ejs         ← New password input
├── app.js                         ← Routes & strategies
└── package.json                   ← Dependencies
```

---

## 🎯 Key Advantages

✨ **User Experience**
- One-click OAuth signup
- Simple email verification
- Straightforward password reset
- Mobile-optimized forms

🔐 **Security**
- No password reset links
- Email verification required
- Secure OTP-based flows
- Bcrypt password hashing

⚡ **Performance**
- OAuth instant login
- Lightweight OTP system
- Resend email service
- Database optimized

🛠️ **Developer Friendly**
- Clear code structure
- Comprehensive documentation
- Reusable OTP utilities
- Easy to extend

---

## ✅ Production Checklist

- [ ] All environment variables set
- [ ] OAuth apps configured
- [ ] HTTPS enabled
- [ ] Email service tested
- [ ] Error messages user-friendly
- [ ] Password requirements documented
- [ ] Backup OAuth credentials stored
- [ ] Monitoring for failed logins set up
- [ ] Email templates reviewed
- [ ] User privacy policy updated

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 19, 2025
