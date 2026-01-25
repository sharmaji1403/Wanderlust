const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../Models/review.js");
const Listing = require ("../Models/listing");
const {validateReview, isloggedIn ,isReviewAuthor} = require("../middleware.js");


// Review Controller
const reviewController = require("../controllers/reviews.js");

// Review route
router.post("/", validateReview ,isloggedIn, wrapAsync(reviewController.createReview));


//  Delete Review 
router.delete("/:reviewId",isloggedIn, isReviewAuthor,  wrapAsync(reviewController.deleteReview));

module.exports = router;
