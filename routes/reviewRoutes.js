const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/jwt");
const {
  createReview,
  getPropertyReviews,
  getMyReviews,
  deleteReview,
} = require("../controllers/reviewController");

// Public — get all reviews for a property
router.get("/all-reviews/:propertyId", getPropertyReviews);

// Private — add review
router.post("/add-review", verifyToken, createReview);

// Private — get user's own reviews
router.get("/my-reviews", verifyToken, getMyReviews);

// Private — delete a review
router.delete("/:id", verifyToken, deleteReview);

module.exports = router;
