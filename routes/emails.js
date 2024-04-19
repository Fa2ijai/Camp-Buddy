const express = require("express");
const { sendEmail } = require("../controllers/emails");

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middleware/auth");
router.route("/").post(protect, authorize("admin"), sendEmail);

module.exports = router;
