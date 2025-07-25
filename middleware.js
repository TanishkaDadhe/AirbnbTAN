const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {

    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; //the url on which the user was before login 
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    };

    next();
};


module.exports.validateListing = async(req,res,next) => {
    const validateListing = (req, res, next) => {
        let {error} = listingSchema.validate(req.body);
        
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
    }
    
    next();
};

module.exports.validateReview = async(req,res,next) => {
    const validateReview = (req, res, next) => {
        let {error} = reviewSchema.validate(req.body);
        
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
    }
    
    next();
};

module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "you are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    };

    next();
};
