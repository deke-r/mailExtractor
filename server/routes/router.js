const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.post("/extract-emails", emailController.extractEmails);

module.exports = router;