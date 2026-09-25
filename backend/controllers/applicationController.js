const InternshipApplication = require("../models/InternshipApplication");
const Internship = require("../models/Internship");
const StudentProfile = require("../models/StudentProfile");
const {
  calculateSkillMatch,
} = require("../services/skillMatchingService");

const levelRank = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const calculateMatchPercentage = (
  studentSkills,
  requiredSkills
) => {
  const match = calculateSkillMatch(
    studentSkills || [],
    requiredSkills || []
  );

  return match.percentage;
};
// Student applies for an internship
const applyForInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { coverMessage = "" } = req.body;

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (internship.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This internship is closed",
      });
    }

    if (
      internship.applicationDeadline &&
      new Date(internship.applicationDeadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    const existingApplication =
      await InternshipApplication.findOne({
        internship: internshipId,
        student: req.user.id,
      });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship",
      });
    }

    const studentProfile = await StudentProfile.findOne({
      user: req.user.id,
    });

    const studentSkills =
      studentProfile?.skills || [];

    const matchPercentage =
      calculateMatchPercentage(
        studentSkills,
        internship.requiredSkills
      );

    const application =
      await InternshipApplication.create({
        internship: internshipId,
        student: req.user.id,
        coverMessage,
        matchPercentage,
      });

    const populatedApplication =
      await InternshipApplication.findById(
        application._id
      )
        .populate(
          "internship",
          "companyName title location type duration stipend"
        )
        .populate(
          "student",
          "name email"
        );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: populatedApplication,
    });
  } catch (error) {
    console.error(
      "Apply for internship error:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this internship",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

// Student views their applications
const getMyApplications = async (req, res) => {
  try {
    const applications =
      await InternshipApplication.find({
        student: req.user.id,
      })
        .populate(
          "internship",
          "companyName title location type duration stipend applicationDeadline status"
        )
        .sort({ appliedAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "Get my applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};

// Student views one of their applications
const getMyApplication = async (req, res) => {
  try {
    const application =
      await InternshipApplication.findOne({
        _id: req.params.id,
        student: req.user.id,
      })
        .populate(
          "internship",
          "companyName title description location type duration stipend requiredSkills applicationDeadline status industry"
        )
        .populate(
          "student",
          "name email"
        );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "Get application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

// Industry views applicants for its internship
const getInternshipApplications = async (
  req,
  res
) => {
  try {
    const internship =
      await Internship.findOne({
        _id: req.params.internshipId,
        industry: req.user.id,
      });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const applications =
      await InternshipApplication.find({
        internship: internship._id,
      })
        .populate(
          "student",
          "name email"
        )
        .populate(
          "internship",
          "companyName title"
        )
        .sort({
          matchPercentage: -1,
          appliedAt: -1,
        });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error(
      "Get internship applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};

// Industry updates an applicant's internship lifecycle status
const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "shortlisted",
      "accepted",
      "rejected",
      "joined",
      "in_progress",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application =
      await InternshipApplication.findById(
        req.params.id
      ).populate("internship");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      String(application.internship.industry) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this internship",
      });
    }

    const currentStatus = application.status;

    const validTransitions = {
      pending: ["shortlisted", "rejected"],
      shortlisted: ["accepted", "rejected"],
      accepted: ["joined", "rejected"],
      joined: ["in_progress"],
      in_progress: ["completed"],
      completed: [],
      rejected: [],
    };

    if (
      currentStatus !== status &&
      !validTransitions[currentStatus]?.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    application.status = status;

    const now = new Date();

    if (status === "shortlisted") {
      application.shortlistedAt = now;
    }

    if (status === "accepted") {
      application.acceptedAt = now;
    }

    if (status === "joined") {
      application.joinedAt = now;
    }

    if (status === "in_progress") {
      application.startedAt = now;
    }

    if (status === "completed") {
      application.completedAt = now;
    }

    await application.save();

    const updatedApplication =
      await InternshipApplication.findById(
        application._id
      )
        .populate(
          "student",
          "name email"
        )
        .populate(
          "internship",
          "companyName title description location type duration stipend applicationDeadline"
        );

    return res.json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
    });
  }
};
// Industry evaluates a completed intern
const evaluateInternship = async (req, res) => {
  try {
    const {
      rating,
      feedback = "",
      skillsDemonstrated = [],
      completionNote = "",
    } = req.body;

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!Array.isArray(skillsDemonstrated)) {
      return res.status(400).json({
        success: false,
        message: "Skills demonstrated must be an array",
      });
    }

    const application =
      await InternshipApplication.findById(
        req.params.id
      ).populate("internship");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!application.internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (
      String(application.internship.industry) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this internship",
      });
    }

    if (application.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Internship must be completed before evaluation",
      });
    }

    application.evaluation = {
      rating: numericRating,
      feedback: String(feedback).trim(),
      skillsDemonstrated: skillsDemonstrated
        .map((skill) => String(skill).trim())
        .filter(Boolean),
      evaluatedAt: new Date(),
    };

    application.completionNote =
      String(completionNote).trim();

    await application.save();

    const updatedApplication =
      await InternshipApplication.findById(
        application._id
      )
        .populate(
          "student",
          "name email"
        )
        .populate(
          "internship",
          "companyName title description location type duration stipend applicationDeadline"
        );

    return res.json({
      success: true,
      message: "Internship evaluation saved successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Evaluate internship error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save internship evaluation",
    });
  }
};

// Industry issues a certificate to a completed intern
const issueInternshipCertificate = async (
  req,
  res
) => {
  try {
    const {
      name,
      issuer,
      url = "",
    } = req.body;

    const application =
      await InternshipApplication.findById(
        req.params.id
      ).populate("internship");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!application.internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (
      String(application.internship.industry) !== String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this internship",
      });
    }

    if (application.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Certificate can only be issued after internship completion",
      });
    }

    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Certificate name is required",
      });
    }

    if (
      !issuer ||
      !String(issuer).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Certificate issuer is required",
      });
    }

    application.certificate = {
      issued: true,
      name: String(name).trim(),
      issuer: String(issuer).trim(),
      issueDate: new Date(),
      url: String(url).trim(),
    };

    await application.save();

    const updatedApplication =
      await InternshipApplication.findById(
        application._id
      )
        .populate(
          "student",
          "name email"
        )
        .populate(
          "internship",
          "companyName title description location type duration stipend applicationDeadline"
        );

    return res.json({
      success: true,
      message: "Certificate issued successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(
      "Issue internship certificate error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to issue internship certificate",
    });
  }
};
module.exports = {
  applyForInternship,
  getMyApplications,
  getMyApplication,
  getInternshipApplications,
  updateApplicationStatus,
  evaluateInternship,
  issueInternshipCertificate,
};


