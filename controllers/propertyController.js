const { getDB } = require("../db");
const { ObjectId } = require("mongodb");

// GET all properties
async function getAllProperties(req, res) {
  try {
    const db = getDB();

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    


    const order = req.query.order === "asc" ? 1 : -1;

    // console.log(search);

    const searchFilter = search
      ? { propertyName: { $regex: search, $options: "i" } }
      : {};

    const properties = await db
      .collection("properties")
      .find(searchFilter)
      .sort({ [sortBy]: order })
      .toArray();

    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching properties" });
  }
}


//delete property
async function deleteProperty(req, res) {
  try {
    const { propertyId } = req.params;


    if (!propertyId) {
      return res.status(400).json({ message: "Invalid property ID " });
    }

    const db = getDB();
    const collection = db.collection("properties");


    const result = await collection.deleteOne({
      _id: new ObjectId(propertyId),
    });


    if (result.deletedCount === 0) {

      return res.status(404).json({ message: "Property not found" });
    }


    res.status(200).json({ message: "Property deleted successfully" });

  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ message: "Error deleting property" });
  }
}
//update property
/**
 * PATCH /properties/:propertyId
 * Updates a property with the provided fields.
 */
async function updateProperty(req, res) {
  try {
    const { propertyId } = req.params;
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
    } = req.body;

    // ---- 1. Validate ID -------------------------------------------------
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    // console.log(propertyId);

    // ---- 2. Build the $set object only with supplied fields ------------
    const updateFields = {};

    if (propertyName !== undefined) updateFields.propertyName = propertyName;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (price !== undefined) updateFields.price = Number(price);
    if (Rooms !== undefined) updateFields.Rooms = Number(Rooms);
    if (Bedrooms !== undefined) updateFields.Bedrooms = Number(Bedrooms);
    if (Bath !== undefined) updateFields.Bath = Number(Bath);
    if (Garages !== undefined) updateFields.Garages = Number(Garages);
    if (location !== undefined) updateFields.location = location;
    if (image !== undefined) updateFields.image = image;

    // If nothing to update → early return
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // console.log(updateFields);
    // ---- 3. Perform the update -----------------------------------------
    const db = getDB();
    const result = await db
      .collection("properties")
      .updateOne(
        { _id: new ObjectId(propertyId) },
        { $set: updateFields }
      );
    // console.log(result);
    // ---- 4. Check if the document existed -------------------------------
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Optional: fetch & return the fresh document
    const updatedProperty = await db
      .collection("properties")
      .findOne({ _id: new ObjectId(propertyId) });

    // ---- 5. Success response --------------------------------------------
    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (err) {
    console.error("Error updating property:", err);
    res.status(500).json({ message: "Internal server error" });
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



module.exports = { getAllProperties, addProperty, getProperty, getAllPropertiesByUserId, deleteProperty, updateProperty };
