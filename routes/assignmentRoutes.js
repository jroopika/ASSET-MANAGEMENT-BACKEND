const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const Assignment = require('../models/Assignment'); // Ensure this import is correct based on the file structure

// Assign asset (Admin)
router.post("/assign", assignmentController.createAssignment);

// Get all assignments
router.get("/", assignmentController.getAllAssignments);
// routes/assignmentRoutes.js

// Fetch all assigned assets
router.get("/assigned", async (req, res) => {
    try {
      const assignedAssets = await Assignment.find({ status: "assigned" })
        .populate("assetId", "name serialNo")
        .populate("userId", "name email")
        .populate("assignedBy", "name email")
        .sort({ assignedAt: -1 });
  
      res.status(200).json(assignedAssets);
    } catch (err) {
      console.error("Error fetching assigned assets:", err);
      res.status(500).json({ error: "Failed to fetch assigned assets" });
    }
  });
  
// Return assigned asset
router.put("/return/:id", assignmentController.markAsReturned);

module.exports = router;
