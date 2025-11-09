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

module.exports = { getAllProperties, addProperty };
