const express = require("express");
const bodyParser = require("body-parser");
const passportConfig = require("./config/passportConfig");
const cors = require("cors");
const fs = require("fs");
const dotenv=require("dotenv");
const connectDB = require("./config/connectDB");
dotenv.config();

//Connecting to MongoDB
connectDB();

// initialising directories
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}
if (!fs.existsSync("./public/resume")) {
  fs.mkdirSync("./public/resume");
}
if (!fs.existsSync("./public/profile")) {
  fs.mkdirSync("./public/profile");
}

const app = express();
const port = 4444;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Setting up middlewares
app.use(cors());
app.use(express.json());
app.use(passportConfig.initialize());

// Routing
app.use("/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/jobsRoutes"));
app.use("/api", require("./routes/ratingRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/jobApplicationRoutes"));
app.use("/upload", require("./routes/uploadRoutes"));
app.use("/host", require("./routes/downloadRoutes"));

app.listen(port, () => {
  console.log(`Server started on port ${port}!`);
});
