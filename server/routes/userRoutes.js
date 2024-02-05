const express = require("express");
const { getUserDetails, getUserDetailsById, updateUser } = require("../controllers/userDetails");
const jwtAuth = require("../middlewares/authMiddleware");


const router = express.Router();

// get user's detail
router.get("/user", jwtAuth, getUserDetails);

// get user's detail by id
router.get("/user/:id", jwtAuth, getUserDetailsById);

// update user details
router.put("/user", jwtAuth, updateUser);


module.exports=router;