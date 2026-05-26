# Findify

A full-stack local business discovery platform. Users can find businesses near them, leave reviews, save favorites, and message vendors directly. Business owners can list their businesses, manage bookings, and track analytics.

I built this as a learning project to get hands-on with Node.js, Express, MongoDB, and third-party integrations (maps, payments, email). The idea was to build something that actually works end-to-end, not just a todo app.

Live at: [findify.live](https://findify.live)

## Why I Built This

I wanted to build something bigger than a CRUD tutorial. Most "beginner" projects stop at basic forms — I wanted to deal with real problems like:

- Authentication with email verification (not just username/password)
- OAuth (Google, GitHub) and how to merge accounts
- Geolocation and map-based search
- File uploads to cloud storage
- Payment integration
- Real-time messaging between users

It's not perfect, but it covers a lot of ground and I learned a ton building it.

## Features

**For users:**
- Search businesses by name or category
- Discover nearby businesses on a map (uses browser geolocation)
- Leave reviews with 1-5 star ratings
- Save businesses to favorites
- Direct messaging with business owners
- Premium membership via Razorpay

**For vendors (business owners):**
- List and manage business profiles
- Upload business images (stored on Cloudinary)
- Pin exact location on a Mapbox map
- View analytics dashboard
- Manage bookings
- Respond to customer messages

**For admins:**
- Approve/reject/suspend business listings
- View user and business tables
- Chatbot analytics dashboard
- Platform stats (users, revenue, growth)

**Auth:**
- Local signup with 6-digit OTP email verification
- Google and GitHub OAuth
- Forgot password flow with OTP
- Role-based access (user, vendor, admin)

## Tech Stack

| What | Tech |
|------|------|
| Backend | Node.js, Express 5 |
| Templating | EJS + ejs-mate |
| Database | MongoDB Atlas + Mongoose |
| Auth | Passport.js (local + Google + GitHub OAuth) |
| Maps | Mapbox GL JS |
| Image uploads | Cloudinary + Multer |
| Payments | Razorpay |
| Email | Resend |
| CSS | Bootstrap 5.3 + custom CSS (dark theme) |
| Icons | Font Awesome 6, Lucide |

Not using React or any frontend framework — it's all server-rendered EJS. Kept it simple on purpose.

## Folder Structure

```
├── app.js                  # Main server file (all routes live here)
├── middleware.js            # isLoggedIn, isOwner, isVendor, isAdmin
├── cloudconfig.js          # Cloudinary + Multer setup
├── mapbox.js               # Mapbox geocoding client
├── createAdmin.js          # One-time script to seed an admin user
├── models/
│   ├── User.js             # User schema (passport-local-mongoose)
│   ├── Business.js         # Business schema with GeoJSON
│   ├── Review.js           # Review schema (rating + comment)
│   ├── Conversation.js     # Messaging conversations
│   ├── Message.js          # Individual messages
│   ├── Booking.js          # Business bookings
│   ├── BusinessAnalytics.js
│   ├── ChatbotHistory.js
│   └── UserSearchHistory.js
├── views/
│   ├── layouts/
│   │   └── boilerplate.ejs # Main layout (navbar, footer, flash, scripts)
│   ├── index.ejs           # Homepage
│   ├── login.ejs
│   ├── register.ejs
│   ├── show.ejs            # Business detail page
│   ├── new.ejs             # Add business form (with map)
│   ├── edit.ejs
│   ├── discover.ejs        # Map-based discovery
│   ├── dashboard.ejs       # Vendor dashboard
│   ├── user-dashboard.ejs
│   ├── admin-dashboard.ejs
│   ├── business-dashboard.ejs
│   ├── messages.ejs        # Conversation list
│   ├── conversation.ejs    # Chat view
│   ├── chatbot.ejs         # Chatbot widget (included in layout)
│   └── ... (about, contact, premium, legal, etc.)
├── public/
│   ├── css/
│   │   ├── index.css       # Design system + global styles
│   │   ├── modern.css      # Page-specific styles
│   │   ├── interactive.css # Hover effects, animations
│   │   └── chatbot.css     # Chatbot widget styles
│   └── js/
│       ├── interactive.js  # Frontend interactivity
│       ├── chatbot.js      # Chatbot client logic
│       └── premium.js      # Razorpay payment flow
└── utils/
    └── otp.js              # OTP generation + email sending
```

Worth noting: `app.js` is a single ~2500 line file with all the routes. I know it should probably be split into route files — it grew organically and I haven't refactored it yet. The `routes/` folder exists but isn't really used.

## Installation

### Prerequisites
- Node.js v18+ (developed on v22.13.1)
- MongoDB Atlas account (or local MongoDB)
- Accounts on: Cloudinary, Mapbox, Resend, Razorpay (for payments)
- Optionally: Google Cloud Console and GitHub Developer settings (for OAuth)

### Setup

```bash
# Clone the repo
git clone https://github.com/aryaan022/Local-Business-Finder.git
cd "Local BuisnessFinder"

# Install dependencies
npm install

# Create .env file (see section below)
# Then run:
node app.js
```

App runs on `http://localhost:3000`.

If you want auto-reload during development, use nodemon:

```bash
npx nodemon app.js
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Session secret (any random string)
SECRET=some_random_session_secret

# Cloudinary (image uploads)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Mapbox (maps)
MAP_ACCESS_TOKEN=pk.your_mapbox_token

# Resend (email/OTP)
RESEND_API_KEY=re_your_resend_key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Razorpay (payments, optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# OpenAI (chatbot, optional)
CHATBOT=sk-proj-your_openai_key
```

The app will start without the OAuth and Razorpay keys, but those features won't work. Cloudinary, Mapbox, Resend, and MongoDB are required.

### Setting up OAuth callback URLs

If you're running locally, set these callback URLs:

- **Google**: `http://localhost:3000/auth/google/callback` (in Google Cloud Console → Credentials)
- **GitHub**: `http://localhost:3000/auth/github/callback` (in GitHub → Settings → Developer Settings → OAuth Apps)

### Creating an admin user

There's a one-time script for this:

```bash
# Edit createAdmin.js with your desired credentials first
node createAdmin.js
```

This creates a user with `role: "admin"` in the database.

## API Routes

### Auth
```
GET    /register              → Registration page
POST   /register              → Create account (sends OTP)
POST   /verify-otp            → Verify email OTP
POST   /resend-otp            → Resend verification OTP
GET    /login                 → Login page
POST   /login                 → Authenticate (local)
GET    /logout                → Destroy session
GET    /forgot-password       → Forgot password page
POST   /forgot-password       → Send reset OTP
POST   /reset-password        → Reset password with OTP
POST   /resend-reset-otp      → Resend reset OTP
GET    /auth/google           → Google OAuth redirect
GET    /auth/google/callback  → Google OAuth callback
GET    /auth/github           → GitHub OAuth redirect
GET    /auth/github/callback  → GitHub OAuth callback
```

### Businesses
```
GET    /                      → Homepage (featured + top rated)
GET    /search?query=&category= → Search businesses
GET    /discover?lat=&lng=    → Nearby businesses (map view)
GET    /show/:id              → Business detail page
GET    /new                   → New business form (vendor only)
POST   /new                   → Create business (multipart form)
POST   /edit/:id              → Get edit form (owner only)
PUT    /edit/:id              → Update business (owner only)
DELETE /delete/:id            → Delete business (owner only)
```

### Reviews
```
POST   /show/:id/reviews                → Create review
GET    /show/:id/reviews/:reviewId/edit  → Edit review form
POST   /show/:id/reviews/:reviewId/edit  → Update review
```

### User
```
GET    /dashboard             → Role-based dashboard redirect
POST   /favorite/:id          → Add to favorites
POST   /favorites/remove/:id  → Remove from favorites
```

### Messaging
```
GET    /messages                        → All conversations
GET    /messages/start/:vendorId        → Start new conversation
POST   /messages/start/:vendorId        → Create conversation
GET    /messages/:conversationId        → View conversation
POST   /messages/:conversationId/send   → Send message
DELETE /messages/:conversationId/delete/:messageId → Delete message
PATCH  /messages/:conversationId/block  → Block user
GET    /api/messages/unread-count       → Unread count (JSON)
```

### Admin (requires admin role)
```
GET    /admin/dashboard                        → Admin panel
PATCH  /admin/businesses/:id/approve           → Approve listing
DELETE /admin/businesses/:id/reject            → Reject listing
PATCH  /admin/businesses/:id/suspend           → Suspend listing
PATCH  /admin/businesses/:id/reactivate        → Reactivate listing
DELETE /admin/businesses/:id                   → Delete listing
```

### Payments
```
GET    /premium               → Premium page
POST   /create-order          → Create Razorpay order
POST   /verify-payment        → Verify payment callback
```

### Other
```
GET    /aboutus               → About page
GET    /contact               → Contact page
POST   /contact               → Submit contact form
GET    /privacy               → Privacy policy
GET    /terms                 → Terms of service
POST   /chatbot               → Chatbot query
GET    /api/chatbot/analytics  → Chatbot stats (JSON)
```

## Screenshots

*Coming soon — will add screenshots of the main pages here.*

<!-- Uncomment and add paths when you have screenshots:
### Homepage
![Homepage](screenshots/homepage.png)

### Business Detail
![Business Detail](screenshots/show.png)

### Discover Map
![Discover](screenshots/discover.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)
-->

## Deployment

The app is currently deployed on a VPS. Basic steps:

```bash
# On your server
git clone https://github.com/aryaan022/Local-Business-Finder.git
cd "Local BuisnessFinder"
npm install

# Set up .env with production values
# Make sure to update OAuth callback URLs to your domain

# Run with pm2 (keeps it alive)
npm install -g pm2
pm2 start app.js --name findify

# Or just run directly
NODE_ENV=production node app.js
```

For HTTPS, put Nginx in front of it as a reverse proxy. The app itself doesn't handle SSL.

### Docker

No Dockerfile yet. It's on the todo list. The app is straightforward enough to containerize — it's just a Node.js server with a MongoDB connection string.

## Known Limitations

- **`app.js` is huge.** All routes are in one file (~2500 lines). Should be split into separate route modules, but it works for now.
- **No tests.** No unit tests or integration tests. I relied on manual testing.
- **Sessions stored in MongoDB.** Fine for low traffic, but for scale you'd want Redis.
- **Chatbot uses in-memory analytics.** The chatbot stats reset when the server restarts. Should be persisted to the database.
- **No pagination.** Business lists and reviews load all at once. Would need cursor-based pagination for lots of data.
- **Messages aren't real-time.** The chat polls every 3 seconds via page refresh. WebSockets would be better.
- **Image uploads are single-file only.** One image per business — no gallery support yet.
- **No input sanitization on reviews.** Should probably sanitize HTML to prevent XSS.

## Future Improvements

- [ ] Split `app.js` into proper route modules
- [ ] Add WebSocket support for real-time messaging
- [ ] Add image gallery for businesses (multiple photos)
- [ ] Pagination on search results and review lists
- [ ] Add Dockerfile and docker-compose
- [ ] Write tests (at least for auth and business CRUD)
- [ ] Email notifications for new reviews and messages
- [ ] Business hours editing (currently locked/coming soon)
- [ ] Search radius filter on discover page
- [ ] Rate limiting on public endpoints

## Contributing

If you want to contribute, fork the repo and submit a PR. Keep changes focused — one feature or fix per PR. No strict style guide, just try to match the existing code.

## License

MIT — do whatever you want with it.

## Contact

**Aryan** — [@aryaan022](https://github.com/aryaan022)

If something's broken, open an issue. I'll try to get to it.