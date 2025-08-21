const Business = require("./models/Business");
const user = require("./models/User");

module.exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that");
    res.redirect("/login");
}


module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const business = await Business.findById(id);
    if (!business || !business.Owner || !req.user) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/show/${id}`);
    }
    if (!business.Owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/show/${id}`);
    }
    next();
};

module.exports.isVendor = async(req,res,next)=>{
     if (!req.user || req.user.role !== "Vendor") {
        req.flash("error", "Please log in as a vendor to do that");
        return res.redirect("/");
    }
    next();
};
