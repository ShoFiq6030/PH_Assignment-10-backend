const { getDB } = require("../db");
const { generateToken } = require("../utils/jwt");
const admin = require("../firebase/firebaseAdmin");
const { ObjectId } = require("mongodb");


// Create a new user
async function createUser(req, res) {
    try {
        const db = getDB();

        const { name, email, password, photoURL, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        if (req.user !== "admin") {
            return res.status(400).json({ message: "Only admin can create a admin" });
        }

        // 🔍 Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z]).{6,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, and be at least 6 characters long."
            });
        }

        // Check if user exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const stringPassword = password.toString()
        console.log(stringPassword);

        const newUser = {
            name,
            email,
            password: stringPassword,
            photoURL: photoURL || "",
            createdAt: new Date(),
            role: role || "user"
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
        // console.log(email);

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
                role:user.role
            },
        });

    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(500).json({ message: "Error logging in user" });
    }
}


// Get single user by email
async function getUserById(req, res) {
    try {
        const db = getDB();
        const userId = req.params.id;
        const reqUser = req.user._id
        // console.log(userId,reqUser);
        if (userId !== reqUser) {
            return res.status(404).json({ message: "Unauthorized" });
        }
        const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user" });
    }
}

// get user info with token
async function getUserByToken(req, res) {

    try {
        const db = getDB();
        const userData = req.user;
        // console.log(userData);
        const email = userData.email
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found..." });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user" });
    }
}

// login by google 
async function googleLogin(req, res) {
    const { firebaseToken } = req.body;

    try {
        // Verify Firebase ID token

        const decoded = await admin.auth().verifyIdToken(firebaseToken);

        const db = getDB();
        const users = db.collection("users");

        // Check if user exists
        let user = await users.findOne({ email: decoded.email });

        // If not, create new user
        if (!user) {
            const newUser = {
                name: decoded.name || decoded.email.split("@")[0],
                email: decoded.email,
                photoURL: decoded.picture,
                googleUid: decoded.uid,
                provider: "google",
                createdAt: new Date(),
            };

            const result = await users.insertOne(newUser);
            user = { _id: result.insertedId, ...newUser };
        }

        // Create your own JWT token
        const token = generateToken(user)

        res.status(200).json({ token, user });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(401).json({ message: "Invalid Google token", error: err.message });
    }
};



module.exports = { createUser, loginUser, getUserById, getUserByToken, googleLogin };
