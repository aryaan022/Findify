const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model("Review", ReviewSchema);