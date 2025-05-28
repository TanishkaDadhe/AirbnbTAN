const Listing = require("../models/listing");
const geocodeLocation = require('../utils/geocode');

module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate: {path : "author",},}).populate("owner");

    if(!listing){
        req.flash("error","Listing you resquested for does not exsist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing, tomtomKey: process.env.TOMTOM_API_KEY});
};

module.exports.createListing = async(req, res, next) => {

    const { location } = req.body.listing;

    const geoData = await geocodeLocation(location);

    if (!geoData || !geoData.geometry || !geoData.geometry.coordinates) {
        req.flash("error", "Unable to geocode the location.");
        return res.redirect("/listings/new");
    }
    const [lng, lat] = geoData.geometry.coordinates;

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = {
        type: "Point",
        coordinates: [lng, lat]  // Longitude first, then Latitude
    };
    
    console.log(lng,lat);
    await newListing.save();
    
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing){
        req.flash("error","Listing you resquested for does not exsist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_200");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destoryListing = async(req,res) => {
    let {id} = req.params;
    // await Listing.findByIdAndDelete(id);
    await Listing.findOneAndDelete({ _id: id });
    req.flash("success","Listing is Deleted!");
    res.redirect("/listings");
};