const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JobApplicant = require("../models/applicant");
const Recruiter = require("../models/recruiter");
const dotenv=require("dotenv");
dotenv.config();
// const router = express.Router();

const signupController= (req, res) => {
  const data = req.body;
  let user = new User({
    email: data.email,
    password: data.password,
    type: data.type,
  });
  user
    .save()
    .then(() => {
      const userDetails =
        user.type == "recruiter"
          ? new Recruiter({
              userId: user._id,
              name: data.name,
              contactNumber: data.contactNumber,
              bio: data.bio,
            })
          : new JobApplicant({
              userId: user._id,
              name: data.name,
              education: data.education,
              skills: data.skills,
              rating: data.rating,
              resume: data.resume,
              profile: data.profile,
            });

      userDetails
        .save()
        .then(() => {
          // Token
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
          res.json({
            token: token,
            type: user.type,
          });
        })
        .catch((err) => {
            user.deleteOne({ _id: user._id }).exec()
            .then(() => {
              res.status(400).json(err);
            })
            .catch((err) => {
              res.json({ error: err });
            });
          err;
        });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const loginController= (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      // Token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.json({
        token: token,
        type: user.type,
      });
    }
  )(req, res, next);
};

module.exports = {signupController,loginController};
