const express = require("express");
const {
  getAllProperties,
  addProperty,
  getProperty,
  getAllPropertiesByUserId, deleteProperty,updateProperty
} = require("../controllers/propertyController");
const { verifyToken } = require("../utils/jwt");

const router = express.Router();

// routes
router.get("/", getAllProperties);
router.post("/", verifyToken, addProperty);
router.get("/:propertyId", getProperty)
router.delete("/:propertyId", verifyToken, deleteProperty)
router.patch("/:propertyId", verifyToken, updateProperty)

router.get("/user/:userId", verifyToken, getAllPropertiesByUserId)


module.exports = router;
