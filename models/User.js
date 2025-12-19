const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    role:{
        type:String,
        enum:["user","Vendor","admin"],
        default:"user"
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    favorites:[{
        type:Schema.Types.ObjectId,
        ref:"Business"
    }],
    PremiumUser:{
        type:Boolean,
        default:false
    },
    premiumExpiresAt: {
        type: Date,
        default: null
    },
    // OTP for email verification (signup)
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    // OTP for password reset
    resetOtp: {
        type: String,
        default: null
    },
    resetOtpExpiry: {
        type: Date,
        default: null
    },
    // OAuth providers
    googleId: {
        type: String,
        default: null
    },
    githubId: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    // Social login profile info
    profilePicture: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

UserSchema.virtual('isPremium').get(function() {//virtual property will not be stored in DB it is calculated on the fly 
    // 'this' refers to the user document
    // If premiumExpiresAt is not null and is a date in the future, they are premium.
    return this.premiumExpiresAt && this.premiumExpiresAt > new Date();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",UserSchema);
module.exports = User;  