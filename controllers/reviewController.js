const { ObjectId } = require("mongodb");
const { getDB } = require("../db");

// Create new review
async function createReview(req, res) {
    try {
        const db = getDB();
        // console.log(req.body);
        const { propertyId, rating, reviewText } = req.body;
        // console.log(propertyId, rating, reviewText);

        if (!propertyId || !rating) {
            return res.status(400).json({ message: "Property ID and rating are required." });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating should be 1 to 5." });
        }
        const newReview = {
            propertyId: new ObjectId(propertyId),
            userId: new ObjectId(req.user._id),
            userName: req.user.name,
            userEmail: req.user.email,
            rating: Number(rating),
            reviewText: reviewText || "",
            createdAt: new Date(),
        };

        const result = await db.collection("reviews").insertOne(newReview);
        res.status(201).json({ message: "Review added successfully", review: newReview });
    } catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ message: "Error creating review" });
    }
}

// Get all reviews for a property
async function getPropertyReviews(req, res) {
    try {
        const db = getDB();
        const { propertyId } = req.params;
        const propertyObjectId = new ObjectId(propertyId);

        const reviews = await db
            .collection("reviews")
            .find({ propertyId: propertyObjectId })
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ message: "Error fetching reviews" });
    }
}

// Get reviews by logged-in user (My Ratings Page)
async function getMyReviews(req, res) {
  try {
    const db = getDB();
    const userEmail = req.user.email;

    const reviews = await db.collection("reviews").aggregate([
      { $match: { userEmail } },

      {
        $lookup: {
          from: "properties",
          let: { pid: { $toObjectId: "$propertyId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$pid"] } } }
          ],
          as: "propertyData"
        }
      },

      { $unwind: "$propertyData" },

      { $sort: { createdAt: -1 } }
    ]).toArray();

    res.status(200).json(reviews);

  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ message: "Error fetching user reviews" });
  }
}


// Delete review
async function deleteReview(req, res) {
    try {
        const db = getDB();
        const { id } = req.params;

        const review = await db.collection("reviews").findOne({ _id: new ObjectId(id) });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // Only owner can delete their review
        if (review.userEmail !== req.user.email) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await db.collection("reviews").deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({ message: "Error deleting review" });
    }
}

module.exports = {
    createReview,
    getPropertyReviews,
    getMyReviews,
    deleteReview,
};
