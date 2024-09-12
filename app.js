if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const app = express();
const dbUrl = process.env.ATLASDB_URL
const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

// Configure session

const store = MongoStore.create({
    mongoUrl :dbUrl,
    crypto :{
        secret:process.env.SECRET,
    },
    touchAfter :24 * 3600,
})

store.on("error" ,()=>{
    console.log("ERROR IN MONGO SESSION STORE" ,err)
})

const sessionOption = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// Use ejs-mate for layout support
app.engine('ejs', ejsMate);

// Connect to MongoDB
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}
main();

// Middleware for session and flash
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Set flash message to res.locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) =>{
//     let fakeuser = new User(
//         {
//             email:"anilyadav65769@gmail.com",
//             username:"Anil-Yadav"
//         }
//     );
//    let registerUser = await User.register(fakeuser ,"helloworld");
//    res.send(registerUser);

// })
// Root route
// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

// Use router files
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter)

// Handle 404 errors for undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); 
    }
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { message });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
