const express = require("express");
const { createUser, loginUser, getUserByEmail } = require("../controllers/userController");

const router = express.Router();

// Create new user (register)
router.post("/signup", createUser);

// login user 

router.post('/login', loginUser)



// Get single user by email 
router.get("/:email", getUserByEmail);

module.exports = router;
