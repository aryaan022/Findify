const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    Owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        enum: ["Restaurant", "Services", "Dealership", "Cafe", "Shops","Retail","Books","Automotive","Other","Entertainment","Health","Beauty"],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    Contact: {
        type: String,
        minlength: 10,
        maxlength: 10,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    Image: {
        url: String,
        filename: String
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    avgRating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true }) // adds createdAt & updatedAt automatically

businessSchema.index({ geometry: "2dsphere" });//this allows $near queries in MongoDB.
const Business = mongoose.model("Business", businessSchema);
module.exports = Business;