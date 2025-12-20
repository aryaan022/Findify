const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatbotHistorySchema = new Schema({
  // User who had the chat (optional - can be null for anonymous users)
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // Session identifier for anonymous users
  sessionId: {
    type: String,
    unique: false
  },

  // Individual messages in the conversation
  messages: [
    {
      role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 5000
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      feedback: {
        type: String,
        enum: ["👍", "👎", "😊", "❓", null],
        default: null
      }
    }
  ],

  // Track the queries and their results
  searches: [
    {
      query: String,
      resultsCount: Number,
      timestamp: Date
    }
  ],

  // Overall conversation metadata
  startTime: {
    type: Date,
    default: Date.now
  },

  lastInteraction: {
    type: Date,
    default: Date.now
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // Store conversation summary for quick retrieval
  summary: String,

  // User feedback on overall conversation
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  }
});

// Index for faster queries
chatbotHistorySchema.index({ userId: 1, startTime: -1 });
chatbotHistorySchema.index({ sessionId: 1, startTime: -1 });
chatbotHistorySchema.index({ lastInteraction: 1 });

// Auto-expire old anonymous chat histories after 30 days
chatbotHistorySchema.index(
  { lastInteraction: 1 },
  { expireAfterSeconds: 2592000, partialFilterExpression: { userId: null } }
);

module.exports = mongoose.model("ChatbotHistory", chatbotHistorySchema);
