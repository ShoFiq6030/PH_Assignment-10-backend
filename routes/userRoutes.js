const express = require("express");
const { createUser, loginUser, getUserById, getUserByToken, googleLogin, getAllUsers, updateUser, updateUserAction } = require("../controllers/userController");
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

// get all users (admin only)
router.get("/all-users", verifyToken, getAllUsers);

// update user 
router.patch("/user-details/:id", verifyToken, updateUser);

// update user action 
router.patch("/:id/action", verifyToken, updateUserAction);

module.exports = router;
