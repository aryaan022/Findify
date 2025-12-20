const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessAnalyticsSchema = new Schema({
    // Reference to the business
    businessId: {
        type: Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        unique: true,
        index: true
    },

    // View tracking
    totalViews: {
        type: Number,
        default: 0
    },
    
    viewsThisMonth: {
        type: Number,
        default: 0
    },
    
    viewsThisWeek: {
        type: Number,
        default: 0
    },

    // Click tracking
    totalClicks: {
        type: Number,
        default: 0
    },
    
    clicksThisMonth: {
        type: Number,
        default: 0
    },

    // Message tracking
    totalMessages: {
        type: Number,
        default: 0
    },
    
    messagesThisMonth: {
        type: Number,
        default: 0
    },
    
    unreadMessages: {
        type: Number,
        default: 0
    },
    
    avgResponseTime: {
        type: Number, // in minutes
        default: 0
    },

    // Review & Rating metrics
    totalReviews: {
        type: Number,
        default: 0
    },
    
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    reviewsThisMonth: {
        type: Number,
        default: 0
    },

    // Visitor demographics
    visitorsData: {
        uniqueVisitors: {
            type: Number,
            default: 0
        },
        repeatVisitors: {
            type: Number,
            default: 0
        },
        avgSessionDuration: {
            type: Number, // in seconds
            default: 0
        }
    },

    // Trending metrics
    trendingScore: {
        type: Number,
        default: 0
    },

    // Historical data for charts
    dailyViews: [{
        date: Date,
        count: Number
    }],

    monthlyViews: [{
        month: String,
        count: Number
    }],

    // Last updated
    lastUpdated: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
businessAnalyticsSchema.index({ trendingScore: -1 });
businessAnalyticsSchema.index({ avgRating: -1 });
businessAnalyticsSchema.index({ totalViews: -1 });

module.exports = mongoose.model("BusinessAnalytics", businessAnalyticsSchema);
