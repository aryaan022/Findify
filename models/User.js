const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
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
    favorites:[{
        type:Schema.Types.ObjectId,
        ref:"Business"
    }],
    PremiumUser:{
        type:Boolean,
        default:false
    },
    premiumExpiresAt: [{
        type: Date,
        default: null
    }],
})

UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",UserSchema);
module.exports = User;  