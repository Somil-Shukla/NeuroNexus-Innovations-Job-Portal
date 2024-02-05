const express=require("express");
const { getFinalApplicants, updateStaus, getAllApplications, getApplicationsForJob, applyForJob } = require("../controllers/jobApplicationHandlers");
const jwtAuth = require("../middlewares/authMiddleware");

const router = express.Router();
// apply for a job [todo: test: done]
router.post("/jobs/:id/applications", jwtAuth,applyForJob);
  
  // recruiter gets applications for a particular job [pagination] [todo: test: done]
router.get("/jobs/:id/applications", jwtAuth,getApplicationsForJob);
  
  // recruiter/applicant gets all his applications [pagination]
router.get("/applications", jwtAuth, getAllApplications);
  
  // update status of application: [Applicant: Can cancel, Recruiter: Can do everything] [todo: test: done]
  router.put("/applications/:id", jwtAuth, updateStaus);
  
  // get a list of final applicants for current job : recruiter
  // get a list of final applicants for all his jobs : recuiter
  router.get("/applicants", jwtAuth, getFinalApplicants)

  module.exports=router;