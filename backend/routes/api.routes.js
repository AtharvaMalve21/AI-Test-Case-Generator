const express = require("express");

const router = express.Router();

const {
  generateSummaries,
  generateTestCode,
} = require("../controllers/api.controller");

router.post("/generate-summaries", generateSummaries);
router.post("/generate-test-code", generateTestCode);

module.exports = router;
