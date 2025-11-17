const express = require("express");
const { createUser, loginUser, getUserById, getUserByToken, googleLogin } = require("../controllers/userController");
const { verifyToken } = require("../utils/jwt");

const router = express.Router();

// Create new user (register)
router.post("/signup", createUser);

// login user 

router.post('/login', loginUser)

// google login 

router.post("/google-login", googleLogin);


// Get single user by id 
router.get("/user-details/:id", verifyToken,getUserById);

// get user by token 
router.get("/token/profile", verifyToken, getUserByToken);





module.exports = router;
