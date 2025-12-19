if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const geocodingClient = require("./mapbox"); // we made this file earlier
const express = require("express");
const app = express();
const MongoStore = require('connect-mongo');
const path = require("path");
const ejs = require("ejs");
const axios = require('axios');
const mongoose = require("mongoose");
const { Resend } = require('resend');
const Business = require("./models/Business");
const user = require("./models/User");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const MethodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const multer = require("multer");
const Review = require("./models/Review");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const { storage, cloudinary } = require("./cloudconfig");
const upload = multer({ storage });
const { isLoggedIn, isOwner, isVendor, isAdmin } = require("./middleware");


const Razorpay = require("razorpay")
const crypto = require("crypto")

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const dbUrl = process.env.DB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(MethodOverride("_method"));
app.use(express.json());
app.engine("ejs", ejsMate);

app.use(flash());
app.use(
  session({
    secret: "YourScevretKEy",
    resave: false,
    saveUninitialized: true,
     store: MongoStore.create({
      mongoUrl: process.env.DB_URL,   // Use your actual connection string
      touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days 24hours 60 min 60 sec 1000 millisecond
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser()); //user ki info session me save kraneka mtlb hai serialized user and unstore krane ka mtlb hai deserialized user.
passport.deserializeUser(user.deserializeUser());

//local storage
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

//home route
app.get("/", async (req, res) => {
    const business = await Business.find({ status: 'active' }).lean();

     const featuredBusinesses = await Business.aggregate([
        { $match: { status: "active" } },
        { $sample: { size: 6 } } // pick 6 random
    ]);

     await Business.populate(featuredBusinesses, { path: "Owner", select: "username premiumExpiresAt" });


    // NEW: Fetch the top 6 businesses based on rating and review count
     const topRatedBusinesses = await Business.find({ status: 'active' })
        .sort({ avgRating: -1, reviewCount: -1 })
        .limit(6)
        .populate("Owner", "username premiumExpiresAt")
        .lean();

    res.render("index.ejs", { 
        business, 
        featuredBusinesses, //featured businesses data to the template
        topRatedBusinesses, //top-rated businesses data to the template
        query: undefined ,
        user: req.user // Pass the user object to the template
    });
});

//regiter route
app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

//register route
app.post("/register", async (req, res, next) => {
  try {
    let { username, email, role, password } = req.body;
    
    //SECURITY: Prevent users from making themselves admins ++
    if (role === 'admin') {
      role = 'user'; // Default them to 'user' if they try to select 'admin'
    }

    let newuser = new user({ email, username, role });
    const registeredUser = await user.register(newuser, password);
    // ... rest of the code remains the same
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      } else {
        req.flash("success", "Welcome to Local Business Finder!");
        res.redirect("/");
      }
    });
  } catch (e) {
    req.flash("error", e.message); // Also a good idea to flash the actual error
    res.redirect("/register");
  }
});

//login route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username}!`);
    res.redirect("/"); // or vendor dashboard
  }
);
//logout

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/");
  });
});

//search route
app.get("/search", async (req, res) => {
  try {
    const { query, category } = req.query;
    let filter = {};
    
    filter.status = 'active'; // Only show active businesses

    // Enhanced search: search both Name and Category
    if (query && query.trim() !== "") {
      filter.$or = [
        { Name: new RegExp(query.trim(), "i") },
        { Category: new RegExp(query.trim(), "i") }
      ];
    }
    
    if (category && category !== "") {
      filter.Category = category;
    }
n
    let business = await Business.find(filter).populate('Owner', 'username');
    
    // Get featured and top-rated businesses for the homepage sections
    const featuredBusinesses = await Business.find({ status: 'active' })
      .populate('Owner', 'username')
      .sort({ createdAt: -1 })
      .limit(6);
    
    const topRatedBusinesses = await Business.find({ 
      status: 'active',
      avgRating: { $gte: 4.0 }
    })
      .populate('Owner', 'username')
      .sort({ avgRating: -1 })
      .limit(6);

    res.render("index.ejs", { 
      business, 
      query, 
      category, 
      featuredBusinesses,
      topRatedBusinesses,
      searchResults: business.length > 0
    });
  } catch (error) {
    console.error("Search error:", error);
    req.flash('error', 'Search failed. Please try again.');
    res.redirect('/');
  }
});

//dashboard route (supports Vendor, User, and Admin roles)
app.get("/dashboard", isLoggedIn, async (req, res) => {
  const authUser = req.user;
  const role = (authUser.role || "").toLowerCase();

  if (role === "admin") {
    // Redirect admin to admin dashboard
    return res.redirect("/admin/dashboard");
  }

  const favUser = await user.findById(authUser._id).populate("favorites");
  const Reviewcount = await Review.countDocuments({ author: authUser._id });
  // THE FIX: Use .find() and the correct field name 'author'
const UserReview = await Review.find({ author: authUser._id })
    .sort({ createdAt: -1 })
    .limit(2)
    .populate("business");

  if (role === "vendor") {
    const business = await Business.find({ Owner: authUser._id });
    return res.render("dashboard.ejs", { user: authUser, business });
  }

  if (role === "user") {
    const businesses = await Business.find();
    return res.render("user-dashboard.ejs", { user: authUser, businesses, favUser, UserReview,Reviewcount });
  }

  req.flash("error", "Your account role is not recognized for dashboard access.");
  res.redirect("/");
});

//about us route
app.get("/aboutus", (req, res) => {
  res.render("about.ejs");
});


//new form get request
app.get("/new", isLoggedIn, isVendor, (req, res) => {
  res.render("new.ejs", { 
    mapboxToken: process.env.MAP_ACCESS_TOKEN 
  });
});


//new form post request
app.post(
  "/new",
  isLoggedIn,
  isVendor,
  upload.single("image"),
  async (req, res) => {
    try {
      let { Name, Category, description, Contact, address, latitude, longitude } = req.body;
      let image = { url: req.file.path, filename: req.file.filename };

      // Validate that coordinates are provided
      if (!latitude || !longitude) {
        req.flash("error", "Please select exact location on the map before submitting.");
        return res.redirect("/new");
      }

      // Parse coordinates as numbers
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validate coordinates are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        req.flash("error", "Invalid coordinates. Please select location again.");
        return res.redirect("/new");
      }

      // Validate latitude and longitude ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        req.flash("error", "Invalid coordinates. Please select location again.");
        return res.redirect("/new");
      }

      // Optional: Use reverse geocoding to get full address if not filled
      let finalAddress = address;
      if (!address || address.trim().length === 0) {
        try {
          const geocodeData = await geocodingClient
            .reverseGeocode({
              query: [lng, lat], // [longitude, latitude]
            })
            .send();

          if (geocodeData.body.features && geocodeData.body.features.length > 0) {
            finalAddress = geocodeData.body.features[0].place_name;
          } else {
            finalAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
        } catch (error) {
          console.log("Reverse geocoding failed, using coordinates as address");
          finalAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
      }

      let business = new Business({
        Name,
        Owner: req.user._id,
        Category,
        description,
        Contact,
        address: finalAddress,
        Image: image,
        geometry: {
          type: "Point",
          coordinates: [lng, lat], // GeoJSON format is [longitude, latitude]
        },
      });

      await business.save();
      req.flash("success", "Business registered successfully with exact location!");
      res.redirect("/");
    } catch (error) {
      console.error("Error creating business:", error);
      req.flash("error", "Error registering business. Please try again.");
      res.redirect("/new");
    }
  }
);

//discover page route (find nearby businesses on this page)
app.get("/discover", async (req, res) => {
  const { lat, lng } = req.query;
  let businesses = [];

  if (lat && lng) {
    // Find nearby businesses within 10 km
    businesses = await Business.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
          },
          $maxDistance: 10000, // 10km radius
        },
      },

      status : 'active'
    });
    
    // Debug logging
    console.log(`Found ${businesses.length} businesses near ${lat}, ${lng}`);
    businesses.forEach((business, index) => {
      console.log(`Business ${index + 1}: ${business.Name}`);
      console.log(`  - Has geometry: ${!!business.geometry}`);
      console.log(`  - Coordinates: ${business.geometry ? business.geometry.coordinates : 'N/A'}`);
      console.log(`  - Status: ${business.status}`);
    });
  }

  res.render("discover.ejs", {
    businesses,
    mapboxToken: process.env.MAP_ACCESS_TOKEN,
  });
});



//delete route
app.delete("/delete/:id", isLoggedIn, isOwner, async (req, res) => {
  try {
    let { id } = req.params;
    let business = await Business.findById(id).populate(reviews);
    if (business.Image && business.Image.filename) {
      for (let img of business.Image.filename) {
        await cloudinary.uploader.destroy(img);
      }
    }
    await Review.deleteMany({ _id: { $in: business.reviews } }); // if a business is deleted all the reviews related to that business will get deleted
    let deletedBusiness = await Business.findByIdAndDelete(id);
    console.log(deletedBusiness);
    res.redirect("/");
  } catch (err) {
    req.flash("error", "Something went wrong while deleting the business.");
    console.log(err);
    res.redirect("/");
  }
});



//edit route
app.post("/edit/:id", isLoggedIn, isOwner, async (req, res) => {
  let { id } = req.params;
  let business = await Business.findById(id);
  res.render("edit.ejs", { business });
});

//contact route
app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});



// contact form submission
app.post("/contact", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;
        
        // Initialize Resend with your API key from the .env file
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send the email using the data from the form
        const { data, error } = await resend.emails.send({
            from: 'no-reply@findify.live', // Use your verified domain here
            to: 'aryankhokhar022@gmail.com',   // <<< CHANGE THIS to your personal email
            subject: `New Findify Contact: ${subject}`,
            reply_to: email, // Sets the "reply" button in your email client to the user's email
            html: `
                <h2>New Message from Findify.live Contact Form</h2>
                <hr>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <br>
                <h3>Message:</h3>
                <p>${message}</p>
            `
        });

        // Handle potential errors from the email service
        if (error) {
            console.error({ error });
            req.flash("error", "Sorry, there was an error sending your message. Please try again.");
            return res.redirect("/contact");
        }

        req.flash("success", "Your message has been sent successfully! We'll be in touch soon.");
        res.redirect("/contact");

    } catch (err) {
        console.error("Error in /contact route:", err);
        req.flash("error", "An error occurred. Please try again.");
        res.redirect("/contact");
    }
});


// -------------------- Enhanced Professional Chatbot backend --------------------
// Advanced in-memory rate limiter per IP (resets every minute)
const chatRateLimit = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // Increased limit
  const entry = chatRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    chatRateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  if (entry.count > maxRequests) return true;
  return false;
}

// Clean up old rate limit entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of chatRateLimit.entries()) {
    if (now > entry.resetAt) {
      chatRateLimit.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// -------------------- Real-time Chatbot Analytics --------------------
// In-memory analytics storage (in production, use Redis or database)
const chatbotAnalytics = {
  totalQueries: 0,
  queriesLastHour: 0,
  queriesLastMinute: 0,
  successfulSearches: 0,
  aiFallbacks: 0,
  quickReplies: 0,
  businessResults: 0,
  uniqueUsers: new Set(),
  queriesByHour: new Array(24).fill(0),
  popularQueries: new Map(), // query -> count
  responseTypes: {
    quickReply: 0,
    businessSearch: 0,
    aiGenerated: 0,
    fallback: 0
  },
  sentiment: {
    positive: 0,
    neutral: 0,
    negative: 0
  },
  startTime: Date.now(),
  lastQueryTime: null,
  averageResponseTime: 0,
  responseTimes: []
};

// Reset hourly stats every hour
setInterval(() => {
  chatbotAnalytics.queriesLastHour = 0;
  chatbotAnalytics.queriesLastMinute = 0;
}, 60 * 60 * 1000);

// Reset minute stats every minute
setInterval(() => {
  chatbotAnalytics.queriesLastMinute = 0;
}, 60 * 1000);

// Track query in analytics
function trackChatbotQuery(query, responseType, responseTime, userId = null, foundBusinesses = false) {
  const now = new Date();
  const hour = now.getHours();
  
  chatbotAnalytics.totalQueries++;
  chatbotAnalytics.queriesLastHour++;
  chatbotAnalytics.queriesLastMinute++;
  chatbotAnalytics.queriesByHour[hour]++;
  chatbotAnalytics.lastQueryTime = now.toISOString();
  
  if (userId) {
    chatbotAnalytics.uniqueUsers.add(userId.toString());
  }
  
  // Track popular queries
  const normalizedQuery = query.toLowerCase().trim().slice(0, 50);
  chatbotAnalytics.popularQueries.set(
    normalizedQuery,
    (chatbotAnalytics.popularQueries.get(normalizedQuery) || 0) + 1
  );
  
  // Track response types
  if (responseType === 'quickReply') {
    chatbotAnalytics.quickReplies++;
    chatbotAnalytics.responseTypes.quickReply++;
  } else if (responseType === 'businessSearch') {
    chatbotAnalytics.businessResults += foundBusinesses ? 1 : 0;
    chatbotAnalytics.responseTypes.businessSearch++;
    chatbotAnalytics.successfulSearches++;
  } else if (responseType === 'aiGenerated') {
    chatbotAnalytics.aiFallbacks++;
    chatbotAnalytics.responseTypes.aiGenerated++;
  } else {
    chatbotAnalytics.responseTypes.fallback++;
  }
  
  // Track response time
  if (responseTime) {
    chatbotAnalytics.responseTimes.push(responseTime);
    if (chatbotAnalytics.responseTimes.length > 100) {
      chatbotAnalytics.responseTimes.shift(); // Keep last 100
    }
    const sum = chatbotAnalytics.responseTimes.reduce((a, b) => a + b, 0);
    chatbotAnalytics.averageResponseTime = sum / chatbotAnalytics.responseTimes.length;
  }
  
  // Simple sentiment analysis (basic keyword-based)
  const lowerQuery = query.toLowerCase();
  if (/(thank|great|awesome|love|perfect|amazing|good|nice|helpful)/.test(lowerQuery)) {
    chatbotAnalytics.sentiment.positive++;
  } else if (/(bad|wrong|error|failed|not working|hate|disappointed)/.test(lowerQuery)) {
    chatbotAnalytics.sentiment.negative++;
  } else {
    chatbotAnalytics.sentiment.neutral++;
  }
}

// Get top popular queries
function getTopQueries(limit = 10) {
  const sorted = Array.from(chatbotAnalytics.popularQueries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query, count]) => ({ query, count }));
  return sorted;
}

// API endpoint for real-time analytics
app.get("/api/chatbot/analytics", async (req, res) => {
  try {
    const uptime = Date.now() - chatbotAnalytics.startTime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
    const queriesPerMinute = chatbotAnalytics.queriesLastMinute;
    const queriesPerHour = chatbotAnalytics.queriesLastHour;
    const successRate = chatbotAnalytics.totalQueries > 0 
      ? ((chatbotAnalytics.successfulSearches / chatbotAnalytics.totalQueries) * 100).toFixed(1)
      : 0;
    
    const topQueries = getTopQueries(10);
    const totalUsers = chatbotAnalytics.uniqueUsers.size;
    
    // Calculate peak hour
    const peakHour = chatbotAnalytics.queriesByHour.indexOf(
      Math.max(...chatbotAnalytics.queriesByHour)
    );
    
    res.json({
      overview: {
        totalQueries: chatbotAnalytics.totalQueries,
        uniqueUsers: totalUsers,
        queriesPerMinute,
        queriesPerHour,
        successRate: parseFloat(successRate),
        averageResponseTime: chatbotAnalytics.averageResponseTime.toFixed(2),
        uptimeHours: parseFloat(uptimeHours),
        lastQueryTime: chatbotAnalytics.lastQueryTime
      },
      responseTypes: {
        quickReplies: chatbotAnalytics.responseTypes.quickReply,
        businessSearches: chatbotAnalytics.responseTypes.businessSearch,
        aiGenerated: chatbotAnalytics.responseTypes.aiGenerated,
        fallbacks: chatbotAnalytics.responseTypes.fallback
      },
      performance: {
        successfulSearches: chatbotAnalytics.successfulSearches,
        businessResults: chatbotAnalytics.businessResults,
        aiFallbacks: chatbotAnalytics.aiFallbacks,
        quickReplies: chatbotAnalytics.quickReplies
      },
      sentiment: {
        positive: chatbotAnalytics.sentiment.positive,
        neutral: chatbotAnalytics.sentiment.neutral,
        negative: chatbotAnalytics.sentiment.negative,
        total: chatbotAnalytics.sentiment.positive + 
               chatbotAnalytics.sentiment.neutral + 
               chatbotAnalytics.sentiment.negative
      },
      popularQueries: topQueries,
      queriesByHour: chatbotAnalytics.queriesByHour.map((count, hour) => ({ hour, count })),
      peakHour
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Utility to clean and normalize text
function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract search terms from natural phrases like "find a bakery near me"
function extractSearchTerms(message) {
  const msg = normalizeText(message);
  // remove common intent/stop words
  const cleaned = msg
    .replace(/\b(find|search|look for|show me|show|please|can you|help me|i need|near me|nearby)\b/g, " ")
    .replace(/\b(in|at|on|for|to|a|an|the|me|my|of)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  const tokens = cleaned.split(" ").filter(Boolean);
  // naive singularization for common plurals
  const normalized = tokens.map(t => t.endsWith("ies") ? t.slice(0, -3) + "y" : (t.endsWith("s") ? t.slice(0, -1) : t));
  return Array.from(new Set(normalized)).slice(0, 5); // cap to 5 terms
}

// Helper for greeting detection
const greetings = ["hi", "hello", "hey", "yo", "hola", "greetings", "good morning", "good afternoon", "good evening"];

// Enhanced intent-based quick replies with professional responses
function getQuickReply(message, currentUser) {
  const msg = normalizeText(message);
  const name = currentUser?.username ? `, ${currentUser.username}` : "";
  
  // Greetings with personalized response
  if (greetings.includes(msg) || /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(msg)) {
    const suggestions = "💡 **Try asking:**\n• \"Find restaurants near me\"\n• \"Show me top-rated cafes\"\n• \"What categories are available?\"";
    return `Hello${name}! 👋 I'm Findify Assistant, your intelligent guide to discovering local businesses. I can help you search, explore categories, answer questions, and more.\n\n${suggestions}`;
  }
  
  // Help and guidance
  if (/(help|guide|assistance|how can you help|what can you do)/.test(msg)) {
    return `**How I Can Help You:**\n\n🔍 **Search & Discovery:** Ask me to find businesses by name or category\n📊 **Information:** Learn about ratings, premium features, or how Findify works\n💼 **Business Owners:** Get help listing your business or managing your account\n📞 **Support:** Direct you to contact forms or answer FAQs\n\n**Examples:**\n• "Find coffee shops"\n• "Show me gyms nearby"\n• "How does premium work?"\n• "What is Findify?"`;
  }
  
  // Customer support requests
  if (/(customer\s*support|talk to support|talk to (an )?agent|support team|human|representative|live chat|real person)/.test(msg)) {
    return `For direct support from our team, please visit our **Contact** page: [/contact](/contact)\n\nYou can:\n• Fill out our contact form\n• Send us a detailed message\n• We typically respond within 24 hours\n\nFor quick answers, I'm here to help! What would you like to know?`;
  }
  
  // Premium features
  if (/(premium|subscription|premium features|upgrade|benefits)/.test(msg)) {
    return `**Findify Premium** 🎯\n\n**Price:** ₹10/month\n**Benefits:**\n✨ Enhanced business discovery\n📊 Advanced dashboard features\n🚀 Priority support\n💎 Exclusive premium badge\n\n**Get Started:** Visit [/premium](/premium) to subscribe\n\nHave questions about premium? Just ask!`;
  }
  
  // Contact information
  if (/(contact|reach out|get in touch|email|phone)/.test(msg)) {
    return `**Contact Findify:**\n\n📧 **Contact Form:** [/contact](/contact)\n💬 **Chat Assistant:** That's me! I'm here 24/7\n\n**Best for:**\n• Business inquiries\n• Technical support\n• General questions\n• Partnership opportunities\n\nUse the contact form for detailed messages that need a human response.`;
  }
  
  // Dashboard help
  if (/(dashboard|my account|profile|my listings|manage)/.test(msg)) {
    const role = currentUser?.role?.toLowerCase();
    const dashboardInfo = role === 'vendor' 
      ? "**Vendor Dashboard Features:**\n• Manage your business listings\n• View analytics and reviews\n• Update business information\n• Track performance"
      : role === 'admin'
      ? "**Admin Dashboard:** Access all administrative features"
      : "**User Dashboard Features:**\n• View your favorite businesses\n• Manage your reviews\n• Track your activity";
    
    return `**Your Dashboard** 📊\n\nAccess it at: [/dashboard](/dashboard)\n\n${dashboardInfo}\n\n${!currentUser ? '**Note:** You need to be logged in to access your dashboard.' : ''}`;
  }
  
  // Categories information
  if (/(categories|suggest categories|what categories|list categories|types of businesses)/.test(msg)) {
    return `**Popular Business Categories on Findify:**\n\n🍕 **Food & Dining:** Restaurants, Cafes, Bakeries\n🔧 **Services:** Plumbers, Electricians, Contractors\n💆 **Beauty & Wellness:** Salons, Spas, Gyms\n📚 **Education:** Tutors, Coaching Centers\n🏥 **Healthcare:** Clinics, Pharmacies\n🛒 **Retail:** Shops, Stores\n\n**Try searching:**\n• "Find [category] near me"\n• "Show me top-rated [category]"\n• "Search for [category]"`;
  }
  
  // Ratings and reviews
  if (/(rating|ratings|reviews|review system|how rating|how reviews work)/.test(msg)) {
    return `**How Ratings Work:** ⭐\n\n**User Reviews:** Customers leave ratings (1-5 stars) and comments\n**Average Rating:** Calculated from all reviews\n**Review Count:** Total number of reviews displayed\n\n**Features:**\n✅ Verified reviews from real users\n✅ Detailed feedback and photos\n✅ Helps you make informed decisions\n\n**Leave a Review:** Visit any business page and share your experience!`;
  }
  
  // About Findify
  if (/(what is findify|about findify|who are you|tell me about findify|what does findify do)/.test(msg)) {
    return `**About Findify** 🌟\n\nFindify is your trusted platform for discovering and reviewing local businesses in your area.\n\n**Key Features:**\n🔍 **Smart Search:** Find businesses by name, category, or location\n📍 **Location-Based Discovery:** Explore businesses near you\n⭐ **Ratings & Reviews:** Read authentic customer experiences\n💼 **Business Listings:** Comprehensive business information\n❤️ **Favorites:** Save your favorite businesses\n\n**Get Started:** Explore businesses on our homepage or ask me to find something specific!`;
  }
  
  // How it works
  if (/(how does it work|how findify works|how to use|getting started|tutorial)/.test(msg)) {
    return `**How to Use Findify:** 📖\n\n**1. Search & Discover**\n   • Use the search bar to find businesses\n   • Browse featured and top-rated businesses\n   • Use the Discover page for location-based search\n\n**2. Explore Business Details**\n   • Click on any business to see full details\n   • View ratings, reviews, contact info, and location\n\n**3. Engage (Login Required)**\n   • Save favorites to your dashboard\n   • Leave reviews and ratings\n   • Help others discover great businesses\n\n**4. For Business Owners**\n   • Register as a vendor\n   • Add your business listing\n   • Manage reviews and analytics\n\n**Ready to explore?** Try asking: "Find coffee shops" or "Show me restaurants"`;
  }
  
  // Business listing help
  if (/(add my business|list my business|become vendor|register business|post my business|sell on findify)/.test(msg)) {
    return `**List Your Business on Findify** 💼\n\n**Steps to Get Started:**\n\n1. **Create Account** → [/register](/register)\n   • Select "Vendor" as your role\n\n2. **Log In** → [/login](/login)\n\n3. **Add Business** → [/new](/new)\n   • Fill in business details\n   • Upload images\n   • Add location\n\n4. **Await Approval**\n   • Our team reviews your listing\n   • You'll be notified once approved\n\n**Benefits:**\n✨ Increased visibility\n📊 Analytics dashboard\n⭐ Customer reviews\n💬 Direct customer contact\n\nNeed help? Ask me anything!`;
  }
  
  // Registration help
  if (/(how to register|create account|sign up|signup|register|new account)/.test(msg)) {
    return `**Create Your Findify Account** 👤\n\n**Get Started:**\n1. Visit [/register](/register)\n2. Choose your role (User or Vendor)\n3. Fill in your details\n4. Verify and start exploring!\n\n**Already have an account?** → [/login](/login)\n\n**Account Types:**\n👤 **User:** Browse, review, and save favorites\n💼 **Vendor:** List and manage your business\n\n**Questions?** I'm here to help!`;
  }
  
  // Pricing and payments
  if (/(refund|payment|pricing|price|cost|subscription|billing|invoice)/.test(msg)) {
    return `**Pricing & Payments** 💳\n\n**Free Features:**\n✅ Browse all businesses\n✅ Search and discover\n✅ Read reviews\n✅ Basic dashboard\n\n**Premium:** ₹10/month\n✨ Enhanced features (see /premium)\n\n**Payment:**\n• Secure payment via Razorpay\n• Monthly subscription model\n• Auto-renewal (cancel anytime)\n\n**Billing Support:**\n• Manage subscription: [/premium](/premium)\n• Contact support: [/contact](/contact)\n• Refunds processed within 5-7 business days`;
  }
  
  // Thank you responses
  if (/(thank|thanks|thx|appreciate|grateful)/.test(msg)) {
    return `You're welcome${name}! 😊 I'm always here to help. Feel free to ask me anything about Findify or finding local businesses. Happy exploring!`;
  }
  
  // Goodbye responses
  if (/(bye|goodbye|see you|farewell|later)/.test(msg)) {
    return `Goodbye${name}! 👋 Thanks for using Findify. Come back anytime if you need help finding businesses or have any questions!`;
  }
  
  return null;
}

// Try to find relevant businesses based on the user's message
async function searchBusinessesForMessage(message, page = 1, pageSize = 5) {
  const terms = extractSearchTerms(message);
  // If no terms extracted, fall back to broad regex on full message
  if (terms.length === 0) {
    const queryText = message.trim();
    if (!queryText) return [];
    const regex = new RegExp(queryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const results = await Business.find({
      status: "active",
      $or: [
        { Name: regex },
        { Category: regex },
        { address: regex },
      ],
    })
      .select("Name Category address avgRating reviewCount _id")
      .sort({ avgRating: -1, reviewCount: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();
    return results;
  }

  // Build AND-of-terms where each term must appear in any of the fields
  const andClauses = terms.map(t => {
    const rx = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return { $or: [{ Name: rx }, { Category: rx }, { address: rx }] };
  });

  const results = await Business.find({
    status: "active",
    $and: andClauses,
  })
    .select("Name Category address avgRating reviewCount _id")
    .sort({ avgRating: -1, reviewCount: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return results;
}

// Enhanced OpenAI fallback with better context and formatting
async function generateAiReply(messages, userContext = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    // Enhanced system prompt with context awareness
    const enhancedSystemPrompt = {
      role: "system",
      content: `You are Findify's professional AI assistant. You help users discover local businesses and navigate the Findify platform.

**Platform Context:**
- Findify is a local business discovery and review platform
- Users can search businesses by name, category, or location
- Features include: Search, Discover (location-based), Dashboard, Premium (₹10/month), Reviews & Ratings
- Business owners can register as vendors and list their businesses

**Your Role:**
- Provide helpful, concise, and professional responses
- Guide users to relevant features (use markdown links: [/route](/route))
- Format responses with markdown for readability (use **bold**, lists, emojis sparingly)
- Keep responses under 150 words when possible
- Be friendly but professional
- If asked about finding businesses, suggest specific search terms or categories

**Response Format:**
- Use markdown for formatting
- Include links in format: [Link Text](/route)
- Use bullet points for lists
- Keep it conversational but informative

**Current User:** ${userContext.username || 'Guest'} (${userContext.role || 'User'})`
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [enhancedSystemPrompt, ...messages],
        temperature: 0.3,
        max_tokens: 300,
        presence_penalty: 0.2,
        frequency_penalty: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );
    const choice = response?.data?.choices?.[0]?.message?.content;
    return choice || null;
  } catch (err) {
    console.error("OpenAI error:", err?.response?.data || err?.message || err);
    return null;
  }
}

app.post("/chatbot", async (req, res) => {
  const startTime = Date.now();
  let responseType = 'fallback';
  let foundBusinesses = false;
  let responseTime = 0;
  
  try {
    if (isRateLimited(req.ip)) {
      return res.status(429).json({ 
        reply: "⏳ You're sending messages too fast. Please wait a moment and try again.",
        type: "error"
      });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ 
        reply: "Please provide a valid message.",
        type: "error"
      });
    }

    const trimmed = message.slice(0, 500).trim();
    if (!trimmed) {
      return res.status(400).json({ 
        reply: "Please enter a non-empty message.",
        type: "error"
      });
    }

    // Initialize conversation history in session if not exists
    if (!req.session.chatHistory) {
      req.session.chatHistory = [];
    }
    
    // Store user message in history (keep last 10 messages)
    req.session.chatHistory.push({ role: "user", content: trimmed });
    if (req.session.chatHistory.length > 10) {
      req.session.chatHistory = req.session.chatHistory.slice(-10);
    }

    // Pagination: if user says "more", fetch next page from session
    const normalized = normalizeText(trimmed);
    if ((normalized === "more" || normalized.includes("more results")) && req.session?.chatQuery) {
      const nextPage = (req.session.chatPage || 1) + 1;
      const businesses = await searchBusinessesForMessage(req.session.chatQuery, nextPage, 5);
      if (businesses.length === 0) {
        return res.json({ 
          reply: "No more results available. Try a different search term or ask me to refine the search.",
          type: "info",
          businesses: []
        });
      }
      req.session.chatPage = nextPage;
      
      // Format businesses with links
      const businessCards = businesses.map((b) => ({
        id: b._id.toString(),
        name: b.Name,
        category: b.Category,
        rating: b.avgRating || "N/A",
        reviewCount: b.reviewCount || 0,
        link: `/show/${b._id}`
      }));
      
      const lines = businesses.map((b, i) => {
        const rating = b.avgRating ? `⭐ ${b.avgRating}` : "";
        const reviews = b.reviewCount ? `(${b.reviewCount} reviews)` : "";
        const num = (nextPage - 1) * 5 + i + 1;
        return `${num}. **${b.Name}** - ${b.Category} ${rating} ${reviews}`;
      });
      
      return res.json({ 
        reply: `**More Results:**\n${lines.join("\n")}\n\n💡 Say 'more' for additional results, or click any business to view details.`,
        type: "businesses",
        businesses: businessCards,
        hasMore: businesses.length === 5
      });
    }

    // 1) Quick intent replies
    const quick = getQuickReply(trimmed, req.user);
    if (quick) {
      responseType = 'quickReply';
      responseTime = Date.now() - startTime;
      try {
        trackChatbotQuery(trimmed, responseType, responseTime, req.user?._id, false);
      } catch (err) {
        console.error("Analytics tracking error:", err);
      }
      req.session.chatHistory.push({ role: "assistant", content: quick });
      return res.json({ reply: quick, type: "text" });
    }

    // 2) Try business search based on the user's message
    const businesses = await searchBusinessesForMessage(trimmed, 1, 5);
    if (businesses.length > 0) {
      // Remember query for pagination
      if (req.session) {
        req.session.chatQuery = trimmed;
        req.session.chatPage = 1;
      }
      
      // Format businesses as cards with links
      const businessCards = businesses.map((b) => ({
        id: b._id.toString(),
        name: b.Name,
        category: b.Category,
        rating: b.avgRating || "N/A",
        reviewCount: b.reviewCount || 0,
        link: `/show/${b._id}`
      }));
      
      const lines = businesses.map((b, i) => {
        const rating = b.avgRating ? `⭐ ${b.avgRating}` : "";
        const reviews = b.reviewCount ? `(${b.reviewCount} reviews)` : "";
        return `${i + 1}. **${b.Name}** - ${b.Category} ${rating} ${reviews}`;
      });
      
      const reply = `**Found ${businesses.length} businesses:**\n${lines.join("\n")}\n\n💡 **Next Steps:**\n• Click any business to view details\n• Say 'more' for additional results\n• Visit [/search](/search) or [/discover](/discover) for advanced search`;
      
      responseType = 'businessSearch';
      foundBusinesses = businesses.length > 0;
      responseTime = Date.now() - startTime;
      try {
        trackChatbotQuery(trimmed, responseType, responseTime, req.user?._id, foundBusinesses);
      } catch (err) {
        console.error("Analytics tracking error:", err);
      }
      req.session.chatHistory.push({ role: "assistant", content: reply });
      
      return res.json({ 
        reply,
        type: "businesses",
        businesses: businessCards,
        hasMore: businesses.length === 5
      });
    }

    // 3) AI fallback with conversation context
    const conversationContext = req.session.chatHistory.slice(-4); // Last 4 messages for context
    const userContext = {
      username: req.user?.username,
      role: req.user?.role,
      email: req.user?.email
    };
    
    const aiMessages = [
      ...conversationContext,
      { role: "user", content: trimmed }
    ];
    
    const ai = await generateAiReply(aiMessages, userContext);
    if (ai) {
      responseType = 'aiGenerated';
      responseTime = Date.now() - startTime;
      try {
        trackChatbotQuery(trimmed, responseType, responseTime, req.user?._id, false);
      } catch (err) {
        console.error("Analytics tracking error:", err);
      }
      req.session.chatHistory.push({ role: "assistant", content: ai });
      return res.json({ reply: ai, type: "text" });
    }

    // 4) Final fallback with helpful suggestions
    const fallback = `I couldn't find an exact match for "${trimmed}".\n\n**Here's what I can help with:**\n\n🔍 **Search Businesses:**\n• "Find [category]" (e.g., "Find cafes", "Find plumbers")\n• "Show me [business type]" (e.g., "Show me restaurants")\n• "Search for [name]"\n\n📚 **Learn About Findify:**\n• "What is Findify?"\n• "How does it work?"\n• "What categories are available?"\n• "How do ratings work?"\n\n💼 **Business Owners:**\n• "How to add my business?"\n• "Become a vendor"\n\n📞 **Support:**\n• "Contact support" → [/contact](/contact)\n• "Help" → General assistance\n\nTry rephrasing your question or use one of the suggestions above!`;
    
    responseTime = Date.now() - startTime;
    try {
      trackChatbotQuery(trimmed, responseType, responseTime, req.user?._id, false);
    } catch (err) {
      console.error("Analytics tracking error:", err);
    }
    req.session.chatHistory.push({ role: "assistant", content: fallback });
    
    return res.json({ 
      reply: fallback,
      type: "text"
    });
  } catch (error) {
    console.error("/chatbot error:", error);
    responseTime = Date.now() - startTime;
    try {
      trackChatbotQuery(message || 'error', 'error', responseTime, req.user?._id, false);
    } catch (err) {
      console.error("Analytics tracking error:", err);
    }
    return res.status(500).json({ 
      reply: "Sorry, something went wrong on our end. Please try again in a moment. If the issue persists, contact us via [/contact](/contact).",
      type: "error"
    });
  }
});
// ------------------ End Chatbot backend ------------------

// Clear chat history endpoint
app.post("/chatbot/clear-history", (req, res) => {
  try {
    // Clear session history
    if (req.session.chatHistory) {
      req.session.chatHistory = [];
    }
    if (req.session.chatQuery) {
      delete req.session.chatQuery;
    }
    if (req.session.chatPage) {
      delete req.session.chatPage;
    }
    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    res.status(500).json({ success: false, error: "Failed to clear chat history" });
  }
});

// Chatbot Analytics Dashboard Route - Admin Only
app.get("/chatbot/analytics", isLoggedIn, isAdmin, (req, res) => {
  res.render("chatbot-analytics.ejs");
});

// (edit + update)
app.put(
  "/edit/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      // Spread the business data from the form into a new object
      const updatedData = { ...req.body };

      // Find and update the text-based fields first
      const updatedBusiness = await Business.findByIdAndUpdate(id, updatedData, { new: true });

      // Check if a new file was uploaded
      if (req.file) {
        // If there was an old image, delete it from Cloudinary
        if (updatedBusiness.Image && updatedBusiness.Image.filename) {
          await cloudinary.uploader.destroy(updatedBusiness.Image.filename);
        }
        
        // Save the new image's data to the business document
        updatedBusiness.Image = {
          url: req.file.path,
          filename: req.file.filename,
        };
        await updatedBusiness.save(); // Save the changes to the database
      }
      
      req.flash("success", "Business updated successfully!");
      res.redirect(`/show/${id}`);

    } catch (err) {
      req.flash("error", "Something went wrong while updating the business.");
      console.error("Business Update Error:", err);
      // It's safer to redirect back instead of to the show page on error
      res.redirect("back"); 
    }
  }
);


//show route
app.get("/show/:id", async (req, res) => {
  let { id } = req.params;
  let business = await Business.findById(id).populate(
    "Owner",
    "username email"
  )
    .populate({
      path: "reviews",
      populate: { path: "author", select: "username premiumExpiresAt" } // populate review authors
    });
  res.render("show.ejs", { business });
});

//favorite route
app.post("/favorite/:id", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let business = await Business.findById(id);
  let user = req.user;
  if (!user.favorites.includes(business._id)) {
    user.favorites.push(business._id);
    await user.save();
    req.flash("success", "Added to favorites");
  }
  else {
    req.flash("error", "Already in favorites");
  }
  res.redirect(`/show/${id}`);
})

//remove favorite route
app.post("/favorites/remove/:id", isLoggedIn, async (req, res) => {
  try {
    const businessId = req.params.id;

    await user.findByIdAndUpdate(
      req.user._id,
      { $pull: { favorites: businessId } },   // remove businessId from favorites array
      { new: true }
    );

    req.flash("success", "Removed from favorites!");
    res.redirect("/dashboard"); // or back to the dashboard
  } catch (err) {
    console.error("Error removing favorite:", err);
    req.flash("error", "Something went wrong.");
    res.redirect("/dashboard");
  }
})

// Add a new review:
app.post("/show/:id/reviews", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const business = await Business.findById(id).populate("reviews"); 
    if (!business) {
      req.flash("error", "Business not found");
      return res.redirect("/discover");
    }

    // Check if user already has a review in this business
    const alreadyadded = business.reviews.some(
      (r) => r.author.toString() === req.user._id.toString()
    );
    if (alreadyadded) {
      req.flash("error", "You have already added a review");
      return res.redirect(`/show/${id}`);
    }

    // Create review
    const review = new Review({
      rating: Number(rating),
      comment,
      author: req.user._id,
      business: id
    });
    await review.save();

    // Push review to business
    business.reviews.push(review);
    await business.save();

    //Recalculate rating & count from DB
    const allReviews = await Review.find({ _id: { $in: business.reviews } });

    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((acc, r) => acc + r.rating, 0);
    business.avgRating = (sumRatings / totalReviews).toFixed(1);
    business.reviewCount = totalReviews;

    await business.save();

    req.flash("success", "Review added!");
    res.redirect(`/show/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not add review");
    res.redirect("back");
  }
});


//edit review
app.get("/show/:id/reviews/:reviewId/edit", isLoggedIn, async (req, res) => {
  const { id, reviewId } = req.params;
  try {
    // Fetch the existing review from DB because in get request body.params doesnot works!(point to remember and learn)
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect(`/show/${id}`);
    }
    // Pass the existing review data to template
    res.render("edit-review.ejs", {
      businessId: id,
      authorId: reviewId,
      rating: review.rating,
      comment: review.comment,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect(`/show/${id}`);
  }
});

//putting reviews updation
app.post("/show/:id/reviews/:reviewId/edit", isLoggedIn, async (req, res) => {
  const { id, reviewId } = req.params;
  const { rating, comment } = req.body;
  const updatedReview = await Review.findByIdAndUpdate(reviewId, {
    rating: Number(rating),
    comment
  });
  console.log(updatedReview);
  if (!updatedReview) {
    req.flash("error", "Review not found");
    return res.redirect(`/show/${id}`);
  }
  // After updating the review, recalculate the business's avgRating and reviewCount
  const business = await Business.findById(id);
  const allReviews = await Review.find({ _id: { $in: business.reviews } });
  const totalReviews = allReviews.length;
  const sumRatings = allReviews.reduce((acc, r) => acc + r.rating, 0);
  business.avgRating = (sumRatings / totalReviews).toFixed(1);
  business.reviewCount = totalReviews;
  await business.save();
  req.flash("success", "Review updated!");
  res.redirect(`/show/${id}`);
});





//admin dashboard work
// In app.js, inside app.post("/register", ...)
app.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
    res.redirect("/admin/dashboard");
});

// Enhanced admin dashboard route
app.get("/admin/dashboard", isLoggedIn, isAdmin, async (req, res) => {
    try {
        // 1. Data for the Stat Cards
        const totalUsers = await user.countDocuments();
        const activeVendors = await user.countDocuments({ role: 'vendor', status: 'active' });
        const totalBusinesses = await Business.countDocuments();
        const pendingBusinesses = await Business.countDocuments({ status: 'pending' });
        const totalReviews = await Review.countDocuments();
        const avgRatingData = await Business.aggregate([
            { $match: { avgRating: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: "$avgRating" } } }
        ]);
        const averageRating = avgRatingData.length > 0 ? avgRatingData[0].avg.toFixed(1) : 0;

        // 2. Revenue and Premium Analytics
        const premiumUsers = await user.countDocuments({ 
            premiumExpiresAt: { $gt: new Date() } 
        });
        
        const expiredPremiumUsers = await user.countDocuments({ 
            premiumExpiresAt: { $lt: new Date(), $ne: null } 
        });
        
        // Calculate revenue (assuming ₹10/month premium membership)
        const premiumPrice = 10;
        const totalRevenue = premiumUsers * premiumPrice;
        const monthlyRevenue = totalRevenue; // Current active subscriptions
        
        // Growth metrics - compare with previous month
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const usersLastMonth = await user.countDocuments({
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });
        const usersThisMonth = await user.countDocuments({
            createdAt: { $gte: thisMonth }
        });
        
        const businessesLastMonth = await Business.countDocuments({
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });
        const businessesThisMonth = await Business.countDocuments({
            createdAt: { $gte: thisMonth }
        });
        
        const reviewsLastMonth = await Review.countDocuments({
            createdAt: { $gte: lastMonth, $lt: thisMonth }
        });
        const reviewsThisMonth = await Review.countDocuments({
            createdAt: { $gte: thisMonth }
        });
        
        // Calculate growth percentages
        const userGrowth = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1) : 0;
        const businessGrowth = businessesLastMonth > 0 ? ((businessesThisMonth - businessesLastMonth) / businessesLastMonth * 100).toFixed(1) : 0;
        const reviewGrowth = reviewsLastMonth > 0 ? ((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth * 100).toFixed(1) : 0;
        const revenueGrowth = 15.2; // This could be calculated from historical data

        // 3. Data for the User Management Table
        const allUsers = await user.find({}).sort({ createdAt: -1 });

        // 4. Data for the Business Management Table
        const allBusinesses = await Business.find({}).populate('Owner', 'username').sort({ createdAt: -1 });

        // 5. Data for Reports & Analytics Tab
        const categoryDistribution = await Business.aggregate([
            { $group: { _id: "$Category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Use totalBusinesses from above, ensure it's not zero to prevent division errors
        const totalBusinessesForPercentage = totalBusinesses > 0 ? totalBusinesses : 1;

        res.render("admin-dashboard.ejs", {
            // This object structure passes all data to the EJS file
            stats: {
                totalUsers,
                activeVendors,
                totalBusinesses,
                pendingBusinesses,
                totalReviews,
                averageRating,
                premiumUsers,
                expiredPremiumUsers,
                totalRevenue,
                monthlyRevenue
            },
            users: allUsers,
            businesses: allBusinesses,
            reports: {
                categoryDistribution,
                totalBusinessesForPercentage,
                growth: {
                    userGrowth: parseFloat(userGrowth),
                    businessGrowth: parseFloat(businessGrowth),
                    reviewGrowth: parseFloat(reviewGrowth),
                    revenueGrowth: parseFloat(revenueGrowth)
                }
            }
        });

    } catch (err) {
        console.error("Admin Dashboard Error:", err);
        req.flash('error', 'Could not load the admin dashboard.');
        res.redirect('/');
    }
});


// Route to approve a business
app.patch("/admin/businesses/:id/approve", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Business.findByIdAndUpdate(id, { status: 'active' });
        req.flash("success", "Business has been successfully approved!");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while approving the business.");
    }
    res.redirect("/admin"); // Redirect back to the admin dashboard
});

// Route to reject (and delete) a pending business
app.delete("/admin/businesses/:id/reject", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // First, find the business to get the image filename
        const business = await Business.findById(id);
        if (business && business.Image && business.Image.filename) {
            // If an image exists, delete it from Cloudinary
            await cloudinary.uploader.destroy(business.Image.filename);
        }

        // Then, delete the business from our database
        await Business.findByIdAndDelete(id);

        req.flash("success", "Business has been rejected and deleted.");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while rejecting the business.");
    }
    res.redirect("/admin");
});



// Route to suspend an active business
app.patch("/admin/businesses/:id/suspend", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Business.findByIdAndUpdate(id, { status: 'suspended' });
        req.flash("success", "Business has been suspended.");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while suspending the business.");
    }
    res.redirect("/admin");
});


// Route to re-activate a suspended business
app.patch("/admin/businesses/:id/reactivate", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Business.findByIdAndUpdate(id, { status: 'active' });
        req.flash("success", "Business has been re-activated.");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while re-activating the business.");
    }
    res.redirect("/admin");
});

// Route to permanently delete a business and its reviews
app.delete("/admin/businesses/:id", isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    console.log(`[ADMIN DELETE] Received request to delete business ID: ${id}`); // Log entry point

    try {
        // Step 1: Find the business document by its ID
        console.log(`[ADMIN DELETE] Step 1: Finding business document...`);
        const businessToDelete = await Business.findById(id);

        if (!businessToDelete) {
            console.log(`[ADMIN DELETE] Business with ID: ${id} not found.`);
            req.flash("error", "Business not found.");
            return res.redirect("/admin");
        }
        console.log(`[ADMIN DELETE] Found business: "${businessToDelete.Name}"`);

        // Step 2: If an image exists, delete it from Cloudinary
        if (businessToDelete.Image && businessToDelete.Image.filename) {
            console.log(`[ADMIN DELETE] Step 2: Deleting image from Cloudinary: ${businessToDelete.Image.filename}`);
            await cloudinary.uploader.destroy(businessToDelete.Image.filename);
            console.log(`[ADMIN DELETE] Cloudinary image deleted successfully.`);
        } else {
            console.log(`[ADMIN DELETE] Step 2: No Cloudinary image to delete for this business.`);
        }

        // Step 3: If there are associated reviews, delete them
        if (businessToDelete.reviews && businessToDelete.reviews.length > 0) {
            console.log(`[ADMIN DELETE] Step 3: Deleting ${businessToDelete.reviews.length} associated reviews.`);
            await Review.deleteMany({ _id: { $in: businessToDelete.reviews } });
            console.log(`[ADMIN DELETE] Reviews deleted successfully.`);
        } else {
            console.log(`[ADMIN DELETE] Step 3: No reviews to delete for this business.`);
        }

        // Step 4: Finally, delete the business document from the database
        console.log(`[ADMIN DELETE] Step 4: Deleting business document from database.`);
        await Business.findByIdAndDelete(id);
        console.log(`[ADMIN DELETE] Business document deleted successfully.`);

        req.flash("success", "Business and all associated assets were successfully deleted.");

    } catch (err) {
        console.error("[ADMIN DELETE] CRITICAL ERROR during business deletion:", err);
        req.flash("error", "An error occurred while deleting the business. Check logs for details.");
    }
    
    // Step 5: Redirect back to the admin dashboard
    console.log(`[ADMIN DELETE] Redirecting to /admin.`);
    res.redirect("/admin");
});


app.get("/premium", isLoggedIn, (req, res) => {
    // Pass the Razorpay Key ID to the EJS template
    res.render("Premium.ejs", { 
        currentUser: req.user,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID 
    });
});



// Create order route
// Route to create a new order
app.post('/create-order', isLoggedIn, async (req, res) => {
    const options = {
        amount: 1000, // Amount in paise (₹10.00)
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        
        // Securely bundle user details from the server session
        const userDetails = {
            name: req.user.username,
            email: req.user.email,
            contact: req.user.contact || '' // Assumes contact field on User model
        };
        
        // Send both the order and user details back to the frontend
        res.json({ order, userDetails });
        
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).send("Error creating order");
    }
});



// STEP 3: Ensure the /verify-payment 
app.post('/verify-payment', isLoggedIn, async(req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        const body = order_id + "|" + payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', key_secret)//sha256 is hashing algorithm
            .update(body.toString())// body ko update krna hai
            .digest('hex');//digest is final output in hexadecimal format

        if (expectedSignature === signature) {
            console.log("Payment verified successfully for user:", req.user.username);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            await user.findByIdAndUpdate(req.user._id, {
                premiumExpiresAt: expiryDate
            });
            req.flash("success", "Payment Successful! Your account is now Premium.");
            res.json({ status: 'success' }); // Send success response to client side js 
        } else {
            req.flash("error", "Payment verification failed. Please contact support.");
            res.status(400).json({ status: 'failure' });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        req.flash("error", "Payment verification failed. Please contact support.");
        res.status(400).json({ status: 'failure' });
    }
});


app.get("/privacy", (req, res) => {
  res.render("Privacy.ejs", { currentUser: req.user });
});
app.get("/terms", (req, res) => {
    res.render("Terms.ejs", { currentUser: req.user });
});






// ==================== MESSAGING SYSTEM ====================

// Middleware to check if user is part of conversation
const isConversationParticipant = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      req.flash("error", "Conversation not found");
      return res.redirect("/messages");
    }
    
    // Check if current user is a participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );
    
    if (!isParticipant) {
      req.flash("error", "You don't have access to this conversation");
      return res.redirect("/messages");
    }
    
    next();
  } catch (err) {
    console.error(err);
    req.flash("error", "An error occurred");
    res.redirect("/messages");
  }
};

// ==================== MESSAGING ROUTES ====================

// GET: Messages dashboard - show all conversations
app.get("/messages", isLoggedIn, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
    .populate("participants", "username email") // Populate user data
    .populate("lastMessageSender", "username")
    .sort({ lastMessageTime: -1 })
    .lean();

    // Count unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          isRead: false,
          isDeleted: false
        });
        return { ...conv, unreadCount };
      })
    );

    // Get total unread count across all conversations
    const totalUnread = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.render("messages.ejs", { 
      conversations: conversationsWithUnread, 
      currentUser: req.user,
      totalUnread
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load messages");
    res.redirect("/");
  }
});

// POST: Start a new conversation (customer initiates with vendor)
// GET: Start/open a conversation with a vendor
app.get("/messages/start/:vendorId", isLoggedIn, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { businessId } = req.query; // Get businessId from query params

    // Validate vendor exists and is a vendor
    const vendor = await user.findById(vendorId);
    if (!vendor || vendor.role !== "Vendor") {
      req.flash("error", "Invalid vendor");
      return res.redirect("back");
    }

    // Can't message yourself
    if (vendorId === req.user._id.toString()) {
      req.flash("error", "You cannot message yourself");
      return res.redirect("back");
    }

    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, vendorId] },
      vendorId: vendorId
    });

    // If not, create new conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, vendorId],
        vendorId: vendorId,
        businessId: businessId || null
      });
      await conversation.save();
    }

    res.redirect(`/messages/${conversation._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not start conversation");
    res.redirect("back");
  }
});

// POST: Alternative route for starting conversation (kept for backward compatibility)
app.post("/messages/start/:vendorId", isLoggedIn, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { businessId } = req.body; // Optional: business being discussed

    // Validate vendor exists and is a vendor
    const vendor = await user.findById(vendorId);
    if (!vendor || vendor.role !== "Vendor") {
      req.flash("error", "Invalid vendor");
      return res.redirect("back");
    }

    // Can't message yourself
    if (vendorId === req.user._id.toString()) {
      req.flash("error", "You cannot message yourself");
      return res.redirect("back");
    }

    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, vendorId] },
      vendorId: vendorId
    });

    // If not, create new conversation
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, vendorId],
        vendorId: vendorId,
        businessId: businessId || null
      });
      await conversation.save();
    }

    res.redirect(`/messages/${conversation._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not start conversation");
    res.redirect("back");
  }
});

// GET: View conversation and messages
app.get("/messages/:conversationId", isLoggedIn, isConversationParticipant, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants", "username email role")
      .populate("businessId", "Name")
      .lean();

    // Get all messages in conversation (pagination: get last 50)
    const messages = await Message.find({
      conversation: req.params.conversationId,
      isDeleted: false
    })
    .populate("sender", "username email role")
    .populate("receiver", "username email role")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    // Reverse to show oldest first
    messages.reverse();

    // Get the other participant
    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    // Mark messages as read (only for current user as receiver)
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.render("conversation.ejs", {
      conversation,
      messages,
      otherParticipant,
      currentUser: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load conversation");
    res.redirect("/messages");
  }
});

// POST: Send a message
app.post("/messages/:conversationId/send", isLoggedIn, isConversationParticipant, async (req, res) => {
  try {
    const { content } = req.body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: "Message is too long (max 5000 characters)" });
    }

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if conversation is blocked
    if (conversation.blockedBy) {
      return res.status(403).json({ error: "This conversation is blocked" });
    }

    // Find the receiver (the other participant)
    const receiver = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create message
    const message = new Message({
      conversation: req.params.conversationId,
      sender: req.user._id,
      receiver: receiver,
      content: content.trim()
    });

    await message.save();

    // Populate for response
    await message.populate("sender", "username");
    await message.populate("receiver", "username");

    // Return message for real-time display (JSON for AJAX)
    res.json({
      success: true,
      message: message
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send message" });
  }
});

// DELETE: Delete a message (soft delete)
app.delete("/messages/:conversationId/delete/:messageId", isLoggedIn, isConversationParticipant, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    // Soft delete: mark as deleted but keep in database
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete message" });
  }
});

// PATCH: Block/Unblock conversation
app.patch("/messages/:conversationId/block", isLoggedIn, isConversationParticipant, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Toggle block status
    if (conversation.blockedBy && conversation.blockedBy.toString() === req.user._id.toString()) {
      // User already blocked it, unblock
      conversation.blockedBy = null;
    } else {
      // Block it
      conversation.blockedBy = req.user._id;
    }

    await conversation.save();

    res.json({ success: true, blocked: conversation.blockedBy !== null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update conversation" });
  }
});

// GET: Unread message count (for navbar/dashboard badge)
app.get("/api/messages/unread-count", isLoggedIn, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch unread count" });
  }
});

// 404 handler - catch unmatched routes
app.use((req, res, next) => {
  res.status(404);
  res.render("error.ejs", { url: req.originalUrl });
});

// General error handler - catch all errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500);
  res.render("error.ejs", { url: req.originalUrl, message: err.message, status: err.status || 500 });
});

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
