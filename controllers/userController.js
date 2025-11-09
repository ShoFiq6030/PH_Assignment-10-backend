const { getDB } = require("../db");
const { generateToken } = require("../utils/jwt");

// Create a new user
async function createUser(req, res) {
    try {
        const db = getDB();

        const { name, email, password, photoURL } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = {
            name,
            email,
            password,
            photoURL: photoURL || "",
            createdAt: new Date(),
        };

        const result = await db.collection("users").insertOne(newUser);

        res.status(201).json({
            message: "User registered successfully",
            insertedId: result.insertedId,
        });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Error creating user" });
    }
}

//Login User



async function loginUser(req, res) {
    try {
        const db = getDB();
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        //Find user by email
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Compare password 

        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                createdAt: user.createdAt,
            },
        });

    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ message: "Error logging in user" });
    }
}


// Get single user by email
async function getUserByEmail(req, res) {
    try {
        const db = getDB();
        const email = req.params.email;
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user" });
    }
}

module.exports = { createUser, loginUser, getUserByEmail };
