const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapboxToken = process.env.MAP_ACCESS_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

module.exports = geocodingClient;