const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the "views" directory
app.use(express.static(path.join(__dirname, "views")));

mongoose.connect("mongodb://localhost:27017/auth_Wandercult", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Configure session middleware
app.use(
  session({
    secret: "yourSecretKey", // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }, // Session will expire in 10 minutes
  })
);

// Middleware to disable caching for all routes
app.use((req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Show login page by default
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
      return res.render("signup", {
        error: "Passwords do not match.",
        username,
        email,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists.",
        username,
        email,
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error("Error signing up:", error);
    res.render("signup", {
      error: "Error signing up. Please try again later.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .render("login", { error: "Both email and password are required." });
    }

    const foundUser = await User.findOne({ email, password });
    if (foundUser) {
      req.session.userId = foundUser._id;
      req.session.username = foundUser.username; // Save username to session
      res.redirect("/home");
    } else {
      res.render("login", { error: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.render("login", { error: "Error logging in. Please try again later." });
  }
});

// Apply the isAuthenticated middleware to the /home route
app.get("/home", isAuthenticated, (req, res) => {
  res.render("home", { username: req.session.username });
});

// Add route for the /report route
app.get("/report", isAuthenticated, (req, res) => {
  res.render("REPORT");
});

app.get("/help", isAuthenticated, (req, res) => {
  res.render("conseils", { username: req.session.username });
});

app.get("/help", isAuthenticated, (req, res) => {
  res.render("conseils", { username: req.session.username });
});

app.get("/saved", isAuthenticated, (req, res) => {
  res.render("savedpage", { username: req.session.username });
});

app.get("/cityInfo", isAuthenticated, (req, res) => {
  res.render("city_info", { username: req.session.username });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/home");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
