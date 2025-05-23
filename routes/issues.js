const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Issue = require("../models/Issue"); // Replace with actual path

// POST: Report an issue
router.post("/", async (req, res) => {
  const { assetId, userId, issue } = req.body;

  // Validate input
  if (!assetId || !userId || !issue) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Validate that assetId and userId are valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(assetId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid assetId or userId!" });
  }

  // Create a new issue
  const newIssue = new Issue({
    assetId,
    userId,
    description: issue,
    reportedAt: new Date(),
  });

  try {
    // Save the issue to the database
    await newIssue.save();
    res.status(201).json({ message: "Issue reported successfully!" });
  } catch (error) {
    // Handle server errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// GET: Fetch all reported issues (for admin)
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('assetId', 'name type')  // Populate assetId with asset name and type (changed from assetName to name)
      .populate('userId', 'name email'); // Populate userId with name and email

    res.status(200).json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// PUT: Resolve an issue
router.put("/:issueId/resolve", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.issueId, {
      status: "resolved",
    }, { new: true });  // Update status to 'resolved'

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({ message: "Issue resolved", issue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
