const express = require("express");

const authController=require("../controllers/authController");
const router = express.Router();
router.post("/signup", authController.signupController);

router.post("/login", authController.loginController);

module.exports = router;
