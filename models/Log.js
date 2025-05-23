const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who performed the action
    action: { type: String, required: true }, // What action was performed
    details: { type: String }, // Extra details about the action
    timestamp: { type: Date, default: Date.now } // When it happened
}, { timestamps: true });

module.exports = mongoose.model("Log", LogSchema);
