const Listing = require("../models/listing.js");
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index =async (req, res) => {
    const listings = await Listing.find({}).populate("owner");
    res.render("listings/index", { allListings: listings });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
}

module.exports.showListing =async (req, res, next) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews", 
            populate: { path: "author" } 
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
}

module.exports.createListing = async (req, res) => {
   let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
      })
        .send()
        

    let url = req.file.path
    let filename = req.file.filename
    const newListing = new Listing(req.body.listing);
    console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url , filename}
    newListing.geometry =response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}
module.exports.renderEditForm =async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_300")
    res.render("listings/edit", { listing , originalImageUrl });
}

module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file !== "undefined"){
    let url = req.file.path
    let filename = req.file.filename
    listing.image = {url , filename}
    await listing.save();
    }
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res, next) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
}