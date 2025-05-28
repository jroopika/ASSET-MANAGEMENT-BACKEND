const express = require("express");
const Request = require("../models/Request");
const Asset = require("../models/Asset");
const Log = require("../models/Log");

const router = express.Router();

// ✅ 1️⃣ User Requests an Asset
router.post("/request", async (req, res) => {
  try {
    const { userId, assetType, reason } = req.body;

    if (!userId || !assetType || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRequest = new Request({ userId, assetType, reason });
    await newRequest.save();

    await Log.create({
      userId,
      action: "Requested Asset",
      details: `User requested an asset of type: ${assetType}`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Asset request submitted successfully" });
  } catch (error) {
    console.error("Error in POST /request:", error.message);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// ✅ 2️⃣ HOD/Admin Approves or Rejects Request (original flexible route)
router.put("/request/:id", async (req, res) => {
  try {
    const { status, approvedBy } = req.body;

    if (!status || !approvedBy) {
      return res.status(400).json({ message: "Status and ApprovedBy are required" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status === "rejected") {
      return res.status(400).json({ message: "Request was rejected previously" });
    }

    if (status === "approved") {
      request.status = "approved";
      request.approvedBy = approvedBy;
      await request.save();

      await Log.create({
        userId: approvedBy,
        action: "Approved Asset Request",
        details: `Request approved for ${request.assetType} for user ${request.userId}`,
        timestamp: new Date(),
      });
    } else if (status === "rejected") {
      request.status = "rejected";
      request.approvedBy = approvedBy;
      await request.save();

      await Log.create({
        userId: approvedBy,
        action: "Rejected Asset Request",
        details: `Request rejected for ${request.assetType} for user ${request.userId}`,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error("Error in PUT /request/:id:", error.message);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// ✅ Fetch all requests - safe version
router.get("/all", async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Filter out any requests with missing users
    const filtered = requests.filter(req => req.userId !== null);

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error in GET /all:", error.message);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});


// ✅ 4️⃣ Fetch all pending requests for HOD
router.get("/pending", async (req, res) => {
  try {
    const pendingRequests = await Request.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ requestedAt: -1 });

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error("Error in GET /pending:", error.message);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

// ✅ 5️⃣ Admin assigns the asset to the user after HOD approval
router.put("/assignAsset/:requestId", async (req, res) => {
  try {
    const { adminId } = req.body;

    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "approved") {
      return res.status(400).json({ message: "Request must be approved by HOD before assignment" });
    }

    const asset = await Asset.findOne({ type: request.assetType, status: "available" });
    if (!asset) {
      return res.status(400).json({ message: "No available asset of requested type" });
    }

    asset.status = "assigned";
    asset.assignedTo = request.userId;
    await asset.save();

    await Log.create({
      userId: adminId,
      action: "Assigned Asset to User",
      details: `Admin assigned asset of type ${asset.type} to user ${request.userId}`,
      timestamp: new Date(),
    });

    request.status = "assigned";
    await request.save();

    res.status(200).json({ message: "Asset assigned successfully" });
  } catch (error) {
    console.error("Error in PUT /assignAsset/:requestId:", error.message);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// ✅ 6️⃣ Approve request via shortcut route
router.put("/:id/approve", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "rejected") {
      return res.status(400).json({ message: "Cannot approve a rejected request" });
    }

    request.status = "approved";
    await request.save();

    await Log.create({
      userId: request.userId,
      action: "HOD Approved Request",
      details: `Approved request for ${request.assetType}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Request approved successfully" });
  } catch (error) {
    console.error("Error approving request:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 7️⃣ Reject request via shortcut route
router.put("/:id/reject", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    await Log.create({
      userId: request.userId,
      action: "HOD Rejected Request",
      details: `Rejected request for ${request.assetType}`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting request:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 8️⃣ Fetch all approved or assigned requests for HOD dashboard
router.get("/approved", async (req, res) => {
  try {
    const approvedRequests = await Request.find({
      status: { $in: ["approved", "assigned"] }
    })
      .populate("userId", "name email")
      .sort({ requestedAt: -1 });

    res.status(200).json(approvedRequests);
  } catch (error) {
    console.error("Error in GET /approved:", error.message);
    res.status(500).json({ error: "Failed to fetch approved requests" });
  }
});

module.exports = router;
