const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const internshipRoutes = require("./routes/internshipRoutes");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require("./routes/jobRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const academicianRoutes = require("./routes/academicianRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const industryRoutes = require("./routes/industryRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");

const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/academician", academicianRoutes);
app.use("/api/institution", institutionRoutes);
app.use("/api/opportunities", opportunityRoutes);


app.use(
  "/api/assessment",
  assessmentRoutes
);

app.use(
  "/api/internships",
  internshipRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);


app.use("/api/jobs", jobRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/industry", industryRoutes);
app.use("/api/collaborations", collaborationRoutes);

app.use(
  "/api/portfolio",
  portfolioRoutes
);
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Open Collab backend is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

