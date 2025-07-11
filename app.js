if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js"); //for express router(better management)
const reviewRouter = require("./routes/review.js");   //for express router(better management)
const userRouter = require("./routes/user.js");       //for express router(better management)

const listings = require("./models/listing.js");
const reviews = require("./models/review.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js"); 


app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));

app.use(express.urlencoded({extended : true})); //enables form data for use 
app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const dbUrl = process.env.ATLASDB_URL;


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
});

store.on("error", ()=> {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

main()
.then(() => {
    console.log("successful connection to DB");
}).catch((err) => console.log(err));


async function main() {
    await mongoose.connect(dbUrl); // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
//-------------------------------------------------------------------------------------------------------------------------------


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.use("/listings", listingRouter); //express route
app.use("/listings/:id/reviews", reviewRouter); //express route
app.use("/",userRouter); //user router

//-------------------------------------------------------------------------------------------------------------

//error handling
app.all("*",(req, res, next) => {
    next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});




//port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`App is listening on port: ${port}`);
});


