const express = require("express");

const router = express.Router();

const {
  connect,
  content,
  createPr,
} = require("../controllers/github.controller");

router.post("/connect", connect);
router.post("/file-content", content);
router.post("/create-pr", createPr);

module.exports = router;
