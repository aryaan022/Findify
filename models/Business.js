const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    Owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Name:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        enum: ["Restaurant","Services","Dealership","Cafe","Shops"],
        required:true
    },
    description:{
        type:String,
        required:true
    },
    Contact:{
        type:String,
        minlength:10,
        maxlength:10,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    Image:{
        url:String,
        filename:String
    }
},{timestamps:true}) // adds createdAt & updatedAt automatically


const Business = mongoose.model("Business",businessSchema);
module.exports = Business;