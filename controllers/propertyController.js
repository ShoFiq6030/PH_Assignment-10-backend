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
    const property = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection("properties").insertOne(property);

    res.status(201).json({
      message: "Property added successfully",
      insertedId: result.insertedId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding property" });
  }
}


module.exports = { getAllProperties, addProperty, getProperty };
