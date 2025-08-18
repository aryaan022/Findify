const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
    Owner:{
        type:String,
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
    email:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    Contact:{
        type:String,
        min:10,
        max:10,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    Image:{
        url:{
            type:String,
            required:true
        },
        filename:{
            type:String,
        }
    }

})

const Business = mongoose.model("Business",businessSchema);
module.exports = Business;