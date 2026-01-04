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

        if (role === "admin") {
            if (req.user !== "admin") {
                return res.status(400).json({ message: "Only admin can create a admin" });
            }
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
        // console.log(stringPassword);

        const newUser = {
            name,
            email,
            password: stringPassword,
            photoURL: photoURL || "",
            createdAt: new Date(),
            role: role || "user",
            properties: []
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
console.log(password);

        if (password.toString() !== user.password) {
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
                role: user.role,
                properties: user.properties || []
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
                role: "user",
                createdAt: new Date(),
                properties: []
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

//  get all users details
async function getAllUsers(req, res) {
    try {
        const db = getDB();

        // Check if user is admin
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        const users = await db.collection("users").find({}, {
            projection: {
                password: 0,
                googleUid: 0,
                provider: 0
            }
        }).toArray();
        
        // Fetch properties for each user
        const usersWithProperties = await Promise.all(
            users.map(async (user) => {
                const userProperties = await db.collection("properties")
                    .find({ userId: user._id })
                    .sort({ createdAt: -1 })
                    .toArray();
                
                return {
                    ...user,
                    properties: userProperties
                };
            })
        );

        res.status(200).json({
            message: "Users retrieved successfully",
            users: usersWithProperties,
            total: users.length
        });

    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
}

// Update user
async function updateUser(req, res) {
    try {
        const db = getDB();
        const userId = req.params.id;
        const reqUser = req.user._id;
        
        // Check if user is updating their own profile or if admin
        if (userId !== reqUser && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. You can only update your own profile." });
        }

        const { name, email, photoURL, role } = req.body;

        // Build update object only with provided fields
        const updateFields = {};
        
        if (name !== undefined) updateFields.name = name;
        if (email !== undefined) updateFields.email = email;
        if (photoURL !== undefined) updateFields.photoURL = photoURL;
        if (role !== undefined && req.user.role === "admin") updateFields.role = role;

        // If nothing to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Check if email already exists (if email is being updated)
        if (updateFields.email) {
            const existingUser = await db.collection("users").findOne({ 
                email: updateFields.email, 
                _id: { $ne: new ObjectId(userId) } 
            });
            if (existingUser) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        // Perform the update
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateFields }
        );

        // Check if user was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get updated user data
        const updatedUser = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            {
                projection: {
                    password: 0,
                    googleUid: 0,
                    provider: 0
                }
            }
        );

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Error updating user" });
    }
}

// Update user action/status
async function updateUserAction(req, res) {
    try {
        const db = getDB();
        const userId = req.params.id;
        
        // Only admins can perform user actions
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        const { action, reason } = req.body;

        // Validate action
        const validActions = ['suspend', 'activate'];
        if (!action || !validActions.includes(action)) {
            return res.status(400).json({ 
                message: `Invalid action. Valid actions: ${validActions.join(', ')}` 
            });
        }

        // Build update object based on action
        const updateFields = {};
        const now = new Date();
        
        switch (action) {
            case 'suspend':
                updateFields.status = 'suspended';
                updateFields.suspendedAt = now;
                updateFields.suspensionReason = reason || 'Admin suspended';
                break;
            case 'activate':
                updateFields.status = 'active';
                updateFields.suspendedAt = null;
                updateFields.suspensionReason = null;
                break;
           
        }

        // Perform the update
        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateFields }
        );

        // Check if user was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get updated user data
        const updatedUser = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            {
                projection: {
                    password: 0,
                    googleUid: 0,
                    provider: 0
                }
            }
        );

        res.status(200).json({
            message: `User ${action}ed successfully`,
            user: updatedUser
        });

    } catch (err) {
        console.error("Error updating user action:", err);
        res.status(500).json({ message: "Error updating user action" });
    }
}

module.exports = { createUser, loginUser, getUserById, getUserByToken, googleLogin, getAllUsers, updateUser, updateUserAction };
