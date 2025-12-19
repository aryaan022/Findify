const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    // The two participants in the conversation
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],

    // Track which user is a vendor (for context)
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Optional: link to the business being discussed
    businessId: {
        type: Schema.Types.ObjectId,
        ref: "Business"
    },

    // Last message for preview
    lastMessage: {
        type: String,
        maxlength: 500
    },

    lastMessageTime: {
        type: Date
    },

    lastMessageSender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    // Track if conversation is active or archived
    isActive: {
        type: Boolean,
        default: true
    },

    // Block conversation if either party requests it
    blockedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true });

// Index for fast queries: find conversations for a user
conversationSchema.index({ participants: 1 });
conversationSchema.index({ vendorId: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Index for finding specific conversation between two users
conversationSchema.index({ participants: 1, vendorId: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
