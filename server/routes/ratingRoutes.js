const express=require("express");
const { addAndUpdateRating, getPersonalRating } = require("../controllers/ratings");
const jwtAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/rating", jwtAuth, addAndUpdateRating);
router.get("/rating", jwtAuth, getPersonalRating);

module.exports=router;



