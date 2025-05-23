const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["available", "assigned", "in use", "maintenance"],
    default: "available"
  },
  qrCode: String, // Base64 QR image
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  history: [
    {
      action: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);
