<div align="center">

# 🎯 Findify - Local Business Discovery Platform

### Discover Local Businesses • Connect with Communities • Support Local Economy

[![Node.js](https://img.shields.io/badge/Node.js-v22.13.1-green?style=for-the-badge)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge)](https://www.mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-Latest-black?style=for-the-badge)](https://expressjs.com)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:667eea,100:764ba2&height=200&section=header&text=Findify&fontSize=80&fontColor=fff&animation=fadeIn&fontAlignY=35" alt="Findify Banner" width="100%" />

</div>

---

## 📑 Table of Contents

- [About](#about-findify)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Authentication System](#-authentication-system)
- [API Routes](#-api-routes)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [UI/UX Improvements](#-uiux-improvements)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## About Findify

**Findify** is a comprehensive full-stack web application that bridges the gap between consumers and local businesses. The platform enables users to discover, review, and connect with businesses in their area, while providing business owners with tools to manage their presence and engage with customers.

### 🎯 Mission
To empower local economies by creating a transparent, community-driven marketplace where businesses can thrive and customers can discover authentic local experiences.

### ✅ Current Status
- **Production Ready**: Full authentication system with OTP verification
- **Features Complete**: Reviews, ratings, messaging, premium accounts
- **Performance Optimized**: Smooth animations, responsive design
- **Security Enhanced**: Multi-provider OAuth, secure password reset

---

## ✨ Key Features

### 👥 User Features
- **📍 Location-Based Discovery**
  - Find nearby businesses using geolocation
  - Interactive Mapbox integration
  - Distance-based filtering and sorting
  - Real-time location validation

- **⭐ Review & Rating System**
  - Leave detailed reviews with 1-5 star ratings
  - View average ratings and review counts
  - Edit or delete personal reviews
  - See review history and timestamps

- **❤️ Favorites Management**
  - Save favorite businesses
  - Quick access to saved businesses
  - Persistent storage across sessions
  - Favorites count and management

- **🔍 Advanced Search**
  - Search by business name or keywords
  - Filter by category, rating, distance
  - Real-time search results
  - Category-based browsing with sorting

- **💬 Messaging System**
  - Direct messaging with businesses
  - Real-time message notifications
  - Message history and persistence
  - Unread message counter

- **📱 Responsive Design**
  - Mobile-first approach
  - Works seamlessly on all devices
  - Touch-friendly interface
  - Fast loading times with optimizations

### 🏢 Business Owner Features
- **🏪 Business Profile Management**
  - Create comprehensive business listings
  - Upload and manage business images
  - Edit business information in real-time
  - Manage business hours and details

- **📊 Analytics Dashboard**
  - View profile statistics and traffic
  - Track customer reviews and ratings
  - Monitor message conversations
  - Performance metrics and insights

- **👁️ Premium Features**
  - Featured business placement
  - Premium badge on listings
  - Higher search visibility
  - Featured carousel placement
  - Enhanced customer reach

- **💼 Business Operations**
  - Respond to customer messages
  - Track and manage reviews
  - Update business information
  - Manage business images and gallery

### 🔐 Advanced Security
- **Email Verification (OTP)**
  - 6-digit OTP sent to email
  - 10-minute expiry window
  - Resend OTP functionality
  - Email validation on registration

- **Multi-Provider Authentication**
  - Local email/password authentication
  - Google OAuth integration
  - GitHub OAuth integration
  - Account linking and management

- **Secure Password Management**
  - Bcrypt password hashing
  - Forgot password with OTP verification
  - Password reset confirmation
  - Secure session management
  - Passport.js session handling

---

## 🛠️ Tech Stack

<div align="center">

### Backend Stack
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### Frontend Stack
![EJS](https://img.shields.io/badge/EJS-8BC0D0?style=for-the-badge&logo=ejs&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### Services & APIs
![Mapbox](https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-FFCA28?style=for-the-badge&logo=cloudinary&logoColor=black)
![Passport](https://img.shields.io/badge/Passport.js-34E27A?style=for-the-badge&logo=passport&logoColor=black)
![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge)

</div>

### Detailed Technology Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | v22.13.1 | JavaScript server environment |
| **Framework** | Express.js | Latest | Web application framework |
| **Database** | MongoDB | Atlas | NoSQL document database |
| **ODM** | Mongoose | Latest | MongoDB object mapping |
| **Auth** | Passport.js | Latest | Authentication middleware |
| **OAuth Providers** | Google + GitHub | Latest | Multi-provider authentication |
| **Templating** | EJS + ejs-mate | Latest | Server-side rendering |
| **CSS Framework** | Bootstrap | v5.3.7 | Responsive UI framework |
| **Icons** | Lucide Icons | Latest | Modern icon library |
| **Maps** | Mapbox GL | v3.14.0 | Interactive mapping service |
| **Image Storage** | Cloudinary | Latest | Cloud image management |
| **Email Service** | Resend | Latest | Transactional emails |
| **Payments** | Razorpay | Latest | Payment processing |
| **Password Hash** | Bcrypt | Latest | Secure password hashing |
| **Crypto** | Node.js crypto | Built-in | OTP generation |

---

## 📁 Project Structure

```
Local Business Finder/
│
├── 📄 app.js                          # Main Express application (2377 lines)
├── 📄 cloudconfig.js                  # Cloudinary configuration
├── 📄 createAdmin.js                  # Admin creation utility
├── 📄 mapbox.js                       # Mapbox integration
├── 📄 middleware.js                   # Custom middleware functions
├── 📄 package.json                    # Project dependencies
├── 📖 README.md                       # Complete documentation
│
├── 📂 models/                         # Mongoose Data Models
│   ├── Business.js                    # Business schema with GeoJSON
│   ├── User.js                        # User schema with OAuth fields
│   └── Review.js                      # Review schema with ratings
│
├── 📂 routes/                         # Express Route Handlers
│   ├── auth.js                        # Authentication routes
│   └── business.js                    # Business CRUD routes
│
├── 📂 views/                          # EJS Templates (Server-side)
│   ├── layouts/
│   │   └── boilerplate.ejs            # Main layout template
│   ├── index.ejs                      # Home page with featured businesses
│   ├── discover.ejs                   # Business discovery page
│   ├── show.ejs                       # Business details page
│   ├── edit.ejs                       # Edit business page
│   ├── new.ejs                        # Create business page
│   ├── about.ejs                      # About page
│   ├── contact.ejs                    # Contact page
│   ├── login.ejs                      # Login page with OAuth
│   ├── register.ejs                   # Registration page with OAuth
│   ├── verify-otp.ejs                 # OTP verification form
│   ├── forgot-password.ejs            # Forgot password form
│   ├── reset-password.ejs             # Reset password form
│   ├── dashboard.ejs                  # Admin dashboard
│   ├── user-dashboard.ejs             # User profile dashboard
│   ├── admin-dashboard.ejs            # Admin management panel
│   ├── Premium.ejs                    # Premium features page
│   ├── Privacy.ejs                    # Privacy policy
│   ├── Terms.ejs                      # Terms of service
│   ├── error.ejs                      # Error page
│   ├── chatbot.ejs                    # Chatbot interface
│   ├── chatbot-analytics.ejs          # Chatbot analytics
│   └── edit-review.ejs                # Edit review form
│
├── 📂 public/                         # Static Assets
│   ├── css/
│   │   ├── index.css                  # Main styles + animations
│   │   └── chatbot.css                # Chatbot styling
│   ├── js/
│   │   ├── chatbot.js                 # Chatbot functionality
│   │   └── premium.js                 # Premium features logic
│   ├── Images/                        # Static images
│   └── sitemap.xml                    # XML sitemap for SEO
│
└── 📂 utils/                          # Utility Functions
    └── otp.js                         # OTP generation + email
```

---

## 🏗️ System Architecture

### Overall Architecture Flow

```
┌──────────────────────────────────────────────────────┐
│                   CLIENT LAYER                        │
│    ┌─────────────┐  ┌──────────┐  ┌──────────┐      │
│    │ EJS HTML    │  │Bootstrap │  │JavaScript│      │
│    │ Templates   │  │CSS + Anim│  │Interactivity│  │
│    └─────────────┘  └──────────┘  └──────────┘      │
└──────────────┬──────────────────────────────────────┘
               │ HTTP/HTTPS
┌──────────────▼──────────────────────────────────────┐
│              EXPRESS.JS SERVER                       │
├──────────────────────────────────────────────────────┤
│ Routes Layer                                         │
│  ├─ /auth/* (Authentication)                        │
│  ├─ /business/* (Business Operations)               │
│  ├─ /messages/* (Messaging)                         │
│  └─ /search (Discovery)                             │
├──────────────────────────────────────────────────────┤
│ Middleware Stack                                     │
│  ├─ Express.json (Body Parsing)                     │
│  ├─ Passport.js (Authentication)                    │
│  ├─ Express-session (Sessions)                      │
│  └─ Custom Middleware (Validation)                  │
├──────────────────────────────────────────────────────┤
│ Business Logic                                       │
│  ├─ User Management                                 │
│  ├─ Business Operations                             │
│  ├─ Review System                                   │
│  └─ Messaging                                       │
└──────┬────┬──────┬──────┬──────┬─────────────────────┘
       │    │      │      │      │
   ┌───▼──┐│ ┌─────▼─┐┌───▼──┐┌─▼───┐
   │MongoDB││ │Mapbox ││Resend││Razor│
   │(Data) ││ │(Maps) ││(Email││pay  │
   └───────┘│ │      ││      ││     │
           └─▼──────┘└──────┘└─────┘
```

### Authentication Flow Diagram

```
User Registration/Login Request
        │
        ├─ Option 1: Local (Email/Password)
        │   ├─ Register → OTP Email → Verify → Account Created
        │   ├─ Login → Validate Credentials → Session Created
        │   └─ Forgot Password → OTP Email → Reset → New Password
        │
        ├─ Option 2: Google OAuth
        │   ├─ Redirect to Google → User Approves → Get Auth Code
        │   ├─ Exchange Code for Profile → Create/Update User
        │   └─ Session Created
        │
        └─ Option 3: GitHub OAuth
            ├─ Redirect to GitHub → User Approves → Get Auth Code
            ├─ Exchange Code for Profile → Create/Update User
            └─ Session Created
                │
                ▼
            Passport.js Validation
                │
                ▼
            MongoDB User Document
                │
                ▼
            Express-session Created
                │
                ▼
            User Authenticated ✓
```

---

## 💾 Database Schema

### User Model (Authentication & Profile)
```javascript
{
  // Basic Information
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed with bcrypt),
  role: String (enum: ['user', 'admin'], default: 'user'),
  
  // Email Verification (OTP)
  otp: String (6-digit code),
  otpExpiry: Date (10-minute window),
  isEmailVerified: Boolean (email confirmation status),
  
  // Password Reset (OTP)
  resetOtp: String (6-digit code),
  resetOtpExpiry: Date (15-minute window),
  
  // OAuth Providers
  googleId: String (Google OAuth unique ID),
  githubId: String (GitHub OAuth unique ID),
  provider: String (enum: ['local', 'google', 'github']),
  
  // Profile Information
  profilePicture: String (URL from OAuth or upload),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Business Model (Listings)
```javascript
{
  // Basic Information
  Name: String (business name),
  Category: String (category filter),
  description: String (business description),
  address: String (full address),
  
  // Location (GeoJSON for Mapbox)
  location: {
    type: Point,
    coordinates: [longitude, latitude]
  },
  
  // Contact Information
  contactNumber: String,
  email: String,
  website: String (optional),
  
  // Images & Media
  Image: {
    public_id: String (Cloudinary ID),
    url: String (Cloudinary URL)
  },
  
  // Ratings & Reviews
  avgRating: Number (average of all reviews),
  reviewCount: Number (total reviews),
  
  // Relationships
  Owner: ObjectId (Reference to User),
  reviews: [ObjectId] (Reference to Reviews),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model (User Reviews)
```javascript
{
  // Review Content
  content: String (review text),
  rating: Number (1-5 star rating),
  
  // References
  author: ObjectId (User who wrote review),
  business: ObjectId (Business being reviewed),
  
  // Metadata
  helpfulCount: Number (helpful votes),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication System

### Email Verification (OTP-Based)

**Registration Flow:**
1. User submits registration form (username, email, password, role)
2. System generates 6-digit OTP and sends via Resend email service
3. User receives email with OTP code
4. User enters OTP on verification page
5. System validates OTP and expiry (10 minutes)
6. Account activated and user redirected to login

**Key Features:**
- 10-minute OTP expiry window
- Resend OTP functionality if needed
- Email validation before account creation
- Prevents spam registrations
- Secure Bcrypt password hashing

### OAuth Integration

#### Google OAuth
- **Configuration**: Google Cloud Console
- **Callback URL**: `http://localhost:3000/auth/google/callback`
- **Scopes**: profile, email
- **Auto-Filled Data**: Name, Email, Profile Picture
- **Account Linking**: Automatic email verification

#### GitHub OAuth
- **Configuration**: GitHub Developer Settings
- **Callback URL**: `http://localhost:3000/auth/github/callback`
- **Scopes**: user:email
- **Auto-Filled Data**: Username, Email, Avatar
- **Account Linking**: Automatic email verification

### Forgot Password (OTP-Based)

**Reset Flow:**
1. User clicks "Forgot Password" on login page
2. Enters registered email address
3. System generates 6-digit reset OTP
4. OTP sent via email (15-minute expiry)
5. User enters OTP and new password
6. System validates OTP and password strength
7. Password updated securely
8. User can login with new password

**Security Features:**
- 15-minute OTP expiry
- Resend reset OTP functionality
- Password strength validation
- No direct email links (OTP-based)
- Secure password hashing

---

## 🌐 API Routes

### Authentication Routes (`/auth`)
```
POST   /register                - Register new user with email
POST   /verify-otp              - Verify email with OTP code
POST   /resend-otp              - Resend OTP to email
GET    /login                   - Display login page
POST   /login                   - Local email/password login
GET    /logout                  - Logout and destroy session
GET    /forgot-password         - Display forgot password form
POST   /forgot-password         - Send reset OTP to email
POST   /reset-password          - Reset password with OTP
POST   /resend-reset-otp        - Resend reset OTP
GET    /auth/google             - Redirect to Google OAuth
GET    /auth/google/callback    - Google OAuth callback handler
GET    /auth/github             - Redirect to GitHub OAuth
GET    /auth/github/callback    - GitHub OAuth callback handler
```

### Business Routes (`/business`)
```
GET    /                        - Home page with featured businesses
GET    /discover                - Browse all businesses
GET    /show/:id                - View business details
GET    /new                     - Create business form
POST   /create-business         - Create new business listing
GET    /edit/:id                - Edit business form
PUT    /update/:id              - Update business information
DELETE /delete/:id              - Delete business listing
GET    /search                  - Search businesses by query
GET    /business/:id            - Business details page
```

### Review Routes
```
POST   /business/:id/reviews    - Create review for business
PUT    /reviews/:id             - Edit review
DELETE /reviews/:id             - Delete review
GET    /reviews/:id             - View review details
```

### User Routes
```
GET    /dashboard               - User dashboard
GET    /profile                 - User profile page
PUT    /profile/update          - Update user profile
GET    /favorites               - View saved businesses
POST   /favorites/:id           - Save business to favorites
DELETE /favorites/:id           - Remove from favorites
```

### Messaging Routes
```
GET    /messages                - View all message threads
GET    /messages/:id            - View specific conversation
POST   /messages/:id/send       - Send message to business
GET    /unread-count            - Get unread message count
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/findify_db

# ==========================================
# AUTHENTICATION - GOOGLE OAUTH
# ==========================================
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ==========================================
# AUTHENTICATION - GITHUB OAUTH
# ==========================================
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# ==========================================
# EMAIL SERVICE (RESEND)
# ==========================================
RESEND_API_KEY=re_your_resend_api_key_here

# ==========================================
# IMAGE STORAGE (CLOUDINARY)
# ==========================================
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# ==========================================
# MAPS & GEOLOCATION (MAPBOX)
# ==========================================
MAP_ACCESS_TOKEN=pk.your_mapbox_access_token_here

# ==========================================
# PAYMENT PROCESSING (RAZORPAY) - OPTIONAL
# ==========================================
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# ==========================================
# CHATBOT (OPENAI) - OPTIONAL
# ==========================================
CHATBOT=sk-proj-your_openai_api_key_here
```

---

## 🎨 UI/UX Improvements

### Enhanced Business Cards
- **Hover Effects**: Cards lift with smooth Y-axis translation
- **Image Animation**: 10% zoom with shimmer effect on hover
- **Icon Animation**: Color change to brand purple (#667eea)
- **Text Transitions**: Smooth fade-in animations
- **Shadow Depth**: Multi-layered shadows for 3D effect

### Improved Search Bar
- **Glass-morphism**: Modern backdrop blur effect
- **Focus States**: Purple glow on input focus
- **Button Animation**: Shine sweep effect on hover
- **Responsive Layout**: Stacks on mobile
- **Smooth Transitions**: Cubic-bezier easing

### Advanced Animations
- **Cubic-bezier Easing**: Natural, smooth motion curves
- **Page Load**: Fade-in transition on page entry
- **Icon Pulse**: Subtle scale animation
- **Button Ripple**: Click feedback effect
- **60 FPS Performance**: GPU-accelerated transforms

### Responsive Design
- **Mobile Optimization**: Touch-friendly sizes
- **Adaptive Cards**: Reduced hover effects on mobile
- **Flexible Layout**: Works on all screen sizes
- **Image Optimization**: Responsive image scaling
- **Performance**: Optimized for slow networks

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v22.13.1 or higher
- npm (comes with Node.js)
- MongoDB Atlas account (or local MongoDB)
- Git for version control

### Step 1: Clone Repository
```bash
git clone https://github.com/aryaan022/Local-Business-Finder.git
cd "Local Business Finder"
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
# Create .env file in root directory
cp .env.example .env
```

### Step 4: Configure Environment Variables
Edit `.env` with your credentials (see [Environment Configuration](#-environment-configuration) above)

### Step 5: Obtain API Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID & Secret to `.env`

**GitHub OAuth:**
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID & Secret to `.env`

**Resend Email:**
1. Sign up at [Resend.com](https://resend.com)
2. Verify domain
3. Generate API key
4. Add to `.env`

**Mapbox:**
1. Create account at [Mapbox](https://www.mapbox.com)
2. Get access token from dashboard
3. Add to `.env`

**Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get API credentials
3. Add to `.env`

### Step 6: Run Application
```bash
# Development with Nodemon (auto-reload)
nodemon app.js

# Or directly with Node
node app.js

# Application available at http://localhost:3000
```

---

## 🎯 UI/UX Features Implemented

### Professional Animations
✅ Smooth hover effects on cards  
✅ Image zoom and shimmer on hover  
✅ Button shine animation  
✅ Icon pulse effects  
✅ Page load fade-in  
✅ Cubic-bezier easing  
✅ GPU-accelerated animations  

### Responsive Design
✅ Mobile-first approach  
✅ Touch-friendly interface  
✅ Adaptive card scaling  
✅ Flexible grid layouts  
✅ Optimized images  

### User Feedback
✅ Focus states with glow effect  
✅ Hover state changes  
✅ Button ripple effect  
✅ Loading animations  
✅ Smooth transitions  

---

## 🚀 Deployment

### Development Start
```bash
nodemon app.js
```

### Production Build
```bash
NODE_ENV=production node app.js
```

### Hosting Options
- **Heroku**: Simple Git push deployment
- **DigitalOcean**: VPS with Node.js
- **AWS**: EC2 instances with load balancing
- **Vercel**: Serverless functions
- **Railway**: Modern deployment platform

---

## 📝 Contributing

### How to Contribute
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- Follow existing code style
- Add meaningful comments
- Test new features
- Update documentation
- Use descriptive commit messages

---

## 📄 License

MIT License - See LICENSE file for details.

Permission is granted to use, modify, and distribute this software freely.

---

## 📧 Contact & Support

**Developer**: Aryaan  
**GitHub**: [@aryaan022](https://github.com/aryaan022)  
**Project**: Local Business Finder  

For issues and feature requests: [GitHub Issues](https://github.com/aryaan022/Local-Business-Finder/issues)

---

<div align="center">

### Made with ❤️ for Local Communities

⭐ If this project helped you, please give it a star!

**Last Updated**: December 19, 2025  
**Version**: 2.0 (Production Ready)

</div>