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

//dashboard route for vendor
app.get("/dashboard", isLoggedIn, isVendor, async (req, res) => {
  let user = req.user;
  let business = await Business.find({ Owner: user._id });
  res.render("dashboard.ejs", { user, business });
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
  const { search, lat, lng } = req.query;
  let businesses = [];

  if (lat && lng) {
    // User's current location → schema has [lat, lng], but Mongo wants [lng, lat]
    businesses = await Business.find({
      geometry: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)], // ✅ swap here
          },
          $maxDistance: 5000,
        },
      },
    });
  } else if (search) {
    const geoData = await geocodingClient
      .forwardGeocode({
        query: search,
        limit: 1,
      })
      .send();

    if (geoData.body.features?.length > 0) {
      const [lng, lat] = geoData.body.features[0].center; // Mapbox gives [lng, lat]

      businesses = await Business.find({
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // ✅ already [lng, lat]
            },
            $maxDistance: 20000,
          },
        },
      });
    }
  }

  res.render("discover.ejs", { businesses, search });
});

//delete route
app.delete("/delete/:id", isLoggedIn, isOwner, async (req, res) => {
  try {
    let { id } = req.params;
    let business = await Business.findById(id);
    if (business.Image && business.Image.filename) {
      for (let img of business.Image.filename) {
        await cloudinary.uploader.destroy(img);
      }
    }
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
  );
  res.render("show.ejs", { business });
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
