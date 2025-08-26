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
    favorites:[{
        type:Schema.Types.ObjectId,
        ref:"Business"
    }]
})

UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User",UserSchema);
module.exports = User;  