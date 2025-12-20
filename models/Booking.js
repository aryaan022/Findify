const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    // Business being booked
    businessId: {
        type: Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },

    // User making the booking
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    // Booking details
    customerName: {
        type: String,
        required: true
    },

    customerEmail: {
        type: String,
        required: true
    },

    customerPhone: {
        type: String,
        required: true
    },

    // Service/item being booked
    serviceName: {
        type: String,
        required: true
    },

    description: {
        type: String,
        maxlength: 1000
    },

    // Date and time
    bookingDate: {
        type: Date,
        required: true,
        index: true
    },

    bookingTime: {
        type: String, // HH:MM format
        required: true
    },

    duration: {
        type: Number, // in minutes
        default: 30
    },

    // Booking status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
        default: 'pending',
        index: true
    },

    // Number of guests/items
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },

    // Pricing
    price: {
        type: Number,
        required: true
    },

    // Payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },

    // Special requests
    specialRequests: {
        type: String,
        maxlength: 500
    },

    // Notes from business owner
    businessNotes: {
        type: String,
        maxlength: 500
    },

    // Cancellation details
    cancelledAt: Date,
    cancellationReason: String,

    // Reminder sent
    reminderSent: {
        type: Boolean,
        default: false
    },

    reminderSentAt: Date,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
bookingSchema.index({ businessId: 1, bookingDate: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
