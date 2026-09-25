const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const StudentProfile = require("../models/StudentProfile");

const levelRank = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const calculateMatchPercentage = (requiredSkills, studentSkills) => {
  if (!requiredSkills?.length) return 100;

  const studentMap = new Map(
    (studentSkills || []).map((skill) => [
      skill.name.toLowerCase(),
      skill,
    ])
  );

  let matched = 0;

  requiredSkills.forEach((required) => {
    const student = studentMap.get(
      required.name.toLowerCase()
    );

    if (
      student &&
      (levelRank[student.level] || 0) >=
        (levelRank[required.minimumLevel] || 0)
    ) {
      matched += 1;
    }
  });

  return Math.round(
    (matched / requiredSkills.length) * 100
  );
};

const applyForJob = async (req, res) => {
  try {
    const { coverMessage = "" } = req.body;

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      job.status !== "open" ||
      job.applicationDeadline < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this job",
      });
    }

    const existing = await JobApplication.findOne({
      job: job._id,
      student: req.user.id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).lean();

    const matchPercentage = calculateMatchPercentage(
      job.requiredSkills,
      profile?.skills || []
    );

    const application = await JobApplication.create({
      job: job._id,
      student: req.user.id,
      coverMessage,
      matchPercentage,
    });

    res.status(201).json({
      success: true,
      message: "Job application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Apply for job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to apply for job",
    });
  }
};

const getMyJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({
      student: req.user.id,
    })
      .populate(
        "job",
        "companyName title description location type salary experience requiredSkills applicationDeadline"
      )
      .sort({ appliedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(
      "Get my job applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load job applications",
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      industry: req.user.id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const applications = await JobApplication.find({
      job: job._id,
    })
      .populate("student", "name email")
      .sort({
        matchPercentage: -1,
        appliedAt: -1,
      })
      .lean();

    res.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(
      "Get job applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load job applications",
    });
  }
};

const validTransitions = {
  pending: ["shortlisted", "rejected"],

  shortlisted: [
    "assessment",
    "rejected",
  ],

  // Backward compatibility for old applications.
  accepted: [
    "assessment",
    "rejected",
  ],

  assessment: [
    "interview",
    "rejected",
  ],

  interview: [
    "selected",
    "rejected",
  ],

  selected: [
    "offer",
    "rejected",
  ],

  offer: [
    "joined",
    "rejected",
  ],

  joined: [],

  rejected: [],
};

const updateJobApplicationStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    if (!Object.prototype.hasOwnProperty.call(
      validTransitions,
      status
    )) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application =
      await JobApplication.findById(
        req.params.id
      ).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      String(application.job.industry) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const allowedNextStatuses =
      validTransitions[application.status] || [];

    if (
      application.status !== status &&
      !allowedNextStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot move application from ${application.status} to ${status}`,
      });
    }

    application.status = status;

    const now = new Date();

    if (status === "shortlisted") {
      application.shortlistedAt = now;
    }

    if (status === "assessment") {
      application.assessmentAt = now;
    }

    if (status === "interview") {
      application.interviewAt = now;
    }

    if (status === "selected") {
      application.selectedAt = now;
    }

    if (status === "offer") {
      application.offerAt = now;
    }

    if (status === "joined") {
      application.joinedAt = now;

      application.placement = {
        ...(application.placement?.toObject?.() ||
          application.placement ||
          {}),
        companyName:
          application.placement?.companyName ||
          application.job.companyName,
        role:
          application.placement?.role ||
          application.job.title,
        joiningDate:
          application.placement?.joiningDate ||
          now,
      };
    }

    if (status === "rejected") {
      application.rejectedAt = now;
    }

    await application.save();

    const populated =
      await JobApplication.findById(
        application._id
      )
        .populate(
          "job",
          "companyName title location type salary experience"
        )
        .populate(
          "student",
          "name email"
        );

    res.json({
      success: true,
      message: "Application status updated",
      data: populated,
    });
  } catch (error) {
    console.error(
      "Update job application error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update application status",
    });
  }
};

const updatePlacementDetails = async (
  req,
  res
) => {
  try {
    const application =
      await JobApplication.findById(
        req.params.id
      ).populate("job");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      String(application.job.industry) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      !["selected", "offer", "joined"].includes(
        application.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Placement details can be added after selection",
      });
    }

    const {
      companyName,
      role,
      package: packageValue,
      offerDate,
      joiningDate,
      offerUrl,
      notes,
    } = req.body;

    application.placement = {
      companyName:
        companyName ??
        application.placement?.companyName ??
        application.job.companyName,

      role:
        role ??
        application.placement?.role ??
        application.job.title,

      package:
        packageValue ??
        application.placement?.package ??
        "",

      offerDate:
        offerDate ??
        application.placement?.offerDate,

      joiningDate:
        joiningDate ??
        application.placement?.joiningDate,

      offerUrl:
        offerUrl ??
        application.placement?.offerUrl ??
        "",

      notes:
        notes ??
        application.placement?.notes ??
        "",
    };

    await application.save();

    const populated =
      await JobApplication.findById(
        application._id
      )
        .populate(
          "job",
          "companyName title location type salary experience"
        )
        .populate(
          "student",
          "name email"
        );

    res.json({
      success: true,
      message:
        "Placement details updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error(
      "Update placement details error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update placement details",
    });
  }
};

module.exports = {
  applyForJob,
  getMyJobApplications,
  getJobApplications,
  updateJobApplicationStatus,
  updatePlacementDetails,
};