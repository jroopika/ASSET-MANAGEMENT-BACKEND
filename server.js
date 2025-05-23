const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Dynamic CORS (allow all origins during development)
app.use(cors({
  origin: true,
  credentials: true
}));

// ✅ Middlewares
app.use(express.json());

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");
const requestRoutes = require("./routes/requestRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const logRoutes = require("./routes/logRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const issuesRoute = require('./routes/issues');
app.use('/api/issues', issuesRoute);


// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
