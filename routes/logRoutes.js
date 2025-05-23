const express = require("express");
const Log = require("../models/Log");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get Logs: Admin can access all, User can access their own logs
router.get("/", protect, async (req, res) => {
    const user = req.user;
if (!user) {
  return res.status(401).json({ message: "Unauthorized: No user found" });
}
const { userId, role } = user;


    try {
        if (role === "admin") {
            // Admin can access all logs
            const logs = await Log.find().sort({ timestamp: -1 });
            return res.status(200).json(logs);
        }

        // Regular user can access only their own logs
        const userLogs = await Log.find({ userId }).sort({ timestamp: -1 });
        return res.status(200).json(userLogs);
        
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
