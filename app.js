if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express  = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");





const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB ")
    })
    .catch(err => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" ,  ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret: process.env.SECRET,
    }
});

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     touchAfter: 24 * 3600,
// });
store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------------ ROUTES ------------------------

// app.use((req, res , next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currentUser = req.user;
//     next();
// }); 



app.use((req, res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // Change this line to handle undefined case
    res.locals.currentUser = req.user || null; 
    next();
});

app.get("/", (req, res) => {
    return res.redirect("/listings"); // return lagana safe hai
});
// Router use
app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);


app.all("*" , (req , res, next) => {
    next( new ExpressError(404 , "page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    
    // Agar response pehle hi ja chuka hai, toh dubara render mat karo
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(statusCode).render("listing/error.ejs", { message });
});


// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing ({
//         title: "My New Villa",
//         description : "By the Beach",
//         price: 1200,
//         location: "Maldives",
//         country: "Malasiya",
//     });

//    await  sampleListing.save();
//    console.log("sample was saved");
//    res.send("Sucessfull testing");
// });

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});