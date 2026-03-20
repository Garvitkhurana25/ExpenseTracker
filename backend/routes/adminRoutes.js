const express = require("express");
const router = express.Router();
const { getAdminStats, getAllUsers, deleteUser } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const { exportDataCSV } = require("../controllers/adminController");
const { getSpendingComparison } = require("../controllers/statsController");



router.get("/stats", protect, admin, getAdminStats); 
router.get("/users", protect, admin, getAllUsers);
router.delete("/users/:id", protect, admin, deleteUser);
router.get("/export-csv", protect, admin, exportDataCSV);
router.get("/chart", protect, admin, getSpendingComparison);

module.exports = router;