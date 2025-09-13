const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
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
    premiumExpiresAt: {
        type: Date,
        default: null
    },
    
})


UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
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