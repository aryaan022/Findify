if(process.env.NODE_ENV !== "production") {
require("dotenv").config();
}

const express  = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Business = require("./models/Business");
const MethodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const multer = require('multer');
const{storage}= require('./cloudconfig');
const upload = multer({ storage });

const dbUrl = "mongodb://127.0.0.1:27017/localbuisness";


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use(MethodOverride("_method"));
app.engine("ejs",ejsMate);



app.get("/",async(req,res)=>{ 
    let business = await Business.find();
    res.render("index.ejs",{business});

   
});

//new form get request
app.get("/new",(req,res)=>{
    res.render("new.ejs");
});

//new form post request 
app.post("/new", upload.single('image'),async(req,res)=>{
    let {Name, Owner, username, Category, description, Contact, address,email} = req.body;
    let image = { url: req.file.path, filename: req.file.filename };
    let business = new Business({Name, Owner, username, Category, description, Contact, address,email, Image: image});
    await business.save();
    res.redirect("/");
});

//delete route
app.delete("/delete/:id",async(req,res)=>{
    let{id}= req.params;
    let deletedBusiness = await Business.findByIdAndDelete(id);
    console.log(deletedBusiness);
    res.redirect("/");
})

//edit route
app.post("/edit/:id",async(req,res)=>{
    let{id} =req.params;
    let business = await Business.findById(id);
    res.render("edit.ejs",{business});
});

//(edit + update )
app.put("/edit/:id",upload.single("image"),async(req,res)=>{
    let{id}=req.params;
    let {Name, Owner, username, Category, description, Contact, address} = req.body;
    let image = {url:req.file.path, filename:req.file.filename};
    let updatedBusiness = await Business.findByIdAndUpdate(
        id,
        {Name, Owner, username, Category, description, Contact, address, Image: image},
    );
    console.log(updatedBusiness);
    res.redirect("/");
});
//show route
app.get("/show/:id",async(req,res)=>{
    let{id}=req.params;
    let business = await Business.findById(id);
    res.render("show.ejs",{business});
});

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}











app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})





