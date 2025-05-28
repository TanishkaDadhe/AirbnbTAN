const axios = require("axios");

const geocodeLocation = async (location) => {
    try {
        const response = await axios.get("https://api.tomtom.com/search/2/geocode/" + encodeURIComponent(location) + ".json", {
            params: {
                key: process.env.TOMTOM_API_KEY
            }
        });

        const results = response.data.results;

        if (results.length === 0) {
            return null;
        }

        const coordinates = results[0].position;
        return {
            geometry: {
                type: "Point",
                coordinates: [coordinates.lon, coordinates.lat]  // Longitude, Latitude
            }
        };
    } catch (error) {
        console.error("Geocoding error:", error.message);
        return null;
    }
};


module.exports = geocodeLocation;
