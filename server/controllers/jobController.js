const Job=require("../models/job");


const addJob=(req, res) => {
    const user = req.user;
  
    if (user.type != "recruiter") {
      res.status(401).json({
        message: "You don't have permissions to add jobs",
      });
      return;
    }
  
    const data = req.body;
  
    let job = new Job({
      userId: user._id,
      title: data.title,
      maxApplicants: data.maxApplicants,
      maxPositions: data.maxPositions,
      dateOfPosting: data.dateOfPosting,
      deadline: data.deadline,
      skillsets: data.skillsets,
      jobType: data.jobType,
      duration: data.duration,
      salary: data.salary,
      rating: data.rating,
    });
  
    job
      .save()
      .then(() => {
        res.json({ message: "Job added successfully to the database" });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }

  const deleteJob=(req, res) => {
    const user = req.user;
    if (user.type != "recruiter") {
      res.status(401).json({
        message: "You don't have permissions to delete the job",
      });
      return;
    }
    Job.findOneAndDelete({
      _id: req.params.id,
      userId: user.id,
    })
      .then((job) => {
        if (job === null) {
          res.status(401).json({
            message: "You don't have permissions to delete the job",
          });
          return;
        }
        res.json({
          message: "Job deleted successfully",
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }

  const getJob=(req, res) => {
    Job.findOne({ _id: req.params.id })
      .then((job) => {
        if (job == null) {
          res.status(400).json({
            message: "Job does not exist",
          });
          return;
        }
        res.json(job);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }

  const getAllJob=(req, res) => {
    let user = req.user;
  
    let findParams = {};
    let sortParams = {};
  
    // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;
  
    // to list down jobs posted by a particular recruiter
    if (user.type === "recruiter" && req.query.myjobs) {
      findParams = {
        ...findParams,
        userId: user._id,
      };
    }
  
    if (req.query.q) {
      findParams = {
        ...findParams,
        title: {
          $regex: new RegExp(req.query.q, "i"),
        },
      };
    }
  
    if (req.query.jobType) {
      let jobTypes = [];
      if (Array.isArray(req.query.jobType)) {
        jobTypes = req.query.jobType;
      } else {
        jobTypes = [req.query.jobType];
      }
      console.log(jobTypes);
      findParams = {
        ...findParams,
        jobType: {
          $in: jobTypes,
        },
      };
    }
  
    if (req.query.salaryMin && req.query.salaryMax) {
      findParams = {
        ...findParams,
        $and: [
          {
            salary: {
              $gte: parseInt(req.query.salaryMin),
            },
          },
          {
            salary: {
              $lte: parseInt(req.query.salaryMax),
            },
          },
        ],
      };
    } else if (req.query.salaryMin) {
      findParams = {
        ...findParams,
        salary: {
          $gte: parseInt(req.query.salaryMin),
        },
      };
    } else if (req.query.salaryMax) {
      findParams = {
        ...findParams,
        salary: {
          $lte: parseInt(req.query.salaryMax),
        },
      };
    }
  
    if (req.query.duration) {
      findParams = {
        ...findParams,
        duration: {
          $lt: parseInt(req.query.duration),
        },
      };
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
  
    console.log(findParams);
    console.log(sortParams);
  
    // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
    // .skip(skip)
    // .limit(limit)
  
    let arr = [
      {
        $lookup: {
          from: "recruiterinfos",
          localField: "userId",
          foreignField: "userId",
          as: "recruiter",
        },
      },
      { $unwind: "$recruiter" },
      { $match: findParams },
    ];
  
    if (Object.keys(sortParams).length > 0) {
      arr = [
        {
          $lookup: {
            from: "recruiterinfos",
            localField: "userId",
            foreignField: "userId",
            as: "recruiter",
          },
        },
        { $unwind: "$recruiter" },
        { $match: findParams },
        {
          $sort: sortParams,
        },
      ];
    }
  
    console.log(arr);
  
    Job.aggregate(arr)
      .then((posts) => {
        if (posts == null) {
          res.status(404).json({
            message: "No job found",
          });
          return;
        }
        res.json(posts);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
 
  const updateJob=(req, res) => {
    const user = req.user;
    if (user.type != "recruiter") {
      res.status(401).json({
        message: "You don't have permissions to change the job details",
      });
      return;
    }
    Job.findOne({
      _id: req.params.id,
      userId: user.id,
    })
      .then((job) => {
        if (job == null) {
          res.status(404).json({
            message: "Job does not exist",
          });
          return;
        }
        const data = req.body;
        if (data.maxApplicants) {
          job.maxApplicants = data.maxApplicants;
        }
        if (data.maxPositions) {
          job.maxPositions = data.maxPositions;
        }
        if (data.deadline) {
          job.deadline = data.deadline;
        }
        job
          .save()
          .then(() => {
            res.json({
              message: "Job details updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
  module.exports={updateJob, getAllJob, getJob, addJob, deleteJob};