const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSearchHistorySchema = new Schema({
    // User who performed the search
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    // IP for anonymous users
    ipAddress: String,

    // Search query
    searchQuery: {
        type: String,
        required: true
    },

    // Search filters applied
    filters: {
        category: String,
        city: String,
        minRating: Number,
        maxDistance: Number,
        priceRange: String
    },

    // Results returned
    resultsCount: {
        type: Number,
        default: 0
    },

    // Did user click any results
    resultsClicked: [{
        businessId: Schema.Types.ObjectId,
        timestamp: Date
    }],

    // Search timestamp
    searchedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model("UserSearchHistory", userSearchHistorySchema);
