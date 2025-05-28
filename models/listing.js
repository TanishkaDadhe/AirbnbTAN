const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({ //template for collection 
    title : {
        type : String,
        required : true,
        default: "Default Title",
    },
    description : String,
    image: {
        url : String,
        filename : String,
    },
    price : Number,
    location : String,
    country : String,
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : "Review",
        },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    category : {
        type : String,
        enum : ["Cities","Mountains","Pools","Camping","Farms","Artic","Forest","Historic","Beaches","Deserts","Lakeside","Adventure","Spiritual","Other"],
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
});

//whenever findbyIdAndDelete is called in delete route then findOneAndDelete gets used.
// we use a middleware in here in which if a listing is deleted then all the reviews of that particular listing also get deleted.
listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema); //created collection called Listing
module.exports = Listing;