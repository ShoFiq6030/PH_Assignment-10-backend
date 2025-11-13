const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

// GET all properties
async function getAllProperties(req, res) {
  try {
    const db = getDB();
    const properties = await db
      .collection("properties")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching properties" });
  }
}

// get all properties by user ID
async function getAllPropertiesByUserId(req, res) {
  try {
    const { userId } = req.params;
    const db = getDB();

    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Filter by userId
    const properties = await db
      .collection("properties")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties by user:", err);
    res.status(500).json({ message: "Error fetching properties" });
  }
}

//GET a properties
async function getProperty(req, res) {
  const { propertyId } = req.params
  const propertyObjectId = new ObjectId(propertyId);
  try {
    const db = getDB();
    const property = await db
      .collection("properties")
      .findOne({ _id: propertyObjectId })
    // console.log(property);

    if (property) {
      res.status(200).json(property);
    } else {
      res.status(404).json({ message: "Property not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching properties" });
  }
}

// POST add new property

async function addProperty(req, res) {
  try {
    const db = getDB();

    const {
      propertyName,
      description,
      category,
      price,
      Rooms,
      Bedrooms,
      Bath,
      Garages,
      location,
      image,
      userId,
      userName,
      userEmail,
    } = req.body;

    // ✅ Validation
    if (
      !propertyName ||
      !description ||
      !category ||
      !price ||
      !Rooms ||
      !Bedrooms ||
      !Bath ||
      !Garages ||
      !location ||
      !image
    ) {
      return res.status(400).json({
        message:
          "All fields are required: propertyName, description, category, price, Rooms, Bedrooms, Bath, Garages, location, and image.",
      });
    }

    const property = {
      propertyName,
      description,
      category,
      price: Number(price),
      Rooms: Number(Rooms),
      Bedrooms: Number(Bedrooms),
      Bath: Number(Bath),
      Garages: Number(Garages),
      location,
      image,
      userId: new ObjectId(userId),
      userName,
      userEmail,
      createdAt: new Date(),
    };

    // ✅ Insert into DB
    const result = await db.collection("properties").insertOne(property);

    return res.status(201).json({
      message: "Property added successfully.",
      propertyId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding property:", error.message);
    return res.status(500).json({
      message: "Internal Server Error. Failed to add property.",
      error: error.message,
    });
  }
}



module.exports = { getAllProperties, addProperty, getProperty, getAllPropertiesByUserId };
