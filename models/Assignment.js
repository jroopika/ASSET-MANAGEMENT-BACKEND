// models/Assignment.js
const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["assigned", "returned"], default: "assigned" },
    assignedAt: { type: Date, default: Date.now },
    returnDate: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
