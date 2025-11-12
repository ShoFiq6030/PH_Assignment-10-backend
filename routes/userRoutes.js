const express = require("express");
const { createUser, loginUser, getUserByEmail,getUserByToken } = require("../controllers/userController");
const { verifyToken } = require("../utils/jwt");

const router = express.Router();

// Create new user (register)
router.post("/signup", createUser);

// login user 

router.post('/login', loginUser)



// Get single user by email 
router.get("/:email", getUserByEmail);

// get user by token 
router.get("/token/profile",verifyToken, getUserByToken);



module.exports = router;
