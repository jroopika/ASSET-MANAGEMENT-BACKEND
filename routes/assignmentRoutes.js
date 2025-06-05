const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const Assignment = require('../models/Assignment'); // Ensure this import is correct based on the file structure

// Assign asset (Admin)
router.post("/assign", async (req, res) => {
    const { assetId, userId } = req.body;

    try {
        // Create the assignment
        const assignment = await assignmentController.createAssignment(req, res);

        // If assignment is successful, update the asset status
        if (assignment) {
            const asset = await Asset.findById(assetId);
            // When assigning an asset
            asset.status = "assigned";
            asset.assignedTo = userId;
            await asset.save();
        }
    } catch (error) {
        console.error("Error in assigning asset:", error);
        return res.status(500).json({ error: "Failed to assign asset" });
    }
});

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
