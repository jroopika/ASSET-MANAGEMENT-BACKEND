const express = require("express");
const Log = require("../models/Log");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get Logs: Admin can access all, User can access their own logs (or HOD specific logs)
router.get("/", protect, async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    const { userId, role } = user;

    try {
        let logs;
        if (role === "admin") {
            // Admin can access all logs, populated with userName
            logs = await Log.find().populate('userId', 'name').sort({ timestamp: -1 });
        } else if (role === "hod") {
            // HOD can access logs related to their actions, populated with userName
            // This assumes logs created by HODs (e.g., approvals) use the HOD's userId
            logs = await Log.find({ userId: userId }).populate('userId', 'name').sort({ timestamp: -1 });
        } else {
            // Regular user can access only their own logs, populated with userName
            logs = await Log.find({ userId: userId }).populate('userId', 'name').sort({ timestamp: -1 });
        }
        return res.status(200).json(logs);
        
    } catch (error) {
        console.error("Error fetching logs:", error); // Added console log for better debugging
        res.status(500).json({ error: "Server error" });
    }
});

// Get Logs by User ID
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const logs = await Log.find({ userId }).populate('userId', 'name').sort({ timestamp: -1 });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs by user ID:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;