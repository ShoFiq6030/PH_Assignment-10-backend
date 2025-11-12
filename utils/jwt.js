const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "safasdf";


function generateToken(user) {
    return jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// Verify JWT 
function verifyToken(req, res, next) {
    console.log(req);
    const authHeader = req.headers.authorization;
    // console.log(authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    // console.log(token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        // console.log(req.user);
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
}

module.exports = { generateToken, verifyToken };
