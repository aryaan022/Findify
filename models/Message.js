const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    // The conversation this message belongs to
    conversation: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },

    // Who sent the message
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Who receives the message
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // The actual message content
    content: {
        type: String,
        required: true,
        maxlength: 5000 // Limit message length
    },

    // Track if message has been read
    isRead: {
        type: Boolean,
        default: false
    },

    // Track when it was read (for "seen at" feature)
    readAt: {
        type: Date,
        default: null
    },

    // Soft delete: message not permanently deleted but marked as deleted
    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },

    // For future: attachment support
    attachments: [
        {
            url: String,
            filename: String,
            type: String // 'image', 'document', etc.
        }
    ]

}, { timestamps: true });

// Index for fast message retrieval in a conversation
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, isRead: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });

// Automatically update conversation's lastMessage when a new message is created
messageSchema.post('save', async function(doc) {
    const Conversation = mongoose.model('Conversation');
    await Conversation.findByIdAndUpdate(
        doc.conversation,
        {
            lastMessage: doc.content.substring(0, 100),
            lastMessageTime: doc.createdAt,
            lastMessageSender: doc.sender
        }
    );
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
