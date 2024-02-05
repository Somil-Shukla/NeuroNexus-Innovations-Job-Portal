const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.get("/resume/:file", (req, res) => {
  const address = path.join(__dirname, `../public/resume/${req.params.file}`);

  if (!fileExists(address)) {
    return res.status(404).json({
      message: "Resume not found",
    });
  }

  res.sendFile(address);
});

router.get("/profile/:file", (req, res) => {
  const address = path.join(__dirname, `../public/profile/${req.params.file}`);

  if (!fileExists(address)) {
    return res.status(404).json({
      message: "Profile image not found",
    });
  }

  res.sendFile(address);
});

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = router;
