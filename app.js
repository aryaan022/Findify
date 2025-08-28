if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const geocodingClient = require("./mapbox"); // we made this file earlier
const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
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
const { isLoggedIn, isOwner, isVendor } = require("./middleware");

const dbUrl = "mongodb://127.0.0.1:27017/localbuisness";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(MethodOverride("_method"));
app.engine("ejs", ejsMate);

app.use(flash());
app.use(
  session({
    secret: "YourScevretKEy",
    resave: false,
    saveUninitialized: true,
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
  let business = await Business.find();
  res.render("index.ejs", { business, query: undefined });
});

//regiter route
app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

//register route
app.post("/register", async (req, res, next) => {
  try {
    let { username, email, role, password } = req.body;
    let newuser = new user({ email, username, role });
    const registeredUser = await user.register(newuser, password);
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
app.post("/contact", (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message, newsletter, agreeTerms } = req.body;
    console.log("Contact submission:", { firstName, lastName, email, phone, subject, messageLength: message?.length, newsletter: !!newsletter, agreeTerms: !!agreeTerms });
    req.flash("success", "Thanks for reaching out! We'll get back to you within 24 hours.");
    res.redirect("/contact");
  } catch (err) {
    console.error("Contact submit error", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/contact");
  }
});


//(edit + update )
app.put(
  "/edit/:id",
  isLoggedIn,
  isOwner,
  upload.single("image"),
  async (req, res) => {
    try {
      let { id } = req.params;
      let business = await Business.findById(id);
      if (req.file) {
        if (business.Image && business.Image.filename) {
          await cloudinary.uploader.destroy(business.Image.filename);
        }
      }
      let { Name, Category, description, Contact, address } = req.body;
      let image = { url: req.file.path, filename: req.file.filename };
      let updatedBusiness = await Business.findByIdAndUpdate(id, {
        Name,
        Category,
        description,
        Contact,
        address,
        Image: image,
      });
      console.log(updatedBusiness);
      res.redirect(`/show/${id}`);
    } catch (err) {
      req.flash("error", "Something went wrong while updating the business.");
      console.log(err);
      res.redirect(`/show/${id}`);
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
      populate: { path: "author", select: "username" } // populate review authors
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


// 404 handler - catch unmatched routes
app.use((req, res, next) => {
  res.status(404);
  res.render("error.ejs", { url: req.originalUrl });
});

// Generic error handler - any thrown/rejected errors
// eslint-disable-next-line no-unused-vars
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
