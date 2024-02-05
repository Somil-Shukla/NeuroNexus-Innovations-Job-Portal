// apply for a job [todo: test: done]
const Application = require("../models/application");
const Job = require("../models/job");
const mongoose=require("mongoose");
// router.post("/jobs/:id/applications", jwtAuth,
 const applyForJob=(req, res) => {
    const user = req.user;
    if (user.type != "applicant") {
      res.status(401).json({
        message: "You don't have permissions to apply for a job",
      });
      return;
    }
    const data = req.body;
    const jobId = req.params.id;
  
    // check whether applied previously
    // find job
    // check count of active applications < limit
    // check user had < 10 active applications && check if user is not having any accepted jobs (user id)
    // store the data in applications
  
    Application.findOne({
      userId: user._id,
      jobId: jobId,
      status: {
        $nin: ["deleted", "accepted", "cancelled"],
      },
    })
      .then((appliedApplication) => {
        console.log(appliedApplication);
        if (appliedApplication !== null) {
          res.status(400).json({
            message: "You have already applied for this job",
          });
          return;
        }
  
        Job.findOne({ _id: jobId })
          .then((job) => {
            if (job === null) {
              res.status(404).json({
                message: "Job does not exist",
              });
              return;
            }
            Application.countDocuments({
              jobId: jobId,
              status: {
                $nin: ["rejected", "deleted", "cancelled", "finished"],
              },
            })
              .then((activeApplicationCount) => {
                if (activeApplicationCount < job.maxApplicants) {
                  Application.countDocuments({
                    userId: user._id,
                    status: {
                      $nin: ["rejected", "deleted", "cancelled", "finished"],
                    },
                  })
                    .then((myActiveApplicationCount) => {
                      if (myActiveApplicationCount < 10) {
                        Application.countDocuments({
                          userId: user._id,
                          status: "accepted",
                        }).then((acceptedJobs) => {
                          if (acceptedJobs === 0) {
                            const application = new Application({
                              userId: user._id,
                              recruiterId: job.userId,
                              jobId: job._id,
                              status: "applied",
                              sop: data.sop,
                            });
                            application
                              .save()
                              .then(() => {
                                res.json({
                                  message: "Job application successful",
                                });
                              })
                              .catch((err) => {
                                res.status(400).json(err);
                              });
                          } else {
                            res.status(400).json({
                              message:
                                "You already have an accepted job. Hence you cannot apply.",
                            });
                          }
                        });
                      } else {
                        res.status(400).json({
                          message:
                            "You have 10 active applications. Hence you cannot apply.",
                        });
                      }
                    })
                    .catch((err) => {
                      res.status(400).json(err);
                    });
                } else {
                  res.status(400).json({
                    message: "Application limit reached",
                  });
                }
              })
              .catch((err) => {
                res.status(400).json(err);
              });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.json(400).json(err);
      });
  }
  
  // recruiter gets applications for a particular job [pagination] [todo: test: done]
//   router.get("/jobs/:id/applications", jwtAuth,
const getApplicationsForJob= (req, res) => {
    const user = req.user;
    if (user.type != "recruiter") {
      res.status(401).json({
        message: "You don't have permissions to view job applications",
      });
      return;
    }
    const jobId = req.params.id;
  
    // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;
  
    let findParams = {
      jobId: jobId,
      recruiterId: user._id,
    };
  
    let sortParams = {};
  
    if (req.query.status) {
      findParams = {
        ...findParams,
        status: req.query.status,
      };
    }
  
    Application.find(findParams)
      .collation({ locale: "en" })
      .sort(sortParams)
      // .skip(skip)
      // .limit(limit)
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
  
  // recruiter/applicant gets all his applications [pagination]
//   router.get("/applications", jwtAuth, 
const getAllApplications=(req, res) => {
    const user = req.user;
  
    // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;
  
    Application.aggregate([
      {
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant",
        },
      },
      { $unwind: "$jobApplicant" },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      {
        $lookup: {
          from: "recruiterinfos",
          localField: "recruiterId",
          foreignField: "userId",
          as: "recruiter",
        },
      },
      { $unwind: "$recruiter" },
      {
        $match: {
          [user.type === "recruiter" ? "recruiterId" : "userId"]: user._id,
        },
      },
      {
        $sort: {
          dateOfApplication: -1,
        },
      },
    ])
      .then((applications) => {
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  };
  
  // update status of application: [Applicant: Can cancel, Recruiter: Can do everything] [todo: test: done]
//   router.put("/applications/:id", jwtAuth, 
const updateStaus=(req, res) => {
    const user = req.user;
    const id = req.params.id;
    const status = req.body.status;
  
    // "applied", // when a applicant is applied
    // "shortlisted", // when a applicant is shortlisted
    // "accepted", // when a applicant is accepted
    // "rejected", // when a applicant is rejected
    // "deleted", // when any job is deleted
    // "cancelled", // an application is cancelled by its author or when other application is accepted
    // "finished", // when job is over
  
    if (user.type === "recruiter") {
      if (status === "accepted") {
        // get job id from application
        // get job info for maxPositions count
        // count applications that are already accepted
        // compare and if condition is satisfied, then save
  
        Application.findOne({
          _id: id,
          recruiterId: user._id,
        })
          .then((application) => {
            if (application === null) {
              res.status(404).json({
                message: "Application not found",
              });
              return;
            }
  
            Job.findOne({
              _id: application.jobId,
              userId: user._id,
            }).then((job) => {
              if (job === null) {
                res.status(404).json({
                  message: "Job does not exist",
                });
                return;
              }
  
              Application.countDocuments({
                recruiterId: user._id,
                jobId: job._id,
                status: "accepted",
              }).then((activeApplicationCount) => {
                if (activeApplicationCount < job.maxPositions) {
                  // accepted
                  application.status = status;
                  application.dateOfJoining = req.body.dateOfJoining;
                  application
                    .save()
                    .then(() => {
                      Application.updateMany(
                        {
                          _id: {
                            $ne: application._id,
                          },
                          userId: application.userId,
                          status: {
                            $nin: [
                              "rejected",
                              "deleted",
                              "cancelled",
                              "accepted",
                              "finished",
                            ],
                          },
                        },
                        {
                          $set: {
                            status: "cancelled",
                          },
                        },
                        { multi: true }
                      )
                        .then(() => {
                          if (status === "accepted") {
                            Job.findOneAndUpdate(
                              {
                                _id: job._id,
                                userId: user._id,
                              },
                              {
                                $set: {
                                  acceptedCandidates: activeApplicationCount + 1,
                                },
                              }
                            )
                              .then(() => {
                                res.json({
                                  message: `Application ${status} successfully`,
                                });
                              })
                              .catch((err) => {
                                res.status(400).json(err);
                              });
                          } else {
                            res.json({
                              message: `Application ${status} successfully`,
                            });
                          }
                        })
                        .catch((err) => {
                          res.status(400).json(err);
                        });
                    })
                    .catch((err) => {
                      res.status(400).json(err);
                    });
                } else {
                  res.status(400).json({
                    message: "All positions for this job are already filled",
                  });
                }
              });
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        Application.findOneAndUpdate(
          {
            _id: id,
            recruiterId: user._id,
            status: {
              $nin: ["rejected", "deleted", "cancelled"],
            },
          },
          {
            $set: {
              status: status,
            },
          }
        )
          .then((application) => {
            if (application === null) {
              res.status(400).json({
                message: "Application status cannot be updated",
              });
              return;
            }
            if (status === "finished") {
              res.json({
                message: `Job ${status} successfully`,
              });
            } else {
              res.json({
                message: `Application ${status} successfully`,
              });
            }
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      }
    } else {
      if (status === "cancelled") {
        console.log(id);
        console.log(user._id);
        Application.findOneAndUpdate(
          {
            _id: id,
            userId: user._id,
          },
          {
            $set: {
              status: status,
            },
          }
        )
          .then((tmp) => {
            console.log(tmp);
            res.json({
              message: `Application ${status} successfully`,
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        res.status(401).json({
          message: "You don't have permissions to update job status",
        });
      }
    }
  }
  
  // get a list of final applicants for current job : recruiter
  // get a list of final applicants for all his jobs : recuiter
//   router.get("/applicants", jwtAuth,
const getFinalApplicants= (req, res) => {
    const user = req.user;
    if (user.type === "recruiter") {
      let findParams = {
        recruiterId: user._id,
      };
      if (req.query.jobId) {
        findParams = {
          ...findParams,
          jobId: new mongoose.Types.ObjectId(req.query.jobId),
        };
      }
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          findParams = {
            ...findParams,
            status: { $in: req.query.status },
          };
        } else {
          findParams = {
            ...findParams,
            status: req.query.status,
          };
        }
      }
      let sortParams = {};
  
      if (!req.query.asc && !req.query.desc) {
        sortParams = { _id: 1 };
      }
  
      if (req.query.asc) {
        if (Array.isArray(req.query.asc)) {
          req.query.asc.map((key) => {
            sortParams = {
              ...sortParams,
              [key]: 1,
            };
          });
        } else {
          sortParams = {
            ...sortParams,
            [req.query.asc]: 1,
          };
        }
      }
  
      if (req.query.desc) {
        if (Array.isArray(req.query.desc)) {
          req.query.desc.map((key) => {
            sortParams = {
              ...sortParams,
              [key]: -1,
            };
          });
        } else {
          sortParams = {
            ...sortParams,
            [req.query.desc]: -1,
          };
        }
      }
  
      Application.aggregate([
        {
          $lookup: {
            from: "jobapplicantinfos",
            localField: "userId",
            foreignField: "userId",
            as: "jobApplicant",
          },
        },
        { $unwind: "$jobApplicant" },
        {
          $lookup: {
            from: "jobs",
            localField: "jobId",
            foreignField: "_id",
            as: "job",
          },
        },
        { $unwind: "$job" },
        { $match: findParams },
        { $sort: sortParams },
      ])
        .then((applications) => {
          if (applications.length === 0) {
            res.status(404).json({
              message: "No applicants found",
            });
            return;
          }
          res.json(applications);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(400).json({
        message: "You are not allowed to access applicants list",
      });
    }
  }

  module.exports={ applyForJob,getAllApplications,getApplicationsForJob,getFinalApplicants, updateStaus};