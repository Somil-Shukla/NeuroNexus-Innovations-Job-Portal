const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { promisify } = require("util");

const router = express.Router();
const upload = multer();

// Handle file uploads for resume
router.post("/resume", upload.single("file"), async (req, res) => {
  const { file } = req;

  const fileExtension = file.originalname.split(".").pop();

  if (fileExtension !== "pdf") {
    return res.status(400).json({
      message: "Invalid format",
    });
  }

  const filename = `${uuidv4()}.${fileExtension}`;
  const filePath = `${__dirname}/../public/resume/${filename}`;

  try {
    await fs.promises.writeFile(filePath, file.buffer);

    res.json({
      message: "File uploaded successfully",
      url: `/host/resume/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error while uploading",
    });
  }
});

// Handle file uploads for profile images
router.post("/profile", upload.single("file"), async (req, res) => {
  const { file } = req;

  const fileExtension = file.originalname.split(".").pop();

  if (fileExtension !== "jpg" && fileExtension !== "png") {
    return res.status(400).json({
      message: "Invalid format",
    });
  }

  const filename = `${uuidv4()}.${fileExtension}`;
  const filePath = `${__dirname}/../public/profile/${filename}`;

  try {
    await fs.promises.writeFile(filePath, file.buffer);

    res.json({
      message: "Profile image uploaded successfully",
      url: `/host/profile/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error while uploading",
    });
  }
});

module.exports = router;
