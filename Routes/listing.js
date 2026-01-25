const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require ("../Models/listing");
const {isloggedIn,isOwner,validateListing} = require ("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


// Require controllers
const listingController = require("../controllers/listings.js");

// Index or Create route 

router.route("/")
.get(wrapAsync (listingController.index))
.post(isloggedIn , upload.single("listing[image]"),validateListing  , wrapAsync(listingController.createListing));



// New Route 

router.get("/new" , isloggedIn , listingController.renderNewForm);


// Show ,  Update  or delete route

router.route("/:id")
.get(wrapAsync (listingController.showListing))
.put( isloggedIn,isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete( isloggedIn,isOwner, wrapAsync(listingController.deleteListing));


// Edit Route
router.get("/:id/edit",isloggedIn ,isOwner, wrapAsync(listingController.renderEditForm));


module.exports= router;