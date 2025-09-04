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
  const { query, category } = req.query;
  let filter = {};
  
  filter.status = 'active'; // <-- ADD THIS LINE

  if (query) {
    filter.Name = new RegExp(query, "i");
  }
  if (category && category !== "") {
    filter.Category = category;
  }
  let business = await Business.find(filter);
  res.render("index.ejs", { business, query, category });
});

//dashboard route (supports Vendor and User roles)
app.get("/dashboard", isLoggedIn, async (req, res) => {
  const authUser = req.user;
  const favUser = await user.findById(authUser._id).populate("favorites");
  const Reviewcount = await Review.countDocuments({ author: authUser._id });
  // THE FIX: Use .find() and the correct field name 'author'
const UserReview = await Review.find({ author: authUser._id })
    .sort({ createdAt: -1 })
    .limit(2)
    .populate("business");
  const role = (authUser.role || "").toLowerCase();

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
  res.render("new.ejs");
});


//new form post request
app.post(
  "/new",
  isLoggedIn,
  isVendor,
  upload.single("image"),
  async (req, res) => {
    let { Name, Category, description, Contact, address } = req.body;
    let image = { url: req.file.path, filename: req.file.filename };

    const geodata = await geocodingClient
      .forwardGeocode({
        query: address,
        limit: 1,
      })
      .send();

    if (!geodata.body.features || geodata.body.features.length === 0) {
      req.flash("error", "Location not found. Try again.");
      return res.redirect("/new");
    }
    const coords = geodata.body.features[0].center; // [lon, lat]

    let business = new Business({
      Name,
      Owner: req.user._id,
      Category,
      description,
      Contact,
      address: geodata.body.features[0].text, //address
      Image: image,
      geometry: {
        type: "Point",
        coordinates: coords,
      },
    });
    await business.save();
    req.flash("success", "Business registered successfully!");
    res.redirect("/");
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

        // 2. Data for the User Management Table
        const allUsers = await user.find({}).sort({ createdAt: -1 });

        // 3. Data for the Business Management Table
        const allBusinesses = await Business.find({}).populate('Owner', 'username').sort({ createdAt: -1 });

        // 4. Data for Reports & Analytics Tab
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
                averageRating
            },
            users: allUsers,
            businesses: allBusinesses,
            reports: {
                categoryDistribution,
                totalBusinessesForPercentage
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
