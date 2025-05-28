const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))  //Index route
.post(isLoggedIn, validateListing, upload.single("listing[image]"), wrapAsync(listingController.createListing)); //Create route

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Filter by category route
router.get("/category/:category", async (req, res) => {
    const category = req.params.category;
    const allListings = await Listing.find({ category: category });
    res.render("listings/index", { allListings, location: category });
});

//search route 
router.get("/search", async (req, res) => {
    const locationQuery = req.query.location || "";
    const allListings = await Listing.find({
      location: { $regex: new RegExp(locationQuery, "i") } // case-insensitive match
    });
    res.render("listings/index", { allListings, location: locationQuery });
});

//Show route
router.get("/:id", wrapAsync(listingController.showListing));

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

//Update route
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));

//Delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destoryListing));

module.exports = router;