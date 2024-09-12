const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview =async (req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    newReview.author= req.user._id;
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError("Listing not found", 404));
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}