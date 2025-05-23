const Assignment = require("../models/Assignment");
const Asset = require("../models/Asset");
const Log = require("../models/Log");

// Assign asset
exports.createAssignment = async (req, res) => {
  try {
    console.log("📥 Request Body:", req.body);
    const { assetId, userId, assignedBy } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset || asset.status !== "available") {
      return res.status(400).json({ message: "Asset not available" });
    }

    const newAssignment = new Assignment({ assetId, userId, assignedBy });
    const saved = await newAssignment.save();

    asset.status = "assigned";
    asset.assignedTo = userId;
    await asset.save();

    await Log.create({
      userId: assignedBy,
      action: "Assigned asset",
      details: `Assigned asset ${assetId} to user ${userId}`
    });

    res.status(201).json({ message: "Asset assigned successfully", assignment: saved });
  } catch (err) {
    console.error("🔥 Error in createAssignment:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("assetId", "name serialNo")
      .populate("userId", "name email")
      .populate("assignedBy", "name email");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark asset as returned
exports.markAsReturned = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.status = "returned";
    assignment.returnDate = new Date();
    await assignment.save();

    const asset = await Asset.findById(assignment.assetId);
    asset.status = "available";
    asset.assignedTo = null;
    await asset.save();

    await Log.create({
      userId: assignment.userId,
      action: "Returned asset",
      details: `Returned asset ${assignment.assetId}`
    });

    res.status(200).json({ message: "Asset returned successfully" });
  } catch (err) {
    console.error("🔥 Error in markAsReturned:", err);
    res.status(500).json({ error: err.message });
  }
};
