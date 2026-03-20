const express = require("express");
const router = express.Router();
const { getSpendingComparison } = require("../controllers/statsController");
const { protect } = require("../middleware/authMiddleware");
const { downloadAllTransactions } = require("../controllers/statsController");


router.get("/download-transactions", protect, downloadAllTransactions);
router.get("/compare-months", protect, getSpendingComparison);

module.exports = router;