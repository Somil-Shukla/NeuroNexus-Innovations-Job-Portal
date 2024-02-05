const express = require("express");

const jwtAuth = require("../middlewares/authMiddleware");
const { addJob, getAllJob, getJob, updateJob, deleteJob } = require("../controllers/jobController");

const router = express.Router();

// To add new job
router.post("/jobs", jwtAuth, addJob);

//to get all the jobs
router.get("/jobs", jwtAuth, getAllJob);

//get a particular job
router.get("/jobs/:id", jwtAuth, getJob);

//update a job
router.put("/jobs/:id", jwtAuth, updateJob);

//delete a job
router.delete("/jobs/:id", jwtAuth, deleteJob);

module.exports=router;