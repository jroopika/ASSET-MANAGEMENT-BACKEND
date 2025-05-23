const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    assetType: {
      type: String,
      required: [true, "Asset type is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason for request is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    hodApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // HOD hasn't approved yet by default
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
